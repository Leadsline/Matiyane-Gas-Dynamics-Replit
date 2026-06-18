<?php
/**
 * Matiyane Gas — WordPress Configuration Sample
 *
 * Add these constants to your wp-config.php file BEFORE the "That's all" comment.
 * Copy the relevant lines to your actual wp-config.php.
 */

// ── Brevo Email (Recommended) ─────────────────────────────────────────────────
// Register at https://brevo.com — free plan includes 300 emails/day
define( 'BREVO_API_KEY',      'your-brevo-api-key-here' );
define( 'MGD_SENDER_EMAIL',   'noreply@matiyanegas.co.za' );  // must be verified in Brevo

// ── PayFast Payment Gateway ───────────────────────────────────────────────────
// Get from https://www.payfast.co.za → Merchant Details
define( 'PAYFAST_MERCHANT_ID',  '10000100' );          // Replace with your Merchant ID
define( 'PAYFAST_MERCHANT_KEY', '46f0cd694581a' );    // Replace with your Merchant Key
define( 'PAYFAST_SANDBOX',      true );                 // Set to false in production!

// ── Paystack Payment Gateway ──────────────────────────────────────────────────
// Get from https://paystack.com → API Keys & Webhooks
define( 'PAYSTACK_PUBLIC_KEY', 'pk_test_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx' ); // Live: pk_live_...
define( 'PAYSTACK_SECRET_KEY', 'sk_test_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx' ); // Live: sk_live_...

// ── Admin Email ───────────────────────────────────────────────────────────────
// Email address that receives order and contact notifications
// (defaults to WordPress admin email if not set)
// define( 'MGD_ADMIN_EMAIL', 'admin@matiyanegas.co.za' );
