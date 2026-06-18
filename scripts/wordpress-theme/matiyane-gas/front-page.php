<?php get_header(); ?>

<main>
<!-- ── HERO ─────────────────────────────────────────────────── -->
<section class="home-hero">
    <canvas id="particleCanvas"></canvas>
    <div class="container">
        <div class="hero-content">
            <div class="hero-tagline">🔥 Kempton Park's #1 Gas Supplier</div>
            <h1 class="hero-title">
                Gas Delivered<br><span>To Your Door</span>
            </h1>
            <p class="hero-sub">Safe, certified LPG gas refills for homes and businesses. Free delivery in Kempton Park and surrounding areas.</p>
            <div class="hero-actions">
                <a href="<?php echo esc_url(home_url('/order-gas/')); ?>" class="btn btn-secondary btn-lg">Order Gas Now</a>
                <a href="<?php echo esc_url(home_url('/products/')); ?>" class="btn btn-outline btn-lg">View Products</a>
            </div>
            <div class="hero-carousel" id="heroCarousel">
                Safe &amp; Certified Gas Supply
            </div>
        </div>
    </div>
</section>

<!-- ── PRODUCTS SNAPSHOT ─────────────────────────────────────── -->
<section class="section">
    <div class="container">
        <div class="text-center mb-4">
            <span class="section-eyebrow">Our Products</span>
            <h2>Choose Your Gas Size</h2>
            <p style="max-width:560px;margin:0.75rem auto 2.5rem;">From small households to large commercial kitchens — we have the right size at the right price.</p>
        </div>
        <div class="grid-4">
            <?php
            $products = mgd_get_products();
            $colors = ['blue','amber','green','purple'];
            $icons = ['🔵','🟡','🟢','🟣'];
            foreach ($products as $i => $p):
            ?>
            <div class="product-card">
                <div class="product-card-header <?php echo $colors[$i]; ?>">
                    <div class="product-icon"><?php echo $icons[$i]; ?>🔥</div>
                    <div class="product-size"><?php echo esc_html($p['unit']); ?></div>
                    <div class="product-name"><?php echo esc_html($p['name']); ?></div>
                </div>
                <div class="product-card-body">
                    <div class="product-price">R<?php echo number_format($p['price']); ?></div>
                    <p class="product-desc"><?php echo esc_html($p['description']); ?></p>
                    <div class="mt-3">
                        <a href="<?php echo esc_url(add_query_arg('product', $p['id'], home_url('/order-gas/'))); ?>" class="btn btn-primary btn-full">Order Now</a>
                    </div>
                </div>
            </div>
            <?php endforeach; ?>
        </div>
    </div>
</section>

<!-- ── FEATURES ──────────────────────────────────────────────── -->
<section class="section section--gray">
    <div class="container">
        <div class="text-center mb-4">
            <span class="section-eyebrow">Why Choose Us</span>
            <h2>Safety. Reliability. Value.</h2>
        </div>
        <div class="grid-4">
            <?php
            $features = [
                ['icon'=>'🛡️','title'=>'Safety Certified','desc'=>'All cylinders inspected and pressure-tested to the highest safety standards.'],
                ['icon'=>'🚚','title'=>'Fast Delivery','desc'=>'Free delivery in Kempton Park. Same-day service when ordered before noon.'],
                ['icon'=>'🕐','title'=>'7 Days a Week','desc'=>'We are available every day of the week, including weekends and holidays.'],
                ['icon'=>'💰','title'=>'Best Prices','desc'=>'Honest, competitive pricing with no hidden fees. Quality gas at fair prices.'],
            ];
            foreach ($features as $f):
            ?>
            <div class="card">
                <div class="feature-icon"><?php echo $f['icon']; ?></div>
                <h3><?php echo esc_html($f['title']); ?></h3>
                <p class="mt-1"><?php echo esc_html($f['desc']); ?></p>
            </div>
            <?php endforeach; ?>
        </div>
    </div>
</section>

<!-- ── TESTIMONIALS ───────────────────────────────────────────── -->
<section class="section">
    <div class="container">
        <div class="text-center mb-4">
            <span class="section-eyebrow">Testimonials</span>
            <h2>What Our Customers Say</h2>
        </div>
        <div class="grid-3">
            <?php
            $testimonials = [
                ['text'=>'Incredible service! Ordered in the morning and had my gas delivered before lunch. The team is professional and friendly.','name'=>'Sarah M.','location'=>'Kempton Park'],
                ['text'=>'Best gas prices in the area by far. I\'ve been a regular customer for over a year. Always reliable, always on time.','name'=>'David K.','location'=>'Glen Marais'],
                ['text'=>'Our restaurant depends on Matiyane Gas for our 48kg cylinders. They\'ve never let us down. Highly recommended!','name'=>'Chef Thabo','location'=>'Birchleigh'],
            ];
            foreach ($testimonials as $t):
            ?>
            <div class="testimonial-card">
                <div class="testimonial-stars">⭐⭐⭐⭐⭐</div>
                <p class="testimonial-text">"<?php echo esc_html($t['text']); ?>"</p>
                <div class="testimonial-author"><?php echo esc_html($t['name']); ?></div>
                <div class="testimonial-location"><?php echo esc_html($t['location']); ?></div>
            </div>
            <?php endforeach; ?>
        </div>
    </div>
</section>

<!-- ── CTA ───────────────────────────────────────────────────── -->
<section class="section section--primary">
    <div class="container text-center">
        <h2 style="color:white;">Ready to Order Gas?</h2>
        <p style="color:rgba(255,255,255,0.7);max-width:500px;margin:1rem auto 2rem;">Place your order online in minutes. We'll handle the rest — delivery right to your door.</p>
        <a href="<?php echo esc_url(home_url('/order-gas/')); ?>" class="btn btn-secondary btn-lg">Place Your Order</a>
    </div>
</section>
</main>

<?php get_footer(); ?>
