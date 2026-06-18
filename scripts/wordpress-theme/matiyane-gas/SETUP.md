# Matiyane Gas Distributors — WordPress Theme Setup Guide

## Requirements
- WordPress 6.0 or higher
- PHP 8.0 or higher
- MySQL 5.7 or higher

---

## Step 1: Install the Theme

1. In your WordPress admin, go to **Appearance → Themes → Add New**
2. Click **Upload Theme**
3. Upload the `matiyane-gas.zip` file
4. Click **Activate**

---

## Step 2: Add Constants to wp-config.php

Open `wp-config.php` on your server and add these lines **before** the line that says `/* That's all, stop editing! */`:

```php
// Brevo Email (recommended — free 300 emails/day)
define( 'BREVO_API_KEY',      'your-brevo-api-key' );
define( 'MGD_SENDER_EMAIL',   'noreply@matiyanegas.co.za' );

// PayFast
define( 'PAYFAST_MERCHANT_ID',  'YOUR_MERCHANT_ID' );
define( 'PAYFAST_MERCHANT_KEY', 'YOUR_MERCHANT_KEY' );
define( 'PAYFAST_SANDBOX',      false );  // true for testing

// Paystack
define( 'PAYSTACK_PUBLIC_KEY', 'pk_live_xxxx' );
define( 'PAYSTACK_SECRET_KEY', 'sk_live_xxxx' );
```

---

## Step 3: Create WordPress Pages

Create the following pages in **WordPress Admin → Pages → Add New**:

| Page Title       | Slug            | Template             |
|-----------------|-----------------|----------------------|
| Home            | (front page)    | Front Page           |
| About Us        | `about`         | Page: About          |
| Products        | `products`      | Page: Products       |
| Order Gas       | `order-gas`     | Page: Order Gas      |
| Order Success   | `order-success` | Page: Order Success  |
| Contact Us      | `contact`       | Page: Contact        |

**Set the Homepage:**
1. Go to **Settings → Reading**
2. Set "Your homepage displays" to "A static page"
3. Select "Home" as the Homepage

**Set Permalink Structure:**
1. Go to **Settings → Permalinks**
2. Select "Post name" (`/sample-post/`)
3. Click Save Changes

---

## Step 4: Set Up Brevo (Email)

1. Register at [brevo.com](https://brevo.com) (free)
2. Go to **Settings → API Keys** → Create a new API key
3. Go to **Senders, Domains & Dedicated IPs** → Add your domain/email
4. Verify the sender email address
5. Add `BREVO_API_KEY` and `MGD_SENDER_EMAIL` to wp-config.php

---

## Step 5: Set Up PayFast

1. Register at [payfast.co.za](https://payfast.co.za)
2. Go to **Settings → Merchant Details**
3. Copy your Merchant ID and Merchant Key
4. Add to wp-config.php with `PAYFAST_SANDBOX = false` for production
5. In PayFast dashboard, set your Return URL, Cancel URL, and Notify URL:
   - Return URL: `https://yourdomain.co.za/order-success/`
   - Notify URL: `https://yourdomain.co.za/wp-json/mgd/v1/payfast-notify`

---

## Step 6: Set Up Paystack

1. Register at [paystack.com](https://paystack.com)
2. Go to **Settings → API Keys & Webhooks**
3. Copy your Live Public Key and Live Secret Key
4. Add webhook: `https://yourdomain.co.za/wp-json/mgd/v1/paystack-webhook`
5. Add keys to wp-config.php

---

## Admin Features

After activating the theme, two new menu items appear in your WordPress admin:

- **Gas Orders** — view all orders, filter by status, update order status
- **Messages** — view all contact form submissions

---

## Frequently Asked Questions

**Q: The database tables weren't created.**
A: Deactivate and reactivate the theme — the activation hook creates them. Or visit any page to trigger the auto-creation.

**Q: Emails are not being sent.**
A: Check that `BREVO_API_KEY` is correct and the sender email is verified in Brevo. Test with a real order.

**Q: PayFast redirects to sandbox.**
A: Set `PAYFAST_SANDBOX` to `false` in wp-config.php and use your real Merchant ID/Key.

**Q: Can I change the product prices?**
A: Edit the `mgd_get_products()` function in `functions.php`.

---

## File Structure

```
matiyane-gas/
├── style.css              — Theme stylesheet + declaration
├── functions.php          — Theme setup, DB, form handlers, email
├── header.php             — Site header and navigation
├── footer.php             — Site footer and WhatsApp button
├── index.php              — Default template
├── front-page.php         — Home page
├── page-about.php         — About Us page
├── page-products.php      — Products catalogue
├── page-order-gas.php     — Order form
├── page-order-success.php — Order confirmation + payment
├── page-contact.php       — Contact page + form
├── 404.php                — 404 error page
├── wp-config-sample.php   — Config constants to copy to wp-config.php
├── SETUP.md               — This file
└── assets/
    └── js/
        └── main.js        — Interactivity (nav, carousel, particle, order)
```
