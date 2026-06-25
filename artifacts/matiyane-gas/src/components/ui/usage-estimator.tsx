import { useState } from "react";
import { Link } from "wouter";
import { ShoppingCart } from "lucide-react";
import { Button } from "@/components/ui/button";

// ── Usage profiles ────────────────────────────────────────────────────────────
// Consumption in grams per day at 0, 25, 50, 75, 100 on the slider
const PROFILE_POINTS = [
  { pos: 0,   grams: 40,   icon: "🧑",  label: "Solo",       sub: "1 person, occasional use" },
  { pos: 25,  grams: 100,  icon: "👨‍👩‍👦",  label: "Small Family", sub: "2–3 people, 30–45 min/day" },
  { pos: 50,  grams: 220,  icon: "👨‍👩‍👧‍👦",  label: "Average Family", sub: "4–5 people, 1–1.5 hrs/day" },
  { pos: 75,  grams: 480,  icon: "🏠",  label: "Large Household", sub: "6+ people or small biz, 2–3 hrs/day" },
  { pos: 100, grams: 1100, icon: "🍽️",  label: "Commercial",  sub: "Restaurant / industrial use" },
];

const CYLINDERS = [
  { id: 1, size: "5kg",  kg: 5,  price: 150,  colors: ["#3b82f6", "#60a5fa"], bg: "from-blue-50 to-blue-100 border-blue-200" },
  { id: 2, size: "9kg",  kg: 9,  price: 250,  colors: ["#f59e0b", "#fbbf24"], bg: "from-amber-50 to-amber-100 border-amber-200" },
  { id: 3, size: "14kg", kg: 14, price: 490,  colors: ["#22c55e", "#4ade80"], bg: "from-green-50 to-green-100 border-green-200" },
  { id: 4, size: "19kg", kg: 19, price: 740,  colors: ["#a855f7", "#c084fc"], bg: "from-purple-50 to-purple-100 border-purple-200" },
  { id: 5, size: "48kg", kg: 48, price: 1590, colors: ["#e11d48", "#fb7185"], bg: "from-rose-50 to-rose-100 border-rose-200" },
];

// ── Helpers ───────────────────────────────────────────────────────────────────
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

function formatDuration(days: number): { value: string; unit: string } {
  if (days >= 365) {
    const y = Math.floor(days / 365);
    const m = Math.round((days % 365) / 30);
    return { value: m > 0 ? `${y}y ${m}m` : `${y}`, unit: m > 0 ? "" : "year" + (y !== 1 ? "s" : "") };
  }
  if (days >= 30) {
    const m = Math.floor(days / 30);
    const d = Math.round(days % 30);
    return { value: d > 0 ? `${m}m ${d}d` : `${m}`, unit: d > 0 ? "" : "month" + (m !== 1 ? "s" : "") };
  }
  return { value: `${Math.round(days)}`, unit: "day" + (Math.round(days) !== 1 ? "s" : "") };
}

// bar fill 0-100 scaled to max cylinder at current usage
function barPercent(days: number, maxDays: number): number {
  return Math.min(100, Math.round((days / maxDays) * 100));
}

// Color: red (short) → yellow → green (long) based on days
function durationColor(days: number): string {
  if (days >= 90) return "#22c55e";
  if (days >= 30) return "#f59e0b";
  if (days >= 14) return "#f97316";
  return "#ef4444";
}

// Nearest profile for labelling
function nearestProfile(pos: number) {
  return PROFILE_POINTS.reduce((prev, curr) =>
    Math.abs(curr.pos - pos) < Math.abs(prev.pos - pos) ? curr : prev
  );
}

// ── Arc SVG ───────────────────────────────────────────────────────────────────
function Arc({ percent, color }: { percent: number; color: string }) {
  const r = 40;
  const cx = 50;
  const cy = 52;
  const startAngle = -210; // degrees — left side of the arc
  const totalDeg = 240;
  const endAngle = startAngle + (totalDeg * percent) / 100;

  function polar(deg: number) {
    const rad = (deg * Math.PI) / 180;
    return { x: cx + r * Math.cos(rad), y: cy + r * Math.sin(rad) };
  }

  const s = polar(startAngle);
  const e = polar(endAngle);
  const large = totalDeg * percent / 100 > 180 ? 1 : 0;
  const sbg = polar(startAngle);
  const ebg = polar(startAngle + totalDeg);
  const bgLarge = totalDeg > 180 ? 1 : 0;

  const bgPath = `M ${sbg.x} ${sbg.y} A ${r} ${r} 0 ${bgLarge} 1 ${ebg.x} ${ebg.y}`;
  const fgPath = percent > 0
    ? `M ${s.x} ${s.y} A ${r} ${r} 0 ${large} 1 ${e.x} ${e.y}`
    : "";

  return (
    <svg viewBox="0 0 100 80" className="w-24 h-20 drop-shadow-sm">
      <path d={bgPath} fill="none" stroke="#e5e7eb" strokeWidth="9" strokeLinecap="round" />
      {fgPath && (
        <path d={fgPath} fill="none" stroke={color} strokeWidth="9" strokeLinecap="round"
          style={{ transition: "stroke-dashoffset 0.6s ease, stroke 0.4s" }} />
      )}
    </svg>
  );
}

