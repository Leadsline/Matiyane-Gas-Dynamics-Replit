import { Link } from "wouter";
import { Flame, MapPin, Phone, Mail } from "lucide-react";

export function Footer() {
  return (
    <footer className="bg-primary text-white pt-16 pb-8">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
          <div className="col-span-1 md:col-span-1">
            <Link href="/" className="flex items-center gap-2 font-bold text-2xl tracking-tight mb-4">
              <Flame className="h-8 w-8 text-secondary" />
              <span>Matiyane Gas</span>
            </Link>
            <p className="text-gray-400 mb-6 max-w-xs">
              Safe, Reliable and Affordable Gas Distributors. Proudly serving Kempton Park and surrounding areas.
            </p>
          </div>
          
          <div>
            <h3 className="font-bold text-lg mb-4 text-white">Quick Links</h3>
            <ul className="space-y-2 text-gray-400">
              <li><Link href="/" className="hover:text-secondary transition-colors">Home</Link></li>
              <li><Link href="/about" className="hover:text-secondary transition-colors">About Us</Link></li>
              <li><Link href="/products" className="hover:text-secondary transition-colors">Products</Link></li>
              <li><Link href="/order" className="hover:text-secondary transition-colors">Order Gas</Link></li>
              <li><Link href="/contact" className="hover:text-secondary transition-colors">Contact</Link></li>
            </ul>
          </div>
          
          <div>
            <h3 className="font-bold text-lg mb-4 text-white">Products</h3>
            <ul className="space-y-2 text-gray-400">
              <li>5kg Gas Refill</li>
              <li>9kg Gas Refill</li>
              <li>14kg Gas Refill</li>
              <li>19kg Gas Refill</li>
              <li>48kg Gas Refill</li>
            </ul>
          </div>
          
          <div>
            <h3 className="font-bold text-lg mb-4 text-white">Contact Us</h3>
            <ul className="space-y-3 text-gray-400">
              <li className="flex items-start gap-3">
                <MapPin className="w-5 h-5 text-secondary shrink-0 mt-0.5" />
                <span>5 Kanonkop Place, Glen Marais, Kempton Park, 1619</span>
              </li>
              <li className="flex items-center gap-3">
                <Phone className="w-5 h-5 text-secondary shrink-0" />
                <span>076 748 8597 / 082 467 6584</span>
              </li>
              <li className="flex items-center gap-3">
                <Mail className="w-5 h-5 text-secondary shrink-0" />
                <span>info@matiyanegas.co.za</span>
              </li>
            </ul>
          </div>
        </div>
        
        <div className="border-t border-gray-800 pt-8 flex flex-col md:flex-row items-center justify-between text-sm text-gray-500">
          <p>&copy; {new Date().getFullYear()} Matiyane Gas Distributors. All rights reserved.</p>
          <div className="mt-4 md:mt-0 space-x-4">
            <Link href="/admin" className="hover:text-white transition-colors">Admin</Link>
            <span className="cursor-pointer hover:text-white">Privacy Policy</span>
            <span className="cursor-pointer hover:text-white">Terms of Service</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
