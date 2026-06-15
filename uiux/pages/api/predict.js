import { MongoClient } from "mongodb";

function digitSum(n) {
  while (n >= 10) {
    n = String(n).split("").reduce((s, d) => s + Number(d), 0);
  }
  return n;
}

function analyzeWithStrategy(r1, r2, history) {
  const product = r1.number * r2.number;
  const rawSum = String(product).split("").reduce((s, d) => s + Number(d), 0);
  const finalDigit = digitSum(rawSum);
  const predictedSize = finalDigit >= 5 ? "Big" : "Small";

  const totalBig = history.filter(r => r.size === "Big").length;
  const totalSmall = history.filter(r => r.size === "Small").length;

  let trend = "neutral";
  if (history.length >= 3) {
    const last3 = history.slice(0, 3).filter(r => r.size);
    const bigCount = last3.filter(r => r.size === "Big").length;
    if (bigCount >= 2) trend = "big-streak";
    else if (bigCount <= 1) trend = "small-streak";
  }

  let adjusted = predictedSize;
  if (trend === "big-streak" && totalBig > totalSmall * 1.3) {
    adjusted = "Small";
  } else if (trend === "small-streak" && totalSmall > totalBig * 1.3) {
    adjusted = "Big";
  }

  return {
    r1: r1.number,
    r2: r2.number,
    product,
    rawSum,
    finalDigit,
    predictedSize,
    adjusted,
    trend,
    stats: { totalBig, totalSmall },
  };
}

export default async function handler(req, res) {
  if (req.method !== "GET") {
    res.setHeader("Allow", "GET");
    return res.status(405).json({ error: "Method not allowed" });
  }

  res.setHeader("Cache-Control", "no-store, max-age=0");

  try {
    const client = new MongoClient(process.env.MONGO_URI, {
      serverSelectionTimeoutMS: 5000,
      connectTimeoutMS: 5000,
    });
    await client.connect();
    const db = client.db(process.env.DB_NAME || "wingo_db");
    const collection = db.collection(process.env.COLLECTION_NAME || "results");

    const docs = await collection
      .find({})
      .sort({ _id: -1 })
      .limit(30)
      .toArray();

    await client.close();

    if (docs.length < 2) {
      return res.status(200).json({
        prediction: "Big",
        finalDigit: 5,
        strategy: "insufficient-data",
      });
    }

    const history = docs.map(d => ({
      number: Number(d.number ?? d.premium ?? d.sum ?? 0),
      size: Number(d.number ?? d.premium ?? d.sum ?? 0) >= 5 ? "Big" : "Small",
    }));

    const r1 = history[0];
    const r2 = history[1];
    const analysis = analyzeWithStrategy(r1, r2, history);

    const groqPayload = {
      model: "llama3-70b-8192",
      messages: [
        {
          role: "system",
          content: `You are a WinGo prediction analyst. Given historical results, predict the next Big/Small outcome.

Rules:
- Numbers 0-9: 0-4 = Small, 5-9 = Big
- Analyze streaks, frequency, and patterns
- Return ONLY a JSON object with keys: "prediction" ("Big" or "Small"), "confidence" (0-100), "reasoning" (one short sentence)`,
        },
        {
          role: "user",
          content: `Recent results (newest first): ${history.slice(0, 10).map(r => r.number).join(", ")}
Total Big: ${analysis.stats.totalBig}, Total Small: ${analysis.stats.totalSmall}
Formula result: R1(${analysis.r1}) × R2(${analysis.r2}) = ${analysis.product}, sum digits = ${analysis.finalDigit} → ${analysis.predictedSize}
Trend: ${analysis.trend}
Adjusted: ${analysis.adjusted}
Return JSON.`,
        },
      ],
      temperature: 0.3,
      max_tokens: 150,
    };

    let groqPrediction = analysis.adjusted;
    let confidence = 70;
    let reasoning = "";

    try {
      const groqRes = await fetch("https://api.groq.com/openai/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
        },
        body: JSON.stringify(groqPayload),
        signal: AbortSignal.timeout(8000),
      });

      if (groqRes.ok) {
        const groqData = await groqRes.json();
        const content = groqData.choices?.[0]?.message?.content || "{}";
        const parsed = JSON.parse(content.replace(/```json|```/g, "").trim());
        if (parsed.prediction && ["Big", "Small"].includes(parsed.prediction)) {
          groqPrediction = parsed.prediction;
          confidence = parsed.confidence ?? 70;
          reasoning = parsed.reasoning ?? "";
        }
      }
    } catch (e) {
      console.error("GROQ API error, falling back to formula:", e.message);
    }

    return res.status(200).json({
      prediction: groqPrediction,
      finalDigit: analysis.finalDigit,
      confidence,
      reasoning,
      strategy: {
        r1: analysis.r1,
        r2: analysis.r2,
        product: analysis.product,
        formulaResult: analysis.predictedSize,
        trend: analysis.trend,
        adjusted: analysis.adjusted,
      },
    });
  } catch (error) {
    console.error("Predict API error:", error);
    return res.status(200).json({
      prediction: Math.random() >= 0.5 ? "Big" : "Small",
      finalDigit: Math.floor(Math.random() * 10),
      strategy: "fallback",
    });
  }
}
