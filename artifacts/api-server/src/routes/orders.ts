import { Hono } from "hono";
import { ordersTable, orderItemsTable } from "@workspace/db/schema";
import { eq, count, sum } from "drizzle-orm";
import { CreateOrderBody, GetOrderParams, GetOrderPayfastDataParams } from "@workspace/api-zod";
import { PRODUCTS } from "./products";
import { sendOrderEmails } from "../lib/email";
import { syncOrderToHubspot } from "../lib/hubspot";
import { logger } from "../lib/logger";
import type { AnyDb } from "../app";

function generateOrderRef(): string {
  const ts = Date.now().toString(36).toUpperCase();
  const rand = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `MGD-${ts}-${rand}`;
}

const FREE_DELIVERY_SUBURBS = [
  "kempton park", "glen marais", "glen place", "glen manor", "esther park",
  "birchleigh", "birchleigh north", "norkem park",
];

function isKemptonPark(suburb: string): boolean {
  return FREE_DELIVERY_SUBURBS.some((s) => suburb.toLowerCase().includes(s));
}

export function createOrdersRouter(db: AnyDb) {
  const router = new Hono();

  router.get("/orders/summary", async (c) => {
    try {
      const [totalResult] = await db.select({ count: count() }).from(ordersTable);
      const [pendingResult] = await db.select({ count: count() }).from(ordersTable).where(eq(ordersTable.status, "pending"));
      const [completedResult] = await db.select({ count: count() }).from(ordersTable).where(eq(ordersTable.status, "completed"));
      const [revenueResult] = await db.select({ total: sum(ordersTable.totalAmount) }).from(ordersTable).where(eq(ordersTable.status, "paid"));

      return c.json({
        totalOrders: totalResult.count,
        pendingOrders: pendingResult.count,
        completedOrders: completedResult.count,
        totalRevenue: parseFloat(revenueResult.total ?? "0"),
      });
    } catch (err) {
      logger.error({ err }, "Failed to get order summary");
      return c.json({ error: "Internal server error" }, 500);
    }
  });

  router.post("/orders", async (c) => {
    let body: unknown;
    try {
      body = await c.req.json();
    } catch {
      return c.json({ error: "Invalid JSON body" }, 400);
    }

    const parsed = CreateOrderBody.safeParse(body);
    if (!parsed.success) {
      return c.json({ error: "Invalid request body" }, 400);
    }

    const { fullName, phone, email, deliveryAddress, suburb, specialInstructions, items } = parsed.data;

    if (!items || items.length === 0) {
      return c.json({ error: "At least one item is required" }, 400);
    }

    const orderItems: { productId: number; productName: string; quantity: number; unitPrice: number; subtotal: number }[] = [];
    let productsTotal = 0;

    for (const item of items) {
      if (item.quantity <= 0) continue;
      const product = PRODUCTS.find((p) => p.id === item.productId);
      if (!product) {
        return c.json({ error: `Product ID ${item.productId} not found` }, 400);
      }
      const subtotal = product.price * item.quantity;
      productsTotal += subtotal;
      orderItems.push({ productId: product.id, productName: product.name, quantity: item.quantity, unitPrice: product.price, subtotal });
    }

    if (orderItems.length === 0) {
      return c.json({ error: "At least one item with quantity > 0 is required" }, 400);
    }

    const deliveryFee = isKemptonPark(suburb) ? 0 : 0;
    const totalAmount = productsTotal + deliveryFee;
    const orderRef = generateOrderRef();

    try {
      const [newOrder] = await db
        .insert(ordersTable)
        .values({ orderRef, fullName, phone, email, deliveryAddress, suburb, specialInstructions: specialInstructions ?? null, status: "pending", totalAmount: totalAmount.toFixed(2), deliveryFee: deliveryFee.toFixed(2) })
        .returning();

      const insertedItems = await db
        .insert(orderItemsTable)
        .values(orderItems.map((item) => ({ orderId: newOrder.id, productId: item.productId, productName: item.productName, quantity: item.quantity, unitPrice: item.unitPrice.toFixed(2), subtotal: item.subtotal.toFixed(2) })))
        .returning();

      sendOrderEmails({ orderRef, fullName, email, phone, deliveryAddress, suburb, specialInstructions, items: orderItems, totalAmount, deliveryFee }).catch((err) =>
        logger.error({ err }, "Email send failed"),
      );

      syncOrderToHubspot({ fullName, email, phone, orderRef, totalAmount }).catch((err) =>
        logger.error({ err }, "HubSpot sync failed"),
      );

      return c.json(
        {
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
          items: insertedItems.map((i) => ({ productId: i.productId, productName: i.productName, quantity: i.quantity, unitPrice: parseFloat(i.unitPrice), subtotal: parseFloat(i.subtotal) })),
          createdAt: newOrder.createdAt.toISOString(),
        },
        201,
      );
    } catch (err) {
      logger.error({ err }, "Failed to create order");
      return c.json({ error: "Internal server error" }, 500);
    }
  });

  router.get("/orders/track", async (c) => {
    const ref = c.req.query("ref")?.trim().toUpperCase();
    if (!ref) return c.json({ error: "ref query parameter is required" }, 400);

    try {
      const [order] = await db.select().from(ordersTable).where(eq(ordersTable.orderRef, ref));
      if (!order) return c.json({ error: "Order not found" }, 404);

      const items = await db.select().from(orderItemsTable).where(eq(orderItemsTable.orderId, order.id));

      return c.json({
        orderRef: order.orderRef,
        status: order.status,
        totalAmount: parseFloat(order.totalAmount),
        createdAt: order.createdAt.toISOString(),
        items: items.map((i) => ({
          productId: i.productId,
          productName: i.productName,
          quantity: i.quantity,
          unitPrice: parseFloat(i.unitPrice),
          subtotal: parseFloat(i.subtotal),
        })),
      });
    } catch (err) {
      logger.error({ err }, "Failed to track order");
      return c.json({ error: "Internal server error" }, 500);
    }
  });

  router.get("/orders/:id", async (c) => {
    const params = GetOrderParams.safeParse({ id: parseInt(c.req.param("id")) });
    if (!params.success) return c.json({ error: "Invalid order ID" }, 400);

    try {
      const [order] = await db.select().from(ordersTable).where(eq(ordersTable.id, params.data.id));
      if (!order) return c.json({ error: "Order not found" }, 404);

      const items = await db.select().from(orderItemsTable).where(eq(orderItemsTable.orderId, order.id));

      return c.json({
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
        items: items.map((i) => ({ productId: i.productId, productName: i.productName, quantity: i.quantity, unitPrice: parseFloat(i.unitPrice), subtotal: parseFloat(i.subtotal) })),
        createdAt: order.createdAt.toISOString(),
      });
    } catch (err) {
      logger.error({ err }, "Failed to get order");
      return c.json({ error: "Internal server error" }, 500);
    }
  });

  router.get("/orders/:id/payfast", async (c) => {
    const params = GetOrderPayfastDataParams.safeParse({ id: parseInt(c.req.param("id")) });
    if (!params.success) return c.json({ error: "Invalid order ID" }, 400);

    try {
      const [order] = await db.select().from(ordersTable).where(eq(ordersTable.id, params.data.id));
      if (!order) return c.json({ error: "Order not found" }, 404);

      const isSandbox = process.env["PAYFAST_SANDBOX"] === "true" || process.env["NODE_ENV"] !== "production";
      const merchantId = process.env["PAYFAST_MERCHANT_ID"] || "10000100";
      const merchantKey = process.env["PAYFAST_MERCHANT_KEY"] || "46f0cd694581a";

      const domains = process.env["REPLIT_DOMAINS"]?.split(",")[0];
      const baseUrl = domains ? `https://${domains}` : (process.env["PUBLIC_URL"] || "http://localhost:80");

      const payfastUrl = isSandbox ? "https://sandbox.payfast.co.za/eng/process" : "https://www.payfast.co.za/eng/process";
      const nameParts = order.fullName.trim().split(" ");
      const nameFirst = nameParts[0] || order.fullName;

      return c.json({ merchantId, merchantKey, returnUrl: `${baseUrl}/order-success?ref=${order.orderRef}`, cancelUrl: `${baseUrl}/order?cancelled=true`, notifyUrl: `${baseUrl}/api/payfast/notify`, nameFirst, emailAddress: order.email, mPaymentId: order.orderRef, amount: parseFloat(order.totalAmount).toFixed(2), itemName: `Matiyane Gas Order ${order.orderRef}`, payfastUrl });
    } catch (err) {
      logger.error({ err }, "Failed to get PayFast data");
      return c.json({ error: "Internal server error" }, 500);
    }
  });

  router.get("/orders/:id/paystack", async (c) => {
    const id = parseInt(c.req.param("id"));
    if (isNaN(id)) return c.json({ error: "Invalid order ID" }, 400);

    try {
      const [order] = await db.select().from(ordersTable).where(eq(ordersTable.id, id));
      if (!order) return c.json({ error: "Order not found" }, 404);

      const publicKey = process.env["PAYSTACK_PUBLIC_KEY"] || "pk_test_xxxxxx";
      const domains = process.env["REPLIT_DOMAINS"]?.split(",")[0];
      const baseUrl = domains ? `https://${domains}` : (process.env["PUBLIC_URL"] || "http://localhost:80");
      const amountKobo = Math.round(parseFloat(order.totalAmount) * 100);

      return c.json({
        publicKey,
        email: order.email,
        amountKobo,
        reference: `MGD-PS-${order.orderRef}`,
        currency: "ZAR",
        callbackUrl: `${baseUrl}/order-success?ref=${order.orderRef}&gateway=paystack`,
        metadata: { orderRef: order.orderRef, customerName: order.fullName },
      });
    } catch (err) {
      logger.error({ err }, "Failed to get Paystack data");
      return c.json({ error: "Internal server error" }, 500);
    }
  });

  router.post("/payfast/notify", async (c) => {
    let body: Record<string, string> = {};
    try {
      body = await c.req.parseBody() as Record<string, string>;
    } catch { /* ignore parse errors */ }

    const { m_payment_id, payment_status } = body;
    if (payment_status === "COMPLETE" && m_payment_id) {
      try {
        await db.update(ordersTable).set({ status: "paid", updatedAt: new Date() }).where(eq(ordersTable.orderRef, m_payment_id));
        logger.info({ orderRef: m_payment_id }, "Order marked as paid via PayFast ITN");
      } catch (err) {
        logger.error({ err, orderRef: m_payment_id }, "Failed to update order status via PayFast ITN");
      }
    }
    return c.text("OK");
  });

  router.post("/paystack/webhook", async (c) => {
    let event: { event: string; data?: { reference?: string } } = { event: "" };
    try {
      event = await c.req.json();
    } catch { /* ignore */ }

    if (event.event === "charge.success" && event.data?.reference) {
      const ref = event.data.reference;
      const orderRef = ref.replace("MGD-PS-", "");
      try {
        await db.update(ordersTable).set({ status: "paid", updatedAt: new Date() }).where(eq(ordersTable.orderRef, orderRef));
        logger.info({ orderRef }, "Order marked as paid via Paystack webhook");
      } catch (err) {
        logger.error({ err, orderRef }, "Failed to update order status via Paystack webhook");
      }
    }
    return c.text("OK");
  });

  return router;
}
