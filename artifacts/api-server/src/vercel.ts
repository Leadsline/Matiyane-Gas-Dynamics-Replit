import { getRequestListener } from "@hono/node-server";
import { db } from "@workspace/db";
import { createApp } from "./app";

const app = createApp(db);

export default getRequestListener(app.fetch);
