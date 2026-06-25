import { useState } from "react";
import { ChevronDown, ChevronUp, Zap } from "lucide-react";

const PROFILE_POINTS = [
  { pos: 0,   grams: 40,   icon: "🧑",  label: "Solo"            },
  { pos: 25,  grams: 100,  icon: "👨‍👩‍👦",  label: "Small Family"   },
  { pos: 50,  grams: 220,  icon: "👨‍👩‍👧‍👦",  label: "Average Family" },
  { pos: 75,  grams: 480,  icon: "🏠",  label: "Large Household" },
  { pos: 100, grams: 1100, icon: "🍽️",  label: "Commercial"      },
];

const CYLINDERS = [
  { id: 1, size: "5kg",  kg: 5,  color: "#3b82f6" },
  { id: 2, size: "9kg",  kg: 9,  color: "#f59e0b" },
  { id: 3, size: "14kg", kg: 14, color: "#22c55e" },
  { id: 4, size: "19kg", kg: 19, color: "#a855f7" },
  { id: 5, size: "48kg", kg: 48, color: "#e11d48" },
];

function interpolate(pos: number): number {
  for (let i = 0; i < PROFILE_POINTS.length - 1; i++) {
    const a = PROFILE_POINTS[i];
    const b = PROFILE_POINTS[i + 1];
    if (pos >= a.pos && pos <= b.pos) {
      const t = (pos - a.pos) / (b.pos - a.pos);
      return Math.round(a.grams + t * (b.grams - a.grams));
    }
  }
  return PROFILE_POINTS[PROFILE_POINTS.length - 1].grams;
}

function formatDuration(days: number): string {
  if (days >= 365) {
    const y = Math.floor(days / 365);
    const m = Math.round((days % 365) / 30);
    return m > 0 ? `${y}y ${m}m` : `${y} yr${y !== 1 ? "s" : ""}`;
  }
  if (days >= 30) {
    const m = Math.floor(days / 30);
    const d = Math.round(days % 30);
    return d > 0 ? `${m}m ${d}d` : `${m} mo`;
  }
  return `${Math.round(days)} day${Math.round(days) !== 1 ? "s" : ""}`;
}

function nearestProfile(pos: number) {
  return PROFILE_POINTS.reduce((prev, curr) =>
    Math.abs(curr.pos - pos) < Math.abs(prev.pos - pos) ? curr : prev
  );
}

interface Props {
  onSetQty?: (id: number, qty: number) => void;
}

export function UsageEstimatorCompact({ onSetQty }: Props) {
  const [open, setOpen] = useState(false);
  const [pos, setPos]   = useState(50);

  const grams   = interpolate(pos);
  const profile = nearestProfile(pos);

  return (
    <div className="border border-secondary/30 rounded-2xl overflow-hidden bg-gradient-to-br from-secondary/5 to-primary/5">
      {/* Toggle header */}
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center justify-between px-5 py-4 text-left"
      >
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-secondary/15 rounded-xl flex items-center justify-center">
            <Zap size={16} className="text-secondary" />
          </div>
          <div>
            <p className="font-bold text-primary text-sm">Not sure how much to order?</p>
            <p className="text-muted-foreground text-xs">Use the estimator to see how long each size lasts</p>
          </div>
        </div>
        {open
          ? <ChevronUp size={16} className="text-muted-foreground shrink-0" />
          : <ChevronDown size={16} className="text-muted-foreground shrink-0" />
        }
      </button>

      {open && (
        <div className="px-5 pb-5 border-t border-secondary/20">
          {/* Profile chips */}
          <div className="flex gap-1.5 mt-4 mb-3 overflow-x-auto pb-1">
            {PROFILE_POINTS.map((p) => (
              <button
                key={p.pos}
                type="button"
                onClick={() => setPos(p.pos)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap border transition-all ${
                  nearestProfile(pos).pos === p.pos
                    ? "bg-secondary text-white border-secondary"
                    : "bg-white border-border text-muted-foreground hover:border-secondary/50"
                }`}
              >
                <span>{p.icon}</span> {p.label}
              </button>
            ))}
          </div>

          {/* Slider */}
          <div className="relative mb-2">
            <div className="w-full h-2.5 rounded-full" style={{ background: "linear-gradient(to right,#22c55e,#84cc16,#f59e0b,#f97316,#ef4444)" }} />
            <input type="range" min={0} max={100} value={pos} onChange={(e) => setPos(parseInt(e.target.value))}
              className="absolute inset-0 w-full opacity-0 cursor-pointer h-2.5" />
            <div className="absolute top-0 w-4 h-4 bg-white rounded-full border-[3px] shadow -translate-y-[3px] -translate-x-2 pointer-events-none"
              style={{ left: `${pos}%`, borderColor: `hsl(${120 - pos*1.2},70%,50%)`, transition: "left 0.05s" }} />
          </div>
          <p className="text-center text-xs text-muted-foreground mb-4">
            <span className="text-lg mr-1">{profile.icon}</span>
            <strong className="text-primary">{profile.label}</strong> — ≈{grams}g LPG/day
          </p>

          {/* Cylinder estimates */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {CYLINDERS.map((c) => {
              const days = (c.kg * 1000) / grams;
              return (
                <div key={c.id} className="bg-white rounded-xl border border-border p-3 text-center">
                  <p className="font-extrabold text-sm text-primary">{c.size}</p>
                  <p className="font-extrabold text-lg mt-0.5" style={{ color: c.color }}>{formatDuration(days)}</p>
                  <p className="text-[10px] text-muted-foreground mb-2">estimated</p>
                  {onSetQty && (
                    <button type="button" onClick={() => onSetQty(c.id, 1)}
                      className="w-full text-[10px] font-bold py-1 rounded-lg border border-current transition-colors hover:text-white"
                      style={{ color: c.color, borderColor: c.color }}
                      onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.background = c.color; (e.currentTarget as HTMLButtonElement).style.color = "#fff"; }}
                      onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.background = ""; (e.currentTarget as HTMLButtonElement).style.color = c.color; }}>
                      + Add {c.size}
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
