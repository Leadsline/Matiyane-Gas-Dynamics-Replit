import { FadeIn } from "@/components/ui/fade-in";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { useListProducts } from "@workspace/api-client-react";
import { CheckCircle, Truck, ShoppingCart, ChevronRight, Flame, Wrench, Heater, Cylinder, ClipboardCheck, ArrowRight } from "lucide-react";
import { UsageEstimator } from "@/components/ui/usage-estimator";
import { GasLevelDetector } from "@/components/ui/gas-level-detector";

const useCases: Record<number, string[]> = {
  1: ["Small apartments", "Camping & braais", "Backup supply", "Single-person households"],
  2: ["Family of 2-4", "Everyday cooking", "Most popular choice", "Suburban homes"],
  3: ["Medium families", "Small restaurants", "Extended use", "Great value"],
  4: ["Large families", "Restaurants & hotels", "Extended cooking", "Premium capacity"],
  5: ["Restaurants & hotels", "Industrial kitchens", "Farms & commercial", "High-volume operations"],
  6: ["All standard cylinders", "5kg to 48kg sizes", "No installation needed", "Perfect gift for customers"],
};

const productColors = [
  "from-blue-50 to-blue-100 border-blue-200",
  "from-amber-50 to-amber-100 border-amber-200",
  "from-green-50 to-green-100 border-green-200",
  "from-purple-50 to-purple-100 border-purple-200",
  "from-rose-50 to-rose-100 border-rose-200",
];

const accentBarClasses = [
  "accent-bar-blue", "accent-bar-amber", "accent-bar-green",
  "accent-bar-purple", "accent-bar-rose", "accent-bar-cyan",
];

const borderHoverClasses = [
  "border-hover-blue", "border-hover-amber", "border-hover-green",
  "border-hover-purple", "border-hover-rose", "border-hover-cyan",
  "border-hover-indigo", "border-hover-orange", "border-hover-teal", "border-hover-lime"
];

