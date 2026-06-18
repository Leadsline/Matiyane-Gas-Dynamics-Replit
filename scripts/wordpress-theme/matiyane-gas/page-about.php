<?php get_header(); ?>

<main>
<section class="page-hero">
    <div class="container">
        <span class="section-eyebrow">Who We Are</span>
        <h1>About Matiyane Gas</h1>
        <p>A trusted, family-run gas distributor proudly serving Kempton Park and surrounding communities with safe, reliable LPG solutions.</p>
    </div>
</section>

<!-- Story -->
<section class="section">
    <div class="container">
        <div class="grid-2">
            <div>
                <span class="section-eyebrow">Our Story</span>
                <h2>Built on Trust, Delivered with Care</h2>
                <div style="color:#4b5563;line-height:1.8;margin-top:1.25rem;">
                    <p style="margin-bottom:1rem;">Matiyane Gas Distributors was founded with a simple but powerful purpose: to make safe, quality gas accessible to every household and business in Kempton Park. We saw too many families struggling to find reliable gas supplies at honest prices — and we decided to do something about it.</p>
                    <p style="margin-bottom:1rem;">Based in Glen Marais, Kempton Park, we serve the local community with the dedication of a neighbour, not a corporation. Every delivery is personal to us — because we live and work in the same community as our customers.</p>
                    <p>We handle 5kg, 9kg, 19kg and 48kg cylinders — catering to households, restaurants, schools and industrial users. No matter your need, we have the right gas solution at a price that makes sense.</p>
                </div>
                <div class="mt-3">
                    <a href="<?php echo esc_url(home_url('/order-gas/')); ?>" class="btn btn-primary">Order Gas Today →</a>
                </div>
            </div>
            <div>
                <div style="background:linear-gradient(135deg,#1a2f5e,#2a4a8e);border-radius:1.5rem;padding:3rem;color:white;">
                    <div class="stats-grid" style="grid-template-columns:1fr 1fr;">
                        <?php
                        $stats = [['1000+','Happy Customers'],['7 Days','A Week Service'],['4 Sizes','Available'],['100%','Safety Certified']];
                        foreach ($stats as $s):
                        ?>
                        <div class="stat-box">
                            <span class="stat-number"><?php echo $s[0]; ?></span>
                            <span class="stat-label"><?php echo $s[1]; ?></span>
                        </div>
                        <?php endforeach; ?>
                    </div>
                </div>
            </div>
        </div>
    </div>
</section>

<!-- Mission -->
<section class="section section--gray">
    <div class="container">
        <div class="text-center" style="max-width:700px;margin:0 auto 3rem;">
            <span class="section-eyebrow">Our Mission</span>
            <h2>Making Safe Gas Accessible to All</h2>
            <p style="margin-top:1rem;">We believe access to clean, safe cooking gas is not a luxury — it is a necessity. Our mission is to be the most reliable, most affordable, and most trusted gas supplier in Kempton Park.</p>
        </div>
    </div>
</section>

<!-- Values -->
<section class="section">
    <div class="container">
        <div class="text-center mb-4">
            <span class="section-eyebrow">Our Values</span>
            <h2>What We Stand For</h2>
        </div>
        <div class="grid-4">
            <?php
            $values = [
                ['🛡️','Safety','Every cylinder we handle is inspected and pressure-tested. Your family\'s safety is non-negotiable.'],
                ['✅','Reliability','When you place an order, we deliver. No excuses, no delays — we take pride in keeping our word.'],
                ['💰','Affordability','We believe access to safe, clean gas shouldn\'t be a luxury. Our prices are honest and competitive.'],
                ['🤝','Community','We\'re a local business serving local families. We know our customers by name, not by number.'],
            ];
            foreach ($values as $v):
            ?>
            <div class="card">
                <div class="feature-icon"><?php echo $v[0]; ?></div>
                <h3><?php echo esc_html($v[1]); ?></h3>
                <p class="mt-1"><?php echo esc_html($v[2]); ?></p>
            </div>
            <?php endforeach; ?>
        </div>
    </div>
</section>

<!-- Safety -->
<section class="section section--primary">
    <div class="container">
        <div class="grid-2">
            <div>
                <span class="section-eyebrow">Safety First</span>
                <h2 style="color:white;">Your Family's Safety is Our Priority</h2>
                <p style="color:rgba(255,255,255,0.7);margin-top:1rem;">Every cylinder we distribute is fully certified, regularly inspected, and handled with the utmost care. We comply with all South African LPG safety regulations.</p>
                <ul style="margin-top:1.5rem;color:rgba(255,255,255,0.8);">
                    <?php
                    $safety = ['SABS certified cylinders','Pressure-tested before every delivery','Trained delivery personnel','Proper valve and seal inspection','Compliance with SANS 10087'];
                    foreach ($safety as $s): ?>
                    <li style="padding:0.4rem 0;display:flex;gap:0.75rem;align-items:center;">✅ <?php echo esc_html($s); ?></li>
                    <?php endforeach; ?>
                </ul>
            </div>
            <div>
                <a href="<?php echo esc_url(home_url('/contact/')); ?>" class="btn btn-secondary btn-lg">Get in Touch →</a>
            </div>
        </div>
    </div>
</section>
</main>

<?php get_footer(); ?>
