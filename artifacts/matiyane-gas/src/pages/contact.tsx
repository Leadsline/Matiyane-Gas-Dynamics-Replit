import { useState, useEffect } from "react";
import { FadeIn } from "@/components/ui/fade-in";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useSubmitContact } from "@workspace/api-client-react";
import { MapPin, Phone, Clock, CheckCircle, Loader2, MessageSquare } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const contactDetails = [
  { icon: Phone, label: "Phone Numbers", value: "076 748 8597\n082 467 6584", href: "tel:0767488597" },
  { icon: MapPin, label: "Address", value: "5 Kanonkop Place\nGlen Place, Glen Marais\nKempton Park, 1619", href: null },
  { icon: Clock, label: "Operating Hours", value: "Monday – Sunday\n7:00 AM – 7:00 PM", href: null },
];

export default function ContactPage() {
  const { toast } = useToast();
  const submitContact = useSubmitContact();
  const [form, setForm] = useState({ name: "", email: "", phone: "", service: "", message: "" });
  const [submitted, setSubmitted] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const serviceOptions = [
    "General Enquiry",
    "5kg Gas Refill",
    "9kg Gas Refill",
    "14kg Gas Refill",
    "19kg Gas Refill",
    "48kg Gas Refill",
    "Gas Level Detector",
    "Gas Stoves Installation",
    "Gas Fire Place Installation",
    "Gas Stoves Distribution (Sales)",
    "Gas Heaters Distribution",
    "Gas Cylinders",
    "Certificates of Compliance (COCs)",
  ];

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const prefillService = params.get("service");
    if (prefillService) {
      setForm((f) => ({ ...f, service: prefillService }));
    }
  }, []);

  const validate = () => {
    const errs: Record<string, string> = {};
    if (!form.name.trim()) errs.name = "Name is required";
    if (!form.email.trim()) errs.email = "Email is required";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) errs.email = "Enter a valid email";
    if (!form.message.trim()) errs.message = "Message is required";
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    try {
      await submitContact.mutateAsync({ data: { name: form.name, email: form.email, phone: form.phone || null, service: form.service || null, message: form.message } });
      setSubmitted(true);
    } catch (err: any) {
      const msg = err?.message || err?.error || "Please try again or call us directly.";
      console.error("Contact error:", err);
      toast({ title: "Failed to send", description: msg, variant: "destructive" });
    }
  };

  return (
    <main className="pt-20">
      {/* Hero */}
      <section className="bg-primary text-white py-20 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10" style={{ backgroundImage: "radial-gradient(circle at 80% 30%, #f0c040 0px, transparent 60%)" }} />
        <div className="container mx-auto px-4 relative z-10">
          <FadeIn direction="up">
            <span className="text-secondary font-semibold uppercase tracking-widest text-sm">Get in Touch</span>
            <h1 className="text-5xl font-extrabold mt-2 mb-4">Contact Us</h1>
            <p className="text-white/70 text-xl max-w-2xl">
              Have a question or ready to order? We're here to help — seven days a week.
            </p>
          </FadeIn>
        </div>
      </section>

      <section className="py-24 bg-white">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
            {/* Left: Info + Map */}
            <FadeIn direction="right">
              <div className="space-y-8">
                <div>
                  <h2 className="text-3xl font-extrabold text-primary mb-6">Get in Touch</h2>
                  <div className="space-y-5">
                    {contactDetails.map((detail) => (
                      <div key={detail.label} className="flex gap-5 group">
                        <div className="w-12 h-12 bg-primary/5 rounded-xl flex items-center justify-center shrink-0 group-hover:bg-secondary/10 transition-colors">
                          <detail.icon className="w-5 h-5 text-primary group-hover:text-secondary transition-colors" />
                        </div>
                        <div>
                          <p className="font-bold text-primary text-sm mb-1">{detail.label}</p>
                          {detail.href ? (
                            <a href={detail.href} className="text-foreground/70 hover:text-secondary transition-colors whitespace-pre-line text-sm leading-relaxed">
                              {detail.value}
                            </a>
                          ) : (
                            <p className="text-foreground/70 whitespace-pre-line text-sm leading-relaxed">{detail.value}</p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* WhatsApp CTA */}
                <div className="bg-[#25D366]/10 border border-[#25D366]/30 rounded-2xl p-6">
                  <div className="flex items-center gap-3 mb-3">
                    <MessageSquare className="w-6 h-6 text-[#25D366]" />
                    <h3 className="font-bold text-primary">Chat on WhatsApp</h3>
                  </div>
                  <p className="text-muted-foreground text-sm mb-4">The fastest way to get a response. Chat directly with our team on WhatsApp.</p>
                  <a
                    href="https://wa.me/27767488597?text=Hi%20Matiyane%20Gas%2C%20I%20would%20like%20to%20enquire%20about%20gas%20delivery."
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <Button className="bg-[#25D366] hover:bg-[#128C7E] text-white rounded-full font-semibold">
                      Open WhatsApp Chat
                    </Button>
                  </a>
                </div>

                {/* Google Maps */}
                <div className="rounded-2xl overflow-hidden border border-border shadow-sm">
                  <iframe
                    title="Matiyane Gas Distributors Location"
                    src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3580.8!2d28.2344!3d-26.1072!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x1e951ca5ec5b6f1b%3A0x1234567890abcdef!2s5+Kanonkop+Place%2C+Glen+Marais%2C+Kempton+Park%2C+1619!5e0!3m2!1sen!2sza!4v1700000000000!5m2!1sen!2sza"
                    width="100%"
                    height="280"
                    style={{ border: 0 }}
                    allowFullScreen
                    loading="lazy"
                    referrerPolicy="no-referrer-when-downgrade"
                  />
                </div>
              </div>
            </FadeIn>

            {/* Right: Contact Form */}
            <FadeIn direction="left" delay={150}>
              <div className="bg-gray-50 rounded-3xl p-8 border border-border">
                <h2 className="text-2xl font-extrabold text-primary mb-2">Send Us a Message</h2>
                <p className="text-muted-foreground text-sm mb-8">We'll respond within 24 hours (usually much sooner).</p>

                {submitted ? (
                  <div className="text-center py-12">
                    <div className="w-16 h-16 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-4">
                      <CheckCircle className="w-8 h-8 text-green-500" />
                    </div>
                    <h3 className="text-xl font-bold text-primary mb-2">Message Sent!</h3>
                    <p className="text-muted-foreground">Thank you for reaching out. We'll get back to you shortly.</p>
                    <Button
                      className="mt-6 rounded-full"
                      variant="outline"
                      onClick={() => { setSubmitted(false); setForm({ name: "", email: "", phone: "", service: "", message: "" }); }}
                    >
                      Send Another Message
                    </Button>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit} className="space-y-5">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                      <div>
                        <Label htmlFor="name" className="font-semibold text-sm mb-1.5 block">Full Name *</Label>
                        <Input
                          id="name"
                          placeholder="Your full name"
                          value={form.name}
                          onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                          className={`bg-white ${errors.name ? "border-destructive" : ""}`}
                        />
                        {errors.name && <p className="text-destructive text-xs mt-1">{errors.name}</p>}
                      </div>
                      <div>
                        <Label htmlFor="contact-phone" className="font-semibold text-sm mb-1.5 block">Phone (optional)</Label>
                        <Input
                          id="contact-phone"
                          placeholder="Your phone number"
                          value={form.phone}
                          onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))}
                          className="bg-white"
                        />
                      </div>
                    </div>
                    <div>
                      <Label htmlFor="contact-email" className="font-semibold text-sm mb-1.5 block">Email Address *</Label>
                      <Input
                        id="contact-email"
                        type="email"
                        placeholder="your@email.com"
                        value={form.email}
                        onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
                        className={`bg-white ${errors.email ? "border-destructive" : ""}`}
                      />
                      {errors.email && <p className="text-destructive text-xs mt-1">{errors.email}</p>}
                    </div>
                    <div>
                      <Label htmlFor="service" className="font-semibold text-sm mb-1.5 block">Service (optional)</Label>
                      <select
                        id="service"
                        value={form.service}
                        onChange={(e) => setForm((f) => ({ ...f, service: e.target.value }))}
                        className="w-full bg-white border border-input rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                      >
                        <option value="">Select a service...</option>
                        {serviceOptions.map((opt) => (
                          <option key={opt} value={opt}>{opt}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <Label htmlFor="message" className="font-semibold text-sm mb-1.5 block">Your Message *</Label>
                      <Textarea
                        id="message"
                        placeholder="Tell us how we can help you..."
                        value={form.message}
                        onChange={(e) => setForm((f) => ({ ...f, message: e.target.value }))}
                        rows={5}
                        className={`bg-white ${errors.message ? "border-destructive" : ""}`}
                      />
                      {errors.message && <p className="text-destructive text-xs mt-1">{errors.message}</p>}
                    </div>
                    <Button
                      type="submit"
                      size="lg"
                      className="w-full bg-primary text-white hover:bg-secondary rounded-full font-bold"
                      disabled={submitContact.isPending}
                    >
                      {submitContact.isPending ? (
                        <><Loader2 className="animate-spin mr-2 w-5 h-5" /> Sending...</>
                      ) : "Send Message"}
                    </Button>
                  </form>
                )}
              </div>
            </FadeIn>
          </div>
        </div>
      </section>
    </main>
  );
}
