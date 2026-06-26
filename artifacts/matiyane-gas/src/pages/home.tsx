import { useEffect, useState } from "react";
import { Link } from "wouter";
import { HeroCanvas } from "@/components/ui/hero-canvas";
import { FadeIn } from "@/components/ui/fade-in";
import { Button } from "@/components/ui/button";
import { useListProducts } from "@workspace/api-client-react";
import { Shield, Truck, Clock, Award, Phone, ChevronRight, Star, Wrench, Flame, ShoppingCart, Heater, ClipboardCheck, Cylinder, ArrowRight } from "lucide-react";

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
  { name: "James M.", suburb: "Birchleigh", text: "Fast, professional, and affordable. The gas stove installation was perfect!", stars: 5 },
  { name: "Sarah N.", suburb: "Esther Park", text: "COC certification was done quickly. They really know their stuff.", stars: 5 },
  { name: "Thabo S.", suburb: "Glen Place", text: "Been using them for 2 years. Never disappointed. Highly recommend!", stars: 5 },
];

const accentBarClasses = [
  "accent-bar-blue", "accent-bar-amber", "accent-bar-green",
  "accent-bar-purple", "accent-bar-rose", "accent-bar-cyan",
  "accent-bar-indigo", "accent-bar-orange", "accent-bar-teal", "accent-bar-lime"
];

const borderHoverClasses = [
  "border-hover-blue", "border-hover-amber", "border-hover-green",
  "border-hover-purple", "border-hover-rose", "border-hover-cyan",
  "border-hover-indigo", "border-hover-orange", "border-hover-teal", "border-hover-lime"
];

const marqueeLogos = [
  "Licensed & Certified Gas Distributor", "Free Delivery in Kempton Park", "Available 7 Days a Week",
  "Your Safety is Our Priority", "Trusted by Thousands of Households", "Competitive Prices, No Compromise",
  "Safe & Certified Gas Supply", "Expert Installations", "COA & COC Certificates",
];

