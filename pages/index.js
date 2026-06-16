import { useEffect, useMemo, useRef, useState } from "react";
import Head from "next/head";
import { useRouter } from "next/router";
import { watchAuthState } from "@/lib/firebase";
import { addUser, getRemainingPredictions, incrementPredictionCount } from "@/lib/storage";

function LottieTgs({ src, size = 48 }) {
  const containerRef = useRef(null);
  const animRef = useRef(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    let cancelled = false;

    async function load() {
      try {
        const [lottieMod, pakoMod] = await Promise.all([
          import("lottie-web"),
          import("pako"),
        ]);
        const lottie = lottieMod.default || lottieMod;
        const pako = pakoMod.default || pakoMod;

        const res = await fetch(src);
        const buffer = await res.arrayBuffer();
        const decompressed = pako.ungzip(new Uint8Array(buffer));
        const text = new TextDecoder().decode(decompressed);
        const data = JSON.parse(text);

        if (!cancelled && container.isConnected) {
          animRef.current = lottie.loadAnimation({
            container,
            animationData: data,
            loop: true,
            autoplay: true,
          });
        }
      } catch (e) {
        if (!cancelled) console.error("TGS load error:", e);
      }
    }

    load();
    return () => {
      cancelled = true;
      if (animRef.current) {
        animRef.current.destroy();
        animRef.current = null;
      }
    };
  }, [src]);

  return <div ref={containerRef} style={{ width: size, height: size }} />;
}

function AccuracyAnimation() {
  return <LottieTgs src="/accuracy.tgs" size={48} />;
}

function FunnyAnimation() {
  return <LottieTgs src="/funny.tgs" size={80} />;
}

function RulesAnim() {
  return <LottieTgs src="/rules.tgs" size={120} />;
}

function KalmodsAnim() {
  return <LottieTgs src="/Kalmods.tgs" size={32} />;
}

function TradingAnim() {
  return <LottieTgs src="/Trading.tgs" size={26} />;
}

function TelegramAnim() {
  return <LottieTgs src="/Telegram.tgs" size={22} />;
}

function FireAnim() {
  return <LottieTgs src="/fire.tgs" size={92} />;
}

function GiftAnim() {
  return <LottieTgs src="/gift.tgs" size={92} />;
}

function ServerAnim() {
  return <LottieTgs src="/server.tgs" size={60} />;
}

const HISTORY_REFRESH_MS = 2000;
const ISSUE_DURATION_MS = 60000;

const mainBalls = [
  { value: 0, tone: "violet" },
  { value: 1, tone: "green" },
  { value: 2, tone: "red" },
  { value: 3, tone: "green" },
  { value: 4, tone: "red" },
  { value: 5, tone: "violet" },
  { value: 6, tone: "red" },
  { value: 7, tone: "green" },
  { value: 8, tone: "red" },
  { value: 9, tone: "green" },
];

const multipliers = ["X1", "X5", "X10", "X20", "X50", "X100"];

function getNumberTone(row) {
  if (row?.colors?.includes("violet") && (row.number === 0 || row.number === 5)) {
    return "violet";
  }

  if (row?.colors?.[0]) {
    return row.colors[0];
  }

  return row?.number % 2 === 0 ? "red" : "green";
}

function splitIssueNumber(issueNumber) {
  const issue = issueNumber ? String(issueNumber) : "";

  if (issue.length <= 8) {
    return { date: issue || "--------", serial: "--------" };
  }

  return {
    date: issue.slice(0, 8),
    serial: issue.slice(8),
  };
}

function incrementIssueNumber(issueNumber, amount = 1) {
  try {
    return (BigInt(issueNumber) + BigInt(amount)).toString();
  } catch (error) {
    return issueNumber ? String(issueNumber) : "";
  }
}

function formatTimerParts(remainingMs) {
  const safeMs = Number.isFinite(remainingMs) ? Math.max(0, remainingMs) : 0;
  const totalSeconds = Math.max(0, Math.ceil(safeMs / 1000));
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;

  return `${String(minutes).padStart(2, "0").slice(-2)}${String(seconds).padStart(2, "0")}`.split("");
}

function formatTimerLabel(remainingMs) {
  const [minuteTens, minuteOnes, secondTens, secondOnes] =
    formatTimerParts(remainingMs);

  return `${minuteTens}${minuteOnes}:${secondTens}${secondOnes}`;
}

