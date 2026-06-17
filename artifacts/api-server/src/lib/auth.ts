import { createHmac } from "crypto";
import type { Request, Response, NextFunction } from "express";

function getSecret(): string {
  return process.env["SESSION_SECRET"] || "matiyane-admin-secret-fallback";
}

export function generateAdminToken(): string {
  const secret = getSecret();
  const payload = `admin:${Math.floor(Date.now() / (1000 * 60 * 60 * 24))}`;
  return createHmac("sha256", secret).update(payload).digest("hex");
}

export function verifyAdminToken(token: string): boolean {
  const today = generateAdminToken();
  const yesterday = (() => {
    const secret = getSecret();
    const payload = `admin:${Math.floor(Date.now() / (1000 * 60 * 60 * 24)) - 1}`;
    return createHmac("sha256", secret).update(payload).digest("hex");
  })();
  return token === today || token === yesterday;
}

export function requireAdmin(req: Request, res: Response, next: NextFunction): void {
  const authHeader = req.headers["authorization"];
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }
  const token = authHeader.slice(7);
  if (!verifyAdminToken(token)) {
    res.status(401).json({ error: "Invalid or expired token" });
    return;
  }
  next();
}
