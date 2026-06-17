# Matiyane Gas — Deployment & WordPress Guide

## Important: About WordPress Export

The Matiyane Gas website is a **React application** (not a PHP/WordPress site). React apps cannot be directly exported to WordPress — they are fundamentally different technologies. However, you have several practical options depending on your goal.

---

## Option 1: Deploy the React App (Recommended)

This keeps all features intact: live orders, PayFast/Paystack payments, admin dashboard, HubSpot sync, and automated emails.

### Deploy on Replit (Easiest)
1. In Replit, click the **Deploy** button in the top right
2. Select **Reserved VM** or **Autoscale**
3. Your site will be live at `your-project-name.replit.app` or a custom domain
4. Set these environment variables in the Replit Secrets panel:

```
DATABASE_URL         = (auto-set by Replit PostgreSQL)
ADMIN_PASSWORD       = your-secure-admin-password
PAYFAST_MERCHANT_ID  = your-payfast-merchant-id
PAYFAST_MERCHANT_KEY = your-payfast-merchant-key
PAYFAST_SANDBOX      = false
PAYSTACK_PUBLIC_KEY  = pk_live_xxxxxxxxxxxx
PAYSTACK_SECRET_KEY  = sk_live_xxxxxxxxxxxx
SMTP_HOST            = smtp.gmail.com
SMTP_USER            = your@gmail.com
SMTP_PASS            = your-app-password
SMTP_PORT            = 587
ADMIN_EMAIL          = admin@matiyanegas.co.za
HUBSPOT_API_KEY      = your-hubspot-private-app-token
SESSION_SECRET       = a-long-random-secret-string
```

### Deploy on Railway
1. Push the code to GitHub
2. Go to [railway.app](https://railway.app) → New Project → Deploy from GitHub
3. Add a PostgreSQL plugin
4. Set the environment variables above
5. Railway auto-detects and builds the app

### Deploy on a VPS (Ubuntu)
```bash
# Install Node.js 20+
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs

# Clone your repo
git clone https://github.com/your-repo/matiyane-gas.git
cd matiyane-gas

# Install pnpm
npm install -g pnpm

# Install dependencies
pnpm install

# Build
pnpm run build

# Set environment variables in .env file
cp .env.example .env  # edit with your values

# Start with PM2
npm install -g pm2
pm2 start "node artifacts/api-server/dist/index.js" --name api-server
pm2 start "npx serve artifacts/matiyane-gas/dist -p 3000" --name frontend
pm2 save

# Set up Nginx reverse proxy
sudo apt install nginx
```

Nginx config (`/etc/nginx/sites-available/matiyanegas`):
```nginx
server {
    listen 80;
    server_name matiyanegas.co.za www.matiyanegas.co.za;

    location /api {
        proxy_pass http://localhost:8080;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }

    location / {
        proxy_pass http://localhost:3000;
        proxy_set_header Host $host;
    }
}
```

Then get an SSL certificate:
```bash
sudo apt install certbot python3-certbot-nginx
sudo certbot --nginx -d matiyanegas.co.za -d www.matiyanegas.co.za
```

---

## Option 2: Add Order Form to WordPress (Iframe Embed)

If you already have a WordPress site and just want to embed the order form:

1. Deploy the React app as above (Option 1)
2. In WordPress, create a new page called "Order Gas"
3. Add an HTML block with:

```html
<iframe
  src="https://your-react-app-url/order"
  width="100%"
  height="900"
  frameborder="0"
  style="border: none; border-radius: 12px;"
  title="Order Gas"
></iframe>
```

This embeds the full order form with PayFast/Paystack support inside your WordPress page.

---

## Option 3: Recreate in WordPress (Full Rebuild)

If you need a 100% native WordPress site, you would need to:

1. **Theme**: Use Elementor or Divi to recreate the design
2. **Order Form**: Use WooCommerce + a custom product for gas refills
3. **Payments**: Install WooCommerce PayFast plugin + WooCommerce Paystack plugin
4. **Contact Form**: Use Contact Form 7 or WPForms
5. **Database**: WooCommerce handles order storage
6. **Emails**: Use WooCommerce email templates or WP Mail SMTP
7. **HubSpot**: Install HubSpot for WordPress plugin (free, official)
8. **Admin**: WooCommerce admin dashboard replaces the custom admin

**Recommended WordPress plugins:**
- WooCommerce (orders, payments)
- WooCommerce PayFast Payment Gateway
- Paystack WooCommerce Payment Gateway
- HubSpot for WordPress
- WP Mail SMTP
- Yoast SEO

**Note:** This option requires significant manual work to recreate all the custom features and design.

---

## Admin Dashboard Access

The custom admin dashboard (built into this app) is at:
```
https://your-domain.co.za/admin
```

Default password: `matiyane2024admin` (change via `ADMIN_PASSWORD` env var before going live)

Features:
- Revenue statistics (total orders, pending, paid)
- Order list with status management (Pending → Confirmed → Out for Delivery → Delivered → Paid)
- Contact message inbox
- Filter orders by status

---

## HubSpot Setup

1. Go to [HubSpot](https://app.hubspot.com) → Settings → Integrations → Private Apps
2. Create a Private App with scopes:
   - `crm.objects.contacts.write`
   - `crm.objects.contacts.read`
   - `crm.objects.deals.write`
   - `crm.associations.write`
   - `crm.objects.notes.write`
3. Copy the Private App Token
4. Add it to your environment as `HUBSPOT_API_KEY`

Every new order creates a HubSpot contact + deal. Every contact form message creates a HubSpot contact + note.

---

## PayFast Production Setup

1. Register at [payfast.co.za](https://www.payfast.co.za)
2. Go to Settings → Integration → Merchant Details
3. Copy your **Merchant ID** and **Merchant Key**
4. Set `PAYFAST_MERCHANT_ID`, `PAYFAST_MERCHANT_KEY`, `PAYFAST_SANDBOX=false`

## Paystack Production Setup

1. Register at [paystack.com](https://paystack.com)
2. Go to Settings → API Keys & Webhooks
3. Copy the **Live Public Key** and **Live Secret Key**
4. Set `PAYSTACK_PUBLIC_KEY` (live key), `PAYSTACK_SECRET_KEY`
5. Add webhook URL in Paystack dashboard: `https://your-domain.co.za/api/paystack/webhook`