function getCurrentPeriod(history, serverNow, apiCurrent) {
  if (apiCurrent?.issueNumber) {
    const baseRemaining = Number(apiCurrent.remainingMs) || 0;
    const elapsedFromApi = Math.max(0, serverNow - Number(apiCurrent.serviceTime || 0));
    const totalElapsed = Math.max(0, elapsedFromApi + (ISSUE_DURATION_MS - baseRemaining));
    const periodOffset = Math.floor(totalElapsed / ISSUE_DURATION_MS);
    const remainingMs = ISSUE_DURATION_MS - (totalElapsed % ISSUE_DURATION_MS);

    return {
      issueNumber: incrementIssueNumber(apiCurrent.issueNumber, periodOffset),
      remainingMs,
    };
  }

  const latest = history[0];

  if (!latest?.period) {
    return {
      issueNumber: "",
      remainingMs: 0,
    };
  }

  const latestTimestamp = Number(latest.blockTimestamp);
  const elapsed = latestTimestamp
    ? Math.max(0, serverNow - latestTimestamp)
    : 0;
  const periodOffset = Math.floor(elapsed / ISSUE_DURATION_MS) + 1;
  const remainingMs = ISSUE_DURATION_MS - (elapsed % ISSUE_DURATION_MS);

  return {
    issueNumber: incrementIssueNumber(latest.period, periodOffset),
    remainingMs,
  };
}

function buildTrendPoints(history) {
  const recent = history.slice(0, 6).reverse();
  const xPositions = [10, 28, 46, 64, 82, 100];

  return recent.map((row, index) => ({
    period: String(row.period).slice(-5),
    value: row.number,
    tone: getNumberTone(row),
    x: xPositions[index],
    y: Math.max(10, 52 - row.number * 4),
  }));
}

function buildHotCold(history) {
  const counts = new Map();

  history.forEach((row, index) => {
    const current = counts.get(row.number) ?? {
      value: row.number,
      count: 0,
      firstSeen: index,
      tone: getNumberTone(row),
    };

    counts.set(row.number, {
      ...current,
      count: current.count + 1,
      firstSeen: Math.min(current.firstSeen, index),
    });
  });

  return [...counts.values()]
    .sort((a, b) => b.count - a.count || a.firstSeen - b.firstSeen)
    .slice(0, 3)
    .map((item) => ({
      value: item.value,
      label: "Hot",
      amount: `${item.count} ${item.count === 1 ? "Time" : "Times"}`,
      tone: item.tone,
      type: "hot",
    }));
}

function buildDashboardStats(history, hotCold) {
  const settled = history.slice(0, -1).map((row, index) => {
    const previous = history[index + 1];
    const predictedTone = getNumberTone(previous);
    const actualColors = row.colors?.length ? row.colors : [getNumberTone(row)];

    return actualColors.includes(predictedTone);
  });
  const total = settled.length;
  const wins = settled.filter(Boolean).length;
  const losses = Math.max(0, total - wins);
  const accuracy = total ? Math.round((wins / total) * 100) : 0;
  const topSignal = hotCold[0];

  return {
    total,
    wins,
    losses,
    accuracy,
    teachers: hotCold.length,
    topSignal,
  };
}

function useLiveHistory() {
  const [history, setHistory] = useState([]);
  const [apiCurrent, setApiCurrent] = useState(null);
  const [status, setStatus] = useState("loading");
  const [clock, setClock] = useState(0);
  const [timeSource, setTimeSource] = useState({
    fetchedAt: 0,
    serviceTime: 0,
  });

  useEffect(() => {
    let active = true;

    async function loadHistory(silent = false) {
      if (!silent) {
        setStatus("loading");
      }

      try {
        const controller = new AbortController();
        const timer = setTimeout(() => controller.abort(), 5000);
        const response = await fetch(`/api/history?ts=${Date.now()}`, {
          cache: "no-store",
          signal: controller.signal,
        });
        clearTimeout(timer);

        if (!response.ok) {
          throw new Error("History request failed");
        }

        const payload = await response.json();
        const nextHistory = Array.isArray(payload?.history)
          ? payload.history.slice(0, 10)
          : [];
        const fetchedAt = Date.now();

        if (!active) {
          return;
        }

        setHistory(nextHistory);
        setTimeSource({
          fetchedAt,
          serviceTime: Number(payload?.serviceTime) || fetchedAt,
        });
        setApiCurrent(
          payload?.current?.issueNumber
            ? {
                issueNumber: payload.current.issueNumber,
                remainingMs: Number(payload.current.remainingMs) || 0,
                serviceTime: Number(payload?.serviceTime) || fetchedAt,
              }
            : null,
        );
        setStatus("ready");
      } catch (error) {
        if (!active) {
          return;
        }

        setStatus((current) =>
          current === "ready" || current === "stale" ? "stale" : "error",
        );
      }
    }

    loadHistory();
    const interval = window.setInterval(() => loadHistory(true), HISTORY_REFRESH_MS);

    return () => {
      active = false;
      window.clearInterval(interval);
    };
  }, []);

  useEffect(() => {
    const tick = () => setClock(Date.now());

    tick();
    const interval = window.setInterval(tick, 1000);

    return () => window.clearInterval(interval);
  }, []);

  const serverNow =
    timeSource.serviceTime && timeSource.fetchedAt && clock
      ? timeSource.serviceTime + (clock - timeSource.fetchedAt)
      : clock;

  return {
    apiCurrent,
    history,
    serverNow,
    status,
  };
}

