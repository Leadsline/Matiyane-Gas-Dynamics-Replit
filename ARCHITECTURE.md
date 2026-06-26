# Matiyane Gas Distributors — Architecture Documentation

## 1. Project Overview

A professional business website for **Matiyane Gas Distributors**, a South African LPG gas supplier based in Kempton Park. The platform handles product browsing, online ordering with payment integration, contact form submissions, and an admin dashboard for order management.

---

## 2. Tech Stack

### 2.1 Language & Tooling

| Layer | Technology | Version | Purpose |
|-------|-----------|---------|---------|
| Language | TypeScript | 5.9 | Type-safe development across all packages |
| Package Manager | pnpm | — | Workspace monorepo management with catalog versions |
| Build Tool | esbuild | 0.27.3 | Bundles the API server to a single ESM file |
| Bundler | Vite | 7.3.3 | Frontend dev server, hot reload, and production build |

### 2.2 Frontend

| Technology | Purpose |
|-----------|---------|
| React | UI framework (v18) |
| Vite | Build tool & dev server |
| Tailwind CSS v4 | Utility-first CSS styling |
| `@tailwindcss/vite` | Vite plugin for Tailwind CSS v4 |
| `tw-animate-css` | CSS animations (enter/exit utilities) |
| `@tailwindcss/typography` | Typography plugin |
| `shadcn/ui` | Pre-built accessible components (Radix UI primitives + CVA) |
| `wouter` | Lightweight routing (React Router alternative) |
| `@tanstack/react-query` | Server state management, caching, and data fetching |
| `framer-motion` | Animations and transitions |
| `lucide-react` | Icon library |
| `react-hook-form` + `@hookform/resolvers` | Form handling and validation |
| `zod` | Runtime schema validation |
| `sonner` | Toast notifications |
| `recharts` | Data visualization (used in admin dashboard) |
| `embla-carousel-react` | Carousel component |
| `react-icons` | Additional icon library |

### 2.3 Backend

| Technology | Purpose |
|-----------|---------|
| Hono | Lightweight web framework (Express alternative) |
| `@hono/node-server` | Node.js server adapter for Hono |
| Drizzle ORM | Type-safe SQL query builder |
| `drizzle-zod` | Generate Zod schemas from Drizzle table definitions |
| `pg` | PostgreSQL driver |
| `drizzle-kit` | Database schema migration and push tool |
| `zod` | Runtime schema validation (v4/v4) |
| `nodemailer` | SMTP email fallback |
| `esbuild` | API server bundling |

### 2.4 Code Generation

| Technology | Purpose |
|-----------|---------|
| Orval | Generates React Query hooks and Zod schemas from OpenAPI spec |
| OpenAPI 3.1.0 | API contract specification (single source of truth) |

### 2.5 Infrastructure

| Technology | Purpose |
|-----------|---------|
| Vercel | Production hosting (serverless functions + static frontend) |
| PostgreSQL | Data persistence (Replit DB in dev, Neon/Cloud in prod) |
| PayFast | Payment gateway for South African customers |
| Paystack | Alternative payment gateway |
| Brevo (Sendinblue) | Primary transactional email provider |
| SMTP | Fallback email delivery |

---

## 3. Monorepo Structure

```
matiyane-gas/
├── pnpm-workspace.yaml          # Workspace discovery + catalog versions
├── tsconfig.base.json           # Shared TypeScript strict defaults
├── tsconfig.json                # Root solution config (libs only)
├── package.json                 # Root task orchestration
│
├── artifacts/                   # Deployable applications
│   ├── matiyane-gas/            # Frontend React app (Vite + Tailwind)
│   ├── api-server/              # Backend Hono API (esbuild bundle)
│   └── mockup-sandbox/          # Canvas component preview server
│
├── lib/                         # Shared libraries (composite packages)
│   ├── api-spec/                # OpenAPI YAML + Orval config
│   ├── api-client-react/        # Generated React Query hooks
│   ├── api-zod/                 # Generated Zod schemas
│   └── db/                      # Drizzle schema + database connection
│
├── scripts/                     # Utility scripts
│   └── src/
│
├── vercel.json                  # Vercel deployment configuration
├── replit.md                    # Project documentation
└── .agents/                     # Agent memory (cross-session)
```

### 3.1 Package Dependencies

```
matiyane-gas (frontend)
  └── api-client-react (workspace:*)
      └── react-query (catalog:)

api-server (backend)
  ├── api-zod (workspace:*)       # Generated Zod schemas
  ├── db (workspace:*)            # Drizzle schema & connection
  └── zod (catalog:)

api-spec (codegen source)
  └── orval (devDep)
      ├── generates api-client-react (React Query hooks)
      └── generates api-zod (Zod schemas)
```

