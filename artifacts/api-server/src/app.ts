import { Hono } from "hono";
import { cors } from "hono/cors";
import { logger as honoLogger } from "hono/logger";
import type { NodePgDatabase } from "drizzle-orm/node-postgres";
import type * as schema from "@workspace/db/schema";
import { createRouter } from "./routes";

export type AnyDb = NodePgDatabase<typeof schema>;

export function createApp(db: AnyDb) {
  const app = new Hono();

  app.use("*", cors());
  app.use("*", honoLogger());

  app.route("/api", createRouter(db));

  return app;
}
