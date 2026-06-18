<?php get_header(); ?>

<?php
global $wpdb;
$order_id  = intval($_GET['order_id'] ?? 0);
$order_ref = sanitize_text_field($_GET['order_ref'] ?? '');
$order     = $order_id ? $wpdb->get_row($wpdb->prepare("SELECT * FROM {$wpdb->prefix}mgd_orders WHERE id = %d AND order_ref = %s", $order_id, $order_ref)) : null;

if (!$order) {
    wp_redirect(home_url('/order-gas/'));
    exit;
}

$items    = json_decode($order->items, true);
$total    = floatval($order->total_amount);
$pf_url   = mgd_payfast_url();
$pf_id    = mgd_payfast_merchant_id();
$pf_key   = mgd_payfast_merchant_key();
$name_parts = explode(' ', $order->full_name, 2);
?>

<main>
<section class="section" style="min-height:80vh;display:flex;align-items:center;">
<div class="container" style="max-width:720px;">
    <div class="card" style="padding:3rem;text-align:center;">
        <div style="width:80px;height:80px;background:#f0fdf4;border-radius:50%;display:flex;align-items:center;justify-content:center;margin:0 auto 1.5rem;font-size:2.5rem;">✅</div>
        <h1 style="color:var(--success);margin-bottom:0.5rem;">Order Placed!</h1>
        <p class="text-muted">A confirmation has been sent to <strong><?php echo esc_html($order->email); ?></strong></p>

        <div style="background:var(--surface);border-radius:var(--radius);padding:1.5rem;margin:2rem 0;text-align:left;">
            <p style="font-size:0.875rem;color:var(--muted);">Your Order Reference</p>
            <p style="font-size:2rem;font-weight:900;color:var(--secondary);"><?php echo esc_html($order->order_ref); ?></p>
        </div>

        <div style="text-align:left;margin-bottom:2rem;">
            <h3 class="mb-2">Order Summary</h3>
            <?php foreach ($items as $item): ?>
            <div style="display:flex;justify-content:space-between;padding:0.6rem 0;border-bottom:1px solid var(--border);font-size:0.9rem;">
                <span><?php echo esc_html($item['productName']); ?> ×<?php echo $item['quantity']; ?></span>
                <strong>R<?php echo number_format($item['subtotal'], 2); ?></strong>
            </div>
            <?php endforeach; ?>
            <div style="display:flex;justify-content:space-between;padding-top:0.75rem;font-size:1.15rem;font-weight:900;color:var(--primary);">
                <span>Total</span>
                <span>R<?php echo number_format($total, 2); ?></span>
            </div>
        </div>

        <!-- Payment Options -->
        <div style="background:var(--surface);border-radius:var(--radius);padding:2rem;margin-bottom:1.5rem;text-align:left;">
            <h3 class="mb-3 text-center">Choose Payment Method</h3>
            <div style="display:flex;gap:0.75rem;margin-bottom:1.5rem;">
                <button class="btn" id="btnPayFast" onclick="showGateway('payfast')" style="flex:1;background:rgba(0,83,155,0.1);color:#00539b;border:2px solid #00539b;">PayFast</button>
                <button class="btn" id="btnPaystack" onclick="showGateway('paystack')" style="flex:1;background:transparent;border:2px solid var(--border);color:var(--muted);">Paystack</button>
            </div>

            <!-- PayFast Form -->
            <div id="gatewayPayfast">
                <form action="<?php echo esc_url($pf_url); ?>" method="POST">
                    <input type="hidden" name="merchant_id" value="<?php echo esc_attr($pf_id); ?>">
                    <input type="hidden" name="merchant_key" value="<?php echo esc_attr($pf_key); ?>">
                    <input type="hidden" name="return_url" value="<?php echo esc_url(home_url('/order-success/?paid=1')); ?>">
                    <input type="hidden" name="cancel_url" value="<?php echo esc_url(home_url('/order-gas/')); ?>">
                    <input type="hidden" name="notify_url" value="<?php echo esc_url(home_url('/wp-json/mgd/v1/payfast-notify')); ?>">
                    <input type="hidden" name="name_first" value="<?php echo esc_attr($name_parts[0]); ?>">
                    <input type="hidden" name="name_last" value="<?php echo esc_attr($name_parts[1] ?? ''); ?>">
                    <input type="hidden" name="email_address" value="<?php echo esc_attr($order->email); ?>">
                    <input type="hidden" name="m_payment_id" value="<?php echo esc_attr($order->order_ref); ?>">
                    <input type="hidden" name="amount" value="<?php echo number_format($total, 2, '.', ''); ?>">
                    <input type="hidden" name="item_name" value="Matiyane Gas Order <?php echo esc_attr($order->order_ref); ?>">
                    <button type="submit" class="btn btn-full btn-lg" style="background:#00539b;color:white;border-radius:50px;">💳 Pay with PayFast — R<?php echo number_format($total, 2); ?></button>
                </form>
            </div>

            <!-- Paystack -->
            <div id="gatewayPaystack" style="display:none;">
                <button type="button" id="paystackBtn" class="btn btn-primary btn-full btn-lg" onclick="payWithPaystack()">💳 Pay with Paystack — R<?php echo number_format($total, 2); ?></button>
            </div>
        </div>

        <div class="alert alert-warning">
            <strong>What happens next?</strong> Complete payment above, or our team will contact you at <?php echo esc_html($order->phone); ?> to arrange delivery.
        </div>
    </div>
