import { logger } from "./logger";

const API_TOKEN = process.env["WHATSAPP_API_TOKEN"];
const PHONE_NUMBER_ID = process.env["WHATSAPP_PHONE_NUMBER_ID"];
const TEMPLATE_NAME = process.env["WHATSAPP_TEMPLATE_NAME"] || "order_status_update";
const LANG_CODE = process.env["WHATSAPP_LANG_CODE"] || "en";
const BASE_URL = "https://graph.facebook.com/v19.0";

export function isWhatsAppConfigured(): boolean {
  return !!(API_TOKEN && PHONE_NUMBER_ID);
}

function formatPhoneZA(raw: string): string {
  const digits = raw.replace(/\D/g, "");
  if (digits.startsWith("27")) return digits;
  if (digits.startsWith("0")) return `27${digits.slice(1)}`;
  return digits;
}

const STATUS_LABELS: Record<string, string> = {
  confirmed:        "Order Confirmed ✅",
  out_for_delivery: "Out for Delivery 🚚",
  delivered:        "Delivered 🎉",
  paid:             "Completed & Paid 💛",
  cancelled:        "Cancelled ❌",
};

const STATUS_DETAILS: Record<string, string> = {
  confirmed:        "Your order is confirmed and being prepared for dispatch.",
  out_for_delivery: "Our driver is on the way — please be available to receive your delivery.",
  delivered:        "Your gas has arrived. Thank you for choosing Matiyane Gas!",
  paid:             "Your order is fully complete. Thank you for your business!",
  cancelled:        "Your order has been cancelled. Call us on 076 748 8597 if you need help.",
};

export async function sendOrderStatusWhatsApp(opts: {
  customerName: string;
  customerPhone: string;
  orderRef: string;
  newStatus: string;
}): Promise<void> {
  if (!isWhatsAppConfigured()) return;

  const statusLabel = STATUS_LABELS[opts.newStatus];
  if (!statusLabel) return;

  const to = formatPhoneZA(opts.customerPhone);
  const firstName = opts.customerName.trim().split(" ")[0] || opts.customerName;
  const detail = STATUS_DETAILS[opts.newStatus] ?? "";

  const body = {
    messaging_product: "whatsapp",
    to,
    type: "template",
    template: {
      name: TEMPLATE_NAME,
      language: { code: LANG_CODE },
      components: [
        {
          type: "body",
          parameters: [
            { type: "text", text: firstName },
            { type: "text", text: opts.orderRef },
            { type: "text", text: statusLabel },
            { type: "text", text: detail },
          ],
        },
      ],
    },
  };

  const res = await fetch(`${BASE_URL}/${PHONE_NUMBER_ID}/messages`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${API_TOKEN}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`WhatsApp API error ${res.status}: ${text}`);
  }

  logger.info({ to, orderRef: opts.orderRef, status: opts.newStatus }, "WhatsApp notification sent");
}
