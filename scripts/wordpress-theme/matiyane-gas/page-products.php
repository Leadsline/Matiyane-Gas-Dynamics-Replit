<?php get_header(); ?>

<main>
<section class="page-hero" style="background:linear-gradient(135deg,#1a2f5e 0%,#243e7a 100%);">
    <div class="container">
        <span class="section-eyebrow">Our Products</span>
        <h1>Gas Refill Catalogue</h1>
        <p>Four sizes to suit every need. All cylinders are certified, safe, and ready for delivery.</p>
    </div>
</section>

<!-- Products -->
<section class="section">
    <div class="container">
        <div class="grid-4">
            <?php
            $products = mgd_get_products();
            $colors  = ['blue','amber','green','purple'];
            $icons   = ['💙','⭐','🌿','💜'];
            $use_cases = [
                ['Small apartments','Camping & braais','Backup supply','Single-person households'],
                ['Family of 2-4','Everyday cooking','Most popular choice','Suburban homes'],
                ['Large families','Small restaurants','Schools & offices','Extended use'],
                ['Restaurants & hotels','Industrial kitchens','Farms & commercial','High-volume operations'],
            ];
            foreach ($products as $i => $p):
            ?>
            <div class="product-card">
                <div class="product-card-header <?php echo $colors[$i]; ?>">
                    <div class="product-icon">🔥</div>
                    <div class="product-size"><?php echo esc_html($p['unit']); ?></div>
                    <div class="product-name"><?php echo esc_html($p['name']); ?></div>
                    <div class="product-price mt-1">R<?php echo number_format($p['price']); ?></div>
                </div>
                <div class="product-card-body">
                    <p class="product-desc mb-2"><?php echo esc_html($p['description']); ?></p>
                    <ul class="product-uses">
                        <?php foreach ($use_cases[$i] as $u): ?>
                        <li><?php echo esc_html($u); ?></li>
                        <?php endforeach; ?>
                    </ul>
                    <a href="<?php echo esc_url(add_query_arg('product', $p['id'], home_url('/order-gas/'))); ?>" class="btn btn-primary btn-full mt-2">Order This Size</a>
                </div>
            </div>
            <?php endforeach; ?>
        </div>
    </div>
</section>

<!-- Delivery Info -->
<section class="section section--gray">
    <div class="container">
        <div class="grid-3">
            <div class="card" style="border-left:4px solid var(--success);">
                <div class="feature-icon" style="background:rgba(22,163,74,0.1);">🚚</div>
                <h3>Free Delivery — Kempton Park</h3>
                <p class="mt-1">Free delivery within Kempton Park, Glen Marais, Birchleigh, Norkem and surrounding areas. No minimum order required.</p>
            </div>
            <div class="card" style="border-left:4px solid var(--secondary);">
                <div class="feature-icon" style="background:rgba(240,192,64,0.1);">📍</div>
                <h3>Other Areas</h3>
                <p class="mt-1">We also deliver to surrounding towns. A delivery fee may apply — our team will confirm the fee before processing your order.</p>
            </div>
            <div class="card" style="border-left:4px solid var(--primary);">
                <div class="feature-icon" style="background:rgba(26,47,94,0.1);">🕐</div>
                <h3>Same-Day Delivery</h3>
                <p class="mt-1">Orders placed before 12:00 noon qualify for same-day delivery in Kempton Park. Weekend deliveries available.</p>
            </div>
        </div>
    </div>
</section>

<section class="section section--primary">
    <div class="container text-center">
        <h2 style="color:white;">Not Sure Which Size to Choose?</h2>
        <p style="color:rgba(255,255,255,0.7);max-width:500px;margin:1rem auto 2rem;">Contact us and we'll help you find the perfect gas cylinder for your needs.</p>
        <div style="display:flex;gap:1rem;justify-content:center;flex-wrap:wrap;">
            <a href="<?php echo esc_url(home_url('/order-gas/')); ?>" class="btn btn-secondary btn-lg">Order Online</a>
            <a href="tel:0767488597" class="btn btn-outline btn-lg">Call Us Now</a>
        </div>
    </div>
</section>
</main>

<?php get_footer(); ?>
