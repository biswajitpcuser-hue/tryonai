import { connectToDatabase } from "../../../lib/mongodb";

export default async function handler(req, res) {
  if (req.method !== "GET") {
    res.setHeader("Allow", "GET");
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { db } = await connectToDatabase();
    const collection = db.collection(process.env.ACTIVATIONS_COLLECTION || "admin_activations");
    const history = await collection.find({}).sort({ activatedAt: -1 }).toArray();
    return res.status(200).json({ history });
  } catch (error) {
    console.error("Admin history fetch error:", error);
    return res.status(500).json({ error: "Failed to fetch history" });
  }
}
