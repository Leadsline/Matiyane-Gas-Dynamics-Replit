import { useEffect, useState } from "react";
import { Link } from "wouter";
import { ParticleCanvas } from "@/components/ui/particle-canvas";
import { FadeIn } from "@/components/ui/fade-in";
import { Button } from "@/components/ui/button";
import { useListProducts } from "@workspace/api-client-react";
import { Shield, Truck, Clock, Award, Phone, ChevronRight, Star } from "lucide-react";

const carouselMessages = [
  "Safe & Certified Gas Supply",
  "Free Delivery in Kempton Park",
  "Available 7 Days a Week",
  "Your Safety is Our Priority",
  "Trusted by Thousands of Households",
  "Competitive Prices, No Compromise",
];

function TextCarousel() {
  const [current, setCurrent] = useState(0);
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const interval = setInterval(() => {
      setVisible(false);
      setTimeout(() => {
        setCurrent((prev) => (prev + 1) % carouselMessages.length);
        setVisible(true);
      }, 400);
    }, 3200);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-full px-8 py-3 inline-block mt-8">
      <p
        className="text-secondary font-semibold text-lg text-center transition-all duration-400"
        style={{ opacity: visible ? 1 : 0, transform: visible ? "translateY(0)" : "translateY(6px)" }}
      >
        {carouselMessages[current]}
      </p>
    </div>
  );
}

const features = [
  { icon: Shield, title: "Safety First", desc: "All cylinders pressure-tested and certified to South African safety standards." },
  { icon: Truck, title: "Free Delivery", desc: "Free delivery throughout Kempton Park. Fast, reliable, on your schedule." },
  { icon: Clock, title: "7 Days a Week", desc: "We're available Monday to Sunday — gas emergencies don't keep business hours." },
  { icon: Award, title: "Competitive Pricing", desc: "Honest, transparent prices. No hidden fees, no surprises at the door." },
];

const testimonials = [
  { name: "Nomsa T.", suburb: "Kempton Park", text: "Delivery was on time and the gas was exactly what I ordered. Will definitely use again!", stars: 5 },
  { name: "Pieter V.", suburb: "Glen Marais", text: "Best gas supplier in the area. Reliable and always friendly service.", stars: 5 },
  { name: "Fatima K.", suburb: "Norkem Park", text: "Ordered 19kg for our restaurant. Same-day delivery and great price.", stars: 5 },
];