export default function ProductsPage() {
  const { data: products, isLoading } = useListProducts();

  const displayProducts = products || [
    { id: 1, name: "5kg Gas Refill",     price: 150,  description: "Perfect for small households and camping. Safe, clean-burning LPG gas.", unit: "5kg",    inStock: true },
    { id: 2, name: "9kg Gas Refill",     price: 250,  description: "Ideal for average households. Our most popular size for everyday cooking.", unit: "9kg",  inStock: true },
    { id: 3, name: "14kg Gas Refill",    price: 490,  description: "Great for medium families and small businesses. Extended cooking time.", unit: "14kg",     inStock: true },
    { id: 4, name: "19kg Gas Refill",    price: 740,  description: "Large families and restaurants. Extended cooking time with premium capacity.", unit: "19kg", inStock: true },
    { id: 5, name: "48kg Gas Refill",    price: 1590, description: "Industrial and commercial grade. Suitable for restaurants and large operations.", unit: "48kg", inStock: true },
    { id: 6, name: "Gas Level Detector", price: 299,  description: "Clip-on ultrasonic sensor that reads your cylinder level in seconds. Works on all standard LPG cylinders.", unit: "device", inStock: true },
  ];

  const gasCylinders = displayProducts.filter((p) => p.id <= 5);
  const detector     = displayProducts.find((p) => p.id === 6);

  const serviceProducts = (products || [
    { id: 7, name: "Gas Stoves Installation", description: "Professional installation of gas stoves for safe and efficient cooking.", icon: "wrench" },
    { id: 8, name: "Gas Fire Place Installation", description: "Expert installation of gas fireplaces to bring warmth, style and comfort.", icon: "flame" },
    { id: 9, name: "Gas Stoves Distribution (Sales)", description: "Wide range of quality gas stoves available for purchase.", icon: "shoppingCart" },
    { id: 10, name: "Gas Heaters Distribution", description: "Stay warm all year round with efficient and reliable gas heaters.", icon: "heater" },
    { id: 11, name: "Gas Cylinders", description: "High quality gas cylinders in different sizes to meet your needs.", icon: "cylinder" },
    { id: 12, name: "Certificates of Compliance (COCs)", description: "We issue COCs to ensure your gas systems meet safety standards.", icon: "clipboardCheck" },
  ]).filter((p) => p.id >= 7);

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
          <FadeIn direction="up">
            <div className="text-center mb-14">
              <span className="text-secondary font-semibold uppercase tracking-widest text-sm">Gas Refills</span>
              <h2 className="text-4xl font-extrabold text-primary mt-2">Gas Refill Price List</h2>
              <p className="text-muted-foreground mt-3 max-w-lg mx-auto">All sizes available. Simple, transparent pricing with no hidden costs.</p>
            </div>
          </FadeIn>
          {isLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6">
              {[1,2,3,4,5].map(i => (
                <div key={i} className="animate-pulse bg-gray-100 rounded-2xl h-96" />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6">
              {gasCylinders.map((product, i) => (
                <FadeIn key={product.id} direction="up" delay={i * 120}>
                  <div className={`h-full flex flex-col border rounded-2xl overflow-hidden hover:shadow-xl transition-all duration-300 group bg-gradient-to-b ${productColors[i % productColors.length]} relative card-hover-lift`}>
                    <div className={`absolute top-0 left-0 right-0 h-1 ${accentBarClasses[i]} scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left`} />
                    {i === 1 && (
                      <div className="absolute top-4 right-4 bg-secondary text-white text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wide animate-pulse-glow">
                        Most Popular
                      </div>
                    )}
                    <div className="p-6 flex flex-col flex-grow">
                      <div className="w-20 h-20 bg-white rounded-2xl flex flex-col items-center justify-center mx-auto mb-4 shadow-sm group-hover:shadow-md transition-shadow duration-300">
                        <Flame className="w-7 h-7 text-secondary mb-1" />
                        <span className="text-xl font-extrabold text-primary">{product.unit}</span>
                      </div>
                      <h3 className="font-extrabold text-lg text-primary text-center mb-2">{product.name}</h3>
                      <p className="text-foreground/60 text-sm text-center mb-4 flex-grow">{product.description}</p>
                      <div className="text-center mb-4">
                        <span className="text-3xl font-extrabold text-primary">R{product.price}</span>
                        <span className="text-muted-foreground text-sm ml-1">per refill</span>
                      </div>
                      <div className="space-y-1.5 mb-5">
                        {(useCases[product.id] || []).map((uc) => (
                          <div key={uc} className="flex items-center gap-2 text-xs text-foreground/70">
                            <CheckCircle size={12} className="text-primary shrink-0" />
                            <span>{uc}</span>
                          </div>
                        ))}
                      </div>
                      <Link href={`/order?product=${product.id}`} className="mt-auto">
                        <Button className="w-full rounded-full bg-primary text-white hover:bg-secondary transition-colors font-bold group-hover:scale-[1.02] transform">
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

      {/* Additional Services */}
      <section className="py-24 bg-gray-50">
        <div className="container mx-auto px-4">
          <FadeIn direction="up">
            <div className="text-center mb-14">
              <span className="text-secondary font-semibold uppercase tracking-widest text-sm">Additional Services</span>
              <h2 className="text-4xl font-extrabold text-primary mt-2">More Than Just Gas Refills</h2>
              <p className="text-muted-foreground mt-3 max-w-lg mx-auto">Professional installations, sales, and compliance services.</p>
            </div>
          </FadeIn>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {serviceProducts.map((product, i) => {
              const iconMap2: Record<string, typeof Wrench> = { wrench: Wrench, flame: Flame, shoppingCart: ShoppingCart, heater: Heater, cylinder: Cylinder, clipboardCheck: ClipboardCheck };
              const fallbackIcon = product.name.includes("Stove") && product.name.includes("Install") ? Wrench
                : product.name.includes("Fire") ? Flame
                : product.name.includes("Sales") ? ShoppingCart
                : product.name.includes("Heater") ? Heater
                : product.name.includes("Cylinders") ? Cylinder
                : product.name.includes("COC") ? ClipboardCheck
                : Wrench;
              const Icon = (product as any).icon ? iconMap2[(product as any).icon] || fallbackIcon : fallbackIcon;
              return (
                <FadeIn key={product.id} direction="up" delay={i * 100}>
                  <div className={`h-full flex flex-col bg-white rounded-2xl p-6 border border-border hover:shadow-xl hover:shadow-secondary/10 transition-all duration-300 card-hover-lift group relative overflow-hidden ${borderHoverClasses[i + 5]}`}>
                    <div className={`absolute top-0 left-0 right-0 h-1 ${accentBarClasses[i + 5]} scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left`} />
                    <div className="w-14 h-14 bg-primary/5 rounded-2xl flex items-center justify-center mb-4 group-hover:bg-secondary/10 transition-colors duration-300">
                      <Icon className="w-7 h-7 text-primary group-hover:text-secondary transition-colors duration-300" />
                    </div>
                    <h3 className="font-bold text-lg text-primary mb-2">{product.name}</h3>
                    <p className="text-muted-foreground text-sm mb-4 flex-grow">{product.description}</p>
                    <div className="inline-flex items-center gap-1 text-xs font-bold text-secondary bg-secondary/10 px-3 py-1 rounded-full mb-4 self-start">
                      <span className="w-1.5 h-1.5 rounded-full bg-secondary inline-block animate-pulse" />
                      Available on Request
                    </div>
                    <Link href={`/contact?service=${encodeURIComponent(product.name)}`} className="mt-auto">
                      <Button variant="outline" className="w-full rounded-full border-primary text-primary hover:bg-primary hover:text-white font-semibold transition-all group-hover:scale-[1.02] transform">
                        Enquire Now
                        <ArrowRight size={14} className="ml-1 group-hover:translate-x-1 transition-transform" />
                      </Button>
                    </Link>
                  </div>
                </FadeIn>
              );
            })}
          </div>
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
