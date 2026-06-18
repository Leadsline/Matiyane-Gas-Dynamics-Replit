<?php get_header(); ?>

<?php
$success = isset($_GET['contact_success']);
$error   = isset($_GET['contact_error']);
?>

<main>
<section class="page-hero">
    <div class="container">
        <span class="section-eyebrow">Get in Touch</span>
        <h1>Contact Us</h1>
        <p>We'd love to hear from you. Reach out for orders, enquiries, or just to say hello.</p>
    </div>
</section>

<section class="section">
<div class="container">
    <div class="grid-2" style="gap:4rem;align-items:start;">
        <!-- Contact Info -->
        <div>
            <h2 class="mb-3">We're Here to Help</h2>
            <p class="mb-4">Contact us via phone, WhatsApp, or email — we respond quickly and are available 7 days a week.</p>

            <?php
            $contacts = [
                ['📞','Phone','076 748 8597 / 082 467 6584','tel:0767488597'],
                ['💬','WhatsApp','Chat with us instantly','https://wa.me/27767488597'],
                ['📧','Email','info@matiyanegas.co.za','mailto:info@matiyanegas.co.za'],
                ['📍','Address','5 Kanonkop Place, Glen Marais, Kempton Park 1619',null],
                ['🕐','Hours','Monday – Sunday: 7:00 AM – 8:00 PM',null],
            ];
            foreach ($contacts as $c):
            ?>
            <div class="contact-info-item">
                <div class="contact-icon"><?php echo $c[0]; ?></div>
                <div>
                    <div style="font-weight:700;color:var(--primary);margin-bottom:0.25rem;"><?php echo esc_html($c[1]); ?></div>
                    <?php if ($c[3]): ?>
                    <a href="<?php echo esc_url($c[3]); ?>" style="color:#4b5563;"><?php echo esc_html($c[2]); ?></a>
                    <?php else: ?>
                    <p style="margin:0;color:#4b5563;"><?php echo esc_html($c[2]); ?></p>
                    <?php endif; ?>
                </div>
            </div>
            <?php endforeach; ?>

            <!-- Map -->
            <div style="margin-top:2rem;border-radius:var(--radius);overflow:hidden;border:1px solid var(--border);">
                <iframe
                    src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3582.5567!2d28.2353!3d-26.0889!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2sGlen+Marais%2C+Kempton+Park!5e0!3m2!1sen!2sza!4v1234567890"
                    width="100%" height="250" style="border:0;display:block;" allowfullscreen="" loading="lazy"
                    referrerpolicy="no-referrer-when-downgrade"></iframe>
            </div>
        </div>

        <!-- Contact Form -->
        <div class="card" style="padding:2.5rem;">
            <h2 class="mb-1">Send a Message</h2>
            <p class="text-muted mb-4">We'll get back to you within a few hours.</p>

            <?php if ($success): ?>
            <div class="alert alert-success mb-4">✅ Your message has been sent! We'll be in touch soon.</div>
            <?php endif; ?>
            <?php if ($error): ?>
            <div class="alert alert-error mb-4">⚠️ Please fill in all required fields.</div>
            <?php endif; ?>

            <form method="post" action="<?php echo esc_url(admin_url('admin-post.php')); ?>">
                <?php wp_nonce_field('mgd_contact_form', 'mgd_contact_nonce'); ?>
                <input type="hidden" name="action" value="mgd_contact">
                <div class="form-group">
                    <label class="form-label" for="contact_name">Full Name *</label>
                    <input class="form-input" type="text" id="contact_name" name="contact_name" placeholder="Your full name" required>
                </div>
                <div class="form-grid-2">
                    <div class="form-group">
                        <label class="form-label" for="contact_email">Email *</label>
                        <input class="form-input" type="email" id="contact_email" name="contact_email" placeholder="your@email.com" required>
                    </div>
                    <div class="form-group">
                        <label class="form-label" for="contact_phone">Phone</label>
                        <input class="form-input" type="tel" id="contact_phone" name="contact_phone" placeholder="076 748 8597">
                    </div>
                </div>
                <div class="form-group">
                    <label class="form-label" for="contact_message">Message *</label>
                    <textarea class="form-textarea" id="contact_message" name="contact_message" placeholder="How can we help you?" required rows="5"></textarea>
                </div>
                <button type="submit" class="btn btn-primary btn-full btn-lg">Send Message →</button>
            </form>
        </div>
    </div>
</div>
</section>
</main>

<?php get_footer(); ?>
