import { useState, useEffect, useRef } from "react";
import { FadeIn } from "@/components/ui/fade-in";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useCreateOrder, useListProducts, useGetOrderPayfastData, useGetOrderPaystackData } from "@workspace/api-client-react";
import { ShoppingCart, Plus, Minus, Truck, CheckCircle, AlertCircle, Loader2, CreditCard } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { UsageEstimatorCompact } from "@/components/ui/usage-estimator-compact";
import { GasLevelDetector } from "@/components/ui/gas-level-detector";

interface OrderItem {
  productId: number;
  productName: string;
  quantity: number;
  unitPrice: number;
  subtotal: number;
}

interface PlacedOrder {
  id: number;
  orderRef: string;
  totalAmount: number;
  items: OrderItem[];
}

const KEMPTON_PARK_KEYWORDS = ["kempton", "glen marais", "glen place", "birchleigh", "norkem", "esther"];

function isKemptonPark(suburb: string) {
  return KEMPTON_PARK_KEYWORDS.some((k) => suburb.toLowerCase().includes(k));
}

function PayFastRedirectForm({ orderId }: { orderId: number }) {
  const { data: payfastData, isLoading, error } = useGetOrderPayfastData(orderId, {
    query: { enabled: !!orderId, queryKey: [`payfast-${orderId}`] as unknown as readonly unknown[] },
  });
  const formRef = useRef<HTMLFormElement>(null);
  const [autoSubmitting, setAutoSubmitting] = useState(false);

  const handleRedirect = () => {
    if (formRef.current && payfastData) {
      setAutoSubmitting(true);
      formRef.current.submit();
    }
  };

  if (isLoading) return (
    <div className="flex items-center justify-center gap-3 py-4 text-muted-foreground">
      <Loader2 className="animate-spin w-5 h-5" /><span>Preparing payment...</span>
    </div>
  );

  if (error || !payfastData) return (
    <p className="text-sm text-muted-foreground text-center py-2">Payment gateway unavailable. Please call us.</p>
  );

  return (
    <div>
      <form ref={formRef} action={payfastData.payfastUrl} method="POST" className="hidden">
        <input type="hidden" name="merchant_id" value={payfastData.merchantId} />
        <input type="hidden" name="merchant_key" value={payfastData.merchantKey} />
        <input type="hidden" name="return_url" value={payfastData.returnUrl} />
        <input type="hidden" name="cancel_url" value={payfastData.cancelUrl} />
        <input type="hidden" name="notify_url" value={payfastData.notifyUrl} />
        <input type="hidden" name="name_first" value={payfastData.nameFirst} />
        <input type="hidden" name="email_address" value={payfastData.emailAddress} />
        <input type="hidden" name="m_payment_id" value={payfastData.mPaymentId} />
        <input type="hidden" name="amount" value={payfastData.amount} />
        <input type="hidden" name="item_name" value={payfastData.itemName} />
      </form>
      <Button size="lg" className="w-full bg-[#00539b] hover:bg-[#003f75] text-white font-bold rounded-full py-4 text-base" onClick={handleRedirect} disabled={autoSubmitting}>
        {autoSubmitting ? <><Loader2 className="animate-spin mr-2 w-5 h-5" />Redirecting...</> : <><CreditCard className="mr-2 w-5 h-5" />Pay with PayFast — R{payfastData.amount}</>}
      </Button>
    </div>
  );
}

