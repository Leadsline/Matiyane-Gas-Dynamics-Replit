import { FadeIn } from "@/components/ui/fade-in";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Shield, Flame, Users, Award, CheckCircle, ChevronRight } from "lucide-react";

const values = [
  { icon: Shield, title: "Safety", desc: "Every cylinder we handle is inspected and pressure-tested. Your family's safety is non-negotiable." },
  { icon: CheckCircle, title: "Reliability", desc: "When you place an order, we deliver. No excuses, no delays — we take pride in keeping our word." },
  { icon: Award, title: "Affordability", desc: "We believe access to safe, clean gas shouldn't be a luxury. Our prices are honest and competitive." },
  { icon: Users, title: "Community", desc: "We're a local business serving local families. We know our customers by name, not by number." },
];

const stats = [
  { number: "1000+", label: "Happy Customers" },
  { number: "7 Days", label: "A Week Service" },
  { number: "4 Sizes", label: "Available" },
  { number: "100%", label: "Safety Certified" },
];

export default function AboutPage() {
  return (
    <main className="pt-20">
      {/* Hero */}
      <section className="bg-primary text-white py-20 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10" style={{ backgroundImage: "radial-gradient(circle at 70% 50%, #f0c040 0px, transparent 60%)" }} />
        <div className="container mx-auto px-4 relative z-10">
          <FadeIn direction="up">
            <span className="text-secondary font-semibold uppercase tracking-widest text-sm">Who We Are</span>
            <h1 className="text-5xl font-extrabold mt-2 mb-4">About Matiyane Gas</h1>
            <p className="text-white/70 text-xl max-w-2xl">
              A trusted, family-run gas distributor proudly serving Kempton Park and surrounding communities with safe, reliable LPG solutions.
            </p>
          </FadeIn>
        </div>
      </section>

      {/* Story */}
      <section className="py-24 bg-white">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <FadeIn direction="right">
              <div>
                <span className="text-secondary font-semibold uppercase tracking-widest text-sm">Our Story</span>
                <h2 className="text-4xl font-extrabold text-primary mt-2 mb-6">Built on Trust, Delivered with Care</h2>
                <div className="space-y-4 text-foreground/70 leading-relaxed">
                  <p>
                    Matiyane Gas Distributors was founded with a simple but powerful purpose: to make safe, quality gas accessible to every household and business in Kempton Park. We saw too many families struggling to find reliable gas supplies at honest prices — and we decided to do something about it.
                  </p>
                  <p>
                    Based in Glen Marais, Kempton Park, we serve the local community with the dedication of a neighbour, not a corporation. Every delivery is personal to us — because we live and work in the same community as our customers.
                  </p>
                  <p>
                    We handle 5kg, 9kg, 19kg and 48kg cylinders — catering to households, restaurants, schools and industrial users. No matter your need, we have the right gas solution at a price that makes sense.
                  </p>
                </div>
                <div className="mt-8">
                  <Link href="/order">
                    <Button className="bg-primary text-white hover:bg-primary/90 rounded-full px-8 font-semibold">
                      Order Gas Today <ChevronRight size={16} className="ml-1" />
                    </Button>
                  </Link>
                </div>
              </div>
            </FadeIn>
            <FadeIn direction="left">
              <div className="relative">
                <div className="bg-primary rounded-3xl p-10 text-white">
                  <Flame className="w-16 h-16 text-secondary mb-6" />
                  <h3 className="text-2xl font-bold mb-3">Our Mission</h3>
                  <p className="text-white/70 leading-relaxed mb-6">
                    To be the most trusted gas distributor in Kempton Park and Ekurhuleni — delivering safe, certified LPG gas with exceptional service and prices every household can afford.
                  </p>
                  <div className="border-t border-white/20 pt-6">
                    <p className="text-secondary font-semibold text-lg italic">"Safe, Reliable and Affordable — that's not just our tagline. It's our promise."</p>
                  </div>
                </div>
              </div>
            </FadeIn>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="py-16 bg-secondary text-white">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, i) => (
              <FadeIn key={stat.label} direction="up" delay={i * 100}>
                <div className="text-center">
                  <p className="text-4xl font-extrabold mb-1">{stat.number}</p>
                  <p className="text-white/80 text-sm font-medium">{stat.label}</p>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="py-24 bg-gray-50">
        <div className="container mx-auto px-4">
          <FadeIn direction="up">
            <div className="text-center mb-14">
              <span className="text-secondary font-semibold uppercase tracking-widest text-sm">What Drives Us</span>
              <h2 className="text-4xl font-extrabold text-primary mt-2">Our Core Values</h2>
            </div>
          </FadeIn>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {values.map((v, i) => (
              <FadeIn key={v.title} direction="up" delay={i * 100}>
                <div className="bg-white rounded-2xl p-8 border border-border hover:border-secondary hover:shadow-lg transition-all duration-300 group">
                  <div className="w-14 h-14 bg-primary/5 rounded-xl flex items-center justify-center mb-5 group-hover:bg-secondary/10 transition-colors">
                    <v.icon className="w-7 h-7 text-primary group-hover:text-secondary transition-colors" />
                  </div>
                  <h3 className="font-bold text-lg text-primary mb-2">{v.title}</h3>
                  <p className="text-muted-foreground text-sm leading-relaxed">{v.desc}</p>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* Safety Commitment */}
      <section className="py-24 bg-primary text-white">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <FadeIn direction="up">
              <Shield className="w-16 h-16 text-secondary mx-auto mb-6" />
              <h2 className="text-4xl font-extrabold mb-4">Our Safety Commitment</h2>
              <p className="text-white/70 text-lg leading-relaxed mb-8">
                Gas safety is not something we take lightly. All our cylinders are sourced from certified suppliers, regularly inspected, and handled by trained staff. We comply fully with South African LP Gas safety regulations and industry best practices.
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mt-10 text-left">
                {[
                  "All cylinders pressure-tested",
                  "Certified & licensed operation",
                  "Proper sealing on every delivery",
                  "Safe delivery procedures",
                  "Staff trained in gas safety",
                  "Compliance with SA regulations",
                ].map((item) => (
                  <div key={item} className="flex items-center gap-3 bg-white/10 rounded-xl p-4">
                    <CheckCircle className="text-secondary w-5 h-5 shrink-0" />
                    <span className="text-sm font-medium">{item}</span>
                  </div>
                ))}
              </div>
            </FadeIn>
          </div>
        </div>
      </section>
    </main>
  );
}
