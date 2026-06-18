<?php get_header(); ?>

<?php
$products = mgd_get_products();
$order_error = isset($_GET['order_error']);
?>

<main>
<section style="background:var(--primary);color:white;padding:8rem 0 4rem;">
    <div class="container">
        <span class="section-eyebrow">Order Gas</span>
        <h1 style="color:white;">Place Your Order</h1>
        <p style="color:rgba(255,255,255,0.7);">Select your products and fill in your details. We'll deliver to your door.</p>
    </div>
</section>

<section class="section section--gray">
<div class="container">
    <?php if ($order_error): ?>
    <div class="alert alert-error mb-4">⚠️ Please select at least one product and fill in all required fields.</div>
    <?php endif; ?>

    <form method="post" action="<?php echo esc_url(admin_url('admin-post.php')); ?>" id="orderForm">
        <?php wp_nonce_field('mgd_place_order', 'mgd_order_nonce'); ?>
        <input type="hidden" name="action" value="mgd_place_order">

        <div style="display:grid;grid-template-columns:2fr 1fr;gap:2rem;align-items:start;">
            <div>
                <!-- Product Selection -->
                <div class="card mb-4">
                    <h2 class="mb-2">🛒 Select Products</h2>
                    <p class="text-muted mb-4" style="font-size:0.9rem;">Choose the sizes and quantities you need.</p>
                    <?php foreach ($products as $p): ?>
                    <div class="order-product-row" id="row_<?php echo $p['id']; ?>">
                        <div style="flex:1;">
                            <div style="font-weight:800;color:var(--primary);"><?php echo esc_html($p['name']); ?></div>
                            <div style="color:var(--secondary);font-weight:700;font-size:0.9rem;">R<?php echo number_format($p['price']); ?> each</div>
                        </div>
                        <div class="qty-control">
                            <button type="button" class="qty-btn minus" data-id="<?php echo $p['id']; ?>" data-price="<?php echo $p['price']; ?>">−</button>
                            <span class="qty-display" id="qty_display_<?php echo $p['id']; ?>">0</span>
                            <input type="hidden" name="qty_<?php echo $p['id']; ?>" id="qty_<?php echo $p['id']; ?>" value="0">
                            <button type="button" class="qty-btn plus" data-id="<?php echo $p['id']; ?>" data-price="<?php echo $p['price']; ?>">+</button>
                        </div>
                        <div style="margin-left:1rem;min-width:70px;text-align:right;" id="subtotal_<?php echo $p['id']; ?>" class="fw-black text-primary"></div>
                    </div>
                    <?php endforeach; ?>
                </div>

                <!-- Customer Details -->
                <div class="card">
                    <h2 class="mb-4">Your Details</h2>
                    <div class="form-grid-2">
                        <div class="form-group">
                            <label class="form-label" for="full_name">Full Name *</label>
                            <input class="form-input" type="text" id="full_name" name="full_name" placeholder="e.g. John Dlamini" required value="<?php echo esc_attr($_POST['full_name'] ?? ''); ?>">
                        </div>
                        <div class="form-group">
                            <label class="form-label" for="phone">Phone Number *</label>
                            <input class="form-input" type="tel" id="phone" name="phone" placeholder="e.g. 076 748 8597" required value="<?php echo esc_attr($_POST['phone'] ?? ''); ?>">
                        </div>
                    </div>
                    <div class="form-group">
                        <label class="form-label" for="email">Email Address *</label>
                        <input class="form-input" type="email" id="email" name="email" placeholder="e.g. john@example.com" required value="<?php echo esc_attr($_POST['email'] ?? ''); ?>">
                    </div>
                    <div class="form-group">
                        <label class="form-label" for="delivery_address">Delivery Address *</label>
                        <input class="form-input" type="text" id="delivery_address" name="delivery_address" placeholder="e.g. 12 Main Street" required value="<?php echo esc_attr($_POST['delivery_address'] ?? ''); ?>">
                    </div>
                    <div class="form-grid-2">
                        <div class="form-group">
                            <label class="form-label" for="suburb">Suburb *</label>
                            <input class="form-input" type="text" id="suburb" name="suburb" placeholder="e.g. Kempton Park" required value="<?php echo esc_attr($_POST['suburb'] ?? ''); ?>">
                            <div id="deliveryNote" style="font-size:0.8rem;margin-top:0.3rem;font-weight:600;"></div>
                        </div>
                        <div class="form-group">
                            <label class="form-label" for="special_instructions">Special Instructions</label>
                            <input class="form-input" type="text" id="special_instructions" name="special_instructions" placeholder="e.g. Ring doorbell" value="<?php echo esc_attr($_POST['special_instructions'] ?? ''); ?>">
                        </div>
                    </div>
                </div>
            </div>

            <!-- Order Summary Sidebar -->
            <div class="order-sidebar">
                <h2 class="mb-4">Order Summary</h2>
                <div id="summaryItems" style="margin-bottom:1.5rem;min-height:4rem;">
                    <p class="text-muted" style="text-align:center;padding:2rem 0;font-size:0.9rem;">🛒 No items selected</p>
                </div>
                <div style="border-top:1px solid var(--border);padding-top:1rem;">
                    <div class="order-summary-item">
                        <span>Products</span><span id="productsTotal" class="fw-bold">R0</span>
                    </div>
                    <div class="order-summary-item">
                        <span>🚚 Delivery</span><span id="deliveryDisplay" style="color:var(--success);font-weight:700;">TBC</span>
                    </div>
                    <div class="order-total-row">
                        <span>Total</span><span id="grandTotal">R0</span>
                    </div>
                </div>
                <button type="submit" class="btn btn-secondary btn-lg btn-full mt-4" id="submitBtn">
                    Place Order →
                </button>
                <div class="alert alert-success mt-2" style="font-size:0.8rem;">
                    ✅ After placing, choose PayFast or Paystack to pay securely.
                </div>
            </div>
        </div>
    </form>
</div>
</section>
</main>

<?php get_footer(); ?>