// ── Main Component ────────────────────────────────────────────────────────────
export function UsageEstimator() {
  const [sliderPos, setSliderPos] = useState(50);

  const gramsPerDay = interpolate(sliderPos);
  const profile     = nearestProfile(sliderPos);

  const estimates = CYLINDERS.map((c) => {
    const days = (c.kg * 1000) / gramsPerDay;
    return { ...c, days };
  });

  const maxDays = Math.max(...estimates.map((e) => e.days));

  return (
    <section className="py-20 bg-white border-t border-gray-100">
      <div className="container mx-auto px-4 max-w-5xl">
        {/* Header */}
        <div className="text-center mb-12">
          <span className="inline-block bg-secondary/10 text-secondary text-xs font-bold uppercase tracking-widest px-4 py-1.5 rounded-full mb-4">
            Usage Estimator
          </span>
          <h2 className="text-3xl md:text-4xl font-extrabold text-primary mb-3">
            How Long Will Your Gas Last?
          </h2>
          <p className="text-muted-foreground max-w-xl mx-auto">
            Drag the slider to match your household usage and see an instant estimate for every cylinder size.
          </p>
        </div>

        {/* Slider */}
        <div className="bg-gray-50 rounded-3xl p-8 mb-10 border border-gray-100 shadow-sm">
          {/* Profile chips */}
          <div className="hidden sm:flex justify-between mb-4 px-1">
            {PROFILE_POINTS.map((p) => (
              <button
                key={p.pos}
                onClick={() => setSliderPos(p.pos)}
                className={`flex flex-col items-center gap-0.5 transition-all px-1 ${
                  nearestProfile(sliderPos).pos === p.pos ? "opacity-100 scale-110" : "opacity-40 hover:opacity-70"
                }`}
              >
                <span className="text-xl">{p.icon}</span>
                <span className="text-[10px] font-bold text-primary leading-tight text-center">{p.label}</span>
              </button>
            ))}
          </div>

          {/* Range slider with rainbow gradient track */}
          <div className="relative mb-5">
            <div
              className="w-full h-3 rounded-full mb-1"
              style={{
                background: "linear-gradient(to right, #22c55e 0%, #84cc16 20%, #f59e0b 40%, #f97316 65%, #ef4444 100%)",
                boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
              }}
            />
            <input
              type="range"
              min={0}
              max={100}
              value={sliderPos}
              onChange={(e) => setSliderPos(parseInt(e.target.value))}
              className="absolute inset-0 w-full opacity-0 cursor-pointer h-3"
              style={{ margin: 0 }}
            />
            {/* Thumb indicator */}
            <div
              className="absolute top-0 w-5 h-5 bg-white rounded-full border-4 shadow-lg -translate-y-1 -translate-x-2.5 pointer-events-none transition-all"
              style={{
                left: `${sliderPos}%`,
                borderColor: `hsl(${120 - sliderPos * 1.2}, 70%, 50%)`,
                transition: "left 0.05s",
              }}
            />
          </div>

          {/* Active profile label */}
          <div className="text-center mt-6">
            <span className="text-3xl">{profile.icon}</span>
            <p className="font-extrabold text-primary text-lg mt-1">{profile.label}</p>
            <p className="text-muted-foreground text-sm">{profile.sub}</p>
            <div className="mt-2 inline-block bg-primary/5 text-primary font-bold text-sm px-4 py-1 rounded-full">
              ≈ {gramsPerDay}g LPG / day
            </div>
          </div>
        </div>

        {/* Cylinder estimate cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {estimates.map((c) => {
            const dur   = formatDuration(c.days);
            const fill  = barPercent(c.days, maxDays);
            const color = durationColor(c.days);

            return (
              <div
                key={c.id}
                className={`bg-gradient-to-b ${c.bg} border rounded-2xl p-5 flex flex-col items-center text-center hover:shadow-lg transition-all duration-300 group`}
              >
                {/* Arc gauge */}
                <div className="relative">
                  <Arc percent={fill} color={color} />
                  <div className="absolute inset-0 flex flex-col items-center justify-center mt-2">
                    <span className="text-lg font-extrabold text-primary leading-none">{c.size}</span>
                  </div>
                </div>

                {/* Duration */}
                <div className="mt-1 mb-3">
                  <div className="flex items-baseline justify-center gap-1">
                    <span className="text-3xl font-extrabold" style={{ color }}>{dur.value}</span>
                    {dur.unit && <span className="text-sm font-semibold text-muted-foreground">{dur.unit}</span>}
                  </div>
                  <p className="text-xs text-muted-foreground font-medium">estimated duration</p>
                </div>

                {/* Coloured fill bar */}
                <div className="w-full bg-white/60 rounded-full h-2 mb-4 overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-700"
                    style={{ width: `${fill}%`, background: color }}
                  />
                </div>

                {/* Price */}
                <p className="text-xs text-muted-foreground mb-1 font-medium">
                  R{c.price} per refill
                </p>
                <p className="text-[11px] text-muted-foreground mb-4">
                  ≈ <strong className="text-primary">R{(c.price / Math.round(c.days)).toFixed(2)}</strong>/day
                </p>

                <Link href={`/order?product=${c.id}`} className="w-full">
                  <Button
                    size="sm"
                    className="w-full rounded-full font-bold text-xs transition-all"
                    style={{ background: c.colors[0], color: "#fff" }}
                  >
                    <ShoppingCart size={12} className="mr-1.5" />
                    Order {c.size}
                  </Button>
                </Link>
              </div>
            );
          })}
        </div>

        {/* Disclaimer */}
        <p className="text-center text-xs text-muted-foreground mt-6 opacity-70">
          ⚠️ Estimates are based on typical LPG consumption rates (~100–150g per burner per hour). Actual usage varies by appliance efficiency, flame settings, and cooking habits.
        </p>
      </div>
    </section>
  );
}
