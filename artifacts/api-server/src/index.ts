import { serve } from "@hono/node-server";
import { db } from "@workspace/db";
import { createApp } from "./app";
import { logger } from "./lib/logger";

const rawPort = process.env["PORT"];

if (!rawPort) {
  throw new Error("PORT environment variable is required but was not provided.");
}

const port = Number(rawPort);

if (Number.isNaN(port) || port <= 0) {
  throw new Error(`Invalid PORT value: "${rawPort}"`);
}

const app = createApp(db);

serve({ fetch: app.fetch, port }, () => {
  logger.info({ port }, "Server listening");
});
