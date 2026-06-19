import { useState, useEffect, useRef } from "react";

// ── Types ─────────────────────────────────────────────────────────────────────
interface Reading {
  level: number;      // 0–100 %
  tempC: number;
  kgRemaining: number;
  maxKg: number;
  status: "FULL" | "GOOD" | "LOW" | "CRITICAL";
}

function getStatus(level: number): Reading["status"] {
  if (level >= 75) return "FULL";
  if (level >= 40) return "GOOD";
  if (level >= 15) return "LOW";
  return "CRITICAL";
}

const STATUS_META: Record<Reading["status"], { label: string; color: string; glow: string }> = {
  FULL:     { label: "FULL",     color: "#22c55e", glow: "rgba(34,197,94,0.35)" },
  GOOD:     { label: "NORMAL",   color: "#84cc16", glow: "rgba(132,204,22,0.35)" },
  LOW:      { label: "LOW",      color: "#f97316", glow: "rgba(249,115,22,0.4)"  },
  CRITICAL: { label: "CRITICAL", color: "#ef4444", glow: "rgba(239,68,68,0.45)" },
};

// ── Arc helpers ───────────────────────────────────────────────────────────────
function polarXY(cx: number, cy: number, r: number, deg: number) {
  const rad = ((deg - 90) * Math.PI) / 180;
  return { x: cx + r * Math.cos(rad), y: cy + r * Math.sin(rad) };
}

function arcPath(cx: number, cy: number, r: number, startDeg: number, endDeg: number) {
  const s = polarXY(cx, cy, r, startDeg);
  const e = polarXY(cx, cy, r, endDeg);
  const large = endDeg - startDeg > 180 ? 1 : 0;
  return `M ${s.x.toFixed(2)} ${s.y.toFixed(2)} A ${r} ${r} 0 ${large} 1 ${e.x.toFixed(2)} ${e.y.toFixed(2)}`;
}

// ── Simulator Component ───────────────────────────────────────────────────────
interface Props {
  cylinderKg?: number;
  compact?: boolean;
}