function PaystackButton({ orderId, totalAmount }: { orderId: number; totalAmount: number }) {
  const { data: psData, isLoading, error } = useGetOrderPaystackData(orderId, {
    query: { enabled: !!orderId, queryKey: [`paystack-${orderId}`] as unknown as readonly unknown[] },
  });
  const [loading, setLoading] = useState(false);

  const handlePaystack = () => {
    if (!psData) return;
    setLoading(true);

    const script = document.createElement("script");
    script.src = "https://js.paystack.co/v1/inline.js";
    script.onload = () => {
      const PaystackPop = (window as unknown as Record<string, unknown>)["PaystackPop"] as {
        setup: (config: Record<string, unknown>) => { openIframe: () => void };
      };
      const handler = PaystackPop.setup({
        key: psData.publicKey,
        email: psData.email,
        amount: psData.amountKobo,
        currency: psData.currency,
        ref: psData.reference,
        callback: () => {
          window.location.href = psData.callbackUrl;
        },
        onClose: () => { setLoading(false); },
      });
      handler.openIframe();
      setLoading(false);
    };
    script.onerror = () => setLoading(false);
    document.head.appendChild(script);
  };

  if (isLoading) return (
    <div className="flex items-center gap-2 justify-center py-3 text-muted-foreground text-sm">
      <Loader2 className="animate-spin w-4 h-4" /> Loading Paystack...
    </div>
  );

  if (error || !psData) return null;

  return (
    <Button size="lg" variant="outline" className="w-full border-primary text-primary hover:bg-primary hover:text-white font-bold rounded-full py-4 text-base" onClick={handlePaystack} disabled={loading}>
      {loading ? <><Loader2 className="animate-spin mr-2 w-5 h-5" />Connecting...</> : <><CreditCard className="mr-2 w-5 h-5" />Pay with Paystack — R{totalAmount.toFixed(2)}</>}
    </Button>
  );
}

function PaymentSection({ order, totalAmount }: { order: PlacedOrder; totalAmount: number }) {
  const [gateway, setGateway] = useState<"payfast" | "paystack">("payfast");

  return (
    <div className="mb-6">
      <div className="flex gap-2 mb-4">
        <button onClick={() => setGateway("payfast")} className={`flex-1 py-2.5 rounded-xl border text-sm font-semibold transition-all ${gateway === "payfast" ? "border-[#00539b] bg-[#00539b]/5 text-[#00539b]" : "border-border text-muted-foreground hover:border-primary"}`}>
          PayFast
        </button>
        <button onClick={() => setGateway("paystack")} className={`flex-1 py-2.5 rounded-xl border text-sm font-semibold transition-all ${gateway === "paystack" ? "border-primary bg-primary/5 text-primary" : "border-border text-muted-foreground hover:border-primary"}`}>
          Paystack
        </button>
      </div>
      {gateway === "payfast" ? (
        <PayFastRedirectForm orderId={order.id} />
      ) : (
        <PaystackButton orderId={order.id} totalAmount={totalAmount} />
      )}
      <p className="text-xs text-center text-muted-foreground mt-3">Secured payment. You'll be redirected to complete payment.</p>
    </div>
  );
}