---

## 4. Frontend Architecture

### 4.1 Routing

| Route | Page | Description |
|-------|------|-------------|
| `/` | `HomePage` | Hero, product cards, marquee, testimonials, CTA |
| `/about` | `AboutPage` | Company story, mission, stats, values |
| `/products` | `ProductsPage` | Full product catalog with pricing |
| `/order` | `OrderPage` | Order form with quantity selectors, payment flow |
| `/contact` | `ContactPage` | Contact form + Google Maps + WhatsApp |
| `/order-success` | `OrderSuccessPage` | Post-payment confirmation |
| `/track-order` | `TrackOrderPage` | Order status lookup by reference |
| `/admin` | `AdminPage` | Admin dashboard (no layout wrapper) |

Router: **wouter** (lightweight, no history API needed)

### 4.2 State Management

- **Server state**: `@tanstack/react-query` — caching, refetching, mutations
- **Client state**: React `useState` / `useReducer` — minimal, no global state library needed
- **Forms**: `react-hook-form` + Zod resolver

### 4.3 Component Structure

```
matiyane-gas/src/
├── App.tsx              # Router setup + QueryClientProvider
├── main.tsx             # Entry point
│
├── components/
│   ├── layout/
│   │   ├── Navbar.tsx              # Navigation with mobile menu
│   │   ├── Footer.tsx              # Footer with links + social
│   │   ├── NotificationBar.tsx     # Sliding announcement bar
│   │   └── WhatsAppButton.tsx      # Floating WhatsApp chat button
│   │
│   └── ui/
│       ├── hero-canvas.tsx         # Canvas particle animation (energy effects)
│       ├── fade-in.tsx             # IntersectionObserver scroll animations
│       ├── usage-estimator.tsx     # Gas usage calculator
│       ├── usage-estimator-compact.tsx
│       ├── gas-level-detector.tsx  # Cylinder level detector
│       └── button.tsx, input.tsx, etc. (shadcn/ui primitives)
│
├── pages/
│   ├── home.tsx           # Hero + products + marquee + testimonials
│   ├── about.tsx          # Company story
│   ├── products.tsx       # Product catalog
│   ├── order.tsx          # Order form + payment
│   ├── contact.tsx        # Contact form
│   ├── order-success.tsx  # Success confirmation
│   ├── track-order.tsx    # Order tracking
│   ├── admin.tsx          # Admin dashboard
│   └── not-found.tsx      # 404 page
│
├── hooks/
│   └── use-toast.ts       # Toast notification hook
│
└── lib/
    └── utils.ts           # cn() helper (tailwind-merge + clsx)
```

### 4.4 Custom Animations

All custom animations are defined in `src/index.css`:

- `cylinder-float` — Gentle floating motion for LPG cylinder
- `cylinder-glow` — Pulsing glow effect for cylinder
- `marquee-scroll` — Continuous horizontal scrolling
- `pulse-glow` — Button pulse animation
- `float` — Badge hover float
- `shimmer` — Loading shimmer effect
- `scale-in` — Modal enter animation

---

## 5. Backend Architecture

### 5.1 Server Structure

```
api-server/src/
├── app.ts              # Hono app factory (CORS + logger + router)
├── index.ts            # Node.js server entry point (PORT binding)
├── vercel.ts           # Vercel serverless adapter
│
├── routes/
│   ├── products.ts     # Static product catalog (in-memory array)
│   ├── orders.ts       # Order CRUD + payment gateway helpers
│   ├── contact.ts      # Contact form submissions
│   ├── admin.ts        # Admin dashboard API (orders, analytics)
│   └── index.ts        # Route aggregator
│
├── lib/
│   ├── email.ts        # Email templates + Brevo/SMT sending
│   ├── logger.ts       # Structured logging (pino-style)
│   ├── auth.ts         # HMAC token generation + admin middleware
│   ├── hubspot.ts      # HubSpot CRM integration
│   └── whatsapp.ts     # WhatsApp notification integration
│
├── middlewares/
│   └── (CORS, auth middleware)
│
└── build.mjs           # esbuild bundler script
```

### 5.2 API Routes

