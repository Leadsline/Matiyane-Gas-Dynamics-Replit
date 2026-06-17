import { logger } from "./logger";

export interface OrderEmailData {
  orderRef: string;
  fullName: string;
  email: string;
  phone: string;
  deliveryAddress: string;
  suburb: string;
  specialInstructions?: string | null;
  items: { productName: string; quantity: number; unitPrice: number; subtotal: number }[];
  totalAmount: number;
  deliveryFee: number;
}

function formatCurrency(amount: number): string {
  return `R${amount.toFixed(2)}`;
}

function buildCustomerEmailHtml(data: OrderEmailData): string {
  const itemRows = data.items
    .map(
      (item) =>
        `<tr>
          <td style="padding:8px 12px;border-bottom:1px solid #e5e7eb;">${item.productName}</td>
          <td style="padding:8px 12px;border-bottom:1px solid #e5e7eb;text-align:center;">${item.quantity}</td>
          <td style="padding:8px 12px;border-bottom:1px solid #e5e7eb;text-align:right;">${formatCurrency(item.unitPrice)}</td>
          <td style="padding:8px 12px;border-bottom:1px solid #e5e7eb;text-align:right;">${formatCurrency(item.subtotal)}</td>
        </tr>`
    )
    .join("");

  return `<!DOCTYPE html>
<html>
<head><meta charset="UTF-8"></head>
<body style="margin:0;padding:0;font-family:Arial,sans-serif;background:#f3f4f6;">
  <div style="max-width:600px;margin:32px auto;background:#ffffff;border-radius:8px;overflow:hidden;box-shadow:0 2px 8px rgba(0,0,0,0.1);">
    <div style="background:#1a2f5e;padding:32px;text-align:center;">
      <h1 style="color:#f0c040;margin:0;font-size:24px;">Matiyane Gas Distributors</h1>
      <p style="color:#ffffff;margin:8px 0 0;font-size:14px;">Safe, Reliable and Affordable</p>
    </div>
    <div style="padding:32px;">
      <h2 style="color:#1a2f5e;margin-top:0;">Order Confirmation</h2>
      <p style="color:#374151;">Dear <strong>${data.fullName}</strong>,</p>
      <p style="color:#374151;">Thank you for your order! We have received your request and will contact you shortly to confirm delivery details.</p>
      
      <div style="background:#f9fafb;border-radius:6px;padding:16px;margin:24px 0;">
        <p style="margin:0;font-size:14px;color:#6b7280;">Order Reference</p>
        <p style="margin:4px 0 0;font-size:20px;font-weight:bold;color:#1a2f5e;">${data.orderRef}</p>
      </div>

      <h3 style="color:#1a2f5e;">Order Details</h3>
      <table style="width:100%;border-collapse:collapse;font-size:14px;">
        <thead>
          <tr style="background:#1a2f5e;color:#ffffff;">
            <th style="padding:10px 12px;text-align:left;">Product</th>
            <th style="padding:10px 12px;text-align:center;">Qty</th>
            <th style="padding:10px 12px;text-align:right;">Unit Price</th>
            <th style="padding:10px 12px;text-align:right;">Subtotal</th>
          </tr>
        </thead>
        <tbody>${itemRows}</tbody>
        <tfoot>
          <tr>
            <td colspan="3" style="padding:10px 12px;text-align:right;font-weight:bold;">Products Total:</td>
            <td style="padding:10px 12px;text-align:right;font-weight:bold;">${formatCurrency(data.totalAmount - data.deliveryFee)}</td>
          </tr>
          <tr>
            <td colspan="3" style="padding:4px 12px;text-align:right;color:#6b7280;">Delivery Fee:</td>
            <td style="padding:4px 12px;text-align:right;color:#6b7280;">${data.deliveryFee === 0 ? "FREE" : formatCurrency(data.deliveryFee)}</td>
          </tr>
          <tr style="background:#f0c040;">
            <td colspan="3" style="padding:10px 12px;text-align:right;font-weight:bold;color:#1a2f5e;">Total Amount:</td>
            <td style="padding:10px 12px;text-align:right;font-weight:bold;color:#1a2f5e;">${formatCurrency(data.totalAmount)}</td>
          </tr>
        </tfoot>
      </table>

      <h3 style="color:#1a2f5e;">Delivery Information</h3>
      <p style="color:#374151;margin:4px 0;"><strong>Address:</strong> ${data.deliveryAddress}</p>
      <p style="color:#374151;margin:4px 0;"><strong>Suburb:</strong> ${data.suburb}</p>
      ${data.specialInstructions ? `<p style="color:#374151;margin:4px 0;"><strong>Instructions:</strong> ${data.specialInstructions}</p>` : ""}

      <div style="background:#fef3c7;border-left:4px solid #f0c040;padding:16px;margin:24px 0;border-radius:0 6px 6px 0;">
        <p style="margin:0;color:#374151;font-size:14px;"><strong>Delivery Note:</strong> Free delivery applies within Kempton Park. For other areas, our team will contact you to confirm the delivery fee before processing.</p>
      </div>

      <p style="color:#374151;">If you have any questions, please contact us:</p>
      <p style="color:#374151;margin:4px 0;">Tel: 076 748 8597 / 082 467 6584</p>
    </div>
    <div style="background:#1a2f5e;padding:24px;text-align:center;">
      <p style="color:#9ca3af;font-size:12px;margin:0;">Matiyane Gas Distributors | 5 Kanonkop Place, Glen Marais, Kempton Park 1619</p>
    </div>
  </div>
</body>
</html>`;
}

