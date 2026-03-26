import { useState, useEffect, useRef } from "react";

const CATEGORIES = {
  fitness: { label: "Fitness", icon: "🏋️", color: "#F59E0B" },
  business: { label: "Business", icon: "🚀", color: "#3B82F6" },
  financial: { label: "Financial", icon: "💰", color: "#10B981" },
  skill: { label: "Skill", icon: "🎯", color: "#8B5CF6" },
};

const SAMPLE_OUTCOMES = [
  {
    id: "1",
    title: "Muscle Up",
    category: "fitness",
    commitDate: "2025-12-26",
    description: "Achieve a clean muscle up on the bar",
    milestones: [
      { id: "m1", title: "5 strict pull-ups", target: 5, unit: "reps", completed: true, completedDate: "2026-01-20" },
      { id: "m2", title: "10 strict pull-ups", target: 10, unit: "reps", completed: true, completedDate: "2026-03-10" },
      { id: "m3", title: "15 strict pull-ups", target: 15, unit: "reps", completed: false },
      { id: "m4", title: "High pull-ups (chest to bar)", target: 10, unit: "reps", completed: false },
      { id: "m5", title: "Negative muscle ups (slow descent)", target: 5, unit: "reps", completed: false },
      { id: "m6", title: "First muscle up", target: 1, unit: "rep", completed: false },
    ],
    currentMetric: { label: "Pull-ups", value: 11, unit: "reps" },
    logs: [
      { date: "2026-03-25", note: "Hit 11 pull-ups today! Form was solid.", metric: 11 },
      { date: "2026-03-20", note: "Worked on explosive pull-ups. Got 10 clean.", metric: 10 },
      { date: "2026-03-10", note: "Finally broke the 10 rep barrier!", metric: 10 },
      { date: "2026-02-20", note: "8 pull-ups. Getting stronger each week.", metric: 8 },
      { date: "2026-02-01", note: "6 pull-ups. Grip strength improving.", metric: 6 },
      { date: "2026-01-15", note: "4 pull-ups. Long way to go.", metric: 4 },
      { date: "2025-12-28", note: "Day 2. Managed 2 ugly pull-ups.", metric: 2 },
      { date: "2025-12-26", note: "Day 0. Can barely do 1 pull-up. Committed.", metric: 1 },
    ],
    streak: 12,
  },
  {
    id: "2",
    title: "6-Figure Coaching Business",
    category: "business",
    commitDate: "2026-01-01",
    description: "Scale coaching to $100K annual revenue",
    milestones: [
      { id: "b1", title: "First paying client", target: 1, unit: "client", completed: true, completedDate: "2026-01-15" },
      { id: "b2", title: "$2K monthly revenue", target: 2000, unit: "$/mo", completed: true, completedDate: "2026-02-28" },
      { id: "b3", title: "10 active clients", target: 10, unit: "clients", completed: false },
      { id: "b4", title: "$5K monthly revenue", target: 5000, unit: "$/mo", completed: false },
      { id: "b5", title: "$8.3K monthly revenue", target: 8300, unit: "$/mo", completed: false },
    ],
    currentMetric: { label: "Monthly Revenue", value: 2800, unit: "$/mo" },
    logs: [
      { date: "2026-03-24", note: "Closed 2 new clients this week. Revenue climbing.", metric: 2800 },
      { date: "2026-03-15", note: "Workshop went great. 3 leads in pipeline.", metric: 2400 },
    ],
    streak: 8,
  },
  {
    id: "3",
    title: "Emergency Fund: 6 Months",
    category: "financial",
    commitDate: "2026-02-01",
    description: "Save 6 months of living expenses ($18,000)",
    milestones: [
      { id: "f1", title: "First $1,000 saved", target: 1000, unit: "$", completed: true, completedDate: "2026-02-20" },
      { id: "f2", title: "$3,000 (1 month)", target: 3000, unit: "$", completed: true, completedDate: "2026-03-15" },
      { id: "f3", title: "$6,000 (2 months)", target: 6000, unit: "$", completed: false },
      { id: "f4", title: "$9,000 (3 months)", target: 9000, unit: "$", completed: false },
      { id: "f5", title: "$12,000 (4 months)", target: 12000, unit: "$", completed: false },
      { id: "f6", title: "$18,000 (6 months)", target: 18000, unit: "$", completed: false },
    ],
    currentMetric: { label: "Saved", value: 3400, unit: "$" },
    logs: [
      { date: "2026-03-22", note: "Added $400 this week from side income.", metric: 3400 },
    ],
    streak: 6,
  },
];

function getDaysSince(dateStr) {
  const d = new Date(dateStr);
  const now = new Date("2026-03-26");
  return Math.floor((now - d) / (1000 * 60 * 60 * 24));
}

function getCompletedMilestones(outcome) {
  return outcome.milestones.filter((m) => m.completed).length;
}

function getProgress(outcome) {
  const total = outcome.milestones.length;
  const done = getCompletedMilestones(outcome);
  return total > 0 ? (done / total) * 100 : 0;
}