| Method | Route | Auth | Description |
|--------|-------|------|-------------|
| `GET` | `/api/healthz` | — | Health check |
| `GET` | `/api/products` | — | List all products & services |
| `POST` | `/api/orders` | — | Create new order |
| `GET` | `/api/orders/:id` | — | Get order details |
| `GET` | `/api/orders/:id/payfast` | — | Get PayFast payment data |
| `GET` | `/api/orders/:id/paystack` | — | Get Paystack payment data |
| `GET` | `/api/orders/track?ref=` | — | Track order by reference |
| `GET` | `/api/orders/summary` | — | Order count + revenue summary |
| `POST` | `/api/contact` | — | Submit contact form |
| `POST` | `/api/payfast/notify` | — | PayFast ITN webhook |
| `POST` | `/api/paystack/webhook` | — | Paystack webhook |
| `POST` | `/api/admin/login` | — | Admin login (password-based) |
| `GET` | `/api/admin/orders` | Bearer | List orders (paginated) |
| `PATCH` | `/api/admin/orders/:id/status` | Bearer | Update order status |
| `GET` | `/api/admin/analytics` | Bearer | Daily analytics |
| `POST` | `/api/admin/orders/:id/whatsapp` | Bearer | Send WhatsApp notification |

### 5.3 Authentication

- **Admin**: HMAC-SHA256 tokens generated daily, verified via `Authorization: Bearer` header
- **Session secret**: `SESSION_SECRET` env var (or fallback)
- **Password**: `ADMIN_PASSWORD` env var (or fallback)
- No customer authentication — orders are tracked by `orderRef` + email

---

## 6. Database Architecture

### 6.1 Schema

```
orders
├── id              SERIAL PRIMARY KEY
├── order_ref       TEXT NOT NULL UNIQUE
├── full_name       TEXT NOT NULL
├── phone           TEXT NOT NULL
├── email           TEXT NOT NULL
├── delivery_address TEXT NOT NULL
├── suburb          TEXT NOT NULL
├── special_instructions TEXT
├── status          TEXT NOT NULL DEFAULT 'pending'
├── total_amount    NUMERIC(10,2) NOT NULL
├── delivery_fee    NUMERIC(10,2) DEFAULT '0'
├── created_at      TIMESTAMP DEFAULT NOW()
└── updated_at      TIMESTAMP DEFAULT NOW()

order_items
├── id              SERIAL PRIMARY KEY
├── order_id        INTEGER REFERENCES orders(id)
├── product_id      INTEGER NOT NULL
├── product_name    TEXT NOT NULL
├── quantity        INTEGER NOT NULL
├── unit_price      NUMERIC(10,2) NOT NULL
└── subtotal        NUMERIC(10,2) NOT NULL

contact_messages
├── id              SERIAL PRIMARY KEY
├── name            TEXT NOT NULL
├── email           TEXT NOT NULL
├── phone           TEXT
├── service         TEXT
├── message         TEXT NOT NULL
└── created_at      TIMESTAMP DEFAULT NOW()
```

### 6.2 ORM & Migrations

- **ORM**: Drizzle ORM with `pg` driver
- **Schema**: `drizzle-zod` generates Zod schemas directly from table definitions
- **Migrations**: `drizzle-kit push` for schema updates
- **Connection**: `DATABASE_URL` env var (PostgreSQL connection string)

### 6.3 Data Flow

1. **Order creation**: Frontend → `POST /api/orders` → Zod validation → Drizzle insert → Email notification → HubSpot sync
2. **Contact form**: Frontend → `POST /api/contact` → Zod validation → Drizzle insert → Email notification → HubSpot sync
3. **Order tracking**: Query by `orderRef` → Return status + items

---

## 7. API Design

### 7.1 Contract-First Development

The API is defined in `lib/api-spec/openapi.yaml` (OpenAPI 3.1.0) and serves as the **single source of truth**.

```
OpenAPI YAML
    ├── orval (codegen)
    │   ├── lib/api-client-react/ (React Query hooks)
    │   └── lib/api-zod/ (Zod schemas)
    │
    └── Backend routes use Zod schemas for validation
```

### 7.2 Code Generation Workflow

```bash
# 1. Update OpenAPI spec
vim lib/api-spec/openapi.yaml

# 2. Generate code
pnpm --filter @workspace/api-spec run codegen

# 3. Typecheck
pnpm run typecheck
```

Orval generates:
- `lib/api-client-react/src/generated/api.ts` — React Query hooks (`useCreateOrder`, `useListProducts`, etc.)
- `lib/api-zod/src/generated/api.ts` — Zod schemas (`CreateOrderBody`, `SubmitContactBody`, etc.)

### 7.3 Frontend API Client

- Custom `customFetch` wrapper in `lib/api-client-react/src/custom-fetch.ts`
- Handles base URL, auth tokens, JSON parsing, error handling
- Supports relative URLs (`/api/...`) in development, absolute URLs in production
- Error classes: `ApiError`, `ResponseParseError`

