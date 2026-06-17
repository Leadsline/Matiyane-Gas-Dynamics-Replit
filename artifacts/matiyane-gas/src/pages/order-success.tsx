import { Link, useLocation } from "wouter";
import { CheckCircle, Home, ShoppingCart } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function OrderSuccessPage() {
  const [location] = useLocation();
  const params = new URLSearchParams(window.location.search);
  const ref = params.get("ref") || "";

  return (
    <main className="pt-20 min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="container mx-auto px-4 max-w-lg text-center py-16">
        <div className="bg-white rounded-3xl p-12 border border-border shadow-lg">
          <div className="w-20 h-20 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="w-10 h-10 text-green-500" />
          </div>
          <h1 className="text-3xl font-extrabold text-primary mb-3">Payment Successful!</h1>
          <p className="text-muted-foreground mb-6">
            Thank you for your payment. Your order has been confirmed and our team will be in touch to arrange delivery.
          </p>
          {ref && (
            <div className="bg-gray-50 rounded-2xl p-5 mb-8">
              <p className="text-sm text-muted-foreground mb-1">Order Reference</p>
              <p className="text-2xl font-extrabold text-secondary">{ref}</p>
            </div>
          )}
          <p className="text-sm text-muted-foreground mb-8">
            If you have any questions, call us at <a href="tel:0767488597" className="text-primary font-semibold">076 748 8597</a>.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link href="/">
              <Button className="rounded-full bg-primary text-white hover:bg-secondary font-semibold">
                <Home size={16} className="mr-2" />
                Back to Home
              </Button>
            </Link>
            <Link href="/order">
              <Button variant="outline" className="rounded-full border-primary text-primary hover:bg-primary hover:text-white font-semibold">
                <ShoppingCart size={16} className="mr-2" />
                Place Another Order
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}
