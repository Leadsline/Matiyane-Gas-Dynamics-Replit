import { Router } from "express";
import { db, ordersTable, orderItemsTable } from "@workspace/db";
import { eq, count, sum, sql } from "drizzle-orm";
import { z } from "zod/v4";
import { CreateOrderBody, GetOrderParams, GetOrderPayfastDataParams } from "@workspace/api-zod";
import { PRODUCTS } from "./products";
import { sendOrderEmails } from "../lib/email";
import { logger } from "../lib/logger";

const router = Router();

function generateOrderRef(): string {
  const ts = Date.now().toString(36).toUpperCase();
  const rand = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `MGD-${ts}-${rand}`;
}

const FREE_DELIVERY_SUBURBS = ["kempton park", "glen marais", "glen place", "glen manor", "esther park", "birchleigh", "birchleigh north", "norkem park"];

function isKemptonPark(suburb: string): boolean {
  return FREE_DELIVERY_SUBURBS.some((s) => suburb.toLowerCase().includes(s));
}

router.get("/orders/summary", async (req, res) => {
  try {
    const [totalResult] = await db.select({ count: count() }).from(ordersTable);
    const [pendingResult] = await db.select({ count: count() }).from(ordersTable).where(eq(ordersTable.status, "pending"));
    const [completedResult] = await db.select({ count: count() }).from(ordersTable).where(eq(ordersTable.status, "completed"));
    const [revenueResult] = await db.select({ total: sum(ordersTable.totalAmount) }).from(ordersTable).where(eq(ordersTable.status, "completed"));

    res.json({
      totalOrders: totalResult.count,
      pendingOrders: pendingResult.count,
      completedOrders: completedResult.count,
      totalRevenue: parseFloat(revenueResult.total ?? "0"),
    });
  } catch (err) {
    req.log.error({ err }, "Failed to get order summary");
    res.status(500).json({ error: "Internal server error" });
  }
});