</div>
</section>
</main>

<script>
var paystackPublicKey = '<?php echo defined("PAYSTACK_PUBLIC_KEY") ? PAYSTACK_PUBLIC_KEY : "pk_test_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"; ?>';
var orderEmail = '<?php echo esc_js($order->email); ?>';
var orderRef   = '<?php echo esc_js($order->order_ref); ?>';
var orderAmount = <?php echo intval($total * 100); ?>;

function showGateway(type) {
    document.getElementById('gatewayPayfast').style.display  = type === 'payfast'  ? '' : 'none';
    document.getElementById('gatewayPaystack').style.display = type === 'paystack' ? '' : 'none';
    document.getElementById('btnPayFast').style.background   = type === 'payfast'  ? 'rgba(0,83,155,0.1)' : 'transparent';
    document.getElementById('btnPayFast').style.borderColor  = type === 'payfast'  ? '#00539b' : '#e5e7eb';
    document.getElementById('btnPayFast').style.color        = type === 'payfast'  ? '#00539b' : '#6b7280';
    document.getElementById('btnPaystack').style.background  = type === 'paystack' ? 'rgba(26,47,94,0.1)' : 'transparent';
    document.getElementById('btnPaystack').style.borderColor = type === 'paystack' ? '#1a2f5e' : '#e5e7eb';
    document.getElementById('btnPaystack').style.color       = type === 'paystack' ? '#1a2f5e' : '#6b7280';
}

function payWithPaystack() {
    var btn = document.getElementById('paystackBtn');
    btn.textContent = 'Connecting...';
    btn.disabled = true;
    var s = document.createElement('script');
    s.src = 'https://js.paystack.co/v1/inline.js';
    s.onload = function() {
        var handler = PaystackPop.setup({
            key: paystackPublicKey,
            email: orderEmail,
            amount: orderAmount,
            currency: 'ZAR',
            ref: orderRef,
            callback: function() { window.location.href = window.location.href + '&paid=1'; },
            onClose: function() { btn.textContent = '💳 Pay with Paystack — R<?php echo number_format($total, 2); ?>'; btn.disabled = false; }
        });
        handler.openIframe();
    };
    s.onerror = function() { btn.disabled = false; btn.textContent = '💳 Pay with Paystack'; };
    document.head.appendChild(s);
}
</script>

<?php get_footer(); ?>