function MiniGraph({ logs, color }) {
  if (!logs || logs.length < 2) return null;
  const sorted = [...logs].sort((a, b) => new Date(a.date) - new Date(b.date));
  const values = sorted.map((l) => l.metric);
  const min = Math.min(...values);
  const max = Math.max(...values);
  const range = max - min || 1;
  const w = 160;
  const h = 48;
  const pad = 4;

  const points = values.map((v, i) => {
    const x = pad + (i / (values.length - 1)) * (w - pad * 2);
    const y = h - pad - ((v - min) / range) * (h - pad * 2);
    return `${x},${y}`;
  });

  const areaPoints = [...points, `${pad + (w - pad * 2)},${h}`, `${pad},${h}`].join(" ");

  return (
    <svg width={w} height={h} style={{ overflow: "visible" }}>
      <defs>
        <linearGradient id={`grad-${color.replace("#", "")}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.3" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      <polygon points={areaPoints} fill={`url(#grad-${color.replace("#", "")})`} />
      <polyline points={points.join(" ")} fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      {points.map((p, i) => {
        const [cx, cy] = p.split(",");
        return i === points.length - 1 ? (
          <circle key={i} cx={cx} cy={cy} r="4" fill={color} stroke="#1a1a2e" strokeWidth="2" />
        ) : null;
      })}
    </svg>
  );
}

function ProgressRing({ progress, size = 56, strokeWidth = 4, color }) {
  const r = (size - strokeWidth) / 2;
  const circ = 2 * Math.PI * r;
  const offset = circ - (progress / 100) * circ;

  return (
    <svg width={size} height={size} style={{ transform: "rotate(-90deg)" }}>
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth={strokeWidth} />
      <circle
        cx={size / 2}
        cy={size / 2}
        r={r}
        fill="none"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeDasharray={circ}
        strokeDashoffset={offset}
        strokeLinecap="round"
        style={{ transition: "stroke-dashoffset 1s ease" }}
      />
    </svg>
  );
}

// Theme data for each category - backgrounds, decorations, colors
const JOURNEY_THEMES = {
  fitness: {
    bgGradient: ["#1a3a2a", "#0f2318", "#162e20"],
    pathColor: "#fff",
    scenery: [
      { emoji: "🏔️", x: "6%", y: "5%", size: 26, opacity: 0.6 },
      { emoji: "🌲", x: "92%", y: "20%", size: 18, opacity: 0.4 },
      { emoji: "💪", x: "88%", y: "50%", size: 18, opacity: 0.3 },
      { emoji: "🌲", x: "5%", y: "70%", size: 20, opacity: 0.35 },
      { emoji: "⛰️", x: "88%", y: "85%", size: 22, opacity: 0.4 },
    ],
    accent: "#4ADE80",
    label: "Mountain Trail",
  },
  business: {
    bgGradient: ["#1a1a3e", "#0f0f28", "#1a1535"],
    pathColor: "#fff",
    scenery: [
      { emoji: "🏙️", x: "6%", y: "5%", size: 26, opacity: 0.5 },
      { emoji: "🚀", x: "90%", y: "25%", size: 18, opacity: 0.35 },
      { emoji: "📈", x: "5%", y: "55%", size: 18, opacity: 0.35 },
      { emoji: "🏢", x: "88%", y: "75%", size: 22, opacity: 0.4 },
      { emoji: "💎", x: "6%", y: "88%", size: 18, opacity: 0.3 },
    ],
    accent: "#60A5FA",
    label: "Startup Road",
  },
  financial: {
    bgGradient: ["#1a2e1a", "#0f1f12", "#182818"],
    pathColor: "#fff",
    scenery: [
      { emoji: "🌴", x: "6%", y: "5%", size: 24, opacity: 0.5 },
      { emoji: "🪙", x: "90%", y: "20%", size: 18, opacity: 0.35 },
      { emoji: "💰", x: "5%", y: "50%", size: 18, opacity: 0.3 },
      { emoji: "🦜", x: "92%", y: "65%", size: 18, opacity: 0.35 },
      { emoji: "🏝️", x: "6%", y: "85%", size: 22, opacity: 0.4 },
    ],
    accent: "#34D399",
    label: "Treasure Island",
  },
  skill: {
    bgGradient: ["#2a1a3a", "#1a0f28", "#251535"],
    pathColor: "#fff",
    scenery: [
      { emoji: "🌌", x: "6%", y: "5%", size: 24, opacity: 0.4 },
      { emoji: "✨", x: "90%", y: "22%", size: 14, opacity: 0.35 },
      { emoji: "📚", x: "5%", y: "50%", size: 18, opacity: 0.3 },
      { emoji: "⚡", x: "92%", y: "70%", size: 16, opacity: 0.3 },
      { emoji: "🧠", x: "6%", y: "85%", size: 20, opacity: 0.35 },
    ],
    accent: "#A78BFA",
    label: "Mystic Path",
  },
};

function JourneyMap({ outcome }) {
  const cat = CATEGORIES[outcome.category];
  const theme = JOURNEY_THEMES[outcome.category];
  const milestones = outcome.milestones;
  const completedCount = milestones.filter((m) => m.completed).length;
  const totalStops = milestones.length + 1; // +1 for the dream destination at top

  // Calculate path points - S-curve winding path from bottom to top
  const mapHeight = Math.max(280, totalStops * 65 + 50);
  const pathPoints = [];
  const nodePositions = [];

  for (let i = 0; i < totalStops; i++) {
    const t = i / (totalStops - 1);
    const y = mapHeight - 35 - t * (mapHeight - 70);
    const xCenter = 50;
    const amplitude = 26;
    const x = xCenter + Math.sin(t * Math.PI * (totalStops > 4 ? 2.5 : 2)) * amplitude;
    pathPoints.push({ x, y });
    nodePositions.push({ x, y, index: i });
  }

  // Build SVG path
  let pathD = `M ${pathPoints[0].x}% ${pathPoints[0].y}`;
  for (let i = 1; i < pathPoints.length; i++) {
    const prev = pathPoints[i - 1];
    const curr = pathPoints[i];
    const cpY = (prev.y + curr.y) / 2;
    pathD += ` C ${prev.x}% ${cpY}, ${curr.x}% ${cpY}, ${curr.x}% ${curr.y}`;
  }

  // Player position - on the next uncompleted milestone (or at the end if all done)
  const playerIdx = Math.min(completedCount, milestones.length - 1);
  const playerPos = completedCount >= milestones.length
    ? pathPoints[pathPoints.length - 1]
    : pathPoints[completedCount];

  return (
    <div
      style={{
        borderRadius: 16,
        overflow: "hidden",
        position: "relative",
        background: `linear-gradient(180deg, ${theme.bgGradient[0]}, ${theme.bgGradient[1]} 50%, ${theme.bgGradient[2]})`,
        marginBottom: 20,
      }}
    >
      {/* Subtle texture overlay */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          background: "radial-gradient(ellipse at 30% 20%, rgba(255,255,255,0.04) 0%, transparent 60%), radial-gradient(ellipse at 70% 80%, rgba(255,255,255,0.03) 0%, transparent 50%)",
          pointerEvents: "none",
        }}
      />

      {/* Theme label */}
      <div
        style={{
          position: "absolute",
          top: 12,
          left: 16,
          fontSize: 10,
          textTransform: "uppercase",
          letterSpacing: "0.12em",
          color: "rgba(255,255,255,0.3)",
          fontWeight: 600,
          zIndex: 2,
        }}
      >
        {theme.label}
      </div>

      {/* Scenery decorations */}
      {theme.scenery.map((s, i) => (
        <div
          key={i}
          style={{
            position: "absolute",
            left: s.x,
            top: s.y,
            fontSize: s.size,
            opacity: s.opacity,
            pointerEvents: "none",
            zIndex: 1,
            filter: "drop-shadow(0 2px 4px rgba(0,0,0,0.3))",
            animation: `fadeIn 0.6s ease ${0.1 + i * 0.08}s both`,
          }}
        >
          {s.emoji}
        </div>
      ))}

      {/* SVG Journey Path + Nodes */}
      <svg
        width="100%"
        height={mapHeight}
        viewBox={`0 0 100 ${mapHeight}`}
        preserveAspectRatio="none"
        style={{ position: "relative", zIndex: 2, display: "block" }}
      >
        <defs>
          {/* Completed path gradient */}
          <linearGradient id="pathCompleted" x1="0" y1="1" x2="0" y2="0">
            <stop offset="0%" stopColor={theme.accent} />
            <stop offset="100%" stopColor={cat.color} />
          </linearGradient>
          {/* Glow filter */}
          <filter id="glow">
            <feGaussianBlur stdDeviation="1.5" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
          {/* Player pulse */}
          <filter id="playerGlow">
            <feGaussianBlur stdDeviation="2" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* Uncompleted path (dim) */}
        <path
          d={pathD}
          fill="none"
          stroke="rgba(255,255,255,0.12)"
          strokeWidth="3.5"
          strokeLinecap="round"
          vectorEffect="non-scaling-stroke"
        />

        {/* Completed path (bright) - drawn partially */}
        {completedCount > 0 && (() => {
          let completedD = `M ${pathPoints[0].x}% ${pathPoints[0].y}`;
          const endIdx = Math.min(completedCount, pathPoints.length - 1);
          for (let i = 1; i <= endIdx; i++) {
            const prev = pathPoints[i - 1];
            const curr = pathPoints[i];
            const cpY = (prev.y + curr.y) / 2;
            completedD += ` C ${prev.x}% ${cpY}, ${curr.x}% ${cpY}, ${curr.x}% ${curr.y}`;
          }
          return (
            <path
              d={completedD}
              fill="none"
              stroke="url(#pathCompleted)"
              strokeWidth="3.5"
              strokeLinecap="round"
              filter="url(#glow)"
              vectorEffect="non-scaling-stroke"
            />
          );
        })()}

        {/* Dotted upcoming path */}
        {pathPoints.slice(completedCount).length >= 2 && (() => {
          const start = pathPoints[completedCount];
          let dottedD = `M ${start.x}% ${start.y}`;
          for (let i = completedCount + 1; i < pathPoints.length; i++) {
            const prev = pathPoints[i - 1];
            const curr = pathPoints[i];
            const cpY = (prev.y + curr.y) / 2;
            dottedD += ` C ${prev.x}% ${cpY}, ${curr.x}% ${cpY}, ${curr.x}% ${curr.y}`;
          }
          return (
            <path
              d={dottedD}
              fill="none"
              stroke="rgba(255,255,255,0.2)"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeDasharray="4 6"
              vectorEffect="non-scaling-stroke"
            />
          );
        })()}
      </svg>

      {/* Milestone nodes and labels (HTML overlays for better text rendering) */}
      <div style={{ position: "absolute", inset: 0, zIndex: 3, pointerEvents: "none" }}>
        {milestones.map((m, i) => {
          const pos = pathPoints[i];
          const isCompleted = m.completed;
          const isCurrent = i === completedCount;
          const isLeft = pos.x < 50;

          return (
            <div key={m.id}>
              {/* Node circle */}
              <div
                style={{
                  position: "absolute",
                  left: `${pos.x}%`,
                  top: pos.y,
                  transform: "translate(-50%, -50%)",
                  width: isCurrent ? 26 : isCompleted ? 22 : 16,
                  height: isCurrent ? 26 : isCompleted ? 22 : 16,
                  borderRadius: "50%",
                  background: isCompleted
                    ? theme.accent
                    : isCurrent
                    ? cat.color
                    : "rgba(255,255,255,0.1)",
                  border: isCurrent
                    ? `3px solid #fff`
                    : isCompleted
                    ? `2px solid rgba(255,255,255,0.3)`
                    : `2px solid rgba(255,255,255,0.15)`,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: isCompleted ? 12 : 10,
                  color: isCompleted || isCurrent ? "#fff" : "rgba(255,255,255,0.3)",
                  fontWeight: 700,
                  boxShadow: isCurrent
                    ? `0 0 20px ${cat.color}88, 0 0 40px ${cat.color}44`
                    : isCompleted
                    ? `0 0 12px ${theme.accent}44`
                    : "none",
                  animation: isCurrent ? "pulse 2s ease infinite" : `fadeSlideIn 0.4s ease ${i * 0.1}s both`,
                  zIndex: isCurrent ? 5 : 3,
                }}
              >
                {isCompleted ? "★" : isCurrent ? "●" : ""}
              </div>

              {/* Label */}
              <div
                style={{
                  position: "absolute",
                  top: pos.y,
                  transform: "translateY(-50%)",
                  ...(isLeft
                    ? { left: `${pos.x + 6}%`, textAlign: "left" }
                    : { right: `${100 - pos.x + 6}%`, textAlign: "right" }),
                  maxWidth: "38%",
                  animation: `fadeSlideIn 0.4s ease ${i * 0.1 + 0.05}s both`,
                }}
              >
                <div
                  style={{
                    fontSize: 10,
                    fontWeight: 700,
                    color: isCompleted ? "#fff" : isCurrent ? cat.color : "rgba(255,255,255,0.4)",
                    lineHeight: 1.2,
                    textShadow: "0 1px 4px rgba(0,0,0,0.6)",
                    fontFamily: "'Inter', sans-serif",
                  }}
                >
                  {m.title}
                </div>
                {isCompleted && m.completedDate && (
                  <div style={{ fontSize: 8, color: theme.accent, marginTop: 1, fontFamily: "'JetBrains Mono', monospace", textShadow: "0 1px 3px rgba(0,0,0,0.5)" }}>
                    {new Date(m.completedDate).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                  </div>
                )}
                {isCurrent && (
                  <div
                    style={{
                      marginTop: 3,
                      padding: "2px 8px",
                      background: `${cat.color}30`,
                      border: `1px solid ${cat.color}50`,
                      borderRadius: 4,
                      fontSize: 9,
                      color: cat.color,
                      display: "inline-block",
                      fontWeight: 700,
                      letterSpacing: "0.05em",
                      textTransform: "uppercase",
                    }}
                  >
                    Next up
                  </div>
                )}
              </div>
            </div>
          );
        })}

        {/* Dream destination at the top */}
        {pathPoints.length > 0 && (() => {
          const topPos = pathPoints[pathPoints.length - 1];
          const allDone = completedCount >= milestones.length;
          return (
            <div>
              <div
                style={{
                  position: "absolute",
                  left: `${topPos.x}%`,
                  top: topPos.y,
                  transform: "translate(-50%, -50%)",
                  width: 34,
                  height: 34,
                  borderRadius: "50%",
                  background: allDone
                    ? `linear-gradient(135deg, ${cat.color}, ${theme.accent})`
                    : "rgba(255,255,255,0.06)",
                  border: allDone ? "3px solid #fff" : "2px dashed rgba(255,255,255,0.2)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 16,
                  boxShadow: allDone ? `0 0 30px ${cat.color}66` : "none",
                  animation: "fadeSlideIn 0.5s ease 0.3s both",
                }}
              >
                {allDone ? "👑" : "🏆"}
              </div>
              <div
                style={{
                  position: "absolute",
                  left: `${topPos.x}%`,
                  top: topPos.y - 26,
                  transform: "translateX(-50%)",
                  textAlign: "center",
                  animation: "fadeSlideIn 0.5s ease 0.35s both",
                }}
              >
                <div
                  style={{
                    fontSize: 10,
                    fontWeight: 800,
                    color: allDone ? "#fff" : "rgba(255,255,255,0.5)",
                    textShadow: "0 2px 6px rgba(0,0,0,0.6)",
                    fontFamily: "'Sora', sans-serif",
                    letterSpacing: "-0.02em",
                    whiteSpace: "nowrap",
                  }}
                >
                  {outcome.title}
                </div>
              </div>
            </div>
          );
        })()}

        {/* Player avatar - current position */}
        <div
          style={{
            position: "absolute",
            left: `${playerPos.x}%`,
            top: playerPos.y - 24,
            transform: "translateX(-50%)",
            animation: "fadeSlideIn 0.6s ease 0.2s both",
            zIndex: 10,
          }}
        >
          <div
            style={{
              width: 24,
              height: 24,
              borderRadius: "50%",
              background: `linear-gradient(135deg, ${cat.color}, ${theme.accent})`,
              border: "2px solid #fff",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 12,
              boxShadow: `0 0 16px ${cat.color}66, 0 4px 12px rgba(0,0,0,0.4)`,
            }}
          >
            {cat.icon}
          </div>
          {/* Speech bubble */}
          <div
            style={{
              position: "absolute",
              bottom: "100%",
              left: "50%",
              transform: "translateX(-50%)",
              marginBottom: 4,
              padding: "3px 8px",
              background: "#fff",
              borderRadius: 8,
              fontSize: 9,
              fontWeight: 700,
              color: "#0d0d1a",
              whiteSpace: "nowrap",
              boxShadow: "0 2px 8px rgba(0,0,0,0.3)",
            }}
          >
            {completedCount >= milestones.length ? "DONE! 🎉" : `${completedCount}/${milestones.length}`}
            <div style={{ position: "absolute", top: "100%", left: "50%", transform: "translateX(-50%)", width: 0, height: 0, borderLeft: "4px solid transparent", borderRight: "4px solid transparent", borderTop: "4px solid #fff" }} />
          </div>
        </div>
      </div>

      {/* Bottom fade */}
      <div
        style={{
          position: "absolute",
          bottom: 0,
          left: 0,
          right: 0,
          height: 40,
          background: `linear-gradient(transparent, ${theme.bgGradient[2]})`,
          pointerEvents: "none",
          zIndex: 4,
        }}
      />
    </div>
  );
}

function LogEntry({ log, color, onEdit, onDelete }) {
  const [showActions, setShowActions] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);

  return (
    <div style={{ position: "relative", marginBottom: 8 }}>
      <div
        style={{
          padding: "12px 14px",
          background: "rgba(255,255,255,0.03)",
          borderRadius: 10,
          borderLeft: `3px solid ${color}`,
          position: "relative",
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 4 }}>
          <span style={{ fontSize: 11, color: "rgba(255,255,255,0.4)", fontFamily: "'JetBrains Mono', monospace" }}>
            {new Date(log.date).toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" })}
          </span>
          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
            {log.metric !== undefined && (
              <span style={{ fontSize: 12, fontWeight: 700, color, fontFamily: "'JetBrains Mono', monospace" }}>{log.metric}</span>
            )}
            <button
              onClick={(e) => { e.stopPropagation(); setShowActions(!showActions); setConfirmDelete(false); }}
              style={{
                background: "none",
                border: "none",
                color: "rgba(255,255,255,0.25)",
                cursor: "pointer",
                padding: "2px 4px",
                fontSize: 16,
                lineHeight: 1,
                borderRadius: 4,
                transition: "color 0.15s",
              }}
              onMouseEnter={(e) => (e.currentTarget.style.color = "rgba(255,255,255,0.6)")}
              onMouseLeave={(e) => (e.currentTarget.style.color = "rgba(255,255,255,0.25)")}
            >
              ⋯
            </button>
          </div>
        </div>
        <div style={{ fontSize: 13, color: "rgba(255,255,255,0.75)", lineHeight: 1.5 }}>{log.note}</div>

        {/* Action menu */}
        {showActions && (
          <div
            style={{
              position: "absolute",
              top: 6,
              right: 6,
              background: "#1e1e36",
              borderRadius: 10,
              border: "1px solid rgba(255,255,255,0.1)",
              boxShadow: "0 8px 32px rgba(0,0,0,0.5)",
              overflow: "hidden",
              zIndex: 10,
              animation: "fadeIn 0.15s ease",
              minWidth: 130,
            }}
          >
            <button
              onClick={(e) => { e.stopPropagation(); setShowActions(false); onEdit(log); }}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
                width: "100%",
                padding: "10px 14px",
                background: "none",
                border: "none",
                color: "rgba(255,255,255,0.75)",
                fontSize: 13,
                cursor: "pointer",
                fontFamily: "inherit",
                textAlign: "left",
              }}
              onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(255,255,255,0.05)")}
              onMouseLeave={(e) => (e.currentTarget.style.background = "none")}
            >
              ✏️ Edit
            </button>
            {!confirmDelete ? (
              <button
                onClick={(e) => { e.stopPropagation(); setConfirmDelete(true); }}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                  width: "100%",
                  padding: "10px 14px",
                  background: "none",
                  border: "none",
                  borderTop: "1px solid rgba(255,255,255,0.05)",
                  color: "#EF4444",
                  fontSize: 13,
                  cursor: "pointer",
                  fontFamily: "inherit",
                  textAlign: "left",
                }}
                onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(239,68,68,0.08)")}
                onMouseLeave={(e) => (e.currentTarget.style.background = "none")}
              >
                🗑️ Delete
              </button>
            ) : (
              <button
                onClick={(e) => { e.stopPropagation(); setShowActions(false); setConfirmDelete(false); onDelete(log); }}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                  width: "100%",
                  padding: "10px 14px",
                  background: "rgba(239,68,68,0.12)",
                  border: "none",
                  borderTop: "1px solid rgba(255,255,255,0.05)",
                  color: "#EF4444",
                  fontSize: 13,
                  cursor: "pointer",
                  fontFamily: "inherit",
                  fontWeight: 700,
                  textAlign: "left",
                }}
              >
                ⚠️ Confirm delete
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

function EditLogModal({ log, outcome, onClose, onSave }) {
  const [note, setNote] = useState(log.note);
  const [metric, setMetric] = useState(String(log.metric ?? ""));
  const [date, setDate] = useState(log.date);
  const cat = CATEGORIES[outcome.category];

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(0,0,0,0.7)",
        backdropFilter: "blur(8px)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 1000,
        padding: 20,
        animation: "fadeIn 0.2s ease",
      }}
      onClick={onClose}
    >
      <div
        style={{
          background: "#1a1a2e",
          borderRadius: 16,
          padding: 28,
          maxWidth: 420,
          width: "100%",
          border: "1px solid rgba(255,255,255,0.08)",
          boxShadow: "0 24px 80px rgba(0,0,0,0.5)",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <h3 style={{ margin: "0 0 6px", fontSize: 20, fontWeight: 700, color: "#fff" }}>Edit Log</h3>
        <p style={{ margin: "0 0 20px", fontSize: 13, color: cat.color }}>{outcome.title}</p>

        <div style={{ marginBottom: 16 }}>
          <label style={{ fontSize: 11, textTransform: "uppercase", letterSpacing: "0.08em", color: "rgba(255,255,255,0.4)", display: "block", marginBottom: 6 }}>Date</label>
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            style={{
              width: "100%",
              padding: "10px 14px",
              background: "rgba(255,255,255,0.05)",
              border: "1px solid rgba(255,255,255,0.1)",
              borderRadius: 8,
              color: "#fff",
              fontSize: 14,
              outline: "none",
              boxSizing: "border-box",
              fontFamily: "'JetBrains Mono', monospace",
              colorScheme: "dark",
            }}
          />
        </div>

        <div style={{ marginBottom: 16 }}>
          <label style={{ fontSize: 11, textTransform: "uppercase", letterSpacing: "0.08em", color: "rgba(255,255,255,0.4)", display: "block", marginBottom: 6 }}>
            {outcome.currentMetric.label} ({outcome.currentMetric.unit})
          </label>
          <input
            type="number"
            value={metric}
            onChange={(e) => setMetric(e.target.value)}
            style={{
              width: "100%",
              padding: "10px 14px",
              background: "rgba(255,255,255,0.05)",
              border: "1px solid rgba(255,255,255,0.1)",
              borderRadius: 8,
              color: "#fff",
              fontSize: 15,
              outline: "none",
              boxSizing: "border-box",
              fontFamily: "'JetBrains Mono', monospace",
            }}
          />
        </div>

        <div style={{ marginBottom: 24 }}>
          <label style={{ fontSize: 11, textTransform: "uppercase", letterSpacing: "0.08em", color: "rgba(255,255,255,0.4)", display: "block", marginBottom: 6 }}>Notes</label>
          <textarea
            value={note}
            onChange={(e) => setNote(e.target.value)}
            rows={3}
            style={{
              width: "100%",
              padding: "10px 14px",
              background: "rgba(255,255,255,0.05)",
              border: "1px solid rgba(255,255,255,0.1)",
              borderRadius: 8,
              color: "#fff",
              fontSize: 14,
              outline: "none",
              resize: "none",
              boxSizing: "border-box",
              fontFamily: "inherit",
              lineHeight: 1.5,
            }}
          />
        </div>

        <div style={{ display: "flex", gap: 10 }}>
          <button onClick={onClose} style={{ flex: 1, padding: "12px", borderRadius: 10, border: "1px solid rgba(255,255,255,0.1)", background: "transparent", color: "rgba(255,255,255,0.5)", fontSize: 14, cursor: "pointer", fontWeight: 600, fontFamily: "inherit" }}>Cancel</button>
          <button
            onClick={() => {
              onSave({
                ...log,
                date,
                note: note.trim() || log.note,
                metric: metric ? Number(metric) : log.metric,
              });
            }}
            style={{ flex: 1, padding: "12px", borderRadius: 10, border: "none", background: cat.color, color: "#000", fontSize: 14, cursor: "pointer", fontWeight: 700, fontFamily: "inherit" }}
          >
            Save changes
          </button>
        </div>
      </div>
    </div>
  );
}