---

## 8. Payment Flow

### 8.1 PayFast Integration

```
1. Customer clicks "Place Order"
   ↓
2. Frontend POST /api/orders (creates order)
   ↓
3. Backend returns order with ID
   ↓
4. Frontend GET /api/orders/:id/payfast
   ↓
5. Backend generates signed payment data
   (merchant_id, merchant_key, amount, return_url, notify_url)
   ↓
6. Frontend auto-submits hidden form to PayFast
   ↓
7. Customer completes payment on PayFast
   ↓
8. PayFast redirects to return_url
   ↓
9. PayFast sends ITN (Instant Transaction Notification) to notify_url
   ↓
10. Backend validates signature and updates order status to "paid"
```

### 8.2 Paystack Integration

Alternative payment flow using Paystack Inline JS:
- Backend returns initialization data
- Frontend uses Paystack SDK for popup payment
- Webhook updates order status

### 8.3 Order States

| Status | Meaning |
|--------|---------|
| `pending` | Order created, awaiting payment |
| `paid` | Payment confirmed via PayFast/Paystack |
| `processing` | Admin is preparing the order |
| `completed` | Order delivered |
| `cancelled` | Order cancelled |

---

## 9. Email System

### 9.1 Architecture

```
Order/Contact Event
    ↓
  Email Templates
    ├── buildCustomerEmailHtml()   — Order confirmation to customer
    ├── buildAdminEmailHtml()      — New order notification to admin
    └── buildContactAdminEmailHtml() — Contact form notification
    ↓
  sendEmail()
    ├── Brevo API (primary)
    │   └── POST https://api.brevo.com/v3/smtp/email
    └── SMTP (fallback)
        └── nodemailer
```

### 9.2 Configuration

| Variable | Required | Default |
|----------|----------|---------|
| `BREVO_API_KEY` | Preferred | — |
| `BREVO_SENDER_EMAIL` | No | `noreply@matiyanegas.co.za` |
| `SMTP_HOST` | Fallback | — |
| `SMTP_USER` | Fallback | — |
| `SMTP_PASS` | Fallback | — |
| `SMTP_PORT` | No | `587` |
| `ADMIN_EMAIL` | Yes | `admin@matiyanegas.co.za` |

### 9.3 Behavior

- Emails are **fire-and-forget** (non-blocking)
- Order creation succeeds even if email fails
- Both customer and admin receive emails simultaneously
- Logs warning if no email provider is configured

---

## 10. Deployment Architecture

### 10.1 Vercel Configuration

```json
{
  "version": 2,
  "framework": null,
  "outputDirectory": "artifacts/matiyane-gas/dist",
  "functions": {
    "api/index.mjs": {
      "runtime": "@vercel/node@5.1.0",
      "maxDuration": 30
    }
  },
  "rewrites": [
    { "source": "/api/:path*", "destination": "/api/index.mjs" },
    { "source": "/((?!.*\\..*).*)", "destination": "/index.html" }
  ]
}
```

### 10.2 Build Pipeline

```
Development
├── Frontend: pnpm --filter @workspace/matiyane-gas run dev
├── Backend: pnpm --filter @workspace/api-server run dev
└── API Spec: pnpm --filter @workspace/api-spec run codegen

Production (Vercel)
├── Frontend: Vite builds static files to dist/
├── Backend: esbuild bundles to dist/index.mjs
└── Vercel serves both via rewrites
```

### 10.3 Environment Variables

| Variable | Environment | Description |
|----------|-------------|-------------|
| `DATABASE_URL` | All | PostgreSQL connection string |
| `PAYFAST_MERCHANT_ID` | Production | PayFast merchant ID |
| `PAYFAST_MERCHANT_KEY` | Production | PayFast merchant key |
| `PAYFAST_PASSPHRASE` | Production | PayFast signature passphrase |
| `PAYFAST_SANDBOX` | Dev | `true` for sandbox mode |
| `PAYSTACK_SECRET_KEY` | Production | Paystack API key |
| `ADMIN_PASSWORD` | Production | Admin dashboard password |
| `SESSION_SECRET` | Production | HMAC token secret |
| `BREVO_API_KEY` | Production | Brevo email API |
| `SMTP_HOST` | Production | SMTP server |
| `SMTP_USER` | Production | SMTP username |
| `SMTP_PASS` | Production | SMTP password |
| `ADMIN_EMAIL` | Production | Admin notification email |
| `HUBSPOT_API_KEY` | Optional | HubSpot CRM integration |

---

