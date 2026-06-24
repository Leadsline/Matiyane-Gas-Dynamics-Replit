import { Hono } from "hono";
import health from "./health";
import products from "./products";
import { createOrdersRouter } from "./orders";
import { createContactRouter } from "./contact";
import { createAdminRouter } from "./admin";
import type { AnyDb } from "../app";

export function createRouter(db: AnyDb) {
  const router = new Hono();

  router.route("/", health);
  router.route("/", products);
  router.route("/", createOrdersRouter(db));
  router.route("/", createContactRouter(db));
  router.route("/", createAdminRouter(db));

  return router;
}