function AddOutcomeModal({ onClose, onAdd }) {
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("fitness");
  const [desc, setDesc] = useState("");

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(0,0,0,0.7)",
        backdropFilter: "blur(8px)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 1000,
        padding: 20,
        animation: "fadeIn 0.2s ease",
      }}
      onClick={onClose}
    >
      <div
        style={{
          background: "#1a1a2e",
          borderRadius: 16,
          padding: 28,
          maxWidth: 420,
          width: "100%",
          border: "1px solid rgba(255,255,255,0.08)",
          boxShadow: "0 24px 80px rgba(0,0,0,0.5)",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <h3 style={{ margin: "0 0 20px", fontSize: 20, fontWeight: 700, color: "#fff", fontFamily: "'Space Grotesk', sans-serif" }}>New Dream Outcome</h3>

        <div style={{ marginBottom: 16 }}>
          <label style={{ fontSize: 11, textTransform: "uppercase", letterSpacing: "0.08em", color: "rgba(255,255,255,0.4)", display: "block", marginBottom: 6 }}>What's the dream?</label>
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g., Run a marathon"
            style={{
              width: "100%",
              padding: "10px 14px",
              background: "rgba(255,255,255,0.05)",
              border: "1px solid rgba(255,255,255,0.1)",
              borderRadius: 8,
              color: "#fff",
              fontSize: 15,
              outline: "none",
              boxSizing: "border-box",
              fontFamily: "inherit",
            }}
          />
        </div>

        <div style={{ marginBottom: 16 }}>
          <label style={{ fontSize: 11, textTransform: "uppercase", letterSpacing: "0.08em", color: "rgba(255,255,255,0.4)", display: "block", marginBottom: 6 }}>Category</label>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            {Object.entries(CATEGORIES).map(([key, cat]) => (
              <button
                key={key}
                onClick={() => setCategory(key)}
                style={{
                  padding: "8px 14px",
                  borderRadius: 8,
                  border: category === key ? `2px solid ${cat.color}` : "1px solid rgba(255,255,255,0.08)",
                  background: category === key ? `${cat.color}15` : "transparent",
                  color: category === key ? cat.color : "rgba(255,255,255,0.5)",
                  fontSize: 13,
                  cursor: "pointer",
                  fontWeight: 600,
                  fontFamily: "inherit",
                }}
              >
                {cat.icon} {cat.label}
              </button>
            ))}
          </div>
        </div>

        <div style={{ marginBottom: 24 }}>
          <label style={{ fontSize: 11, textTransform: "uppercase", letterSpacing: "0.08em", color: "rgba(255,255,255,0.4)", display: "block", marginBottom: 6 }}>Describe your commitment</label>
          <textarea
            value={desc}
            onChange={(e) => setDesc(e.target.value)}
            placeholder="Why does this matter to you?"
            rows={3}
            style={{
              width: "100%",
              padding: "10px 14px",
              background: "rgba(255,255,255,0.05)",
              border: "1px solid rgba(255,255,255,0.1)",
              borderRadius: 8,
              color: "#fff",
              fontSize: 14,
              outline: "none",
              resize: "none",
              boxSizing: "border-box",
              fontFamily: "inherit",
              lineHeight: 1.5,
            }}
          />
        </div>

        <div style={{ display: "flex", gap: 10 }}>
          <button
            onClick={onClose}
            style={{
              flex: 1,
              padding: "12px",
              borderRadius: 10,
              border: "1px solid rgba(255,255,255,0.1)",
              background: "transparent",
              color: "rgba(255,255,255,0.5)",
              fontSize: 14,
              cursor: "pointer",
              fontWeight: 600,
              fontFamily: "inherit",
            }}
          >
            Cancel
          </button>
          <button
            onClick={() => {
              if (title.trim()) {
                onAdd({
                  id: Date.now().toString(),
                  title: title.trim(),
                  category,
                  description: desc.trim(),
                  commitDate: "2026-03-26",
                  milestones: [],
                  currentMetric: { label: "Progress", value: 0, unit: "%" },
                  logs: [],
                  streak: 0,
                });
              }
            }}
            style={{
              flex: 1,
              padding: "12px",
              borderRadius: 10,
              border: "none",
              background: CATEGORIES[category].color,
              color: "#000",
              fontSize: 14,
              cursor: "pointer",
              fontWeight: 700,
              fontFamily: "inherit",
            }}
          >
            Commit to it
          </button>
        </div>
      </div>
    </div>
  );
}