function Icon({ name, className = "" }) {
  const icons = {
    back: (
      <path d="M15.5 4.75 8.25 12l7.25 7.25" />
    ),
    book: (
      <>
        <path d="M4.75 5.75A2.75 2.75 0 0 1 7.5 3.95h9.75v15.6H7.5a2.75 2.75 0 0 0-2.75 1.8Z" />
        <path d="M19.25 5.75A2.75 2.75 0 0 0 16.5 3.95H6.75v15.6h9.75a2.75 2.75 0 0 1 2.75 1.8Z" />
        <path d="M12 4.2v15.35" />
      </>
    ),
    history: (
      <>
        <path d="M4.75 12a7.25 7.25 0 1 0 2.13-5.13" />
        <path d="M4.75 4.85v4.4h4.4" />
        <path d="M12 7.65v4.55l3.05 1.85" />
      </>
    ),
    chevron: <path d="m9.5 6.25 5.25 5.25-5.25 5.25" />,
    shuffle: (
      <>
        <path d="M3.5 7.25h2.7c2.9 0 3.65 9.5 6.7 9.5h1.85" />
        <path d="m12.75 14.2 2.55 2.55-2.55 2.55" />
        <path d="M3.5 16.75h2.7c1.35 0 2.25-1.95 3.1-4.1" />
        <path d="M12.95 7.25h1.8" />
        <path d="m12.75 4.7 2.55 2.55-2.55 2.55" />
      </>
    ),
    sparkle: (
      <>
        <path d="M11.55 2.95 13.7 9l6.05 2.15-6.05 2.15-2.15 6.05-2.15-6.05-6.05-2.15L9.4 9Z" />
        <path d="m5.35 3.45.8 2.05 2.05.8-2.05.8-.8 2.05-.8-2.05-2.05-.8 2.05-.8Z" />
      </>
    ),
    clock: (
      <>
        <circle cx="12" cy="12" r="8.25" />
        <path d="M12 7.7v4.55l3.15 1.85" />
      </>
    ),
    brain: (
      <>
        <path d="M9.2 4.25A3 3 0 0 0 6 7.05a3.1 3.1 0 0 0-2.25 5.1A3.45 3.45 0 0 0 7.25 18H9.2Z" />
        <path d="M14.8 4.25a3 3 0 0 1 3.2 2.8 3.1 3.1 0 0 1 2.25 5.1A3.45 3.45 0 0 1 16.75 18H14.8Z" />
        <path d="M9.2 7.35H7.65m1.55 4.35H7.25m1.95 3.15H7.4m5.8-7.5h1.55m-1.55 4.35h1.95m-1.95 3.15h1.8M12 5.1v13.8" />
      </>
    ),
    bolt: (
      <path d="m13.4 2.9-7.1 9.45h5.15l-1.05 8.75 7.3-10.45h-5.25Z" />
    ),
    chart: (
      <>
        <path d="M5.5 19.5V10" />
        <path d="M12 19.5V4.5" />
        <path d="M18.5 19.5V7.5" />
      </>
    ),
    send: (
      <>
        <path d="M21 3 10.8 13.2" />
        <path d="m21 3-6.5 18-3.7-7.8L3 9.5Z" />
      </>
    ),
    target: (
      <>
        <circle cx="12" cy="12" r="8.25" />
        <circle cx="12" cy="12" r="3.15" />
        <path d="M12 2.8v3.1M12 18.1v3.1M2.8 12h3.1M18.1 12h3.1" />
      </>
    ),
    layers: (
      <>
        <path d="m12 3.8 8.25 4.35L12 12.5 3.75 8.15Z" />
        <path d="m4.15 12 7.85 4.15L19.85 12" />
        <path d="m4.15 15.85 7.85 4.15 7.85-4.15" />
      </>
    ),
  };

  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      aria-hidden="true"
      fill="none"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="2"
    >
      {icons[name]}
    </svg>
  );
}

function NumberBall({ value, tone, small = false }) {
  return (
    <div className={`number-ball ${tone} ${small ? "small" : ""}`}>
      <span>{value}</span>
    </div>
  );
}

function MoreButton() {
  return (
    <button className="more-button" type="button">
      More
      <Icon name="chevron" />
    </button>
  );
}

function Header({ onRulesClick }) {
  return (
    <header className="app-header">
      <div className="top-nav">
        <div className="header-left">
          <KalmodsAnim />
        </div>
        <div className="brand" aria-label="TryonAI">
          <span>TryonAI</span>
        </div>
        <div className="header-actions">
          <button className="header-action" type="button" onClick={onRulesClick}>
            <Icon name="book" />
            <span>Rules</span>
          </button>
        </div>
      </div>
    </header>
  );
}

function HowToPlay({ latestBalls }) {
  return (
    <section className="card play-card">
      <div>
        <h2>How to play</h2>
        <p>Win go 1M</p>
      </div>
      <button className="soft-circle" type="button" aria-label="Next">
        <Icon name="chevron" />
      </button>
      <div className="mini-ball-row">
        {latestBalls.map((ball, index) => (
          <NumberBall key={`${ball.period}-${index}`} {...ball} small />
        ))}
      </div>
      <div className="pager-dots" aria-hidden="true">
        <span className="active" />
        <span />
      </div>
    </section>
  );
}