export default function OrderPage() {
  const { toast } = useToast();
  const { data: products } = useListProducts();
  const createOrder = useCreateOrder();

  const displayProducts = products || [
    { id: 1, name: "5kg Gas Refill",     price: 150,  unit: "5kg"    },
    { id: 2, name: "9kg Gas Refill",     price: 250,  unit: "9kg"    },
    { id: 3, name: "14kg Gas Refill",    price: 490,  unit: "14kg"   },
    { id: 4, name: "19kg Gas Refill",    price: 740,  unit: "19kg"   },
    { id: 5, name: "48kg Gas Refill",    price: 1590, unit: "48kg"   },
    { id: 6, name: "Gas Level Detector", price: 299,  unit: "device" },
  ];

  const GAS_CYLINDER_KG: Record<number, number> = { 1: 5, 2: 9, 3: 14, 4: 19, 5: 48 };

  const [quantities, setQuantities] = useState<Record<number, number>>({ 1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0 });
  const [form, setForm] = useState({ fullName: "", phone: "", email: "", deliveryAddress: "", suburb: "", specialInstructions: "" });
  const [placedOrder, setPlacedOrder] = useState<PlacedOrder | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const productId = parseInt(params.get("product") || "0");
    if (productId >= 1 && productId <= 6) {
      setQuantities((prev) => ({ ...prev, [productId]: 1 }));
    }
  }, []);

  const updateQuantity = (productId: number, delta: number) => {
    setQuantities((prev) => ({ ...prev, [productId]: Math.max(0, (prev[productId] || 0) + delta) }));
  };

  const orderItems: OrderItem[] = displayProducts
    .filter((p) => quantities[p.id] > 0)
    .map((p) => ({ productId: p.id, productName: p.name, quantity: quantities[p.id], unitPrice: p.price, subtotal: p.price * quantities[p.id] }));

  const productsTotal = orderItems.reduce((sum, i) => sum + i.subtotal, 0);
  const freeDelivery = form.suburb ? isKemptonPark(form.suburb) : null;
  const totalAmount = productsTotal;

  const validate = () => {
    const errs: Record<string, string> = {};
    if (!form.fullName.trim()) errs.fullName = "Full name is required";
    if (!form.phone.trim()) errs.phone = "Phone number is required";
    if (!/^[0-9+\s\-()]{7,}$/.test(form.phone.trim())) errs.phone = "Enter a valid phone number";
    if (!form.email.trim()) errs.email = "Email address is required";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) errs.email = "Enter a valid email address";
    if (!form.deliveryAddress.trim()) errs.deliveryAddress = "Delivery address is required";
    if (!form.suburb.trim()) errs.suburb = "Suburb is required";
    if (orderItems.length === 0) errs.items = "Please add at least one product";
    setErrors(errs);
    return errs;
  };

  const scrollToFirstError = (errs: Record<string, string>) => {
    const fieldOrder = ["items", "fullName", "phone", "email", "deliveryAddress", "suburb"];
    const firstErrorKey = fieldOrder.find((k) => errs[k]);
    if (!firstErrorKey) return;
    const el = document.getElementById(firstErrorKey === "items" ? "products-section" : firstErrorKey);
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "center" });
      el.focus();
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length > 0) {
      scrollToFirstError(errs);
      return;
    }
    try {
      const order = await createOrder.mutateAsync({
        data: {
          fullName: form.fullName, phone: form.phone, email: form.email,
          deliveryAddress: form.deliveryAddress, suburb: form.suburb,
          specialInstructions: form.specialInstructions || null,
          items: orderItems.map((i) => ({ productId: i.productId, quantity: i.quantity })),
        },
      });
      setPlacedOrder(order as unknown as PlacedOrder);
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (err: any) {
      const msg = err?.message || err?.error || "Something went wrong. Please try again or call us directly.";
      console.error("Order error:", err);
      toast({ title: "Order failed", description: msg, variant: "destructive" });
    }
  };

  if (placedOrder) {
    return (
      <main className="pt-20 min-h-screen bg-gray-50">
        <div className="container mx-auto px-4 py-16 max-w-2xl">
          <div className="bg-white rounded-3xl p-10 border border-border shadow-lg text-center">
            <div className="w-20 h-20 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle className="w-10 h-10 text-green-500" />
            </div>
            <h1 className="text-3xl font-extrabold text-primary mb-2">Order Placed!</h1>
            <p className="text-muted-foreground mb-6">A confirmation has been sent to {form.email}</p>
            <div className="bg-gray-50 rounded-2xl p-6 mb-8 text-left">
              <p className="text-sm text-muted-foreground mb-1">Your Order Reference</p>
              <p className="text-2xl font-extrabold text-secondary">{placedOrder.orderRef}</p>
            </div>
            <div className="text-left mb-8">
              <h3 className="font-bold text-primary mb-3">Order Summary</h3>
              {orderItems.map((item) => (
                <div key={item.productId} className="flex justify-between py-2 border-b border-border text-sm">
                  <span>{item.productName} ×{item.quantity}</span>
                  <span className="font-semibold">R{item.subtotal.toFixed(2)}</span>
                </div>
              ))}
              <div className="flex justify-between pt-3 font-bold text-primary text-lg">
                <span>Total</span>
                <span>R{totalAmount.toFixed(2)}</span>
              </div>
            </div>
            <PaymentSection order={placedOrder} totalAmount={placedOrder.totalAmount || totalAmount} />
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mt-4 text-sm text-amber-800">
              <p className="font-semibold mb-1">What happens next?</p>
              <p>Complete payment above, or our team will contact you at {form.phone} to arrange delivery.</p>
            </div>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="pt-20 min-h-screen bg-gray-50">
      <section className="bg-primary text-white py-16">
        <div className="container mx-auto px-4">
          <FadeIn direction="up">
            <span className="text-secondary font-semibold uppercase tracking-widest text-sm">Order Gas</span>
            <h1 className="text-5xl font-extrabold mt-2 mb-3">Place Your Order</h1>
            <p className="text-white/70 text-lg">Select your products and fill in your details. We'll deliver to your door.</p>
          </FadeIn>
        </div>
      </section>

      <form onSubmit={handleSubmit}>
        <div className="container mx-auto px-4 py-12 max-w-6xl">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-8">
              <FadeIn direction="up">
                {/* Usage Estimator — compact accordion */}
                <UsageEstimatorCompact
                  onSetQty={(id, qty) => setQuantities((prev) => ({ ...prev, [id]: Math.max(prev[id] || 0, qty) }))}
                />
              </FadeIn>

              <FadeIn direction="up">
                <div id="products-section" className="bg-white rounded-2xl p-8 border border-border shadow-sm">
                  <h2 className="text-2xl font-extrabold text-primary mb-2 flex items-center gap-3">
                    <ShoppingCart className="w-6 h-6 text-secondary" /> Select Products
                  </h2>
                  <p className="text-muted-foreground text-sm mb-6">Choose sizes and quantities. Add a Gas Level Detector to always know when to reorder.</p>
                  {errors.items && (
                    <div className="flex items-center gap-2 text-destructive text-sm mb-4 bg-destructive/10 rounded-lg p-3">
                      <AlertCircle size={16} />{errors.items}
                    </div>
                  )}
                  <div className="space-y-4">
                    {displayProducts.map((product) => {
                      const isDetector = product.id === 6;
                      const cylinderKg = GAS_CYLINDER_KG[product.id];
                      return (
                        <div key={product.id}>
                          <div className={`flex items-center justify-between p-5 rounded-xl border transition-all hover:shadow-sm ${quantities[product.id] > 0 ? "border-secondary bg-secondary/5" : "border-border hover:border-primary/30"} ${isDetector ? "bg-gradient-to-r from-gray-950/5 to-gray-900/5 border-dashed" : ""}`}>
                            <div className="flex-1">
                              <div className="flex items-center gap-2">
                                {isDetector && <span className="text-lg">📡</span>}
                                <p className="font-bold text-primary">{product.name}</p>
                                {isDetector && <span className="text-[10px] font-bold bg-secondary/10 text-secondary px-2 py-0.5 rounded-full uppercase">New</span>}
                              </div>
                              <p className="text-secondary font-semibold text-sm">R{product.price} {isDetector ? "per device" : "each"}</p>
                            </div>
                            <div className="flex items-center gap-3">
                              <button type="button" onClick={() => updateQuantity(product.id, -1)} className="w-9 h-9 rounded-full border-2 border-border hover:border-primary flex items-center justify-center transition-colors disabled:opacity-30 hover:scale-110 active:scale-95" disabled={quantities[product.id] === 0}>
                                <Minus size={14} />
                              </button>
                              <span className="w-8 text-center font-bold text-lg text-primary">{quantities[product.id] || 0}</span>
                              <button type="button" onClick={() => updateQuantity(product.id, 1)} className="w-9 h-9 rounded-full bg-primary text-white hover:bg-secondary flex items-center justify-center transition-colors hover:scale-110 active:scale-95">
                                <Plus size={14} />
                              </button>
                            </div>
                            {quantities[product.id] > 0 && (
                              <div className="ml-4 text-right min-w-[70px]">
                                <p className="font-bold text-primary">R{(product.price * quantities[product.id]).toFixed(0)}</p>
                              </div>
                            )}
                          </div>
                          {/* Inline detector simulator when added */}
                          {isDetector && quantities[product.id] > 0 && (
                            <div className="mt-2 px-2">
                              <p className="text-xs font-semibold text-muted-foreground mb-2 flex items-center gap-1.5">
                                <span className="w-1.5 h-1.5 bg-green-400 rounded-full inline-block" style={{ boxShadow: "0 0 5px #4ade80" }} />
                                Live Demo — this is how your detector will look:
                              </p>
                              <GasLevelDetector cylinderKg={9} />
                            </div>
                          )}
                          {/* Usage hint per cylinder */}
                          {!isDetector && quantities[product.id] > 0 && cylinderKg && (
                            <div className="mt-1.5 ml-5 text-xs text-muted-foreground">
                              💡 {quantities[product.id]}× {product.unit} = {quantities[product.id]} cylinder{quantities[product.id] > 1 ? "s" : ""}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              </FadeIn>

              <FadeIn direction="up" delay={100}>
                <div className="bg-white rounded-2xl p-8 border border-border shadow-sm">
                  <h2 className="text-2xl font-extrabold text-primary mb-6">Your Details</h2>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    <div>
                      <Label htmlFor="fullName" className="font-semibold text-sm mb-1.5 block">Full Name *</Label>
                      <Input id="fullName" placeholder="e.g. John Dlamini" value={form.fullName} onChange={(e) => setForm((f) => ({ ...f, fullName: e.target.value }))} className={errors.fullName ? "border-destructive" : ""} />
                      {errors.fullName && <p className="text-destructive text-xs mt-1">{errors.fullName}</p>}
                    </div>
                    <div>
                      <Label htmlFor="phone" className="font-semibold text-sm mb-1.5 block">Phone Number *</Label>
                      <Input id="phone" placeholder="e.g. 076 748 8597" value={form.phone} onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))} className={errors.phone ? "border-destructive" : ""} />
                      {errors.phone && <p className="text-destructive text-xs mt-1">{errors.phone}</p>}
                    </div>
                    <div className="sm:col-span-2">
                      <Label htmlFor="email" className="font-semibold text-sm mb-1.5 block">Email Address *</Label>
                      <Input id="email" type="email" placeholder="e.g. john@example.com" value={form.email} onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))} className={errors.email ? "border-destructive" : ""} />
                      {errors.email && <p className="text-destructive text-xs mt-1">{errors.email}</p>}
                    </div>
                    <div className="sm:col-span-2">
                      <Label htmlFor="deliveryAddress" className="font-semibold text-sm mb-1.5 block">Delivery Address *</Label>
                      <Input id="deliveryAddress" placeholder="e.g. 12 Main Street" value={form.deliveryAddress} onChange={(e) => setForm((f) => ({ ...f, deliveryAddress: e.target.value }))} className={errors.deliveryAddress ? "border-destructive" : ""} />
                      {errors.deliveryAddress && <p className="text-destructive text-xs mt-1">{errors.deliveryAddress}</p>}
                    </div>
                    <div>
                      <Label htmlFor="suburb" className="font-semibold text-sm mb-1.5 block">Suburb *</Label>
                      <Input id="suburb" placeholder="e.g. Kempton Park" value={form.suburb} onChange={(e) => setForm((f) => ({ ...f, suburb: e.target.value }))} className={errors.suburb ? "border-destructive" : ""} />
                      {errors.suburb && <p className="text-destructive text-xs mt-1">{errors.suburb}</p>}
                      {form.suburb && (
                        <p className={`text-xs mt-1.5 font-medium ${isKemptonPark(form.suburb) ? "text-green-600" : "text-amber-600"}`}>
                          {isKemptonPark(form.suburb) ? "Free delivery applies!" : "Delivery fee will be confirmed for your area."}
                        </p>
                      )}
                    </div>
                    <div className="sm:col-span-2">
                      <Label htmlFor="instructions" className="font-semibold text-sm mb-1.5 block">Special Instructions (optional)</Label>
                      <Textarea id="instructions" placeholder="e.g. Ring doorbell, specific time preference..." value={form.specialInstructions} onChange={(e) => setForm((f) => ({ ...f, specialInstructions: e.target.value }))} rows={3} />
                    </div>
                  </div>
                </div>
              </FadeIn>

              {/* Mobile bottom Place Order button */}
              <FadeIn direction="up" delay={100}>
                <div className="lg:hidden mt-6 bg-white rounded-2xl p-6 border border-border shadow-sm">
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-sm text-muted-foreground">Total</span>
                    <span className="text-xl font-extrabold text-primary">R{totalAmount.toFixed(0)}</span>
                  </div>
                  <Button type="submit" size="lg" className="w-full bg-secondary text-white hover:bg-secondary/90 font-bold rounded-full py-4 text-base" disabled={createOrder.isPending || orderItems.length === 0}>
                    {createOrder.isPending ? <><Loader2 className="animate-spin mr-2 w-5 h-5" />Placing Order...</> : <>Place Order — R{totalAmount.toFixed(0)}</>}
                  </Button>
                  <div className="mt-4 flex items-start gap-2 text-xs text-muted-foreground bg-gray-50 rounded-xl p-3">
                    <CheckCircle size={13} className="text-green-500 mt-0.5 shrink-0" />
                    <span>After placing, choose PayFast or Paystack to pay securely.</span>
                  </div>
                </div>
              </FadeIn>
            </div>

            <div className="lg:col-span-1">
              <FadeIn direction="left" delay={200}>
                <div className="bg-white rounded-2xl p-8 border border-border shadow-sm sticky top-24 hidden lg:block">
                  <h2 className="text-xl font-extrabold text-primary mb-6">Order Summary</h2>
                  {orderItems.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                      <ShoppingCart className="w-10 h-10 mx-auto mb-3 opacity-30" />
                      <p className="text-sm">No items selected yet</p>
                    </div>
                  ) : (
                    <div className="space-y-3 mb-6">
                      {orderItems.map((item) => (
                        <div key={item.productId} className="flex justify-between text-sm">
                          <div>
                            <p className="font-medium">{item.productName}</p>
                            <p className="text-muted-foreground">×{item.quantity} @ R{item.unitPrice}</p>
                          </div>
                          <span className="font-semibold text-primary">R{item.subtotal.toFixed(0)}</span>
                        </div>
                      ))}
                    </div>
                  )}
                  <div className="border-t border-border pt-4 space-y-2">
                    <div className="flex justify-between text-sm text-muted-foreground">
                      <span>Products</span><span>R{productsTotal.toFixed(0)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="flex items-center gap-1.5 text-muted-foreground"><Truck size={14} /> Delivery</span>
                      <span className={freeDelivery === false ? "text-amber-600 font-medium" : "text-green-600 font-medium"}>
                        {freeDelivery === null ? "TBC" : freeDelivery ? "FREE" : "TBC"}
                      </span>
                    </div>
                    <div className="flex justify-between font-extrabold text-lg text-primary pt-2 border-t border-border">
                      <span>Total</span><span>R{totalAmount.toFixed(0)}</span>
                    </div>
                  </div>
                  <Button type="submit" size="lg" className="w-full mt-6 bg-secondary text-white hover:bg-secondary/90 font-bold rounded-full py-4 text-base" disabled={createOrder.isPending || orderItems.length === 0}>
                    {createOrder.isPending ? <><Loader2 className="animate-spin mr-2 w-5 h-5" />Placing Order...</> : <>Place Order — R{totalAmount.toFixed(0)}</>}
                  </Button>
                  <div className="mt-5 flex items-start gap-2 text-xs text-muted-foreground bg-gray-50 rounded-xl p-4">
                    <CheckCircle size={13} className="text-green-500 mt-0.5 shrink-0" />
                    <span>After placing, choose PayFast or Paystack to pay securely.</span>
                  </div>
                </div>
              </FadeIn>
            </div>
          </div>
        </div>
      </form>
    </main>
  );
}
