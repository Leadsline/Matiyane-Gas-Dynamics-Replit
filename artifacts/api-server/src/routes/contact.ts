import { Router } from "express";
import { db, contactMessagesTable } from "@workspace/db";
import { SubmitContactBody } from "@workspace/api-zod";
import { sendContactEmail } from "../lib/email";
import { logger } from "../lib/logger";

const router = Router();

router.post("/contact", async (req, res) => {
  const parsed = SubmitContactBody.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: "Invalid request body" });
  }

  const { name, email, phone, message } = parsed.data;

  try {
    await db.insert(contactMessagesTable).values({
      name,
      email,
      phone: phone ?? null,
      message,
    });

    // Send email notification (non-blocking)
    sendContactEmail(name, email, phone ?? undefined, message).catch((err) =>
      logger.error({ err }, "Contact email send failed")
    );

    res.json({ message: "Message received. We will get back to you shortly." });
  } catch (err) {
    req.log.error({ err }, "Failed to save contact message");
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
