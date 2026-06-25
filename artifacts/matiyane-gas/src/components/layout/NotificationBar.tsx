import { useEffect, useState } from "react";
import { Truck, Phone, Shield, Award, Clock, Wrench } from "lucide-react";

const messages = [
  { text: "Free delivery in Kempton Park!", icon: Truck },
  { text: "Call us today: 076 748 8597", icon: Phone },
  { text: "Safe, Reliable and Affordable Gas", icon: Shield },
  { text: "Competitive Prices, No Compromise", icon: Award },
  { text: "Available 7 Days a Week", icon: Clock },
  { text: "Expert Installations Available", icon: Wrench },
];

export function NotificationBar() {
  const [currentMessageIndex, setCurrentMessageIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentMessageIndex((prev) => (prev + 1) % messages.length);
    }, 4000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="bg-secondary text-white text-sm font-semibold h-10 flex items-center justify-center fixed top-0 left-0 right-0 z-50 px-4 overflow-hidden">
      <div className="relative w-full max-w-lg text-center overflow-hidden h-full flex items-center justify-center">
        {messages.map((msg, index) => {
          const Icon = msg.icon;
          return (
            <p
              key={index}
              className={`absolute w-full transition-all duration-500 ease-in-out flex items-center justify-center gap-2 ${
                index === currentMessageIndex
                  ? "opacity-100 translate-y-0"
                  : "opacity-0 translate-y-4"
              }`}
            >
              <Icon size={14} className="shrink-0" />
              {msg.text}
            </p>
          );
        })}
      </div>
    </div>
  );
}
