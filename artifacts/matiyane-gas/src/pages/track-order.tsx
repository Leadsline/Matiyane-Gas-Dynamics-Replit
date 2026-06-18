import { useState } from "react";
import { Search, Package, CheckCircle, Truck, MapPin, Clock, ArrowRight, Phone } from "lucide-react";
import { Button } from "@/components/ui/button";
import { FadeIn } from "@/components/ui/fade-in";

const STATUS_STEPS = [
  { key: "pending",            label: "Order Placed",       icon: Package,       desc: "Your order has been received and is awaiting confirmation." },
  { key: "confirmed",          label: "Confirmed",          icon: CheckCircle,   desc: "Your order is confirmed and being prepared for dispatch." },
  { key: "out_for_delivery",   label: "Out for Delivery",   icon: Truck,         desc: "Your gas is on its way — our driver is en route to you." },
  { key: "delivered",          label: "Delivered",          icon: MapPin,        desc: "Your gas has been delivered. Enjoy!" },
  { key: "paid",               label: "Completed & Paid",   icon: CheckCircle,   desc: "Order fully completed. Thank you for your business!" },
];

const STATUS_RANK: Record<string, number> = {
  pending: 0, confirmed: 1, out_for_delivery: 2, delivered: 3, paid: 4, cancelled: -1,
};

type TrackResult = {
  orderRef: string;
  status: string;
  totalAmount: number;
  createdAt: string;
  items: { productName: string; quantity: number; unitPrice: number; subtotal: number }[];
};