function buildAdminEmailHtml(data: OrderEmailData): string {
  const itemRows = data.items
    .map(
      (item) =>
        `<tr>
          <td style="padding:8px 12px;border-bottom:1px solid #e5e7eb;">${item.productName}</td>
          <td style="padding:8px 12px;border-bottom:1px solid #e5e7eb;text-align:center;">${item.quantity}</td>
          <td style="padding:8px 12px;border-bottom:1px solid #e5e7eb;text-align:right;">R${item.subtotal.toFixed(2)}</td>
        </tr>`
    )
    .join("");

  return `<!DOCTYPE html>
<html>
<head><meta charset="UTF-8"></head>
<body style="margin:0;padding:0;font-family:Arial,sans-serif;background:#f3f4f6;">
  <div style="max-width:600px;margin:32px auto;background:#ffffff;border-radius:8px;overflow:hidden;box-shadow:0 2px 8px rgba(0,0,0,0.1);">
    <div style="background:#dc2626;padding:24px;text-align:center;">
      <h1 style="color:#ffffff;margin:0;font-size:20px;">NEW ORDER RECEIVED</h1>
      <p style="color:#fecaca;margin:8px 0 0;font-size:14px;">Order Ref: ${data.orderRef}</p>
    </div>
    <div style="padding:32px;">
      <h2 style="color:#111827;margin-top:0;">Customer Details</h2>
      <p style="margin:4px 0;"><strong>Name:</strong> ${data.fullName}</p>
      <p style="margin:4px 0;"><strong>Phone:</strong> ${data.phone}</p>
      <p style="margin:4px 0;"><strong>Email:</strong> ${data.email}</p>
      <p style="margin:4px 0;"><strong>Delivery Address:</strong> ${data.deliveryAddress}, ${data.suburb}</p>
      ${data.specialInstructions ? `<p style="margin:4px 0;"><strong>Special Instructions:</strong> ${data.specialInstructions}</p>` : ""}
      
      <h2 style="color:#111827;margin-top:24px;">Order Items</h2>
      <table style="width:100%;border-collapse:collapse;font-size:14px;">
        <thead>
          <tr style="background:#111827;color:#ffffff;">
            <th style="padding:10px 12px;text-align:left;">Product</th>
            <th style="padding:10px 12px;text-align:center;">Qty</th>
            <th style="padding:10px 12px;text-align:right;">Subtotal</th>
          </tr>
        </thead>
        <tbody>${itemRows}</tbody>
      </table>
      
      <div style="margin-top:16px;padding:16px;background:#f9fafb;border-radius:6px;">
        <p style="margin:4px 0;"><strong>Total Amount: R${data.totalAmount.toFixed(2)}</strong></p>
        <p style="margin:4px 0;color:#6b7280;">Delivery Fee: ${data.deliveryFee === 0 ? "FREE (Kempton Park)" : `R${data.deliveryFee.toFixed(2)}`}</p>
      </div>
    </div>
  </div>
</body>
</html>`;
}

