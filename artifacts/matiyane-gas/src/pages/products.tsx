import { FadeIn } from "@/components/ui/fade-in";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { useListProducts } from "@workspace/api-client-react";
import { CheckCircle, Truck, ShoppingCart, ChevronRight, Flame } from "lucide-react";
import { UsageEstimator } from "@/components/ui/usage-estimator";
import { GasLevelDetector } from "@/components/ui/gas-level-detector";

const useCases: Record<number, string[]> = {
  1: ["Small apartments", "Camping & braais", "Backup supply", "Single-person households"],
  2: ["Family of 2-4", "Everyday cooking", "Most popular choice", "Suburban homes"],
  3: ["Large families", "Small restaurants", "Schools & offices", "Extended use"],
  4: ["Restaurants & hotels", "Industrial kitchens", "Farms & commercial", "High-volume operations"],
  5: ["All standard cylinders", "5kg to 48kg sizes", "No installation needed", "Perfect gift for customers"],
};

const productColors = [
  "from-blue-50 to-blue-100 border-blue-200",
  "from-amber-50 to-amber-100 border-amber-200",
  "from-green-50 to-green-100 border-green-200",
  "from-purple-50 to-purple-100 border-purple-200",
];

export default function ProductsPage() {
  const { data: products, isLoading } = useListProducts();

  const displayProducts = products || [
    { id: 1, name: "5kg Gas Refill",     price: 150,  description: "Perfect for small households and camping. Safe, clean-burning LPG gas.", unit: "5kg",    inStock: true },
    { id: 2, name: "9kg Gas Refill",     price: 250,  description: "Ideal for average households. Our most popular size for everyday cooking.", unit: "9kg",  inStock: true },
    { id: 3, name: "19kg Gas Refill",    price: 490,  description: "Great for large families and small businesses. Extended cooking time.", unit: "19kg",     inStock: true },
    { id: 4, name: "48kg Gas Refill",    price: 1250, description: "Industrial and commercial grade. Suitable for restaurants and large operations.", unit: "48kg", inStock: true },
    { id: 5, name: "Gas Level Detector", price: 299,  description: "Clip-on ultrasonic sensor that reads your cylinder level in seconds. Works on all standard LPG cylinders.", unit: "device", inStock: true },
  ];

  const gasCylinders = displayProducts.filter((p) => p.id <= 4);
  const detector     = displayProducts.find((p) => p.id === 5);

  return (
    <main className="pt-20">
      {/* Hero */}
      <section className="bg-primary text-white py-20 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10" style={{ backgroundImage: "radial-gradient(circle at 30% 70%, #f0c040 0px, transparent 60%)" }} />
        <div className="container mx-auto px-4 relative z-10">
          <FadeIn direction="up">
            <span className="text-secondary font-semibold uppercase tracking-widest text-sm">Our Products</span>
            <h1 className="text-5xl font-extrabold mt-2 mb-4">Gas Refill Catalogue</h1>
            <p className="text-white/70 text-xl max-w-2xl">
              Four sizes to suit every need. All cylinders are certified, safe, and ready for delivery.
            </p>
          </FadeIn>
        </div>
      </section>

      {/* Gas Refill Grid */}
      <section className="py-24 bg-white">
        <div className="container mx-auto px-4">
          {isLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {[1,2,3,4].map(i => (
                <div key={i} className="animate-pulse bg-gray-100 rounded-2xl h-96" />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {gasCylinders.map((product, i) => (
                <FadeIn key={product.id} direction="up" delay={i * 120}>
                  <div className={`border rounded-2xl overflow-hidden hover:shadow-xl transition-all duration-300 group bg-gradient-to-b ${productColors[i % productColors.length]} relative`}>
                    {i === 1 && (
                      <div className="absolute top-4 right-4 bg-secondary text-white text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wide">
                        Most Popular
                      </div>
                    )}
                    <div className="p-8">
                      <div className="w-24 h-24 bg-white rounded-2xl flex flex-col items-center justify-center mx-auto mb-6 shadow-sm group-hover:shadow-md transition-shadow">
                        <Flame className="w-8 h-8 text-secondary mb-1" />
                        <span className="text-2xl font-extrabold text-primary">{product.unit}</span>
                      </div>
                      <h3 className="font-extrabold text-xl text-primary text-center mb-2">{product.name}</h3>
                      <p className="text-foreground/60 text-sm text-center mb-5 leading-relaxed">{product.description}</p>
                      <div className="text-center mb-6">
                        <span className="text-4xl font-extrabold text-primary">R{product.price}</span>
                        <span className="text-muted-foreground text-sm ml-1">per refill</span>
                      </div>
                      <div className="space-y-2 mb-8">
                        {(useCases[product.id] || []).map((uc) => (
                          <div key={uc} className="flex items-center gap-2 text-sm text-foreground/70">
                            <CheckCircle size={14} className="text-primary shrink-0" />
                            <span>{uc}</span>
                          </div>
                        ))}
                      </div>
                      <Link href={`/order?product=${product.id}`}>
                        <Button className="w-full rounded-full bg-primary text-white hover:bg-secondary transition-colors font-bold">
                          <ShoppingCart size={15} className="mr-2" />
                          Order Now
                        </Button>
                      </Link>
                    </div>
                  </div>
                </FadeIn>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Usage Estimator */}
      <UsageEstimator />

      {/* Gas Level Detector */}
      {detector && (
        <section className="py-24 bg-gray-950">
          <div className="container mx-auto px-4">
            <FadeIn direction="up">
              <div className="text-center mb-14">
                <span className="text-secondary font-semibold uppercase tracking-widest text-sm">Smart Accessory</span>
                <h2 className="text-4xl font-extrabold text-white mt-2 mb-3">Gas Level Detector</h2>
                <p className="text-gray-400 text-lg max-w-xl mx-auto">
                  Never get caught with an empty cylinder again. Our clip-on ultrasonic sensor reads your gas level in seconds — no installation needed.
                </p>
              </div>
            </FadeIn>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center max-w-5xl mx-auto">
              {/* Simulator */}
              <FadeIn direction="left">
                <GasLevelDetector cylinderKg={9} />
              </FadeIn>

              {/* Features */}
              <FadeIn direction="right">
                <div className="space-y-6">
                  <div className="text-center lg:text-left">
                    <span className="inline-block bg-secondary/20 text-secondary text-xs font-bold px-3 py-1 rounded-full uppercase mb-4">Live Demo Above ↑</span>
                    <p className="text-gray-400 text-sm mb-6">Select any cylinder size and press Scan Now to simulate a reading. Your real device works exactly like this.</p>
                  </div>

                  {[
                    { icon: "⚡", title: "Instant Reading", desc: "Ultrasonic technology gives you a result in under 3 seconds — no waiting, no guessing." },
                    { icon: "🔗", title: "Universal Fit", desc: "Works on all standard LPG cylinders from 5kg to 48kg. Just clip on and scan." },
                    { icon: "🔋", title: "Long Battery Life", desc: "CR2032 coin cell included. Lasts up to 2 years with normal use." },
                    { icon: "🌡️", title: "Temperature Sensor", desc: "Built-in thermometer helps you store cylinders safely during extreme weather." },
                  ].map((f) => (
                    <div key={f.title} className="flex gap-4 bg-gray-900 rounded-2xl p-5 border border-gray-800">
                      <div className="text-2xl shrink-0">{f.icon}</div>
                      <div>
                        <p className="font-bold text-white mb-1">{f.title}</p>
                        <p className="text-gray-400 text-sm leading-relaxed">{f.desc}</p>
                      </div>
                    </div>
                  ))}

                  <div className="pt-2">
                    <div className="flex items-baseline gap-2 mb-4">
                      <span className="text-5xl font-extrabold text-white">R{detector.price}</span>
                      <span className="text-gray-500 text-sm">per device</span>
                    </div>
                    <Link href="/order?product=5">
                      <Button size="lg" className="w-full bg-secondary text-white hover:bg-secondary/90 rounded-full font-bold text-base py-4">
                        <ShoppingCart size={18} className="mr-2" />
                        Add to Order — R{detector.price}
                      </Button>
                    </Link>
                  </div>
                </div>
              </FadeIn>
            </div>
          </div>
        </section>
      )}

      {/* Delivery Info */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <FadeIn direction="up">
            <div className="max-w-3xl mx-auto">
              <div className="flex items-start gap-4 bg-white rounded-2xl p-8 border border-border shadow-sm">
                <Truck className="w-10 h-10 text-secondary shrink-0 mt-1" />
                <div>
                  <h3 className="font-bold text-xl text-primary mb-2">Delivery Information</h3>
                  <p className="text-foreground/70 mb-3">
                    <strong className="text-primary">Free delivery</strong> throughout Kempton Park (including Glen Marais, Glen Place, Birchleigh, Norkem Park and surrounding areas).
                  </p>
                  <p className="text-foreground/70">
                    For orders outside Kempton Park, our team will contact you to confirm the applicable delivery fee before processing your order.
                  </p>
                </div>
              </div>
            </div>
          </FadeIn>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 bg-primary text-white">
        <div className="container mx-auto px-4 text-center">
          <FadeIn direction="up">
            <h2 className="text-4xl font-extrabold mb-4">Ready to Order?</h2>
            <p className="text-white/70 text-lg mb-8">Place your order online or call us directly for assistance.</p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/order">
                <Button size="lg" className="bg-secondary text-white hover:bg-secondary/90 rounded-full font-bold px-10">
                  Order Online <ChevronRight size={16} className="ml-1" />
                </Button>
              </Link>
              <a href="tel:0767488597">
                <Button size="lg" variant="outline" className="border-white text-white hover:bg-white/10 rounded-full font-bold px-10">
                  Call 076 748 8597
                </Button>
              </a>
            </div>
          </FadeIn>
        </div>
      </section>
    </main>
  );
}