export function GasLevelDetector({ cylinderKg = 9, compact = false }: Props) {
  const [reading, setReading] = useState<Reading>({
    level: 68,
    tempC: 22,
    kgRemaining: +(cylinderKg * 0.68).toFixed(1),
    maxKg: cylinderKg,
    status: "GOOD",
  });
  const [scanning, setScanning] = useState(false);
  const [pulse, setPulse] = useState(false);
  const [selectedKg, setSelectedKg] = useState(cylinderKg);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Micro-fluctuation idle animation
  useEffect(() => {
    intervalRef.current = setInterval(() => {
      if (!scanning) {
        setReading((prev) => {
          const delta = (Math.random() - 0.5) * 1.2;
          const newLevel = Math.min(100, Math.max(0, prev.level + delta));
          const tempDelta = (Math.random() - 0.5) * 0.4;
          const newTemp = Math.round((prev.tempC + tempDelta) * 10) / 10;
          return {
            ...prev,
            level: +newLevel.toFixed(1),
            tempC: newTemp,
            kgRemaining: +(selectedKg * newLevel / 100).toFixed(1),
            status: getStatus(newLevel),
          };
        });
      }
    }, 1800);
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, [scanning, selectedKg]);

  const triggerScan = () => {
    if (scanning) return;
    setScanning(true);
    setPulse(true);

    // Animate down to 0, then sweep up to a random new level
    const target = Math.round(Math.random() * 85 + 5);
    let current = 0;
    let step = 0;
    const total = 40;

    const sweep = setInterval(() => {
      step++;
      const ease = step / total;
      const animated = Math.round(target * ease * ease * (3 - 2 * ease));
      const newTemp = +(20 + Math.random() * 6).toFixed(1);
      setReading({
        level: animated,
        tempC: newTemp,
        kgRemaining: +(selectedKg * animated / 100).toFixed(1),
        maxKg: selectedKg,
        status: getStatus(animated),
      });
      if (step >= total) {
        clearInterval(sweep);
        setScanning(false);
        setPulse(false);
      }
    }, 40);
  };

  const handleKgChange = (kg: number) => {
    setSelectedKg(kg);
    setReading((prev) => ({
      ...prev,
      maxKg: kg,
      kgRemaining: +(kg * prev.level / 100).toFixed(1),
    }));
  };

  const meta   = STATUS_META[reading.status];
  const fillDeg = 220 * (reading.level / 100); // arc spans 220 degrees
  const startDeg = -110;
  const endDeg   = startDeg + fillDeg;
  const cx = 60; const cy = 60; const R = 44;

  // ── Compact version ───────────────────────────────────────────────────────
  if (compact) {
    return (
      <div className="flex items-center gap-3 bg-gray-900 rounded-2xl p-3">
        {/* Mini arc */}
        <svg width="52" height="52" viewBox="0 0 120 120">
          <path d={arcPath(60,60,44,-110,110)} fill="none" stroke="#1f2937" strokeWidth="10" strokeLinecap="round" />
          {reading.level > 0 && (
            <path d={arcPath(60,60,44,-110,-110 + 220*(reading.level/100))} fill="none" stroke={meta.color} strokeWidth="10" strokeLinecap="round"
              style={{ filter: `drop-shadow(0 0 4px ${meta.glow})`, transition: "all 0.6s ease" }} />
          )}
          <text x="60" y="66" textAnchor="middle" fill="white" fontSize="17" fontWeight="900" fontFamily="monospace">
            {Math.round(reading.level)}%
          </text>
        </svg>
        <div>
          <p className="text-white font-bold text-sm leading-tight">{reading.kgRemaining}kg left</p>
          <p style={{ color: meta.color }} className="text-xs font-bold">{meta.label}</p>
          <p className="text-gray-400 text-[10px]">{reading.tempC}°C</p>
        </div>
      </div>
    );
  }

  // ── Full version ──────────────────────────────────────────────────────────
  return (
    <div className="bg-gray-950 rounded-3xl p-6 select-none" style={{ boxShadow: `0 0 40px ${meta.glow}, 0 0 0 1px rgba(255,255,255,0.05)` }}>
      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <div>
          <p className="text-gray-400 text-[10px] font-bold uppercase tracking-widest">Gas Level Detector</p>
          <p className="text-white font-extrabold text-base leading-tight">MGD-Sensor Pro</p>
        </div>
        <div className="flex items-center gap-1.5">
          <div className={`w-2 h-2 rounded-full ${scanning ? "bg-yellow-400" : "bg-green-400"}`}
            style={{ boxShadow: scanning ? "0 0 6px #facc15" : "0 0 6px #4ade80", animation: "pulse-dot 1.5s infinite" }} />
          <span className="text-[10px] text-gray-400 font-mono">{scanning ? "SCANNING" : "LIVE"}</span>
        </div>
      </div>

      {/* Cylinder selector */}
      <div className="flex gap-1.5 mb-5">
        {[5, 9, 19, 48].map((kg) => (
          <button key={kg} onClick={() => handleKgChange(kg)}
            className={`flex-1 py-1.5 rounded-lg text-xs font-bold border transition-all ${selectedKg === kg ? "border-current text-white" : "border-gray-700 text-gray-500 hover:border-gray-500"}`}
            style={selectedKg === kg ? { borderColor: meta.color, color: meta.color, background: `${meta.glow}` } : {}}>
            {kg}kg
          </button>
        ))}
      </div>

      {/* Main gauge */}
      <div className="flex flex-col items-center mb-4">
        <svg viewBox="0 0 120 105" className="w-48 h-40">
          {/* Track */}
          <path d={arcPath(cx, cy, R, startDeg, startDeg + 220)} fill="none" stroke="#1f2937" strokeWidth="11" strokeLinecap="round" />
          {/* Zone ticks */}
          {[25, 40, 75].map((pct) => {
            const d = startDeg + 220 * (pct / 100);
            const inner = polarXY(cx, cy, R - 8, d);
            const outer = polarXY(cx, cy, R + 2, d);
            return <line key={pct} x1={inner.x} y1={inner.y} x2={outer.x} y2={outer.y} stroke="#374151" strokeWidth="1.5" />;
          })}
          {/* Colored fill */}
          {reading.level > 0.5 && (
            <path d={arcPath(cx, cy, R, startDeg, endDeg)} fill="none" stroke={meta.color} strokeWidth="11" strokeLinecap="round"
              style={{ filter: `drop-shadow(0 0 6px ${meta.glow})`, transition: "all 0.5s cubic-bezier(.34,1.56,.64,1)" }} />
          )}
          {/* Needle */}
          {(() => {
            const needlePt = polarXY(cx, cy, R - 6, endDeg);
            return (
              <circle cx={needlePt.x} cy={needlePt.y} r="4" fill={meta.color}
                style={{ filter: `drop-shadow(0 0 5px ${meta.color})`, transition: "all 0.5s cubic-bezier(.34,1.56,.64,1)" }} />
            );
          })()}
          {/* Center text */}
          <text x={cx} y={cy - 5} textAnchor="middle" fill="white" fontSize="22" fontWeight="900" fontFamily="monospace"
            style={{ transition: "all 0.3s" }}>
            {Math.round(reading.level)}%
          </text>
          <text x={cx} y={cy + 11} textAnchor="middle" fill={meta.color} fontSize="8" fontWeight="700" letterSpacing="1.5">
            {meta.label}
          </text>
          {/* Zone labels */}
          <text x={cx - 34} y={cy + 38} fill="#4b5563" fontSize="7" textAnchor="middle">CRITICAL</text>
          <text x={cx} y={cy + 48} fill="#4b5563" fontSize="7" textAnchor="middle">NORMAL</text>
          <text x={cx + 34} y={cy + 38} fill="#4b5563" fontSize="7" textAnchor="middle">FULL</text>
        </svg>

        {/* Readings grid */}
        <div className="grid grid-cols-3 gap-2 w-full">
          {[
            { icon: "🔥", label: "Gas Level", value: `${reading.level.toFixed(1)}%`, color: meta.color },
            { icon: "⚖️", label: "Remaining", value: `${reading.kgRemaining}kg`, color: "#a78bfa" },
            { icon: "🌡️", label: "Temp", value: `${reading.tempC}°C`, color: "#60a5fa" },
          ].map((r) => (
            <div key={r.label} className="bg-gray-900 rounded-xl p-2.5 text-center border border-gray-800">
              <div className="text-base mb-0.5">{r.icon}</div>
              <p className="font-extrabold text-sm font-mono" style={{ color: r.color, transition: "color 0.4s" }}>{r.value}</p>
              <p className="text-[9px] text-gray-500 uppercase tracking-wide">{r.label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Level bar */}
      <div className="mb-5">
        <div className="flex justify-between text-[9px] text-gray-600 mb-1 font-mono">
          <span>0%</span><span>25%</span><span>50%</span><span>75%</span><span>100%</span>
        </div>
        <div className="relative h-3 bg-gray-800 rounded-full overflow-hidden">
          {/* Zone segments */}
          <div className="absolute inset-0 flex">
            <div style={{ width: "15%", background: "rgba(239,68,68,0.3)" }} />
            <div style={{ width: "25%", background: "rgba(249,115,22,0.25)" }} />
            <div style={{ width: "35%", background: "rgba(132,204,22,0.2)" }} />
            <div style={{ width: "25%", background: "rgba(34,197,94,0.25)" }} />
          </div>
          {/* Fill */}
          <div className="absolute inset-y-0 left-0 rounded-full transition-all duration-500"
            style={{ width: `${reading.level}%`, background: `linear-gradient(90deg, #ef4444, ${meta.color})`, boxShadow: `0 0 8px ${meta.glow}` }} />
        </div>
        <div className="flex justify-between text-[9px] mt-1 font-bold" style={{ color: "transparent" }}>
          <span style={{ color: "#ef4444" }}>CRIT</span>
          <span style={{ color: "#f97316" }}>LOW</span>
          <span style={{ color: "#84cc16" }}>GOOD</span>
          <span style={{ color: "#22c55e" }}>FULL</span>
        </div>
      </div>

      {/* Scan button */}
      <button onClick={triggerScan} disabled={scanning}
        className="w-full py-3 rounded-2xl font-extrabold text-sm tracking-widest uppercase transition-all disabled:opacity-50"
        style={{
          background: scanning ? "#1f2937" : `linear-gradient(135deg, ${meta.color}cc, ${meta.color})`,
          color: scanning ? "#6b7280" : "#000",
          boxShadow: scanning ? "none" : `0 4px 20px ${meta.glow}`,
        }}>
        {scanning ? "⚡ SCANNING..." : "🔍 SCAN NOW"}
      </button>

      <p className="text-center text-[9px] text-gray-600 mt-3 font-mono">
        ULTRASONIC SENSOR · WORKS ON ALL LPG CYLINDERS
      </p>

      <style>{`
        @keyframes pulse-dot {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.3; }
        }
        .pulse-dot { animation: pulse-dot 1.5s infinite; }
      `}</style>
    </div>
  );
}