export async function sendOrderEmails(data: OrderEmailData): Promise<void> {
  const SMTP_HOST = process.env.SMTP_HOST;
  const SMTP_PORT = parseInt(process.env.SMTP_PORT || "587");
  const SMTP_USER = process.env.SMTP_USER;
  const SMTP_PASS = process.env.SMTP_PASS;
  const ADMIN_EMAIL = process.env.ADMIN_EMAIL || "admin@matiyanegas.co.za";

  if (!SMTP_HOST || !SMTP_USER || !SMTP_PASS) {
    logger.warn("SMTP not configured — skipping email send. Set SMTP_HOST, SMTP_USER, SMTP_PASS to enable emails.");
    return;
  }

  try {
    const nodemailer = await import("nodemailer");
    const transporter = nodemailer.default.createTransport({
      host: SMTP_HOST,
      port: SMTP_PORT,
      secure: SMTP_PORT === 465,
      auth: { user: SMTP_USER, pass: SMTP_PASS },
    });

    await Promise.all([
      transporter.sendMail({
        from: `"Matiyane Gas Distributors" <${SMTP_USER}>`,
        to: data.email,
        subject: `Order Confirmation - ${data.orderRef} | Matiyane Gas Distributors`,
        html: buildCustomerEmailHtml(data),
      }),
      transporter.sendMail({
        from: `"Matiyane Gas Orders" <${SMTP_USER}>`,
        to: ADMIN_EMAIL,
        subject: `New Order: ${data.orderRef} - ${data.fullName} - R${data.totalAmount.toFixed(2)}`,
        html: buildAdminEmailHtml(data),
      }),
    ]);

    logger.info({ orderRef: data.orderRef }, "Order emails sent successfully");
  } catch (err) {
    logger.error({ err, orderRef: data.orderRef }, "Failed to send order emails");
  }
}

export async function sendContactEmail(name: string, email: string, phone: string | undefined, message: string): Promise<void> {
  const SMTP_HOST = process.env.SMTP_HOST;
  const SMTP_PORT = parseInt(process.env.SMTP_PORT || "587");
  const SMTP_USER = process.env.SMTP_USER;
  const SMTP_PASS = process.env.SMTP_PASS;
  const ADMIN_EMAIL = process.env.ADMIN_EMAIL || "admin@matiyanegas.co.za";

  if (!SMTP_HOST || !SMTP_USER || !SMTP_PASS) {
    logger.warn("SMTP not configured — skipping contact email");
    return;
  }

  try {
    const nodemailer = await import("nodemailer");
    const transporter = nodemailer.default.createTransport({
      host: SMTP_HOST,
      port: SMTP_PORT,
      secure: SMTP_PORT === 465,
      auth: { user: SMTP_USER, pass: SMTP_PASS },
    });

    await transporter.sendMail({
      from: `"Matiyane Gas Website" <${SMTP_USER}>`,
      to: ADMIN_EMAIL,
      subject: `New Contact Message from ${name}`,
      html: `<h2>New Contact Form Submission</h2><p><strong>Name:</strong> ${name}</p><p><strong>Email:</strong> ${email}</p>${phone ? `<p><strong>Phone:</strong> ${phone}</p>` : ""}<p><strong>Message:</strong></p><p>${message.replace(/\n/g, "<br>")}</p>`,
    });

    logger.info({ email }, "Contact email sent");
  } catch (err) {
    logger.error({ err }, "Failed to send contact email");
  }
}
