# Matiyane Gas Distributors

A professional business website for Matiyane Gas Distributors — a South African LPG gas supplier based in Kempton Park. Customers can browse products, place orders with a full order form, pay via PayFast, and contact the business. Admin receives email notifications for every order and contact message.

## Run & Operate

- `pnpm --filter @workspace/api-server run dev` — run the API server (port varies)
- `pnpm --filter @workspace/matiyane-gas run dev` — run the frontend (port varies)
- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run build` — typecheck + build all packages
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API hooks and Zod schemas from the OpenAPI spec
- `pnpm --filter @workspace/db run push` — push DB schema changes (dev only)
- Required env: `DATABASE_URL` — Postgres connection string

## Stack

- pnpm workspaces, Node.js 24, TypeScript 5.9
- Frontend: React + Vite, Tailwind CSS, Montserrat font, wouter router
- API: Express 5
- DB: PostgreSQL + Drizzle ORM
- Validation: Zod (`zod/v4`), `drizzle-zod`
- API codegen: Orval (from OpenAPI spec)
- Build: esbuild (CJS bundle)
- Email: nodemailer (optional, configure via env vars)
- Payments: PayFast (redirect-based, sandbox by default)

## Where things live

- `lib/api-spec/openapi.yaml` — OpenAPI spec (source of truth)
- `lib/db/src/schema/orders.ts` — DB schema: orders, order_items, contact_messages
- `artifacts/api-server/src/routes/` — API route handlers (products, orders, contact)
- `artifacts/api-server/src/lib/email.ts` — Email templates and send logic
- `artifacts/matiyane-gas/src/pages/` — All 6 page components
- `artifacts/matiyane-gas/src/components/layout/` — Navbar, Footer, NotificationBar, WhatsAppButton
- `artifacts/matiyane-gas/src/components/ui/particle-canvas.tsx` — Canvas particle animation
- `artifacts/matiyane-gas/src/components/ui/fade-in.tsx` — IntersectionObserver scroll fade

## Architecture decisions

- PayFast uses redirect-based integration (HTML form POST) — no SDK needed, works with sandbox by default
- Emails are fire-and-forget (non-blocking) — order creation succeeds even if email fails
- Products are static in-memory data in the routes file (no DB table needed for MVP)
- Delivery fee is always 0 on record; admin contacts non-KP customers to confirm fee
- PayFast sandbox mode active unless `PAYFAST_SANDBOX=false` and `NODE_ENV=production`

## Product

- **Home** — particle hero, sliding notification bar, text carousel, product grid, features, testimonials, CTA
- **About Us** — company story, mission, stats, values, safety commitment
- **Products** — full product catalogue with use-cases, pricing, delivery info
- **Order Gas** — quantity selectors for all 4 sizes, full order form, live order summary, PayFast payment after submission
- **Contact Us** — contact details, form (saves to DB + email), Google Maps embed, WhatsApp chat link

## User preferences

_Populate as you build — explicit user instructions worth remembering across sessions._

## Gotchas

- Run `pnpm --filter @workspace/api-spec run codegen` after any OpenAPI spec change before using updated hooks
- Run `pnpm --filter @workspace/db run push` after any DB schema change
- PayFast MERCHANT_ID and MERCHANT_KEY must be set in production; defaults are PayFast sandbox test credentials
- Set `SMTP_HOST`, `SMTP_USER`, `SMTP_PASS`, `SMTP_PORT` (default 587), `ADMIN_EMAIL` to enable email notifications

## Required env vars for production

- `DATABASE_URL` — PostgreSQL connection string (auto-set by Replit DB)
- `PAYFAST_MERCHANT_ID` — from PayFast merchant account
- `PAYFAST_MERCHANT_KEY` — from PayFast merchant account
- `PAYFAST_SANDBOX` — set to `false` in production
- `SMTP_HOST`, `SMTP_USER`, `SMTP_PASS` — for automated emails
- `ADMIN_EMAIL` — email address for admin order notifications

## Pointers

- See the `pnpm-workspace` skill for workspace structure, TypeScript setup, and package details