function AddLogModal({ outcome, onClose, onAdd }) {
  const [note, setNote] = useState("");
  const [metric, setMetric] = useState("");
  const cat = CATEGORIES[outcome.category];

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(0,0,0,0.7)",
        backdropFilter: "blur(8px)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 1000,
        padding: 20,
        animation: "fadeIn 0.2s ease",
      }}
      onClick={onClose}
    >
      <div
        style={{
          background: "#1a1a2e",
          borderRadius: 16,
          padding: 28,
          maxWidth: 420,
          width: "100%",
          border: "1px solid rgba(255,255,255,0.08)",
          boxShadow: "0 24px 80px rgba(0,0,0,0.5)",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <h3 style={{ margin: "0 0 6px", fontSize: 20, fontWeight: 700, color: "#fff" }}>Log Progress</h3>
        <p style={{ margin: "0 0 20px", fontSize: 13, color: cat.color }}>{outcome.title}</p>

        <div style={{ marginBottom: 16 }}>
          <label style={{ fontSize: 11, textTransform: "uppercase", letterSpacing: "0.08em", color: "rgba(255,255,255,0.4)", display: "block", marginBottom: 6 }}>
            {outcome.currentMetric.label} ({outcome.currentMetric.unit})
          </label>
          <input
            type="number"
            value={metric}
            onChange={(e) => setMetric(e.target.value)}
            placeholder={`Current: ${outcome.currentMetric.value}`}
            style={{
              width: "100%",
              padding: "10px 14px",
              background: "rgba(255,255,255,0.05)",
              border: "1px solid rgba(255,255,255,0.1)",
              borderRadius: 8,
              color: "#fff",
              fontSize: 15,
              outline: "none",
              boxSizing: "border-box",
              fontFamily: "'JetBrains Mono', monospace",
            }}
          />
        </div>

        <div style={{ marginBottom: 24 }}>
          <label style={{ fontSize: 11, textTransform: "uppercase", letterSpacing: "0.08em", color: "rgba(255,255,255,0.4)", display: "block", marginBottom: 6 }}>What happened today?</label>
          <textarea
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="How was your session? Any breakthroughs?"
            rows={3}
            style={{
              width: "100%",
              padding: "10px 14px",
              background: "rgba(255,255,255,0.05)",
              border: "1px solid rgba(255,255,255,0.1)",
              borderRadius: 8,
              color: "#fff",
              fontSize: 14,
              outline: "none",
              resize: "none",
              boxSizing: "border-box",
              fontFamily: "inherit",
              lineHeight: 1.5,
            }}
          />
        </div>

        <div style={{ display: "flex", gap: 10 }}>
          <button onClick={onClose} style={{ flex: 1, padding: "12px", borderRadius: 10, border: "1px solid rgba(255,255,255,0.1)", background: "transparent", color: "rgba(255,255,255,0.5)", fontSize: 14, cursor: "pointer", fontWeight: 600, fontFamily: "inherit" }}>Cancel</button>
          <button
            onClick={() => {
              if (note.trim()) {
                onAdd({
                  date: "2026-03-26",
                  note: note.trim(),
                  metric: metric ? Number(metric) : outcome.currentMetric.value,
                });
              }
            }}
            style={{ flex: 1, padding: "12px", borderRadius: 10, border: "none", background: cat.color, color: "#000", fontSize: 14, cursor: "pointer", fontWeight: 700, fontFamily: "inherit" }}
          >
            Log it
          </button>
        </div>
      </div>
    </div>
  );
}

