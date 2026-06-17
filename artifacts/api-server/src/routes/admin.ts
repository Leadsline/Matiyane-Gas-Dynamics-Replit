import { Router } from "express";
import { db, ordersTable, orderItemsTable, contactMessagesTable } from "@workspace/db";
import { eq, desc, count, sql } from "drizzle-orm";
import { z } from "zod/v4";
import { requireAdmin, generateAdminToken } from "../lib/auth";

const router = Router();

const ADMIN_PASSWORD = process.env["ADMIN_PASSWORD"] || "matiyane2024admin";

// POST /admin/login
router.post("/admin/login", (req, res) => {
  const schema = z.object({ password: z.string() });
  const parsed = schema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: "Password is required" });
  }

  if (parsed.data.password !== ADMIN_PASSWORD) {
    return res.status(401).json({ error: "Invalid password" });
  }

  const token = generateAdminToken();
  res.json({ token });
});

// GET /admin/orders
router.get("/admin/orders", requireAdmin, async (req, res) => {
  const page = Math.max(1, parseInt(String(req.query["page"] || "1")));
  const limit = Math.min(100, Math.max(1, parseInt(String(req.query["limit"] || "20"))));
  const status = req.query["status"] as string | undefined;
  const offset = (page - 1) * limit;

  try {
    const whereClause = status ? eq(ordersTable.status, status) : undefined;

    const [{ total }] = await db
      .select({ total: count() })
      .from(ordersTable)
      .where(whereClause);

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
        acc[item.orderId].push(item);
        return acc;
      },
      {} as Record<number, typeof items>
    );

    res.json({
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
    req.log.error({ err }, "Failed to list admin orders");
    res.status(500).json({ error: "Internal server error" });
  }
});

// PATCH /admin/orders/:id/status
router.patch("/admin/orders/:id/status", requireAdmin, async (req, res) => {
  const id = parseInt(req.params.id);
  if (isNaN(id)) return res.status(400).json({ error: "Invalid order ID" });

  const schema = z.object({
    status: z.enum(["pending", "confirmed", "out_for_delivery", "delivered", "paid", "cancelled"]),
  });
  const parsed = schema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: "Invalid status" });
  }

  try {
    const [updated] = await db
      .update(ordersTable)
      .set({ status: parsed.data.status, updatedAt: new Date() })
      .where(eq(ordersTable.id, id))
      .returning();

    if (!updated) return res.status(404).json({ error: "Order not found" });

    res.json({ message: "Order status updated" });
  } catch (err) {
    req.log.error({ err }, "Failed to update order status");
    res.status(500).json({ error: "Internal server error" });
  }
});

// GET /admin/contacts
router.get("/admin/contacts", requireAdmin, async (req, res) => {
  const page = Math.max(1, parseInt(String(req.query["page"] || "1")));
  const limit = Math.min(100, Math.max(1, parseInt(String(req.query["limit"] || "20"))));
  const offset = (page - 1) * limit;

  try {
    const [{ total }] = await db.select({ total: count() }).from(contactMessagesTable);

    const contacts = await db
      .select()
      .from(contactMessagesTable)
      .orderBy(desc(contactMessagesTable.createdAt))
      .limit(limit)
      .offset(offset);

    res.json({
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
    req.log.error({ err }, "Failed to list contacts");
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
