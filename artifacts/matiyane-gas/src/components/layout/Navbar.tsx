import { Link, useLocation } from "wouter";
import { cn } from "@/lib/utils";
import { useIsScrolled } from "@/hooks/use-scroll";
import { Menu, X, Flame } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";

export function Navbar() {
  const [location] = useLocation();
  const isScrolled = useIsScrolled(20);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const links = [
    { href: "/", label: "Home" },
    { href: "/about", label: "About Us" },
    { href: "/products", label: "Products" },
    { href: "/contact", label: "Contact" },
  ];

  return (
    <header
      className={cn(
        "fixed top-10 left-0 right-0 z-40 transition-all duration-300 border-b",
        isScrolled
          ? "bg-white text-primary border-gray-200 shadow-md py-2"
          : "bg-primary text-white border-transparent py-4"
      )}
    >
      <div className="container mx-auto px-4 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 font-bold text-xl tracking-tight">
          <Flame className={cn("h-6 w-6", isScrolled ? "text-secondary" : "text-secondary")} />
          <span>Matiyane Gas</span>
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center gap-8 font-medium">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                "transition-colors hover:text-secondary",
                location === link.href && "text-secondary font-bold"
              )}
            >
              {link.label}
            </Link>
          ))}
          <Link href="/order">
            <Button className={cn(
              "font-bold rounded-full px-6",
              isScrolled ? "bg-secondary text-white hover:bg-secondary/90" : "bg-white text-primary hover:bg-gray-100"
            )}>
              Order Now
            </Button>
          </Link>
        </nav>

        {/* Mobile Nav Toggle */}
        <button 
          className="md:hidden p-2"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          aria-label="Toggle menu"
        >
          {isMobileMenuOpen ? <X /> : <Menu />}
        </button>
      </div>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden absolute top-full left-0 right-0 bg-white border-b border-gray-200 shadow-lg flex flex-col py-4 px-4 text-primary">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setIsMobileMenuOpen(false)}
              className={cn(
                "py-3 border-b border-gray-100 font-medium",
                location === link.href && "text-secondary font-bold"
              )}
            >
              {link.label}
            </Link>
          ))}
          <div className="pt-4">
            <Link href="/order" onClick={() => setIsMobileMenuOpen(false)}>
              <Button className="w-full bg-secondary text-white hover:bg-secondary/90 font-bold rounded-full">
                Order Now
              </Button>
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
