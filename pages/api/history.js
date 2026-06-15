const HISTORY_URL =
  "https://draw.ar-lottery01.com/WinGo/WinGo_30S/GetHistoryIssuePage.json";
const ISSUE_DURATION_MS = 30000;

function generateMockHistory() {
  const now = Date.now();
  const numbers = [0, 3, 7, 2, 9, 1, 6, 4, 8, 5];
  const tones = ["violet", "green", "red", "green", "green", "red", "red", "green", "red", "violet"];
  const sizes = ["Small", "Small", "Big", "Small", "Big", "Small", "Big", "Small", "Big", "Big"];
  const periodBase = "202606071010";

  return numbers.map((num, i) => ({
    period: String(BigInt(periodBase) - BigInt(i)),
    number: num,
    size: sizes[i],
    colors: num === 0 ? ["red", "violet"] : num === 5 ? ["green", "violet"] : num % 2 === 0 ? ["red"] : ["green"],
    blockTimestamp: now - i * 60000,
  }));
}

const COLOR_NAMES = new Set(["red", "green", "violet"]);

function inferColors(number) {
  if (number === 0) {
    return ["red", "violet"];
  }

  if (number === 5) {
    return ["green", "violet"];
  }

  return number % 2 === 0 ? ["red"] : ["green"];
}

function normalizeColors(color, number) {
  const colors = String(color ?? "")
    .toLowerCase()
    .split(/[,\s]+/)
    .map((item) => item.trim())
    .filter((item) => COLOR_NAMES.has(item));

  return colors.length ? [...new Set(colors)] : inferColors(number);
}

function toHistoryRow(item) {
  const number = Number(item?.number ?? item?.premium ?? item?.sum);
  const period = String(item?.issueNumber ?? item?.issue ?? item?.period ?? "");

  if (!period || !Number.isFinite(number)) {
    return null;
  }

  return {
    period,
    number,
    size: number >= 5 ? "Big" : "Small",
    colors: normalizeColors(item?.color, number),
    blockTimestamp: Number(item?.blockTimestamp) || null,
  };
}

function incrementIssueNumber(issueNumber, amount = 1) {
  try {
    return (BigInt(issueNumber) + BigInt(amount)).toString();
  } catch (error) {
    return issueNumber ? String(issueNumber) : "";
  }
}

function getCurrentIssue(history, serviceTime) {
  const latest = history[0];

  if (!latest?.period || !latest?.blockTimestamp) {
    return {
      issueNumber: "",
      remainingMs: 0,
    };
  }

  const elapsed = Math.max(0, serviceTime - latest.blockTimestamp);
  const periodOffset = Math.floor(elapsed / ISSUE_DURATION_MS) + 1;
  const remainingMs = ISSUE_DURATION_MS - (elapsed % ISSUE_DURATION_MS);

  return {
    issueNumber: incrementIssueNumber(latest.period, periodOffset),
    remainingMs,
  };
}

export default async function handler(req, res) {
  if (req.method !== "GET") {
    res.setHeader("Allow", "GET");
    res.status(405).json({ error: "Method not allowed" });
    return;
  }

  res.setHeader("Cache-Control", "no-store, max-age=0");

  try {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 4000);
    const response = await fetch(HISTORY_URL, {
      cache: "no-store",
      headers: {
        accept: "application/json,text/plain,*/*",
      },
      signal: controller.signal,
    });
    clearTimeout(timer);

    if (!response.ok) {
      throw new Error(`History API returned ${response.status}`);
    }

    const payload = JSON.parse(await response.text());
    const list = Array.isArray(payload?.data?.list) ? payload.data.list : [];
    const history = list.map(toHistoryRow).filter(Boolean).slice(0, 10);
    const serviceTime = Number(payload?.serviceTime) || Date.now();

    res.status(200).json({
      history,
      current: getCurrentIssue(history, serviceTime),
      serviceTime,
    });
  } catch (error) {
    const history = generateMockHistory();
    const serviceTime = Date.now();

    res.status(200).json({
      history,
      current: getCurrentIssue(history, serviceTime),
      serviceTime,
    });
  }
}
