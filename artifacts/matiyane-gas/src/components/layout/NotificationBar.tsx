import { useState, useEffect } from "react";

const messages = [
  "Free delivery in Kempton Park!",
  "Call us today: 076 748 8597",
  "Safe, Reliable and Affordable Gas"
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
    <div className="bg-secondary text-white text-sm font-semibold h-10 flex items-center justify-center fixed top-0 left-0 right-0 z-50 px-4">
      <div className="relative w-full max-w-lg text-center overflow-hidden h-full flex items-center justify-center">
        {messages.map((message, index) => (
          <p
            key={index}
            className={`absolute w-full transition-all duration-500 ease-in-out ${
              index === currentMessageIndex
                ? "opacity-100 translate-y-0"
                : "opacity-0 translate-y-4"
            }`}
          >
            {message}
          </p>
        ))}
      </div>
    </div>
  );
}