function OutcomeDetail({ outcome, onBack, onLog, onEditLog, onDeleteLog, onAddMilestone, onToggleMilestone, onDeleteMilestone, onEditMilestone, onReorderMilestone, onEditOutcome, onDeleteOutcome }) {
  const cat = CATEGORIES[outcome.category];
  const days = getDaysSince(outcome.commitDate);
  const progress = getProgress(outcome);
  const [showAllLogs, setShowAllLogs] = useState(false);
  const [showMilestones, setShowMilestones] = useState(false);
  const [newMsTitle, setNewMsTitle] = useState("");
  const [editingMs, setEditingMs] = useState(null);
  const [editMsTitle, setEditMsTitle] = useState("");
  const [editMode, setEditMode] = useState(false);
  const [editTitle, setEditTitle] = useState(outcome.title);
  const [editDesc, setEditDesc] = useState(outcome.description);
  const [editCategory, setEditCategory] = useState(outcome.category);
  const [editMetricLabel, setEditMetricLabel] = useState(outcome.currentMetric.label);
  const [editMetricUnit, setEditMetricUnit] = useState(outcome.currentMetric.unit);
  const [confirmDeleteOutcome, setConfirmDeleteOutcome] = useState(false);

  const firstLog = outcome.logs.length > 0 ? outcome.logs[outcome.logs.length - 1] : null;
  const startMetric = firstLog ? firstLog.metric : 0;
  const currentMetric = outcome.currentMetric.value;
  const growth = startMetric > 0 ? Math.round(((currentMetric - startMetric) / startMetric) * 100) : 0;

  return (
    <div style={{ animation: "fadeSlideIn 0.4s ease" }}>
      {/* Back button + actions */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
        <button onClick={onBack} style={{ background: "none", border: "none", color: "rgba(255,255,255,0.5)", fontSize: 14, cursor: "pointer", padding: 0, fontFamily: "inherit", display: "flex", alignItems: "center", gap: 6 }}>
          ← Back
        </button>
        <div style={{ display: "flex", gap: 6 }}>
          <button
            onClick={() => { setEditMode(!editMode); setConfirmDeleteOutcome(false); }}
            style={{
              padding: "6px 12px",
              borderRadius: 8,
              border: editMode ? `1px solid ${cat.color}40` : "1px solid rgba(255,255,255,0.08)",
              background: editMode ? `${cat.color}15` : "rgba(255,255,255,0.03)",
              color: editMode ? cat.color : "rgba(255,255,255,0.45)",
              fontSize: 11,
              cursor: "pointer",
              fontFamily: "inherit",
              fontWeight: 600,
            }}
          >
            {editMode ? "Done" : "✏️ Edit"}
          </button>
        </div>
      </div>

      {/* Header - view or edit mode */}
      {editMode ? (
        <div style={{ marginBottom: 20, padding: 16, background: "rgba(255,255,255,0.02)", borderRadius: 14, border: "1px solid rgba(255,255,255,0.06)", animation: "fadeSlideIn 0.2s ease" }}>
          <div style={{ marginBottom: 12 }}>
            <label style={{ fontSize: 10, textTransform: "uppercase", letterSpacing: "0.08em", color: "rgba(255,255,255,0.35)", display: "block", marginBottom: 4 }}>Dream outcome</label>
            <input
              value={editTitle}
              onChange={(e) => setEditTitle(e.target.value)}
              style={{ width: "100%", padding: "8px 12px", background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 8, color: "#fff", fontSize: 16, fontWeight: 700, outline: "none", boxSizing: "border-box", fontFamily: "'Sora', sans-serif" }}
            />
          </div>
          <div style={{ marginBottom: 12 }}>
            <label style={{ fontSize: 10, textTransform: "uppercase", letterSpacing: "0.08em", color: "rgba(255,255,255,0.35)", display: "block", marginBottom: 4 }}>Description</label>
            <textarea
              value={editDesc}
              onChange={(e) => setEditDesc(e.target.value)}
              rows={2}
              style={{ width: "100%", padding: "8px 12px", background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 8, color: "#fff", fontSize: 13, outline: "none", resize: "none", boxSizing: "border-box", fontFamily: "inherit", lineHeight: 1.4 }}
            />
          </div>
          <div style={{ marginBottom: 12 }}>
            <label style={{ fontSize: 10, textTransform: "uppercase", letterSpacing: "0.08em", color: "rgba(255,255,255,0.35)", display: "block", marginBottom: 4 }}>Category</label>
            <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
              {Object.entries(CATEGORIES).map(([key, c]) => (
                <button
                  key={key}
                  onClick={() => setEditCategory(key)}
                  style={{
                    padding: "6px 10px",
                    borderRadius: 6,
                    border: editCategory === key ? `2px solid ${c.color}` : "1px solid rgba(255,255,255,0.08)",
                    background: editCategory === key ? `${c.color}15` : "transparent",
                    color: editCategory === key ? c.color : "rgba(255,255,255,0.4)",
                    fontSize: 11,
                    cursor: "pointer",
                    fontWeight: 600,
                    fontFamily: "inherit",
                  }}
                >
                  {c.icon} {c.label}
                </button>
              ))}
            </div>
          </div>
          <div style={{ display: "flex", gap: 8, marginBottom: 14 }}>
            <div style={{ flex: 1 }}>
              <label style={{ fontSize: 10, textTransform: "uppercase", letterSpacing: "0.08em", color: "rgba(255,255,255,0.35)", display: "block", marginBottom: 4 }}>Metric name</label>
              <input value={editMetricLabel} onChange={(e) => setEditMetricLabel(e.target.value)} style={{ width: "100%", padding: "8px 10px", background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 8, color: "#fff", fontSize: 12, outline: "none", boxSizing: "border-box", fontFamily: "inherit" }} />
            </div>
            <div style={{ flex: 1 }}>
              <label style={{ fontSize: 10, textTransform: "uppercase", letterSpacing: "0.08em", color: "rgba(255,255,255,0.35)", display: "block", marginBottom: 4 }}>Unit</label>
              <input value={editMetricUnit} onChange={(e) => setEditMetricUnit(e.target.value)} style={{ width: "100%", padding: "8px 10px", background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 8, color: "#fff", fontSize: 12, outline: "none", boxSizing: "border-box", fontFamily: "inherit" }} />
            </div>
          </div>
          <div style={{ display: "flex", gap: 8 }}>
            <button
              onClick={() => {
                onEditOutcome(outcome.id, {
                  title: editTitle.trim() || outcome.title,
                  description: editDesc.trim(),
                  category: editCategory,
                  currentMetric: { ...outcome.currentMetric, label: editMetricLabel.trim() || outcome.currentMetric.label, unit: editMetricUnit.trim() },
                });
                setEditMode(false);
              }}
              style={{ flex: 1, padding: "10px", borderRadius: 8, border: "none", background: CATEGORIES[editCategory].color, color: "#000", fontSize: 13, fontWeight: 700, cursor: "pointer", fontFamily: "inherit" }}
            >
              Save changes
            </button>
            {!confirmDeleteOutcome ? (
              <button
                onClick={() => setConfirmDeleteOutcome(true)}
                style={{ padding: "10px 14px", borderRadius: 8, border: "1px solid rgba(239,68,68,0.3)", background: "rgba(239,68,68,0.08)", color: "#EF4444", fontSize: 13, fontWeight: 600, cursor: "pointer", fontFamily: "inherit" }}
              >
                Delete
              </button>
            ) : (
              <button
                onClick={() => { onDeleteOutcome(outcome.id); }}
                style={{ padding: "10px 14px", borderRadius: 8, border: "none", background: "#EF4444", color: "#fff", fontSize: 13, fontWeight: 700, cursor: "pointer", fontFamily: "inherit", animation: "fadeIn 0.15s ease" }}
              >
                Confirm
              </button>
            )}
          </div>
        </div>
      ) : (
        <div style={{ marginBottom: 24 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
            <span style={{ fontSize: 28 }}>{cat.icon}</span>
            <h2 style={{ margin: 0, fontSize: 26, fontWeight: 800, color: "#fff", letterSpacing: "-0.03em", fontFamily: "'Sora', sans-serif" }}>{outcome.title}</h2>
          </div>
          <p style={{ margin: 0, fontSize: 14, color: "rgba(255,255,255,0.5)", lineHeight: 1.5 }}>{outcome.description}</p>
        </div>
      )}

      {/* Stats row */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10, marginBottom: 24 }}>
        {[
          { label: "Days In", value: days, sub: "committed" },
          { label: "Growth", value: `${growth > 0 ? "+" : ""}${growth}%`, sub: `${startMetric} → ${currentMetric}` },
          { label: "Streak", value: `${outcome.streak}d`, sub: "current" },
        ].map((s, i) => (
          <div
            key={i}
            style={{
              padding: "14px 12px",
              background: "rgba(255,255,255,0.03)",
              borderRadius: 12,
              textAlign: "center",
              border: "1px solid rgba(255,255,255,0.05)",
            }}
          >
            <div style={{ fontSize: 22, fontWeight: 800, color: cat.color, fontFamily: "'JetBrains Mono', monospace" }}>{s.value}</div>
            <div style={{ fontSize: 10, color: "rgba(255,255,255,0.35)", textTransform: "uppercase", letterSpacing: "0.08em", marginTop: 2 }}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* Progress bar */}
      <div style={{ marginBottom: 24 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 8 }}>
          <span style={{ fontSize: 11, textTransform: "uppercase", letterSpacing: "0.08em", color: "rgba(255,255,255,0.4)" }}>Milestone Progress</span>
          <span style={{ fontSize: 13, fontWeight: 700, color: cat.color, fontFamily: "'JetBrains Mono', monospace" }}>{getCompletedMilestones(outcome)}/{outcome.milestones.length}</span>
        </div>
        <div style={{ height: 6, borderRadius: 3, background: "rgba(255,255,255,0.06)", overflow: "hidden" }}>
          <div
            style={{
              height: "100%",
              width: `${progress}%`,
              background: `linear-gradient(90deg, ${cat.color}, ${cat.color}cc)`,
              borderRadius: 3,
              transition: "width 1s ease",
              boxShadow: `0 0 12px ${cat.color}44`,
            }}
          />
        </div>
      </div>

      {/* Milestones management */}
      <div style={{ marginBottom: 20 }}>
        <button
          onClick={() => setShowMilestones(!showMilestones)}
          style={{
            width: "100%",
            padding: "10px 14px",
            borderRadius: 10,
            border: "1px solid rgba(255,255,255,0.08)",
            background: "rgba(255,255,255,0.02)",
            color: "rgba(255,255,255,0.6)",
            fontSize: 12,
            cursor: "pointer",
            fontFamily: "inherit",
            fontWeight: 600,
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <span>⚙️ Manage Milestones</span>
          <span style={{ fontSize: 10, color: "rgba(255,255,255,0.3)" }}>{showMilestones ? "▲" : "▼"}</span>
        </button>

        {showMilestones && (
          <div style={{ marginTop: 10, padding: 14, background: "rgba(255,255,255,0.02)", borderRadius: 12, border: "1px solid rgba(255,255,255,0.06)", animation: "fadeSlideIn 0.25s ease" }}>
            {/* Existing milestones */}
            {outcome.milestones.map((m, i) => (
              <div
                key={m.id}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 6,
                  padding: "8px 0",
                  borderBottom: i < outcome.milestones.length - 1 ? "1px solid rgba(255,255,255,0.04)" : "none",
                }}
              >
                {/* Reorder arrows */}
                <div style={{ display: "flex", flexDirection: "column", gap: 1, flexShrink: 0 }}>
                  <button
                    onClick={() => { if (i > 0) onReorderMilestone(outcome.id, m.id, -1); }}
                    style={{
                      background: "none",
                      border: "none",
                      color: i > 0 ? "rgba(255,255,255,0.35)" : "rgba(255,255,255,0.08)",
                      cursor: i > 0 ? "pointer" : "default",
                      fontSize: 10,
                      padding: "1px 3px",
                      lineHeight: 1,
                    }}
                  >
                    ▲
                  </button>
                  <button
                    onClick={() => { if (i < outcome.milestones.length - 1) onReorderMilestone(outcome.id, m.id, 1); }}
                    style={{
                      background: "none",
                      border: "none",
                      color: i < outcome.milestones.length - 1 ? "rgba(255,255,255,0.35)" : "rgba(255,255,255,0.08)",
                      cursor: i < outcome.milestones.length - 1 ? "pointer" : "default",
                      fontSize: 10,
                      padding: "1px 3px",
                      lineHeight: 1,
                    }}
                  >
                    ▼
                  </button>
                </div>

                {/* Toggle completed */}
                <button
                  onClick={() => onToggleMilestone(outcome.id, m.id)}
                  style={{
                    width: 22,
                    height: 22,
                    borderRadius: "50%",
                    border: m.completed ? "none" : `2px solid rgba(255,255,255,0.2)`,
                    background: m.completed ? cat.color : "transparent",
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: 10,
                    color: "#fff",
                    flexShrink: 0,
                    padding: 0,
                  }}
                >
                  {m.completed && "✓"}
                </button>

                {/* Title - editable inline */}
                {editingMs === m.id ? (
                  <input
                    autoFocus
                    value={editMsTitle}
                    onChange={(e) => setEditMsTitle(e.target.value)}
                    onBlur={() => {
                      if (editMsTitle.trim() && editMsTitle.trim() !== m.title) {
                        onEditMilestone(outcome.id, m.id, editMsTitle.trim());
                      }
                      setEditingMs(null);
                    }}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") e.target.blur();
                      if (e.key === "Escape") setEditingMs(null);
                    }}
                    style={{
                      flex: 1,
                      padding: "4px 8px",
                      background: "rgba(255,255,255,0.06)",
                      border: `1px solid ${cat.color}50`,
                      borderRadius: 6,
                      color: "#fff",
                      fontSize: 12,
                      outline: "none",
                      fontFamily: "inherit",
                    }}
                  />
                ) : (
                  <span
                    onClick={() => { setEditingMs(m.id); setEditMsTitle(m.title); }}
                    style={{
                      flex: 1,
                      fontSize: 12,
                      color: m.completed ? "rgba(255,255,255,0.5)" : "#fff",
                      textDecoration: m.completed ? "line-through" : "none",
                      cursor: "text",
                      padding: "4px 0",
                    }}
                  >
                    {m.title}
                  </span>
                )}

                {/* Delete */}
                <button
                  onClick={() => onDeleteMilestone(outcome.id, m.id)}
                  style={{
                    background: "none",
                    border: "none",
                    color: "rgba(255,255,255,0.2)",
                    cursor: "pointer",
                    fontSize: 14,
                    padding: "2px 4px",
                    flexShrink: 0,
                    lineHeight: 1,
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.color = "#EF4444")}
                  onMouseLeave={(e) => (e.currentTarget.style.color = "rgba(255,255,255,0.2)")}
                >
                  ×
                </button>
              </div>
            ))}

            {/* Add new milestone */}
            <div style={{ display: "flex", gap: 8, marginTop: outcome.milestones.length > 0 ? 10 : 0 }}>
              <input
                value={newMsTitle}
                onChange={(e) => setNewMsTitle(e.target.value)}
                placeholder="Add a milestone..."
                onKeyDown={(e) => {
                  if (e.key === "Enter" && newMsTitle.trim()) {
                    onAddMilestone(outcome.id, newMsTitle.trim());
                    setNewMsTitle("");
                  }
                }}
                style={{
                  flex: 1,
                  padding: "8px 12px",
                  background: "rgba(255,255,255,0.04)",
                  border: "1px solid rgba(255,255,255,0.1)",
                  borderRadius: 8,
                  color: "#fff",
                  fontSize: 12,
                  outline: "none",
                  fontFamily: "inherit",
                }}
              />
              <button
                onClick={() => {
                  if (newMsTitle.trim()) {
                    onAddMilestone(outcome.id, newMsTitle.trim());
                    setNewMsTitle("");
                  }
                }}
                style={{
                  padding: "8px 14px",
                  borderRadius: 8,
                  border: "none",
                  background: cat.color,
                  color: "#000",
                  fontSize: 12,
                  fontWeight: 700,
                  cursor: "pointer",
                  fontFamily: "inherit",
                  flexShrink: 0,
                }}
              >
                Add
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Journey Map - the hero visual */}
      {outcome.milestones.length > 0 && (
        <JourneyMap outcome={outcome} />
      )}

      {/* Daily Logs section */}
      <div style={{ marginBottom: 8 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
          <span style={{ fontSize: 11, textTransform: "uppercase", letterSpacing: "0.08em", color: "rgba(255,255,255,0.4)", fontWeight: 600 }}>📝 Daily Logs</span>
          <span style={{ fontSize: 11, color: "rgba(255,255,255,0.25)", fontFamily: "'JetBrains Mono', monospace" }}>{outcome.logs.length} entries</span>
        </div>
        {outcome.logs.slice(0, showAllLogs ? undefined : 3).map((log, i) => (
          <LogEntry key={`${log.date}-${i}`} log={log} color={cat.color} onEdit={onEditLog} onDelete={onDeleteLog} />
        ))}
        {outcome.logs.length === 0 && (
          <div style={{ textAlign: "center", padding: "32px 0", color: "rgba(255,255,255,0.3)", fontSize: 14 }}>No logs yet. Start tracking your journey.</div>
        )}
        {outcome.logs.length > 3 && (
          <button
            onClick={() => setShowAllLogs(!showAllLogs)}
            style={{
              width: "100%",
              padding: "10px",
              borderRadius: 8,
              border: "1px solid rgba(255,255,255,0.06)",
              background: "rgba(255,255,255,0.02)",
              color: "rgba(255,255,255,0.4)",
              fontSize: 12,
              cursor: "pointer",
              fontFamily: "inherit",
              fontWeight: 600,
              marginTop: 4,
            }}
          >
            {showAllLogs ? "Show less" : `Show all ${outcome.logs.length} logs`}
          </button>
        )}
      </div>

      {/* Log button */}
      <button
        onClick={onLog}
        style={{
          width: "100%",
          padding: "14px",
          borderRadius: 12,
          border: "none",
          background: `linear-gradient(135deg, ${cat.color}, ${cat.color}cc)`,
          color: "#000",
          fontSize: 15,
          fontWeight: 700,
          cursor: "pointer",
          marginTop: 20,
          fontFamily: "inherit",
          letterSpacing: "-0.01em",
        }}
      >
        + Log Today's Progress
      </button>
    </div>
  );
}

export default function DreamOutcomesTracker() {
  const [outcomes, setOutcomes] = useState(SAMPLE_OUTCOMES);
  const [selectedId, setSelectedId] = useState(null);
  const [showAddOutcome, setShowAddOutcome] = useState(false);
  const [showAddLog, setShowAddLog] = useState(false);
  const [editingLog, setEditingLog] = useState(null);
  const [view, setView] = useState("dashboard");

  const selected = outcomes.find((o) => o.id === selectedId);

  const totalMilestones = outcomes.reduce((sum, o) => sum + o.milestones.length, 0);
  const completedMilestones = outcomes.reduce((sum, o) => sum + getCompletedMilestones(o), 0);
  const avgProgress = outcomes.length > 0 ? outcomes.reduce((sum, o) => sum + getProgress(o), 0) / outcomes.length : 0;

  const handleAddOutcome = (newOutcome) => {
    setOutcomes([...outcomes, newOutcome]);
    setShowAddOutcome(false);
  };

  const handleAddLog = (newLog) => {
    setOutcomes(
      outcomes.map((o) =>
        o.id === selectedId
          ? {
              ...o,
              logs: [newLog, ...o.logs],
              currentMetric: { ...o.currentMetric, value: newLog.metric },
              streak: o.streak + 1,
            }
          : o
      )
    );
    setShowAddLog(false);
  };

  const handleEditLog = (updatedLog) => {
    setOutcomes(
      outcomes.map((o) =>
        o.id === selectedId
          ? {
              ...o,
              logs: o.logs.map((l) =>
                l.date === editingLog.date && l.note === editingLog.note ? updatedLog : l
              ),
              currentMetric: {
                ...o.currentMetric,
                value: o.logs[0]?.date === editingLog.date && o.logs[0]?.note === editingLog.note
                  ? updatedLog.metric
                  : o.currentMetric.value,
              },
            }
          : o
      )
    );
    setEditingLog(null);
  };

  const handleDeleteLog = (logToDelete) => {
    setOutcomes(
      outcomes.map((o) => {
        if (o.id !== selectedId) return o;
        const newLogs = o.logs.filter(
          (l) => !(l.date === logToDelete.date && l.note === logToDelete.note)
        );
        return {
          ...o,
          logs: newLogs,
          currentMetric: {
            ...o.currentMetric,
            value: newLogs.length > 0 ? newLogs[0].metric : 0,
          },
        };
      })
    );
  };

  const handleAddMilestone = (outcomeId, title) => {
    setOutcomes(outcomes.map((o) =>
      o.id === outcomeId
        ? { ...o, milestones: [...o.milestones, { id: `ms-${Date.now()}`, title, target: 0, unit: "", completed: false }] }
        : o
    ));
  };

  const handleToggleMilestone = (outcomeId, msId) => {
    setOutcomes(outcomes.map((o) =>
      o.id === outcomeId
        ? {
            ...o,
            milestones: o.milestones.map((m) =>
              m.id === msId
                ? { ...m, completed: !m.completed, completedDate: !m.completed ? "2026-03-26" : undefined }
                : m
            ),
          }
        : o
    ));
  };

  const handleDeleteMilestone = (outcomeId, msId) => {
    setOutcomes(outcomes.map((o) =>
      o.id === outcomeId
        ? { ...o, milestones: o.milestones.filter((m) => m.id !== msId) }
        : o
    ));
  };

  const handleEditMilestone = (outcomeId, msId, newTitle) => {
    setOutcomes(outcomes.map((o) =>
      o.id === outcomeId
        ? { ...o, milestones: o.milestones.map((m) => m.id === msId ? { ...m, title: newTitle } : m) }
        : o
    ));
  };

  const handleReorderMilestone = (outcomeId, msId, direction) => {
    setOutcomes(outcomes.map((o) => {
      if (o.id !== outcomeId) return o;
      const idx = o.milestones.findIndex((m) => m.id === msId);
      if (idx < 0) return o;
      const newIdx = idx + direction;
      if (newIdx < 0 || newIdx >= o.milestones.length) return o;
      const newMs = [...o.milestones];
      [newMs[idx], newMs[newIdx]] = [newMs[newIdx], newMs[idx]];
      return { ...o, milestones: newMs };
    }));
  };

  const handleEditOutcome = (outcomeId, updates) => {
    setOutcomes(outcomes.map((o) =>
      o.id === outcomeId ? { ...o, ...updates } : o
    ));
  };

  const handleDeleteOutcome = (outcomeId) => {
    setOutcomes(outcomes.filter((o) => o.id !== outcomeId));
    setSelectedId(null);
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#0d0d1a",
        color: "#fff",
        fontFamily: "'Inter', -apple-system, sans-serif",
        position: "relative",
        overflow: "hidden",
      }}
    >
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Sora:wght@400;600;700;800&family=JetBrains+Mono:wght@400;600;700&family=Inter:wght@400;500;600;700&display=swap');

        * { box-sizing: border-box; }
        
        @keyframes fadeSlideIn {
          from { opacity: 0; transform: translateY(12px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }
        @keyframes shimmer {
          0% { background-position: -200% 0; }
          100% { background-position: 200% 0; }
        }

        ::-webkit-scrollbar { width: 4px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.1); border-radius: 2px; }
        
        input::placeholder, textarea::placeholder { color: rgba(255,255,255,0.25); }
      `}</style>

      {/* Ambient background */}
      <div
        style={{
          position: "fixed",
          top: -200,
          right: -200,
          width: 500,
          height: 500,
          borderRadius: "50%",
          background: "radial-gradient(circle, rgba(245,158,11,0.04) 0%, transparent 70%)",
          pointerEvents: "none",
        }}
      />
      <div
        style={{
          position: "fixed",
          bottom: -300,
          left: -200,
          width: 600,
          height: 600,
          borderRadius: "50%",
          background: "radial-gradient(circle, rgba(59,130,246,0.03) 0%, transparent 70%)",
          pointerEvents: "none",
        }}
      />

      {/* Content */}
      <div style={{ maxWidth: 540, margin: "0 auto", padding: "24px 20px 100px", position: "relative" }}>
        {!selectedId ? (
          <>
            {/* Header */}
            <div style={{ marginBottom: 28, animation: "fadeSlideIn 0.5s ease" }}>
              <div style={{ fontSize: 11, textTransform: "uppercase", letterSpacing: "0.15em", color: "rgba(255,255,255,0.3)", marginBottom: 6 }}>Dream Outcomes</div>
              <h1
                style={{
                  margin: 0,
                  fontSize: 32,
                  fontWeight: 800,
                  fontFamily: "'Sora', sans-serif",
                  letterSpacing: "-0.04em",
                  background: "linear-gradient(135deg, #fff 30%, rgba(255,255,255,0.6))",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  lineHeight: 1.1,
                }}
              >
                The path is the proof.
              </h1>
            </div>

            {/* Overview stats */}
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr 1fr",
                gap: 10,
                marginBottom: 28,
                animation: "fadeSlideIn 0.5s ease 0.1s both",
              }}
            >
              <div style={{ padding: "16px 12px", background: "rgba(255,255,255,0.03)", borderRadius: 12, textAlign: "center", border: "1px solid rgba(255,255,255,0.05)" }}>
                <div style={{ fontSize: 28, fontWeight: 800, fontFamily: "'JetBrains Mono', monospace", color: "#F59E0B" }}>{outcomes.length}</div>
                <div style={{ fontSize: 10, color: "rgba(255,255,255,0.35)", textTransform: "uppercase", letterSpacing: "0.08em" }}>Dreams</div>
              </div>
              <div style={{ padding: "16px 12px", background: "rgba(255,255,255,0.03)", borderRadius: 12, textAlign: "center", border: "1px solid rgba(255,255,255,0.05)" }}>
                <div style={{ fontSize: 28, fontWeight: 800, fontFamily: "'JetBrains Mono', monospace", color: "#10B981" }}>{completedMilestones}</div>
                <div style={{ fontSize: 10, color: "rgba(255,255,255,0.35)", textTransform: "uppercase", letterSpacing: "0.08em" }}>Milestones Hit</div>
              </div>
              <div style={{ padding: "16px 12px", background: "rgba(255,255,255,0.03)", borderRadius: 12, textAlign: "center", border: "1px solid rgba(255,255,255,0.05)" }}>
                <div style={{ fontSize: 28, fontWeight: 800, fontFamily: "'JetBrains Mono', monospace", color: "#3B82F6" }}>{Math.round(avgProgress)}%</div>
                <div style={{ fontSize: 10, color: "rgba(255,255,255,0.35)", textTransform: "uppercase", letterSpacing: "0.08em" }}>Avg Progress</div>
              </div>
            </div>

            {/* Outcome Cards */}
            {outcomes.map((outcome, i) => {
              const cat = CATEGORIES[outcome.category];
              const days = getDaysSince(outcome.commitDate);
              const progress = getProgress(outcome);

              return (
                <div
                  key={outcome.id}
                  onClick={() => setSelectedId(outcome.id)}
                  style={{
                    padding: 18,
                    background: "rgba(255,255,255,0.03)",
                    borderRadius: 14,
                    border: "1px solid rgba(255,255,255,0.06)",
                    marginBottom: 12,
                    cursor: "pointer",
                    transition: "all 0.2s ease",
                    animation: `fadeSlideIn 0.4s ease ${0.15 + i * 0.08}s both`,
                    position: "relative",
                    overflow: "hidden",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = `${cat.color}40`;
                    e.currentTarget.style.background = "rgba(255,255,255,0.04)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = "rgba(255,255,255,0.06)";
                    e.currentTarget.style.background = "rgba(255,255,255,0.03)";
                  }}
                >
                  {/* Subtle color accent */}
                  <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 2, background: `linear-gradient(90deg, ${cat.color}, transparent)`, opacity: 0.5 }} />

                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                    <div style={{ flex: 1 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
                        <span style={{ fontSize: 18 }}>{cat.icon}</span>
                        <h3 style={{ margin: 0, fontSize: 17, fontWeight: 700, color: "#fff", fontFamily: "'Sora', sans-serif", letterSpacing: "-0.02em" }}>{outcome.title}</h3>
                      </div>

                      <div style={{ display: "flex", gap: 16, marginBottom: 12 }}>
                        <span style={{ fontSize: 12, color: "rgba(255,255,255,0.4)" }}>
                          <span style={{ color: cat.color, fontWeight: 700, fontFamily: "'JetBrains Mono', monospace" }}>{days}</span> days in
                        </span>
                        <span style={{ fontSize: 12, color: "rgba(255,255,255,0.4)" }}>
                          <span style={{ color: cat.color, fontWeight: 700, fontFamily: "'JetBrains Mono', monospace" }}>{outcome.currentMetric.value}</span> {outcome.currentMetric.unit}
                        </span>
                        <span style={{ fontSize: 12, color: "rgba(255,255,255,0.4)" }}>
                          🔥 <span style={{ fontFamily: "'JetBrains Mono', monospace", fontWeight: 600 }}>{outcome.streak}</span>d streak
                        </span>
                      </div>

                      {/* Mini progress */}
                      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                        <div style={{ flex: 1, height: 4, borderRadius: 2, background: "rgba(255,255,255,0.06)", overflow: "hidden" }}>
                          <div style={{ height: "100%", width: `${progress}%`, background: cat.color, borderRadius: 2, transition: "width 1s ease" }} />
                        </div>
                        <span style={{ fontSize: 11, color: "rgba(255,255,255,0.35)", fontFamily: "'JetBrains Mono', monospace", minWidth: 40, textAlign: "right" }}>
                          {getCompletedMilestones(outcome)}/{outcome.milestones.length}
                        </span>
                      </div>
                    </div>

                    <div style={{ marginLeft: 12, flexShrink: 0 }}>
                      <MiniGraph logs={outcome.logs} color={cat.color} />
                    </div>
                  </div>
                </div>
              );
            })}

            {/* Add button */}
            <button
              onClick={() => setShowAddOutcome(true)}
              style={{
                width: "100%",
                padding: 16,
                borderRadius: 14,
                border: "2px dashed rgba(255,255,255,0.1)",
                background: "transparent",
                color: "rgba(255,255,255,0.35)",
                fontSize: 15,
                cursor: "pointer",
                marginTop: 8,
                fontWeight: 600,
                fontFamily: "inherit",
                transition: "all 0.2s ease",
                animation: `fadeSlideIn 0.4s ease ${0.15 + outcomes.length * 0.08}s both`,
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = "rgba(255,255,255,0.2)";
                e.currentTarget.style.color = "rgba(255,255,255,0.6)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = "rgba(255,255,255,0.1)";
                e.currentTarget.style.color = "rgba(255,255,255,0.35)";
              }}
            >
              + Commit to a new dream
            </button>
          </>
        ) : (
          selected && (
            <OutcomeDetail
              outcome={selected}
              onBack={() => setSelectedId(null)}
              onLog={() => setShowAddLog(true)}
              onEditLog={(log) => setEditingLog(log)}
              onDeleteLog={handleDeleteLog}
              onAddMilestone={handleAddMilestone}
              onToggleMilestone={handleToggleMilestone}
              onDeleteMilestone={handleDeleteMilestone}
              onEditMilestone={handleEditMilestone}
              onReorderMilestone={handleReorderMilestone}
              onEditOutcome={handleEditOutcome}
              onDeleteOutcome={handleDeleteOutcome}
            />
          )
        )}
      </div>

      {/* Modals */}
      {showAddOutcome && <AddOutcomeModal onClose={() => setShowAddOutcome(false)} onAdd={handleAddOutcome} />}
      {showAddLog && selected && <AddLogModal outcome={selected} onClose={() => setShowAddLog(false)} onAdd={handleAddLog} />}
      {editingLog && selected && <EditLogModal log={editingLog} outcome={selected} onClose={() => setEditingLog(null)} onSave={handleEditLog} />}
    </div>
  );
}