export default function HomePage() {
  const { data: products } = useListProducts();

  return (
    <main>
      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
        <ParticleCanvas />
        <div className="relative z-10 text-center text-white px-4 max-w-4xl mx-auto">
          <FadeIn direction="down">
            <div className="inline-flex items-center gap-2 bg-secondary/20 border border-secondary/40 text-secondary rounded-full px-5 py-2 text-sm font-semibold mb-6 uppercase tracking-wider">
              <Shield size={14} />
              Licensed & Certified Gas Distributor
            </div>
          </FadeIn>
          <FadeIn direction="up" delay={100}>
            <h1 className="text-5xl md:text-7xl font-extrabold leading-tight mb-4 tracking-tight">
              Matiyane Gas
              <span className="block text-secondary">Distributors</span>
            </h1>
          </FadeIn>
          <FadeIn direction="up" delay={200}>
            <p className="text-xl md:text-2xl text-white/80 font-light mb-2">
              Safe, Reliable and Affordable
            </p>
            <p className="text-base text-white/60 max-w-xl mx-auto">
              Serving Kempton Park and surrounding areas with quality LPG gas refills — delivered to your door.
            </p>
          </FadeIn>
          <FadeIn direction="up" delay={300}>
            <TextCarousel />
          </FadeIn>
          <FadeIn direction="up" delay={400}>
            <div className="flex flex-col sm:flex-row gap-4 justify-center mt-10">
              <Link href="/order">
                <Button size="lg" className="bg-secondary text-white hover:bg-secondary/90 font-bold rounded-full px-10 py-4 text-base shadow-xl shadow-secondary/30">
                  Order Gas Now
                  <ChevronRight size={18} className="ml-1" />
                </Button>
              </Link>
              <Link href="/products">
                <Button size="lg" variant="outline" className="border-white text-white hover:bg-white/10 font-bold rounded-full px-10 py-4 text-base">
                  View Prices
                </Button>
              </Link>
            </div>
          </FadeIn>
          <FadeIn direction="up" delay={500}>
            <div className="mt-10 flex flex-wrap gap-6 justify-center text-sm text-white/60">
              <span className="flex items-center gap-2"><Phone size={14} className="text-secondary" /> 076 748 8597</span>
              <span className="flex items-center gap-2"><Phone size={14} className="text-secondary" /> 082 467 6584</span>
            </div>
          </FadeIn>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10 flex flex-col items-center text-white/40 text-xs gap-2">
          <span>Scroll</span>
          <div className="w-px h-12 bg-white/20 animate-pulse" />
        </div>
      </section>

      {/* Products Preview */}
      <section className="py-24 bg-white">
        <div className="container mx-auto px-4">
          <FadeIn direction="up">
            <div className="text-center mb-14">
              <span className="text-secondary font-semibold uppercase tracking-widest text-sm">Our Products</span>
              <h2 className="text-4xl font-extrabold text-primary mt-2">Gas Refill Price List</h2>
              <p className="text-muted-foreground mt-3 max-w-lg mx-auto">All sizes available. Simple, transparent pricing with no hidden costs.</p>
            </div>
          </FadeIn>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {(products || [
              { id: 1, name: "5kg Gas Refill", price: 150, description: "Perfect for small households and camping." },
              { id: 2, name: "9kg Gas Refill", price: 250, description: "Our most popular size for everyday cooking." },
              { id: 3, name: "19kg Gas Refill", price: 490, description: "Great for large families and small businesses." },
              { id: 4, name: "48kg Gas Refill", price: 1250, description: "Industrial and commercial grade." },
            ]).map((product, i) => (
              <FadeIn key={product.id} direction="up" delay={i * 100}>
                <div className="group border border-border rounded-2xl p-6 text-center hover:border-secondary hover:shadow-xl hover:shadow-secondary/10 transition-all duration-300 bg-card relative overflow-hidden">
                  <div className="absolute top-0 left-0 right-0 h-1 bg-secondary scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left" />
                  <div className="w-16 h-16 bg-primary/5 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:bg-secondary/10 transition-colors">
                    <span className="text-2xl font-extrabold text-primary group-hover:text-secondary transition-colors">{product.name.split("kg")[0]}kg</span>
                  </div>
                  <h3 className="font-bold text-lg text-primary mb-1">{product.name}</h3>
                  <p className="text-muted-foreground text-sm mb-4">{product.description}</p>
                  <div className="text-3xl font-extrabold text-secondary mb-4">R{product.price}</div>
                  <Link href="/order">
                    <Button className="w-full rounded-full bg-primary text-white group-hover:bg-secondary transition-colors font-semibold">
                      Order Now
                    </Button>
                  </Link>
                </div>
              </FadeIn>
            ))}
          </div>
          <FadeIn direction="up" delay={400}>
            <div className="text-center mt-10">
              <Link href="/products">
                <Button variant="outline" size="lg" className="rounded-full border-primary text-primary hover:bg-primary hover:text-white font-semibold px-8">
                  View Full Catalogue
                  <ChevronRight size={16} className="ml-1" />
                </Button>
              </Link>
            </div>
          </FadeIn>
        </div>
      </section>

      {/* Features / Why Choose Us */}
      <section className="py-24 bg-primary text-white relative overflow-hidden">
        <div className="absolute inset-0 opacity-5" style={{ backgroundImage: "radial-gradient(circle at 20% 50%, #f0c040 1px, transparent 1px), radial-gradient(circle at 80% 20%, #f0c040 1px, transparent 1px)", backgroundSize: "60px 60px" }} />
        <div className="container mx-auto px-4 relative z-10">
          <FadeIn direction="up">
            <div className="text-center mb-14">
              <span className="text-secondary font-semibold uppercase tracking-widest text-sm">Why Choose Us</span>
              <h2 className="text-4xl font-extrabold mt-2">The Matiyane Difference</h2>
              <p className="text-white/60 mt-3 max-w-lg mx-auto">We don't just deliver gas — we deliver peace of mind.</p>
            </div>
          </FadeIn>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((f, i) => (
              <FadeIn key={f.title} direction="up" delay={i * 100}>
                <div className="text-center group">
                  <div className="w-16 h-16 bg-white/10 rounded-2xl flex items-center justify-center mx-auto mb-5 group-hover:bg-secondary/20 transition-colors duration-300">
                    <f.icon className="w-8 h-8 text-secondary" />
                  </div>
                  <h3 className="font-bold text-lg mb-2">{f.title}</h3>
                  <p className="text-white/60 text-sm leading-relaxed">{f.desc}</p>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-24 bg-gray-50">
        <div className="container mx-auto px-4">
          <FadeIn direction="up">
            <div className="text-center mb-14">
              <span className="text-secondary font-semibold uppercase tracking-widest text-sm">Testimonials</span>
              <h2 className="text-4xl font-extrabold text-primary mt-2">What Our Customers Say</h2>
            </div>
          </FadeIn>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((t, i) => (
              <FadeIn key={t.name} direction="up" delay={i * 150}>
                <div className="bg-white rounded-2xl p-8 shadow-sm border border-border hover:shadow-lg transition-shadow duration-300">
                  <div className="flex gap-1 mb-4">
                    {Array.from({ length: t.stars }).map((_, j) => (
                      <Star key={j} size={16} className="text-secondary fill-secondary" />
                    ))}
                  </div>
                  <p className="text-foreground/80 mb-6 leading-relaxed italic">"{t.text}"</p>
                  <div>
                    <p className="font-bold text-primary">{t.name}</p>
                    <p className="text-sm text-muted-foreground">{t.suburb}</p>
                  </div>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Banner */}
      <section className="py-20 bg-secondary text-white">
        <div className="container mx-auto px-4 text-center">
          <FadeIn direction="up">
            <h2 className="text-4xl font-extrabold mb-4">Ready to Order?</h2>
            <p className="text-white/80 text-lg mb-8 max-w-xl mx-auto">Place your order now and get gas delivered to your door. Free delivery in Kempton Park.</p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/order">
                <Button size="lg" className="bg-white text-secondary hover:bg-white/90 font-bold rounded-full px-10">
                  Order Gas Now
                </Button>
              </Link>
              <a href="tel:0767488597">
                <Button size="lg" variant="outline" className="border-white text-white hover:bg-white/10 font-bold rounded-full px-10">
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
