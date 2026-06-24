import { Hono } from "hono";
import { ordersTable, orderItemsTable, contactMessagesTable } from "@workspace/db/schema";
import { eq, desc, count, sql, gte } from "drizzle-orm";
import { z } from "zod/v4";
import { requireAdmin, generateAdminToken } from "../lib/auth";
import { logger } from "../lib/logger";
import { sendOrderStatusWhatsApp, isWhatsAppConfigured } from "../lib/whatsapp";
import type { AnyDb } from "../app";

const ADMIN_PASSWORD = process.env["ADMIN_PASSWORD"] || "matiyane2024admin";

export function createAdminRouter(db: AnyDb) {
  const router = new Hono();

  router.post("/admin/login", async (c) => {
    let body: unknown;
    try {
      body = await c.req.json();
    } catch {
      return c.json({ error: "Password is required" }, 400);
    }

    const schema = z.object({ password: z.string() });
    const parsed = schema.safeParse(body);
    if (!parsed.success) {
      return c.json({ error: "Password is required" }, 400);
    }

    if (parsed.data.password !== ADMIN_PASSWORD) {
      return c.json({ error: "Invalid password" }, 401);
    }

    const token = await generateAdminToken();
    return c.json({ token });
  });

  router.get("/admin/orders", requireAdmin, async (c) => {
    const page = Math.max(1, parseInt(c.req.query("page") || "1"));
    const limit = Math.min(100, Math.max(1, parseInt(c.req.query("limit") || "20")));
    const status = c.req.query("status");
    const offset = (page - 1) * limit;

    try {
      const whereClause = status ? eq(ordersTable.status, status) : undefined;

      const [{ total }] = await db.select({ total: count() }).from(ordersTable).where(whereClause);

      const orders = await db
        .select()
        .from(ordersTable)
        .where(whereClause)
        .orderBy(desc(ordersTable.createdAt))
        .limit(limit)
        .offset(offset);

      const orderIds = orders.map((o) => o.id);
      const items = orderIds.length
        ? await db
            .select()
            .from(orderItemsTable)
            .where(sql`${orderItemsTable.orderId} = ANY(${sql.raw(`ARRAY[${orderIds.join(",")}]::int[]`)})`)
        : [];

      const itemsByOrderId = items.reduce(
        (acc, item) => {
          if (!acc[item.orderId]) acc[item.orderId] = [];
          acc[item.orderId]!.push(item);
          return acc;
        },
        {} as Record<number, typeof items>,
      );

      return c.json({
        orders: orders.map((o) => ({
          id: o.id,
          orderRef: o.orderRef,
          fullName: o.fullName,
          phone: o.phone,
          email: o.email,
          deliveryAddress: o.deliveryAddress,
          suburb: o.suburb,
          specialInstructions: o.specialInstructions ?? null,
          status: o.status,
          totalAmount: parseFloat(o.totalAmount),
          deliveryFee: parseFloat(o.deliveryFee),
          items: (itemsByOrderId[o.id] || []).map((i) => ({
            productId: i.productId,
            productName: i.productName,
            quantity: i.quantity,
            unitPrice: parseFloat(i.unitPrice),
            subtotal: parseFloat(i.subtotal),
          })),
          createdAt: o.createdAt.toISOString(),
        })),
        total,
        page,
        totalPages: Math.ceil(total / limit),
      });
    } catch (err) {
      logger.error({ err }, "Failed to list admin orders");
      return c.json({ error: "Internal server error" }, 500);
    }
  });

  router.patch("/admin/orders/:id/status", requireAdmin, async (c) => {
    const id = parseInt(c.req.param("id"));
    if (isNaN(id)) return c.json({ error: "Invalid order ID" }, 400);

    let body: unknown;
    try {
      body = await c.req.json();
    } catch {
      return c.json({ error: "Invalid status" }, 400);
    }

    const schema = z.object({
      status: z.enum(["pending", "confirmed", "out_for_delivery", "delivered", "paid", "cancelled"]),
    });
    const parsed = schema.safeParse(body);
    if (!parsed.success) {
      return c.json({ error: "Invalid status" }, 400);
    }

    try {
      const [updated] = await db
        .update(ordersTable)
        .set({ status: parsed.data.status, updatedAt: new Date() })
        .where(eq(ordersTable.id, id))
        .returning();

      if (!updated) return c.json({ error: "Order not found" }, 404);

      if (isWhatsAppConfigured()) {
        sendOrderStatusWhatsApp({
          customerName: updated.fullName,
          customerPhone: updated.phone,
          orderRef: updated.orderRef,
          newStatus: parsed.data.status,
        }).catch((err) => logger.error({ err, orderId: id }, "WhatsApp notification failed"));
      }

      return c.json({ message: "Order status updated" });
    } catch (err) {
      logger.error({ err }, "Failed to update order status");
      return c.json({ error: "Internal server error" }, 500);
    }
  });

  router.get("/admin/analytics", requireAdmin, async (c) => {
    const period = c.req.query("period") || "30d";
    const days = period === "7d" ? 7 : period === "90d" ? 90 : 30;
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const rows = await db
      .select({
        date: sql<string>`DATE(${ordersTable.createdAt})::text`,
        orders: count(),
        revenue: sql<number>`COALESCE(SUM(${ordersTable.totalAmount}), 0)::float`,
      })
      .from(ordersTable)
      .where(gte(ordersTable.createdAt, startDate))
      .groupBy(sql`DATE(${ordersTable.createdAt})`)
      .orderBy(sql`DATE(${ordersTable.createdAt})`);

    return c.json({ period, dailyData: rows });
  });

  router.get("/admin/contacts", requireAdmin, async (c) => {
    const page = Math.max(1, parseInt(c.req.query("page") || "1"));
    const limit = Math.min(100, Math.max(1, parseInt(c.req.query("limit") || "20")));
    const offset = (page - 1) * limit;

    try {
      const [{ total }] = await db.select({ total: count() }).from(contactMessagesTable);

      const contacts = await db
        .select()
        .from(contactMessagesTable)
        .orderBy(desc(contactMessagesTable.createdAt))
        .limit(limit)
        .offset(offset);

      return c.json({
        contacts: contacts.map((c) => ({
          id: c.id,
          name: c.name,
          email: c.email,
          phone: c.phone ?? null,
          message: c.message,
          createdAt: c.createdAt.toISOString(),
        })),
        total,
        page,
        totalPages: Math.ceil(total / limit),
      });
    } catch (err) {
      logger.error({ err }, "Failed to list contacts");
      return c.json({ error: "Internal server error" }, 500);
    }
  });

  return router;
}