function TimeRemaining({ issueNumber, remainingMs }) {
  const timerParts = formatTimerParts(remainingMs);
  const issue = splitIssueNumber(issueNumber);
  const timerLabel = formatTimerLabel(remainingMs);

  return (
    <section className="card timer-card">
      <h2>Time remaining</h2>
      <div className="timer-digits" aria-label={timerLabel}>
        <span>{timerParts[0]}</span>
        <span>{timerParts[1]}</span>
        <b>:</b>
        <span>{timerParts[2]}</span>
        <span>{timerParts[3]}</span>
      </div>
      <p>
        {issue.date} | {issue.serial}
      </p>
    </section>
  );
}

function BettingPanel({ onBetClick }) {
  return (
    <section className="card betting-card">
      <div className="game-grid">
        {mainBalls.map((ball) => (
          <NumberBall key={ball.value} {...ball} />
        ))}
      </div>

      <div className="multiplier-row">
        <button className="random-btn" type="button" onClick={onBetClick}>
          <Icon name="shuffle" />
          Random
        </button>
        {multipliers.map((multiplier, index) => (
          <button
            className={`multiplier ${index === 0 ? "active" : ""}`}
            type="button"
            key={multiplier}
            onClick={onBetClick}
          >
            {multiplier}
          </button>
        ))}
      </div>
    </section>
  );
}

function getSizeLabel(value) {
  return value >= 5 ? "Big" : "Small";
}

function PredictionCard({ issueNumber, remainingMs, hotCold, predictionResult, showServerAnim }) {
  const issue = splitIssueNumber(issueNumber);

  return (
    <section className="prediction-card">
      <div className="prediction-top">
        <div className="prediction-title">
          <TradingAnim />
          <div>
            <h2>AI Prediction</h2>
            <p>Smart analysis for next period</p>
          </div>
        </div>
        <div className="accuracy-anim">
          <AccuracyAnimation />
        </div>
      </div>

      <div className="prediction-body">
        <div className="prediction-cell progress-cell">
          <span>Win Chance</span>
          <div className="progress-ring">
            <b>92%</b>
          </div>
        </div>
        <div className="prediction-cell next-period">
          <span>Next Period</span>
          <FunnyAnimation />
        </div>
        <div className="prediction-cell result-cell">
          <span>Result</span>
          {showServerAnim ? (
            <ServerAnim />
          ) : (
            <strong>{predictionResult || "\u2014\u2014"}</strong>
          )}
        </div>
      </div>

    </section>
  );
}

function TrendChart({ trendPoints }) {
  function smoothPath(points) {
    if (points.length < 2) return "";
    let d = `M ${points[0].x} ${points[0].y}`;
    for (let i = 1; i < points.length; i++) {
      const prev = points[i - 1];
      const curr = points[i];
      const cx1 = prev.x + (curr.x - prev.x) / 2;
      const cy1 = prev.y;
      const cx2 = cx1;
      const cy2 = curr.y;
      d += ` C ${cx1} ${cy1}, ${cx2} ${cy2}, ${curr.x} ${curr.y}`;
    }
    return d;
  }

  const linePath = smoothPath(trendPoints);
  const areaPath = trendPoints.length > 1
    ? `${linePath} L ${trendPoints[trendPoints.length - 1].x} 62 L ${trendPoints[0].x} 62 Z`
    : "";

  const gridYs = [52, 43, 34, 25, 16];

  return (
    <section className="card trend-card compact-card">
      <div className="card-heading">
        <h2>Trend Chart</h2>
        <MoreButton />
      </div>
      {trendPoints.length > 0 ? (
        <svg className="trend-svg" viewBox="0 0 124 68" aria-label="Trend Chart">
          <defs>
            <linearGradient id="trendFill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#08a966" stopOpacity="0.40" />
              <stop offset="100%" stopColor="#08a966" stopOpacity="0.02" />
            </linearGradient>
            <filter id="trendGlow">
              <feGaussianBlur in="SourceGraphic" stdDeviation="2" />
            </filter>
          </defs>
          {gridYs.map((y, i) => (
            <line key={i} x1="0" y1={y} x2="124" y2={y} className="trend-hgrid" />
          ))}
          <path d={areaPath} fill="url(#trendFill)" className="trend-area" />
          <path d={linePath} className="trend-line" />
          <path d={linePath} className="trend-line-scan" />
          {trendPoints.map((point) => (
            <g key={point.period}>
              <line x1={point.x} y1={point.y + 3} x2={point.x} y2="62" className="trend-vgrid" />
              <text x={point.x} y={point.y - 8} className={`trend-label ${point.tone}`}>
                {point.value}
              </text>
              <circle cx={point.x} cy={point.y} r="4" className={`trend-dot ${point.tone}`} />
              <circle cx={point.x} cy={point.y} r="9" className={`trend-dot-ring ${point.tone}`} />
              <text x={point.x} y="65" className="trend-period">
                {point.period.slice(-4)}
              </text>
            </g>
          ))}
        </svg>
      ) : (
        <div className="compact-empty">Loading...</div>
      )}
    </section>
  );
}

