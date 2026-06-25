import { Hono } from "hono";
import { contactMessagesTable } from "@workspace/db/schema";
import { SubmitContactBody } from "@workspace/api-zod";
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { sendContactEmail } from "../lib/email";
import { syncContactToHubspot } from "../lib/hubspot";
import { logger } from "../lib/logger";
import type { AnyDb } from "../app";

export function createContactRouter(db: AnyDb) {
  const router = new Hono();

  router.post("/contact", async (c) => {
    let body: unknown;
    try {
      body = await c.req.json();
    } catch {
      return c.json({ error: "Invalid JSON body" }, 400);
    }

    const parsed = SubmitContactBody.safeParse(body);
    if (!parsed.success) {
      return c.json({ error: "Invalid request body" }, 400);
    }

    const { name, email, phone, service, message } = parsed.data;

    try {
      await db.insert(contactMessagesTable).values({ name, email, phone: phone ?? null, service: service ?? null, message });

      sendContactEmail(name, email, phone ?? undefined, service ?? undefined, message).catch((err) =>
        logger.error({ err }, "Contact email send failed"),
      );

      syncContactToHubspot({ name, email, phone: phone ?? undefined, service: service ?? undefined, message }).catch((err) =>
        logger.error({ err }, "HubSpot contact sync failed"),
      );

      return c.json({ message: "Message received. We will get back to you shortly." });
    } catch (err) {
      logger.error({ err }, "Failed to save contact message");
      return c.json({ error: "Internal server error" }, 500);
    }
  });

  return router;
}
