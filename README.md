# Matiyane Gas Distributors

A professional business website for Matiyane Gas Distributors — a South African LPG gas supplier based in Kempton Park. Customers browse products, place orders, pay via PayFast, and contact the business. Admin gets a full dashboard with live analytics, order management, and WhatsApp notifications.

---

## Deploy on Vercel

### 1. Connect GitHub

Push this repo to GitHub and connect it in [Vercel Dashboard](https://vercel.com).

### 2. Set Framework Preset

In the Vercel project settings:
- **Framework Preset**: `Other` (no framework preset)
- **Build Command**: leave blank (uses `package.json` `build` script)
- **Output Directory**: `artifacts/matiyane-gas/dist/public`
- **Node.js Version**: `20.x` (see `package.json` `engines` field)

### 3. Add Environment Variables

| Variable | Required | Description |
|---|---|---|
| `DATABASE_URL` | **Yes** | PostgreSQL connection string (e.g. from Supabase or Neon) |
| `ADMIN_PASSWORD` | **Yes** | Password to log into the admin dashboard |
| `PAYFAST_MERCHANT_ID` | Yes (prod) | From PayFast merchant account |
| `PAYFAST_MERCHANT_KEY` | Yes (prod) | From PayFast merchant account |
| `PAYFAST_SANDBOX` | No | `false` for production payments |
| `SMTP_HOST` | No | For email notifications |
| `SMTP_USER` | No | SMTP username |
| `SMTP_PASS` | No | SMTP password |
| `SMTP_PORT` | No | Default `587` |
| `ADMIN_EMAIL` | No | Email for admin order notifications |
| `WHATSAPP_API_TOKEN` | No | Meta WhatsApp Business token |
| `WHATSAPP_PHONE_NUMBER_ID` | No | Meta WhatsApp phone number ID |

### 4. Push to GitHub and Deploy

Vercel auto-deploys on every push. Your site will be live at `https://your-project.vercel.app`.

---

## Deploy on Any VPS (cloud.co.za, Hetzner, etc.)

### Requirements

- Node.js 20+
- PostgreSQL 14+
- nginx (reverse proxy)
- PM2 (process manager)

### Setup

```bash
# 1. Build locally
pnpm run build

# 2. Upload to server
# Copy artifacts/api-server/dist/ and artifacts/matiyane-gas/dist/public/

# 3. On server
npm install -g pm2
export DATABASE_URL="postgres://user:pass@localhost:5432/matiyane"
export ADMIN_PASSWORD="your-secure-password"
export PORT=3001
pm2 start artifacts/api-server/dist/index.mjs --name matiyane-api
pm2 save && pm2 startup

# 4. nginx config
# Proxy /api/* to localhost:3001
# Serve static files from dist/public
# SPA fallback: all routes to index.html

# 5. SSL
sudo certbot --nginx -d yourdomain.co.za
```

---

## Deploy on Cloudflare Pages

1. Connect the GitHub repo in [Cloudflare Dashboard](https://dash.cloudflare.com)
2. Set build command: `pnpm run build`
3. Set output directory: `artifacts/matiyane-gas/dist/public`
4. Set `DATABASE_URL` as a Cloudflare Pages secret (for the Workers API)
5. Use a Neon PostgreSQL database (or any database with HTTP/SSL access)

---

## Project Structure

```
.
├── artifacts/
│   ├── matiyane-gas/      # React + Vite frontend
│   ├── api-server/        # Hono API backend
│   └── mockup-sandbox/    # Canvas component previews
├── lib/
│   ├── api-spec/          # OpenAPI spec & code generation
│   ├── api-client-react/  # Generated React Query hooks
│   ├── api-zod/           # Generated Zod schemas
│   └── db/                # Drizzle ORM schema + DB connection
├── api/
│   └── index.mjs          # Vercel serverless function (pre-built)
├── vercel.json            # Vercel deployment config
├── wrangler.toml          # Cloudflare Workers config
└── package.json
```

---

## Key Features

- **Home** — particle hero, product grid, testimonials, order CTA
- **Products** — full catalogue with 4 LPG gas sizes
- **Order Gas** — quantity selectors, order summary, PayFast payment
- **Track Order** — real-time order status lookup by `MGD-XXXXX-XXXX`
- **Contact Us** — contact form (saves to DB + email), Google Maps
- **Admin Dashboard** — stats, orders, messages, analytics charts
- **WhatsApp Notifications** — auto-message customers on status changes

---

## Tech Stack

- pnpm workspaces, Node.js 20+, TypeScript 5.9
- Frontend: React + Vite, Tailwind CSS, shadcn/ui, wouter
- API: Hono (Node.js serverless + Workers compatible)
- DB: PostgreSQL + Drizzle ORM
- Validation: Zod v4
- Payments: PayFast (redirect-based)
- Charts: Recharts
- Icons: Lucide

---

## Development

```bash
# Run all workflows
pnpm --filter @workspace/api-server run dev
pnpm --filter @workspace/matiyane-gas run dev

# Typecheck
pnpm run typecheck

# Build everything
pnpm run build

# DB changes
pnpm --filter @workspace/db run push

# API changes
pnpm --filter @workspace/api-spec run codegen
```

---

## License

MIT
