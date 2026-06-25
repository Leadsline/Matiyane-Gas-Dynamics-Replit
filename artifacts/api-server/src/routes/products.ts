import { Hono } from "hono";

const products = new Hono();

export const PRODUCTS = [
  { id: 1, name: "5kg Gas Refill", description: "Perfect for small households and camping. Safe, clean-burning LPG gas.", price: 150, unit: "5kg", inStock: true },
  { id: 2, name: "9kg Gas Refill", description: "Ideal for average households. Our most popular size for everyday cooking.", price: 250, unit: "9kg", inStock: true },
  { id: 3, name: "14kg Gas Refill", description: "Great for medium families and small businesses. Extended cooking time.", price: 490, unit: "14kg", inStock: true },
  { id: 4, name: "19kg Gas Refill", description: "Large families and restaurants. Extended cooking time with premium capacity.", price: 740, unit: "19kg", inStock: true },
  { id: 5, name: "48kg Gas Refill", description: "Industrial and commercial grade. Suitable for restaurants and large operations.", price: 1590, unit: "48kg", inStock: true },
  { id: 6, name: "Gas Level Detector", description: "Clip-on ultrasonic sensor that reads your cylinder level in seconds. Works on all standard LPG cylinders. No installation required.", price: 299, unit: "device", inStock: true },
  { id: 7, name: "Gas Stoves Installation", description: "Professional installation of gas stoves for safe and efficient cooking.", price: 0, unit: "service", inStock: true, onRequest: true },
  { id: 8, name: "Gas Fire Place Installation", description: "Expert installation of gas fireplaces to bring warmth, style and comfort to your space.", price: 0, unit: "service", inStock: true, onRequest: true },
  { id: 9, name: "Gas Stoves Distribution (Sales)", description: "Wide range of quality gas stoves available for purchase. Affordable. Reliable. Safe.", price: 0, unit: "service", inStock: true, onRequest: true },
  { id: 10, name: "Gas Heaters Distribution", description: "Stay warm all year round with our efficient and reliable gas heaters. Various sizes available.", price: 0, unit: "service", inStock: true, onRequest: true },
  { id: 11, name: "Gas Cylinders", description: "High quality gas cylinders in different sizes to meet your needs.", price: 0, unit: "service", inStock: true, onRequest: true },
  { id: 12, name: "Certificates of Compliance (COCs)", description: "We issue Certificates of Compliance (COCs) to ensure your gas energy systems meet safety standards and legal requirements.", price: 0, unit: "service", inStock: true, onRequest: true },
];

products.get("/products", (c) => {
  return c.json(PRODUCTS);
});

export default products;
