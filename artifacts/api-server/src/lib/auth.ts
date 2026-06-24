import { createMiddleware } from "hono/factory";

function getSecret(): string {
  return process.env["SESSION_SECRET"] || "matiyane-admin-secret-fallback";
}

async function hmacHex(secret: string, message: string): Promise<string> {
  const enc = new TextEncoder();
  const key = await globalThis.crypto.subtle.importKey(
    "raw",
    enc.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  const sig = await globalThis.crypto.subtle.sign("HMAC", key, enc.encode(message));
  return Array.from(new Uint8Array(sig))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

export async function generateAdminToken(): Promise<string> {
  const payload = `admin:${Math.floor(Date.now() / (1000 * 60 * 60 * 24))}`;
  return hmacHex(getSecret(), payload);
}

export async function verifyAdminToken(token: string): Promise<boolean> {
  const secret = getSecret();
  const day = Math.floor(Date.now() / (1000 * 60 * 60 * 24));
  const [today, yesterday] = await Promise.all([
    hmacHex(secret, `admin:${day}`),
    hmacHex(secret, `admin:${day - 1}`),
  ]);
  return token === today || token === yesterday;
}

export const requireAdmin = createMiddleware(async (c, next) => {
  const authHeader = c.req.header("authorization");
  if (!authHeader?.startsWith("Bearer ")) {
    return c.json({ error: "Unauthorized" }, 401);
  }
  const token = authHeader.slice(7);
  if (!(await verifyAdminToken(token))) {
    return c.json({ error: "Invalid or expired token" }, 401);
  }
  return next();
});