## 11. Key Architectural Decisions

### 11.1 Static Product Catalog

Products are stored in a **static in-memory array** (`PRODUCTS` in `products.ts`) rather than a database table. This is an MVP decision:
- **Pros**: No DB migrations needed, instant reads, easy to update prices
- **Cons**: Requires a redeploy to update products
- **Future**: Can migrate to a database table when inventory management is needed

### 11.2 Contract-First API

The OpenAPI spec is the **source of truth** for all API contracts. Both frontend and backend code is generated from it:
- Prevents drift between frontend types and backend validation
- Guarantees type safety across the stack
- New endpoints require spec update → codegen → implementation

### 11.3 Fire-and-Forget Emails

Email notifications are sent **asynchronously** without blocking the response:
- Order creation succeeds even if email fails
- `.catch()` on the promise prevents crashes
- Logs warnings for debugging

### 11.4 Zero Delivery Fee

Delivery fee is always stored as `0` in the database:
- Free delivery for Kempton Park customers
- Admin contacts non-Kempton Park customers to confirm fee
- Simplifies the MVP checkout flow

### 11.5 Dual Payment Gateways

Both PayFast and Paystack are integrated:
- **PayFast**: Primary for South African customers (local bank support)
- **Paystack**: Alternative with better developer experience
- Both use redirect/popup flow (no server-side token capture needed)

### 11.6 Admin Authentication

Admin uses a simple **password + HMAC token** system:
- No user database or sessions table
- Tokens are generated from `admin:${day}` using HMAC-SHA256
- Tokens valid for 2 days (today + yesterday)
- No JWT library needed — uses Web Crypto API

---

## 12. Data Flow Diagram

```
┌─────────────────────────────────────────────────────────────────────────┐
│                           CLIENT BROWSER                                 │
│  ┌─────────────────────────────────────────────────────────────────┐    │
│  │  React App (Vite + Tailwind + React Query + wouter)              │    │
│  │  ├── Pages: Home, About, Products, Order, Contact, Admin       │    │
│  │  ├── State: react-query (server), useState (client)              │    │
│  │  └── API: useListProducts, useCreateOrder, etc.                  │    │
│  └─────────────────────────────────────────────────────────────────┘    │
│                         │                                               │
│                         │ fetch /api/...                                │
│                         ▼                                               │
│  ┌─────────────────────────────────────────────────────────────────┐    │
│  │  PayFast / Paystack (payment gateways)                          │    │
│  └─────────────────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────────────────┘
                                    │
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                         VERCEL SERVERLESS                                │
│  ┌─────────────────────────────────────────────────────────────────┐    │
│  │  Hono API (esbuild bundle → api/index.mjs)                      │    │
│  │  ├── Routes: /api/products, /api/orders, /api/contact, /api/admin │    │
│  │  ├── Middleware: CORS, Logger, Auth (admin)                     │    │
│  │  └── Validation: Zod (generated from OpenAPI)                    │    │
│  └─────────────────────────────────────────────────────────────────┘    │
│                         │                                               │
│                         │ Drizzle ORM                                   │
│                         │                                               │
│  ┌─────────────────────────────────────────────────────────────────┐    │
│  │  PostgreSQL Database                                            │    │
│  │  ├── orders, order_items, contact_messages                      │    │
│  └─────────────────────────────────────────────────────────────────┘    │
│                         │                                               │
│  ┌─────────────────────────────────────────────────────────────────┐    │
│  │  External Services                                                │    │
│  │  ├── Brevo API (emails)                                         │    │
│  │  ├── HubSpot (CRM sync)                                         │    │
│  │  └── WhatsApp (status notifications)                            │    │
│  └─────────────────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## 13. File Reference

### Critical Files

| File | Purpose |
|------|---------|
| `lib/api-spec/openapi.yaml` | API contract (source of truth) |
| `lib/api-spec/orval.config.ts` | Code generation config |
| `lib/db/src/schema/orders.ts` | Database schema |
| `artifacts/api-server/src/app.ts` | Hono app factory |
| `artifacts/api-server/src/routes/` | All API endpoints |
| `artifacts/api-server/src/lib/email.ts` | Email templates & sending |
| `artifacts/matiyane-gas/src/App.tsx` | Frontend routing & providers |
| `artifacts/matiyane-gas/src/pages/` | All page components |
| `artifacts/matiyane-gas/src/index.css` | Custom animations & Tailwind config |
| `vercel.json` | Deployment configuration |
| `artifacts/api-server/build.mjs` | esbuild bundler |
| `artifacts/matiyane-gas/vite.config.ts` | Vite configuration |
