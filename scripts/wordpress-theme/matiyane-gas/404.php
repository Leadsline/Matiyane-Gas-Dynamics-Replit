<?php get_header(); ?>

<main class="section" style="min-height:60vh;display:flex;align-items:center;">
    <div class="container text-center">
        <div style="font-size:6rem;margin-bottom:1rem;">🔥</div>
        <h1 style="font-size:5rem;color:var(--secondary);margin-bottom:0.5rem;">404</h1>
        <h2 class="mb-2">Page Not Found</h2>
        <p class="text-muted mb-4">Looks like this page has gone up in flames. Let's get you back on track.</p>
        <a href="<?php echo esc_url(home_url('/')); ?>" class="btn btn-primary btn-lg">Go to Home Page</a>
    </div>
</main>

<?php get_footer(); ?>