export default function HomePage() {
  const { data: products } = useListProducts();

  // Products are now 5 gas cylinders + 1 detector + 6 services
  const gasRefills = (products || [
    { id: 1, name: "5kg Gas Refill", price: 150, description: "Perfect for small households and camping." },
    { id: 2, name: "9kg Gas Refill", price: 250, description: "Our most popular size for everyday cooking." },
    { id: 3, name: "14kg Gas Refill", price: 490, description: "Great for medium families and small businesses." },
    { id: 4, name: "19kg Gas Refill", price: 740, description: "Large families and restaurants." },
    { id: 5, name: "48kg Gas Refill", price: 1590, description: "Industrial and commercial grade." },
  ]).filter((p) => p.id <= 5);

  const serviceProducts = (products || [
    { id: 7, name: "Gas Stoves Installation", description: "Professional installation of gas stoves for safe and efficient cooking.", icon: "wrench" },
    { id: 8, name: "Gas Fire Place Installation", description: "Expert installation of gas fireplaces to bring warmth, style and comfort.", icon: "flame" },
    { id: 9, name: "Gas Stoves Distribution (Sales)", description: "Wide range of quality gas stoves available for purchase.", icon: "shoppingCart" },
    { id: 10, name: "Gas Heaters Distribution", description: "Stay warm all year round with efficient and reliable gas heaters.", icon: "heater" },
    { id: 11, name: "Gas Cylinders", description: "High quality gas cylinders in different sizes to meet your needs.", icon: "cylinder" },
    { id: 12, name: "Certificates of Compliance (COCs)", description: "We issue COCs to ensure your gas systems meet safety standards.", icon: "clipboardCheck" },
  ]).filter((p) => p.id >= 7);

  const iconMap: Record<string, typeof Wrench> = {
    wrench: Wrench, flame: Flame, shoppingCart: ShoppingCart, heater: Heater, cylinder: Cylinder, clipboardCheck: ClipboardCheck,
  };
  const getIcon = (product: { name: string; icon?: string }) => {
    const fallback = (product.name.includes("Stove") && product.name.includes("Install")) ? Wrench
      : product.name.includes("Fire") ? Flame
      : product.name.includes("Sales") ? ShoppingCart
      : product.name.includes("Heater") ? Heater
      : product.name.includes("Cylinders") ? Cylinder
      : product.name.includes("COC") ? ClipboardCheck
      : Wrench;
    return (product.icon && iconMap[product.icon]) || fallback;
  };

  return (
    <main>
      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
        {/* Dark background base */}
        <div className="absolute inset-0 z-0 bg-gradient-to-br from-[#0a1628] via-[#0f2240] to-[#1a2f5e]" />
        {/* Animated energy overlay — particles, light, rings */}
        <HeroCanvas />
        {/* Animated LPG cylinder — right side, isolated with gentle float + glow */}
        <img
          src="/hero-cylinder.png"
          alt="LPG Gas Cylinder"
          className="absolute z-[1] pointer-events-none hidden md:block animate-cylinder-float animate-cylinder-glow"
          style={{
            right: "8%",
            bottom: "-5%",
            height: "95%",
            maxHeight: "none",
            objectFit: "contain",
          }}
        />
        {/* Mobile cylinder — bottom right, smaller, gentle float */}
        <img
          src="/hero-cylinder.png"
          alt="LPG Gas Cylinder"
          className="absolute z-[1] pointer-events-none md:hidden animate-cylinder-float"
          style={{
            right: "-20%",
            bottom: "-8%",
            height: "40%",
            objectFit: "contain",
            opacity: 0.65,
          }}
        />
        <div className="relative z-10 text-white px-4 max-w-4xl mx-auto w-full text-center md:text-left md:ml-8 lg:ml-16">
          <FadeIn direction="down">
            <div className="inline-flex items-center gap-2 bg-secondary/20 border border-secondary/40 text-secondary rounded-full px-5 py-2 text-sm font-semibold mb-6 uppercase tracking-wider animate-float" style={{ textShadow: "0 2px 8px rgba(0,0,0,0.6)" }}>
              <Shield size={14} />
              Licensed & Certified Gas Distributor
            </div>
          </FadeIn>
          <FadeIn direction="up" delay={100}>
            <h1 className="text-5xl md:text-7xl font-extrabold leading-tight mb-4 tracking-tight" style={{ textShadow: "0 2px 16px rgba(0,0,0,0.7), 0 4px 32px rgba(0,0,0,0.4)" }}>
              Matiyane Gas
              <span className="block text-secondary" style={{ textShadow: "0 2px 16px rgba(0,0,0,0.7), 0 4px 32px rgba(0,0,0,0.4)" }}>Distributors</span>
            </h1>
          </FadeIn>
          <FadeIn direction="up" delay={200}>
            <p className="text-xl md:text-2xl text-white font-medium mb-2" style={{ textShadow: "0 2px 10px rgba(0,0,0,0.6)" }}>
              Safe, Reliable and Affordable
            </p>
            <p className="text-base text-white max-w-xl" style={{ textShadow: "0 1px 6px rgba(0,0,0,0.5)" }}>
              Serving Kempton Park and surrounding areas with quality LPG gas refills, installations, and COCs — delivered to your door.
            </p>
          </FadeIn>
          <FadeIn direction="up" delay={300}>
            <TextCarousel />
          </FadeIn>
          <FadeIn direction="up" delay={400}>
            <div className="flex flex-col sm:flex-row gap-4 mt-10 justify-center md:justify-start">
              <Link href="/order">
                <Button size="lg" className="bg-secondary text-white hover:bg-secondary/90 font-bold rounded-full px-10 py-4 text-base shadow-xl shadow-secondary/30 animate-pulse-glow">
                  Order Gas Now
                  <ChevronRight size={18} className="ml-1" />
                </Button>
              </Link>
              <Link href="/products">
                <Button size="lg" variant="outline" className="border-white text-white hover:bg-white/10 font-bold rounded-full px-10 py-4 text-base transition-all hover:scale-105">
                  View Prices
                </Button>
              </Link>
            </div>
          </FadeIn>
          <FadeIn direction="up" delay={500}>
            <div className="mt-10 flex flex-wrap gap-6 text-sm text-white font-medium" style={{ textShadow: "0 1px 6px rgba(0,0,0,0.5)" }}>
              <span className="flex items-center gap-2 hover:text-secondary transition-colors"><Phone size={14} className="text-secondary" /> 076 748 8597</span>
              <span className="flex items-center gap-2 hover:text-secondary transition-colors"><Phone size={14} className="text-secondary" /> 082 467 6584</span>
            </div>
          </FadeIn>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10 flex flex-col items-center text-white/40 text-xs gap-2">
          <span>Scroll</span>
          <div className="w-px h-12 bg-white/20 animate-pulse" />
        </div>
      </section>

      {/* Marquee Banner */}
      <div className="bg-primary border-y border-white/10 py-3 overflow-hidden">
        <div className="flex animate-marquee whitespace-nowrap">
          {[...marqueeLogos, ...marqueeLogos].map((text, i) => (
            <span key={i} className="mx-8 text-sm font-semibold text-white/80 uppercase tracking-wider flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-secondary inline-block" />
              {text}
            </span>
          ))}
        </div>
      </div>

      {/* Gas Refill Price List */}
      <section className="py-24 bg-white">
        <div className="container mx-auto px-4">
          <FadeIn direction="up">
            <div className="text-center mb-14">
              <span className="text-secondary font-semibold uppercase tracking-widest text-sm">Our Products</span>
              <h2 className="text-4xl font-extrabold text-primary mt-2">Gas Refill Price List</h2>
              <p className="text-muted-foreground mt-3 max-w-lg mx-auto">All sizes available. Simple, transparent pricing with no hidden costs.</p>
            </div>
          </FadeIn>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6">
            {gasRefills.map((product, i) => (
              <FadeIn key={product.id} direction="up" delay={i * 100}>
                <div className={`group h-full flex flex-col border border-border rounded-2xl p-6 text-center hover:shadow-xl hover:shadow-secondary/10 transition-all duration-300 bg-card relative overflow-hidden card-hover-lift ${borderHoverClasses[i]}`}>
                  {/* Colored accent bar on hover */}
                  <div className={`absolute top-0 left-0 right-0 h-1 ${accentBarClasses[i]} scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left`} />
                  <div className="w-16 h-16 bg-primary/5 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:bg-secondary/10 transition-colors duration-300">
                    <span className="text-2xl font-extrabold text-primary group-hover:text-secondary transition-colors duration-300">{product.name.split("kg")[0]}kg</span>
                  </div>
                  <h3 className="font-bold text-lg text-primary mb-1">{product.name}</h3>
                  <p className="text-muted-foreground text-sm mb-4 flex-grow">{product.description}</p>
                  <div className="text-3xl font-extrabold text-secondary mb-4">R{product.price}</div>
                  <Link href={`/order?product=${product.id}`}>
                    <Button className="w-full rounded-full bg-primary text-white group-hover:bg-secondary transition-colors duration-300 font-semibold group-hover:scale-[1.02] transform">
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
                <Button variant="outline" size="lg" className="rounded-full border-primary text-primary hover:bg-primary hover:text-white font-semibold px-8 transition-all hover:scale-105">
                  View Full Catalogue
                  <ChevronRight size={16} className="ml-1" />
                </Button>
              </Link>
            </div>
          </FadeIn>
        </div>
      </section>

      {/* Services */}
      <section className="py-24 bg-gray-50">
        <div className="container mx-auto px-4">
          <FadeIn direction="up">
            <div className="text-center mb-14">
              <span className="text-secondary font-semibold uppercase tracking-widest text-sm">Additional Services</span>
              <h2 className="text-4xl font-extrabold text-primary mt-2">More Than Just Gas Refills</h2>
              <p className="text-muted-foreground mt-3 max-w-lg mx-auto">Professional installations, sales, and compliance services to meet all your gas needs.</p>
            </div>
          </FadeIn>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {serviceProducts.map((product, i) => {
              const Icon = getIcon(product);
              return (
                <FadeIn key={product.id} direction="up" delay={i * 100}>
                  <div className={`group h-full flex flex-col bg-white rounded-2xl p-6 border border-border hover:shadow-xl hover:shadow-secondary/10 transition-all duration-300 card-hover-lift relative overflow-hidden ${borderHoverClasses[i + 5]}`}>
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
                    <Link href={`/contact?service=${encodeURIComponent(product.name)}`}>
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
                <div className="text-center group h-full">
                  <div className="w-16 h-16 bg-white/10 rounded-2xl flex items-center justify-center mx-auto mb-5 group-hover:bg-secondary/20 transition-all duration-300 group-hover:scale-110">
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
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {testimonials.map((t, i) => (
              <FadeIn key={t.name} direction="up" delay={i * 100}>
                <div className="h-full flex flex-col bg-white rounded-2xl p-8 shadow-sm border border-border hover:shadow-lg hover:border-secondary/30 transition-all duration-300 card-hover-lift group">
                  <div className="flex gap-1 mb-4">
                    {Array.from({ length: t.stars }).map((_, j) => (
                      <Star key={j} size={16} className="text-secondary fill-secondary group-hover:scale-110 transition-transform" style={{ transitionDelay: `${j * 50}ms` }} />
                    ))}
                  </div>
                  <p className="text-foreground/80 mb-6 leading-relaxed italic flex-grow">"{t.text}"</p>
                  <div className="flex items-center gap-3 mt-auto">
                    <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center text-primary font-bold text-sm">
                      {t.name.split(" ")[0][0]}{t.name.split(" ")[1]?.[0] || ""}
                    </div>
                    <div>
                      <p className="font-bold text-primary">{t.name}</p>
                      <p className="text-sm text-muted-foreground">{t.suburb}</p>
                    </div>
                  </div>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Banner */}
      <section className="py-20 bg-secondary text-white relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 left-0 w-64 h-64 bg-white rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2" />
          <div className="absolute bottom-0 right-0 w-64 h-64 bg-white rounded-full blur-3xl translate-x-1/2 translate-y-1/2" />
        </div>
        <div className="container mx-auto px-4 text-center relative z-10">
          <FadeIn direction="up">
            <h2 className="text-4xl font-extrabold mb-4">Ready to Order?</h2>
            <p className="text-white/80 text-lg mb-8 max-w-xl mx-auto">Place your order now and get gas delivered to your door. Free delivery in Kempton Park.</p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/order">
                <Button size="lg" className="bg-white text-secondary hover:bg-white/90 font-bold rounded-full px-10 transition-all hover:scale-105">
                  Order Gas Now
                </Button>
              </Link>
              <a href="tel:0767488597">
                <Button size="lg" variant="outline" className="border-white text-white hover:bg-white/10 font-bold rounded-full px-10 transition-all hover:scale-105">
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
