<!DOCTYPE html>
<html <?php language_attributes(); ?>>
<head>
    <meta charset="<?php bloginfo('charset'); ?>">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <meta name="description" content="Matiyane Gas Distributors — Safe, reliable and affordable LPG gas supplier in Kempton Park. Order online for fast delivery.">
    <?php wp_head(); ?>
</head>
<body <?php body_class(); ?>>
<?php wp_body_open(); ?>

<!-- Notification Bar -->
<div class="notification-bar" id="notifBar">
    🔥 Free delivery in Kempton Park! Call us: <a href="tel:0767488597" style="color:inherit;font-weight:900;">076 748 8597</a>
</div>

<!-- Header -->
<header class="site-header" id="siteHeader">
    <div class="container">
        <nav class="nav-inner">
            <a href="<?php echo esc_url(home_url('/')); ?>" class="nav-logo">
                <span class="flame">🔥</span>
                <span>Matiyane Gas</span>
            </a>

            <ul class="nav-links" id="navLinks">
                <li><a href="<?php echo esc_url(home_url('/')); ?>" class="<?php echo is_front_page() ? 'current-menu-item' : ''; ?>">Home</a></li>
                <li><a href="<?php echo esc_url(home_url('/about/')); ?>" class="<?php echo is_page('about') ? 'current-menu-item' : ''; ?>">About Us</a></li>
                <li><a href="<?php echo esc_url(home_url('/products/')); ?>" class="<?php echo is_page('products') ? 'current-menu-item' : ''; ?>">Products</a></li>
                <li><a href="<?php echo esc_url(home_url('/contact/')); ?>" class="<?php echo is_page('contact') ? 'current-menu-item' : ''; ?>">Contact</a></li>
                <li><a href="<?php echo esc_url(home_url('/order-gas/')); ?>" class="nav-cta">Order Now</a></li>
            </ul>

            <button class="nav-toggle" id="navToggle" aria-label="Toggle menu">
                <span></span><span></span><span></span>
            </button>
        </nav>
    </div>
</header>