router.post("/orders", async (req, res) => {
  const parsed = CreateOrderBody.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: "Invalid request body" });
  }

  const { fullName, phone, email, deliveryAddress, suburb, specialInstructions, items } = parsed.data;

  if (!items || items.length === 0) {
    return res.status(400).json({ error: "At least one item is required" });
  }

  // Validate and calculate items
  const orderItems: { productId: number; productName: string; quantity: number; unitPrice: number; subtotal: number }[] = [];
  let productsTotal = 0;

  for (const item of items) {
    if (item.quantity <= 0) continue;
    const product = PRODUCTS.find((p) => p.id === item.productId);
    if (!product) {
      return res.status(400).json({ error: `Product ID ${item.productId} not found` });
    }
    const subtotal = product.price * item.quantity;
    productsTotal += subtotal;
    orderItems.push({
      productId: product.id,
      productName: product.name,
      quantity: item.quantity,
      unitPrice: product.price,
      subtotal,
    });
  }

  if (orderItems.length === 0) {
    return res.status(400).json({ error: "At least one item with quantity > 0 is required" });
  }

  const deliveryFee = isKemptonPark(suburb) ? 0 : 0; // 0 for now; admin confirms non-KP fee
  const totalAmount = productsTotal + deliveryFee;
  const orderRef = generateOrderRef();

  try {
    const [newOrder] = await db
      .insert(ordersTable)
      .values({
        orderRef,
        fullName,
        phone,
        email,
        deliveryAddress,
        suburb,
        specialInstructions: specialInstructions ?? null,
        status: "pending",
        totalAmount: totalAmount.toFixed(2),
        deliveryFee: deliveryFee.toFixed(2),
      })
      .returning();

    const insertedItems = await db
      .insert(orderItemsTable)
      .values(
        orderItems.map((item) => ({
          orderId: newOrder.id,
          productId: item.productId,
          productName: item.productName,
          quantity: item.quantity,
          unitPrice: item.unitPrice.toFixed(2),
          subtotal: item.subtotal.toFixed(2),
        }))
      )
      .returning();

    // Send emails (non-blocking)
    sendOrderEmails({
      orderRef,
      fullName,
      email,
      phone,
      deliveryAddress,
      suburb,
      specialInstructions,
      items: orderItems,
      totalAmount,
      deliveryFee,
    }).catch((err) => logger.error({ err }, "Email send failed"));

    res.status(201).json({
      id: newOrder.id,
      orderRef: newOrder.orderRef,
      fullName: newOrder.fullName,
      phone: newOrder.phone,
      email: newOrder.email,
      deliveryAddress: newOrder.deliveryAddress,
      suburb: newOrder.suburb,
      specialInstructions: newOrder.specialInstructions ?? null,
      status: newOrder.status,
      totalAmount: parseFloat(newOrder.totalAmount),
      deliveryFee: parseFloat(newOrder.deliveryFee),
      items: insertedItems.map((i) => ({
        productId: i.productId,
        productName: i.productName,
        quantity: i.quantity,
        unitPrice: parseFloat(i.unitPrice),
        subtotal: parseFloat(i.subtotal),
      })),
      createdAt: newOrder.createdAt.toISOString(),
    });
  } catch (err) {
    req.log.error({ err }, "Failed to create order");
    res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/orders/:id", async (req, res) => {
  const params = GetOrderParams.safeParse({ id: parseInt(req.params.id) });
  if (!params.success) {
    return res.status(400).json({ error: "Invalid order ID" });
  }

  try {
    const [order] = await db.select().from(ordersTable).where(eq(ordersTable.id, params.data.id));
    if (!order) {
      return res.status(404).json({ error: "Order not found" });
    }

    const items = await db.select().from(orderItemsTable).where(eq(orderItemsTable.orderId, order.id));

    res.json({
      id: order.id,
      orderRef: order.orderRef,
      fullName: order.fullName,
      phone: order.phone,
      email: order.email,
      deliveryAddress: order.deliveryAddress,
      suburb: order.suburb,
      specialInstructions: order.specialInstructions ?? null,
      status: order.status,
      totalAmount: parseFloat(order.totalAmount),
      deliveryFee: parseFloat(order.deliveryFee),
      items: items.map((i) => ({
        productId: i.productId,
        productName: i.productName,
        quantity: i.quantity,
        unitPrice: parseFloat(i.unitPrice),
        subtotal: parseFloat(i.subtotal),
      })),
      createdAt: order.createdAt.toISOString(),
    });
  } catch (err) {
    req.log.error({ err }, "Failed to get order");
    res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/orders/:id/payfast", async (req, res) => {
  const params = GetOrderPayfastDataParams.safeParse({ id: parseInt(req.params.id) });
  if (!params.success) {
    return res.status(400).json({ error: "Invalid order ID" });
  }

  try {
    const [order] = await db.select().from(ordersTable).where(eq(ordersTable.id, params.data.id));
    if (!order) {
      return res.status(404).json({ error: "Order not found" });
    }

    const isSandbox = process.env.PAYFAST_SANDBOX === "true" || process.env.NODE_ENV !== "production";
    const merchantId = process.env.PAYFAST_MERCHANT_ID || "10000100";
    const merchantKey = process.env.PAYFAST_MERCHANT_KEY || "46f0cd694581a";

    const domains = process.env.REPLIT_DOMAINS?.split(",")[0];
    const baseUrl = domains ? `https://${domains}` : "http://localhost:80";

    const payfastUrl = isSandbox
      ? "https://sandbox.payfast.co.za/eng/process"
      : "https://www.payfast.co.za/eng/process";

    const nameParts = order.fullName.trim().split(" ");
    const nameFirst = nameParts[0] || order.fullName;

    res.json({
      merchantId,
      merchantKey,
      returnUrl: `${baseUrl}/order-success?ref=${order.orderRef}`,
      cancelUrl: `${baseUrl}/order?cancelled=true`,
      notifyUrl: `${baseUrl}/api/payfast/notify`,
      nameFirst,
      emailAddress: order.email,
      mPaymentId: order.orderRef,
      amount: parseFloat(order.totalAmount).toFixed(2),
      itemName: `Matiyane Gas Order ${order.orderRef}`,
      payfastUrl,
    });
  } catch (err) {
    req.log.error({ err }, "Failed to get PayFast data");
    res.status(500).json({ error: "Internal server error" });
  }
});

// PayFast ITN (Instant Transfer Notification) handler
router.post("/payfast/notify", async (req, res) => {
  // Acknowledge receipt
  res.status(200).send("OK");

  const { m_payment_id, payment_status } = req.body as { m_payment_id: string; payment_status: string };

  if (payment_status === "COMPLETE" && m_payment_id) {
    try {
      await db
        .update(ordersTable)
        .set({ status: "paid", updatedAt: new Date() })
        .where(eq(ordersTable.orderRef, m_payment_id));
      logger.info({ orderRef: m_payment_id }, "Order marked as paid via PayFast ITN");
    } catch (err) {
      logger.error({ err, orderRef: m_payment_id }, "Failed to update order status via PayFast ITN");
    }
  }
});

export default router;
