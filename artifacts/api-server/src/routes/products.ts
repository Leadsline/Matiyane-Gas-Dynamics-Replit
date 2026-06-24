import { Hono } from "hono";

const products = new Hono();

export const PRODUCTS = [
  { id: 1, name: "5kg Gas Refill", description: "Perfect for small households and camping. Safe, clean-burning LPG gas.", price: 150, unit: "5kg", inStock: true },
  { id: 2, name: "9kg Gas Refill", description: "Ideal for average households. Our most popular size for everyday cooking.", price: 250, unit: "9kg", inStock: true },
  { id: 3, name: "19kg Gas Refill", description: "Great for large families and small businesses. Extended cooking time.", price: 490, unit: "19kg", inStock: true },
  { id: 4, name: "48kg Gas Refill", description: "Industrial and commercial grade. Suitable for restaurants and large operations.", price: 1250, unit: "48kg", inStock: true },
  { id: 5, name: "Gas Level Detector", description: "Clip-on ultrasonic sensor that reads your cylinder level in seconds. Works on all standard LPG cylinders. No installation required.", price: 299, unit: "device", inStock: true },
];

products.get("/products", (c) => {
  return c.json(PRODUCTS);
});

export default products;