function HotColdCard({ hotCold }) {
  return (
    <section className="card hot-card compact-card">
      <div className="hot-card-bg" />
      <div className="hot-card-blob" />
      <div className="card-heading">
        <h2>Hot & Cold</h2>
        <MoreButton />
      </div>
      <div className="hot-list">
        {hotCold.length > 0 ? (
          hotCold.map((item) => (
            <div className="hot-row" key={`${item.value}-${item.label}`}>
              <span className={`mini-token ${item.tone}`}>{item.value}</span>
              <span className={`temp-icon ${item.type}`}>
                {item.type === "hot" ? "Hot" : "Cold"}
              </span>
              <span className="temp-label">{item.label}</span>
              <strong>{item.amount}</strong>
            </div>
          ))
        ) : (
          <div className="compact-empty">Loading...</div>
        )}
      </div>
    </section>
  );
}

function useCountUp(target, duration = 1200) {
  const [count, setCount] = useState(0);
  const ref = useRef(null);
  const hasAnimated = useRef(false);

  useEffect(() => {
    const node = ref.current;
    if (!node || hasAnimated.current) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !hasAnimated.current) {
          hasAnimated.current = true;
          const start = performance.now();
          const from = 0;
          const to = Number(target) || 0;

          function tick(now) {
            const elapsed = now - start;
            const progress = Math.min(elapsed / duration, 1);
            const ease = 1 - Math.pow(1 - progress, 3);
            setCount(Math.round(from + (to - from) * ease));
            if (progress < 1) requestAnimationFrame(tick);
          }
          requestAnimationFrame(tick);
        }
      },
      { threshold: 0.3 },
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, [target, duration]);

  return { count, ref };
}

function AnimatedValue({ value, suffix = "" }) {
  const { count, ref } = useCountUp(value);
  return (
    <strong ref={ref}>
      {count}
      {suffix}
    </strong>
  );
}

function DashboardMetric({ label, value, detail, tone, icon, suffix }) {
  return (
    <div className={`dashboard-metric ${tone}`}>
      <div className="dashboard-metric-glow" />
      <span className="dashboard-metric-icon">
        <Icon name={icon} />
      </span>
      <div>
        <span>{label}</span>
        <AnimatedValue value={value} suffix={suffix || ""} />
        <em>{detail}</em>
      </div>
    </div>
  );
}

function SignalWaves() {
  return (
    <div className="signal-waves" aria-hidden="true">
      <span />
      <span />
      <span />
      <span />
    </div>
  );
}

function LiveDot() {
  return (
    <span className="live-dot">
      <span />
      <span>LIVE</span>
    </span>
  );
}