export default function TrackOrderPage() {
  const [ref, setRef] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<TrackResult | null>(null);
  const [error, setError] = useState("");

  async function handleTrack(e: React.FormEvent) {
    e.preventDefault();
    if (!ref.trim()) return;
    setLoading(true);
    setError("");
    setResult(null);
    try {
      const res = await fetch(`/api/orders/track?ref=${encodeURIComponent(ref.trim().toUpperCase())}`);
      if (res.status === 404) { setError("Order not found. Please check your reference number and try again."); return; }
      if (!res.ok) { setError("Something went wrong. Please try again."); return; }
      setResult(await res.json());
    } catch {
      setError("Unable to connect. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  const rank = result ? (STATUS_RANK[result.status] ?? 0) : -1;
  const isCancelled = result?.status === "cancelled";

  return (
    <main className="pt-20 min-h-screen bg-gray-50">
      {/* Hero */}
      <section className="bg-primary text-white py-20">
        <div className="container mx-auto px-4 text-center">
          <FadeIn>
            <div className="inline-flex items-center gap-2 bg-white/10 text-white text-sm font-semibold px-4 py-1.5 rounded-full mb-6">
              <Search size={14} /> Track Your Order
            </div>
            <h1 className="text-4xl md:text-5xl font-extrabold mb-4">Where's My Gas?</h1>
            <p className="text-white/70 text-lg max-w-lg mx-auto">
              Enter your order reference to get a real-time update on your delivery.
            </p>
          </FadeIn>
        </div>
      </section>

      {/* Search */}
      <section className="py-10">
        <div className="container mx-auto px-4 max-w-2xl">
          <FadeIn>
            <form onSubmit={handleTrack} className="bg-white rounded-3xl border border-border shadow-lg p-8">
              <label className="block text-sm font-semibold text-primary mb-2">Order Reference Number</label>
              <div className="flex gap-3">
                <input
                  type="text"
                  value={ref}
                  onChange={(e) => setRef(e.target.value)}
                  placeholder="e.g. MGD-M3KJV8-A2X4"
                  className="flex-1 border border-border rounded-2xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 font-mono uppercase placeholder:normal-case placeholder:font-sans"
                  required
                />
                <Button
                  type="submit"
                  disabled={loading}
                  className="bg-secondary text-white hover:bg-secondary/90 font-bold rounded-2xl px-6"
                >
                  {loading ? (
                    <span className="flex items-center gap-2">
                      <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                      Checking
                    </span>
                  ) : (
                    <span className="flex items-center gap-2"><Search size={16} /> Track</span>
                  )}
                </Button>
              </div>
              <p className="text-xs text-muted-foreground mt-3">
                Your reference was emailed to you when you placed the order (format: MGD-XXXXX-XXXX).
              </p>
              {error && (
                <div className="mt-4 bg-red-50 border border-red-100 text-red-700 rounded-2xl px-4 py-3 text-sm font-medium">
                  ⚠️ {error}
                </div>
              )}
            </form>
          </FadeIn>
        </div>
      </section>

      {/* Result */}
      {result && (
        <section className="pb-20">
          <div className="container mx-auto px-4 max-w-2xl space-y-6">
            <FadeIn>
              {/* Reference header */}
              <div className="bg-white rounded-3xl border border-border shadow-sm p-6 flex items-center justify-between flex-wrap gap-4">
                <div>
                  <p className="text-xs text-muted-foreground mb-1">Order Reference</p>
                  <p className="text-2xl font-extrabold text-secondary font-mono">{result.orderRef}</p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-muted-foreground mb-1">Placed on</p>
                  <p className="font-semibold text-primary">
                    {new Date(result.createdAt).toLocaleDateString("en-ZA", { day: "numeric", month: "long", year: "numeric" })}
                  </p>
                </div>
              </div>

              {/* Status stepper */}
              {!isCancelled ? (
                <div className="bg-white rounded-3xl border border-border shadow-sm p-8">
                  <h2 className="font-extrabold text-primary mb-8 text-lg">Delivery Status</h2>
                  <div className="relative">
                    {STATUS_STEPS.map((step, i) => {
                      const done  = rank >= i;
                      const active = rank === i;
                      const Icon = step.icon;
                      return (
                        <div key={step.key} className="flex gap-4 relative pb-8 last:pb-0">
                          {/* Connector line */}
                          {i < STATUS_STEPS.length - 1 && (
                            <div className={`absolute left-5 top-10 bottom-0 w-0.5 ${done ? "bg-secondary" : "bg-gray-200"}`} />
                          )}
                          {/* Icon */}
                          <div className={`relative z-10 w-10 h-10 rounded-full flex items-center justify-center shrink-0 transition-all ${
                            active ? "bg-secondary text-white ring-4 ring-secondary/20 scale-110" :
                            done   ? "bg-primary text-white" :
                                     "bg-gray-100 text-gray-400"
                          }`}>
                            <Icon size={18} />
                          </div>
                          {/* Content */}
                          <div className="pt-1.5">
                            <p className={`font-bold text-sm ${done ? "text-primary" : "text-gray-400"}`}>
                              {step.label}
                              {active && <span className="ml-2 text-xs bg-secondary/10 text-secondary px-2 py-0.5 rounded-full">Current</span>}
                            </p>
                            {active && <p className="text-xs text-muted-foreground mt-1">{step.desc}</p>}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ) : (
                <div className="bg-red-50 border border-red-100 rounded-3xl p-6 text-center">
                  <p className="text-2xl mb-2">❌</p>
                  <p className="font-bold text-red-700 mb-1">Order Cancelled</p>
                  <p className="text-sm text-red-600">This order has been cancelled. Please contact us if you have questions.</p>
                </div>
              )}

              {/* Order items */}
              <div className="bg-white rounded-3xl border border-border shadow-sm p-6">
                <h2 className="font-extrabold text-primary mb-5 text-lg">Order Summary</h2>
                <div className="space-y-3">
                  {result.items.map((item, i) => (
                    <div key={i} className="flex items-center justify-between py-3 border-b border-gray-100 last:border-0">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 bg-primary/5 rounded-xl flex items-center justify-center text-lg">🔥</div>
                        <div>
                          <p className="font-semibold text-sm text-primary">{item.productName}</p>
                          <p className="text-xs text-muted-foreground">×{item.quantity} @ R{item.unitPrice.toFixed(2)} each</p>
                        </div>
                      </div>
                      <span className="font-bold text-primary">R{item.subtotal.toFixed(2)}</span>
                    </div>
                  ))}
                  <div className="flex justify-between pt-3 font-extrabold text-primary text-lg">
                    <span>Total</span>
                    <span>R{result.totalAmount.toFixed(2)}</span>
                  </div>
                </div>
              </div>

              {/* Help */}
              <div className="bg-primary/5 rounded-3xl p-6 text-center">
                <Clock size={24} className="mx-auto text-primary mb-3" />
                <p className="font-semibold text-primary mb-1">Need help with your order?</p>
                <p className="text-sm text-muted-foreground mb-4">Our team is available 7 days a week, 7am – 8pm.</p>
                <div className="flex gap-3 justify-center flex-wrap">
                  <a href="tel:0767488597">
                    <Button className="bg-primary text-white hover:bg-primary/90 rounded-full font-bold">
                      <Phone size={16} className="mr-2" /> 076 748 8597
                    </Button>
                  </a>
                  <a href="https://wa.me/27767488597" target="_blank" rel="noopener">
                    <Button variant="outline" className="border-primary text-primary hover:bg-primary hover:text-white rounded-full font-bold">
                      💬 WhatsApp
                    </Button>
                  </a>
                </div>
              </div>
            </FadeIn>
          </div>
        </section>
      )}

      {/* Prompt to track if no result yet */}
      {!result && !loading && (
        <section className="pb-20">
          <div className="container mx-auto px-4 max-w-2xl">
            <FadeIn>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-center">
                {[
                  { icon: "📩", title: "Find your reference", desc: "Check your confirmation email for a code like MGD-XXXXX-XXXX." },
                  { icon: "🔍", title: "Enter the code", desc: "Type it in the search box above and hit Track." },
                  { icon: "🚚", title: "See live status", desc: "Get an instant update on where your delivery is." },
                ].map((s) => (
                  <div key={s.title} className="bg-white rounded-2xl border border-border p-6">
                    <div className="text-3xl mb-3">{s.icon}</div>
                    <p className="font-bold text-primary text-sm mb-1">{s.title}</p>
                    <p className="text-xs text-muted-foreground">{s.desc}</p>
                  </div>
                ))}
              </div>
            </FadeIn>
          </div>
        </section>
      )}
    </main>
  );
}
