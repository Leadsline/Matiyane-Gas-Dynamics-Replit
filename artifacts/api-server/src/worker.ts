import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import * as schema from "@workspace/db/schema";
import { createApp, type AnyDb } from "./app";

interface Env {
  DATABASE_URL: string;
}

export const onRequest = async (context: {
  request: Request;
  env: Env;
}): Promise<Response> => {
  const sql = neon(context.env.DATABASE_URL);
  const db = drizzle(sql, { schema }) as unknown as AnyDb;
  const app = createApp(db);
  return app.fetch(context.request, context.env);
};