function Dashboard({ history, hotCold, currentPeriod, remainingMs, stats }) {
  const issue = splitIssueNumber(currentPeriod.issueNumber);
  const latest = history[0];
  const topSignal = stats.topSignal ?? {
    value: latest?.number ?? "-",
    tone: latest ? getNumberTone(latest) : "green",
    amount: "0 Time",
  };
  const frequency = Array.from({ length: 10 }, (_, number) => ({
    number,
    count: history.filter((row) => row.number === number).length,
  }));
  const maxFrequency = Math.max(1, ...frequency.map((item) => item.count));
  const metricCards = [
    {
      label: "Total Prediction",
      value: stats.total,
      detail: "Settled rounds",
      tone: "mint",
      icon: "layers",
    },
    {
      label: "Prediction Wins",
      value: stats.wins,
      detail: "Color matched",
      tone: "green",
      icon: "target",
    },
    {
      label: "Prediction Loss",
      value: stats.losses,
      detail: "Missed rounds",
      tone: "coral",
      icon: "bolt",
    },
    {
      label: "Win Accuracy",
      value: stats.accuracy,
      detail: "Live accuracy",
      tone: "gold",
      icon: "chart",
      suffix: "%",
    },
    {
      label: "Active Signals",
      value: stats.teachers,
      detail: "More teachers",
      tone: "violet",
      icon: "brain",
    },
  ];
  const heroCards = [
    {
      label: "Timer",
      value: formatTimerLabel(remainingMs),
      detail: "Next period",
      icon: "clock",
    },
    {
      label: "Hot Signal",
      value: topSignal.value,
      detail: topSignal.amount,
      icon: "target",
    },
    {
      label: "Rounds",
      value: history.length,
      detail: "Live sample",
      icon: "layers",
    },
  ];
  const featureCards = [
    {
      label: "Quick Scan",
      value: `${history.length} Live`,
      detail: "Auto refresh mode",
      icon: "sparkle",
    },
    {
      label: "Risk Guard",
      value: `${stats.losses} Miss`,
      detail: "Track weak streaks",
      icon: "bolt",
    },
    {
      label: "Trend Lock",
      value: `No. ${topSignal.value}`,
      detail: topSignal.amount,
      icon: "chart",
    },
    {
      label: "Reward Zone",
      value: "Gift Ready",
      detail: "Premium signal flow",
      icon: "target",
    },
  ];

  return (
    <section className="dashboard-view">
      <div className="dashboard-hero">
        <div className="dashboard-anim dashboard-anim-left">
          <FireAnim />
        </div>
        <div className="dashboard-anim dashboard-anim-right">
          <GiftAnim />
        </div>

        <div className="dashboard-hero-content">
          <div className="dashboard-kicker">
            <Icon name="sparkle" />
            <LiveDot />
            Live premium dashboard
          </div>
          <div className="dashboard-title-row">
            <div>
              <h1>Dashboard</h1>
              <p>Clean signal control by @kalmods</p>
            </div>
            <div className="dashboard-score">
              <span>Win Rate</span>
              <strong>{stats.accuracy}%</strong>
            </div>
          </div>
          <div className="dashboard-period">
            <span>Current Period</span>
            <strong>
              {issue.date}
              <br />
              {issue.serial}
            </strong>
          </div>
          <div className="dashboard-hero-cards">
            {heroCards.map((card) => (
              <div className="dashboard-hero-card" key={card.label}>
                <span>
                  <Icon name={card.icon} />
                  {card.label}
                </span>
                <strong>{card.value}</strong>
                <em>{card.detail}</em>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="dashboard-feature-grid">
        {featureCards.map((feature) => (
          <div className="dashboard-feature" key={feature.label}>
            <span>
              <Icon name={feature.icon} />
            </span>
            <div>
              <p>{feature.label}</p>
              <strong>{feature.value}</strong>
              <em>{feature.detail}</em>
            </div>
          </div>
        ))}
      </div>

      <div className="dashboard-metrics">
        {metricCards.map((metric) => (
          <DashboardMetric key={metric.label} {...metric} />
        ))}
      </div>

      <div className="dashboard-focus">
        <div
          className="dashboard-ring"
          style={{ "--accuracy": `${stats.accuracy * 3.6}deg` }}
        >
          <strong>{stats.accuracy}%</strong>
          <span>Win Accuracy</span>
        </div>
        <div className="signal-panel">
          <SignalWaves />
          <span>Top Repeat Signal</span>
          <div className="signal-number">
            <b className={topSignal.tone}>{topSignal.value}</b>
            <strong>{topSignal.amount}</strong>
          </div>
          <p>
            {latest
              ? `Latest result ${latest.number} / ${latest.size}`
              : "Waiting for live result"}
          </p>
        </div>
      </div>

      <div className="frequency-board" aria-label="Number frequency">
        <div className="frequency-label">
          <span>Number Frequency</span>
          <span className="frequency-count">{history.length} rounds</span>
        </div>
        <div className="frequency-grid">
          {frequency.map((item) => (
            <div className="frequency-bar" key={item.number}>
              <span>{item.number}</span>
              <div className="frequency-track">
                <i style={{ "--height": `${(item.count / maxFrequency) * 100}%` }} />
              </div>
              <em>{item.count}</em>
            </div>
          ))}
        </div>
      </div>

      <a
        className="telegram-button"
        href="https://t.me/+spWu5CnIDrViNDRl"
        target="_blank"
        rel="noreferrer"
      >
        <TelegramAnim />
        Join Telegram Channel
      </a>
    </section>
  );
}

function HistoryTable({ history, status }) {
  const emptyMessage =
    status === "loading" ? "Loading live results..." : "Live results unavailable";

  return (
    <section className="card history-card">
      <div className="history-table">
        <div className="history-head">
          <span>Period</span>
          <span>Number</span>
          <span>Big Small</span>
          <span>Color</span>
        </div>
        {history.length > 0 ? (
          history.map((row) => {
            const colors = row.colors?.length ? row.colors : ["green"];

            return (
              <div className="history-row" key={row.period}>
                <span>{row.period}</span>
                <strong
                  className={`history-number ${
                    colors.length > 1 ? colors.join("-") : colors[0]
                  }`}
                >
                  {row.number}
                </strong>
                <span>{row.size}</span>
                <span className="color-dots">
                  {colors.map((color) => (
                    <i className={color} key={color} />
                  ))}
                </span>
              </div>
            );
          })
        ) : (
          <div className="history-row history-message">
            <span>{emptyMessage}</span>
          </div>
        )}
      </div>
    </section>
  );
}

function RulesPopup({ onClose, remaining }) {
  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = ""; };
  }, []);

  return (
    <div className="rules-overlay" onClick={onClose}>
      <div className="rules-modal" onClick={(e) => e.stopPropagation()}>
        <button className="rules-close" type="button" onClick={onClose}>
          <Icon name="back" />
        </button>
        <div className="rules-content">
          <RulesAnim />
          <h2>How to Play</h2>
          <p>
            Predict the correct number, color, or size for the next period.
            Choose from Green, Violet, or Red — or pick a specific number.
            Win big with multipliers up to 100x!
          </p>
          <div className="rules-limit">
            <strong>Daily Limit</strong>
            <span>
              {remaining === -1
                ? 'Unlimited Predictions'
                : `${remaining} / 5 Predictions remaining today`}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

function Toast({ message, visible }) {
  return (
    <div className={`toast ${visible ? "toast-visible" : ""}`}>
      <span>{message}</span>
    </div>
  );
}

function AuthGate() {
  return (
    <>
      <Head>
        <title>Checking Login | TryonAI</title>
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1, maximum-scale=1"
        />
        <meta name="theme-color" content="#ffffff" />
      </Head>
      <div className="auth-gate">
        <span />
        <p>Checking login...</p>
      </div>
    </>
  );
}

function BottomNav({ activeView, onChangeView }) {
  const items = [
    { label: "Predict", icon: "brain", view: "predict" },
    { label: "Chart", icon: "chart", view: "dashboard" },
  ];

  return (
    <nav className="bottom-nav" aria-label="Main navigation">
      <button
        className={`nav-item ${activeView === items[0].view ? "active" : ""}`}
        type="button"
        onClick={() => onChangeView(items[0].view)}
      >
        <Icon name={items[0].icon} />
        <span>{items[0].label}</span>
      </button>
      <button
        className="nav-bolt"
        type="button"
        aria-label="Quick prediction"
        onClick={() => onChangeView("predict")}
      >
        <Icon name="bolt" />
      </button>
      <button
        className={`nav-item ${activeView === items[1].view ? "active" : ""}`}
        type="button"
        onClick={() => onChangeView(items[1].view)}
      >
        <Icon name={items[1].icon} />
        <span>{items[1].label}</span>
      </button>
    </nav>
  );
}

function MainApp({ user }) {
  const [activeView, setActiveView] = useState("predict");
  const [showRules, setShowRules] = useState(false);
  const [toastVisible, setToastVisible] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const [remaining, setRemaining] = useState(5);
  const [predictionResult, setPredictionResult] = useState(null);
  const [showServerAnim, setShowServerAnim] = useState(false);
  const [userPredictions, setUserPredictions] = useState([]);
  const toastTimer = useRef(null);
  const lastPredictedPeriod = useRef(null);
  const screenRef = useRef(null);
  const router = useRouter();
  const { apiCurrent, history, serverNow, status } = useLiveHistory();
  const savedUser = useRef(false);

  useEffect(() => {
    if (user?.email && !savedUser.current) {
      savedUser.current = true;
      addUser({ email: user.email, displayName: user.displayName, photoURL: user.photoURL });
    }
  }, [user]);

  useEffect(() => {
    if (user?.email) {
      setRemaining(getRemainingPredictions(user.email));
    }
  }, [user]);

  function handleBetClick() {
    if (!user?.email) return;
    const r = getRemainingPredictions(user.email);
    if (r === 0) {
      router.push('/subscription');
      return;
    }
    if (r > 0) {
      incrementPredictionCount(user.email);
      const newRemaining = getRemainingPredictions(user.email);
      setRemaining(newRemaining);
      if (newRemaining === 0) {
        router.push('/subscription');
        return;
      }
    }
    setToastVisible(true);
    if (toastTimer.current) clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToastVisible(false), 2000);
  }
  function handleGeneratePrediction() {
    if (!user?.email) return;
    const r = getRemainingPredictions(user.email);
    if (r === 0) {
      router.push('/subscription');
      return;
    }
    if (lastPredictedPeriod.current === currentPeriod.issueNumber) {
      setToastMessage("Wait for next result");
      setToastVisible(true);
      if (toastTimer.current) clearTimeout(toastTimer.current);
      toastTimer.current = setTimeout(() => setToastVisible(false), 3000);
      return;
    }
    if (r > 0) {
      incrementPredictionCount(user.email);
      const newRemaining = getRemainingPredictions(user.email);
      setRemaining(newRemaining);
      if (newRemaining === 0) {
        setTimeout(() => router.push('/subscription'), 1500);
      }
    }
    lastPredictedPeriod.current = currentPeriod.issueNumber;
    setPredictionResult(null);
    setShowServerAnim(true);
    fetch("/api/predict")
      .then(r => r.json())
      .then(data => {
        const size = data.prediction || (Math.random() >= 0.5 ? "Big" : "Small");
        setUserPredictions(prev => [...prev, { period: currentPeriod.issueNumber, prediction: size }]);
        setTimeout(() => {
          setShowServerAnim(false);
          setPredictionResult(size);
        }, 5000);
      })
      .catch(() => {
        const size = Math.random() >= 0.5 ? "Big" : "Small";
        setUserPredictions(prev => [...prev, { period: currentPeriod.issueNumber, prediction: size }]);
        setTimeout(() => {
          setShowServerAnim(false);
          setPredictionResult(size);
        }, 5000);
      });
  }
  const currentPeriod = useMemo(
    () => getCurrentPeriod(history, serverNow, apiCurrent),
    [apiCurrent, history, serverNow],
  );
  const latestBalls = useMemo(
    () =>
      history.slice(0, 5).map((row) => ({
        period: row.period,
        tone: getNumberTone(row),
        value: row.number,
      })),
    [history],
  );
  const trendPoints = useMemo(() => buildTrendPoints(history), [history]);
  const hotCold = useMemo(() => buildHotCold(history), [history]);
  const dashboardStats = useMemo(() => {
    const settled = userPredictions.filter(up =>
      history.some(row => row.period === up.period)
    );
    const total = userPredictions.length;
    const wins = settled.filter(({ period, prediction }) => {
      const result = history.find(row => row.period === period);
      return result && result.size === prediction;
    }).length;
    const losses = settled.length - wins;
    const accuracy = settled.length ? Math.round((wins / settled.length) * 100) : 0;
    const topSignal = hotCold[0] ?? { value: "-", tone: "green", amount: "0 Time" };
    return {
      total,
      wins,
      losses,
      accuracy,
      teachers: hotCold.length,
      topSignal,
    };
  }, [userPredictions, history, hotCold]);

  useEffect(() => {
    if (window.location.hash === "#dashboard") {
      const timeout = window.setTimeout(() => setActiveView("dashboard"), 0);

      return () => window.clearTimeout(timeout);
    }

    return undefined;
  }, []);

  useEffect(() => {
    const target = screenRef.current;

    if (target) {
      target.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }

    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [activeView]);

  return (
    <>
      <Head>
        <title>TryonAI UI</title>
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1, maximum-scale=1"
        />
        <meta name="theme-color" content="#00964f" />
      </Head>
      {showRules && <RulesPopup onClose={() => setShowRules(false)} remaining={remaining} />}
      <Toast message={toastMessage} visible={toastVisible} />
      <div className="page-shell">
        <div className="app-screen" ref={screenRef}>
          <Header onRulesClick={() => setShowRules(true)} />
          <main className="content">
            {activeView === "predict" ? (
              <>
                <div className="top-cards">
                  <HowToPlay latestBalls={latestBalls} />
                  <TimeRemaining
                    issueNumber={currentPeriod.issueNumber}
                    remainingMs={currentPeriod.remainingMs}
                  />
                </div>
                <BettingPanel onBetClick={handleBetClick} />
                <PredictionCard
                  hotCold={hotCold}
                  issueNumber={currentPeriod.issueNumber}
                  remainingMs={currentPeriod.remainingMs}
                  predictionResult={predictionResult}
                  showServerAnim={showServerAnim}
                />
                <button
                  className="relative flex items-center px-6 py-3 overflow-hidden font-medium transition-all bg-emerald-600 rounded-md group w-full mt-[13px] mb-[38px]"
                  type="button"
                  onClick={handleGeneratePrediction}
                >
                    <span className="absolute top-0 right-0 inline-block w-4 h-4 transition-all duration-500 ease-in-out bg-emerald-800 rounded group-hover:-mr-4 group-hover:-mt-4">
                    <span className="absolute top-0 right-0 w-5 h-5 rotate-45 translate-x-1/2 -translate-y-1/2 bg-white"></span>
                  </span>
                    <span className="absolute bottom-0 rotate-180 left-0 inline-block w-4 h-4 transition-all duration-500 ease-in-out bg-emerald-800 rounded group-hover:-ml-4 group-hover:-mb-4">
                    <span className="absolute top-0 right-0 w-5 h-5 rotate-45 translate-x-1/2 -translate-y-1/2 bg-white"></span>
                  </span>
                                      <span className="absolute bottom-0 left-0 w-full h-full transition-all duration-500 ease-in-out delay-200 -translate-x-full bg-emerald-700 rounded-md group-hover:translate-x-0"></span>
                    <span className="relative w-full text-center text-white transition-colors duration-200 ease-in-out group-hover:text-white">
                    GENERATE PREDICTION
                  </span>
                </button>
                <div className="insights-grid">
                  <TrendChart trendPoints={trendPoints} />
                  <HotColdCard hotCold={hotCold} />
                </div>
                <HistoryTable history={history} status={status} />
              </>
            ) : (
              <Dashboard
                currentPeriod={currentPeriod}
                history={history}
                hotCold={hotCold}
                remainingMs={currentPeriod.remainingMs}
                stats={dashboardStats}
              />
            )}
          </main>
        </div>
        <BottomNav activeView={activeView} onChangeView={setActiveView} />
      </div>
    </>
  );
}

export default function Home() {
  const router = useRouter();
  const [authReady, setAuthReady] = useState(false);
  const [user, setUser] = useState(null);

  useEffect(() => {
    let active = true;
    let unsubscribe = () => {};

    watchAuthState((currentUser) => {
      if (!active) return;

      if (!currentUser) {
        setAuthReady(true);
        router.replace("/login");
        return;
      }

      setUser(currentUser);
      setAuthReady(true);
    })
      .then((unsub) => {
        unsubscribe = unsub;
      })
      .catch((error) => {
        console.error("Auth guard error:", error);

        if (active) {
          setAuthReady(true);
          router.replace("/login");
        }
      });

    return () => {
      active = false;
      unsubscribe();
    };
  }, [router]);

  if (!authReady || !user) {
    return <AuthGate />;
  }

  return <MainApp user={user} />;
}
