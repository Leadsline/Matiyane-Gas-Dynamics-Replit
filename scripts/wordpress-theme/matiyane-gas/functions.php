<?php
/**
 * Matiyane Gas Distributors — Theme Functions
 */

defined('ABSPATH') || exit;

// ── Theme Setup ─────────────────────────────────────────────────────────────
function mgd_setup() {
    add_theme_support('title-tag');
    add_theme_support('post-thumbnails');
    add_theme_support('html5', ['search-form','comment-form','gallery','caption']);
    register_nav_menus(['primary' => __('Primary Menu', 'matiyane-gas')]);
}
add_action('after_setup_theme', 'mgd_setup');

// ── Enqueue Assets ───────────────────────────────────────────────────────────
function mgd_enqueue() {
    wp_enqueue_style('google-fonts', 'https://fonts.googleapis.com/css2?family=Montserrat:wght@400;500;600;700;800;900&display=swap', [], null);
    wp_enqueue_style('matiyane-gas', get_stylesheet_uri(), ['google-fonts'], '1.0.0');
    wp_enqueue_script('matiyane-gas', get_template_directory_uri() . '/assets/js/main.js', [], '1.0.0', true);
    wp_localize_script('matiyane-gas', 'mgdAjax', [
        'ajaxurl' => admin_url('admin-ajax.php'),
        'nonce'   => wp_create_nonce('mgd_nonce'),
    ]);
}
add_action('wp_enqueue_scripts', 'mgd_enqueue');

// ── Admin Menu ───────────────────────────────────────────────────────────────
function mgd_menus() {
    add_menu_page('Gas Orders', 'Gas Orders', 'manage_options', 'mgd-orders', 'mgd_orders_page', 'dashicons-cart', 30);
    add_menu_page('Contact Messages', 'Messages', 'manage_options', 'mgd-messages', 'mgd_messages_page', 'dashicons-email', 31);
}
add_action('admin_menu', 'mgd_menus');

// ── Order Tracking AJAX ───────────────────────────────────────────────────────
function mgd_track_order_ajax() {
    check_ajax_referer('mgd_nonce', '_wpnonce');

    global $wpdb;
    $ref = strtoupper(sanitize_text_field($_GET['ref'] ?? ''));
    if (!$ref) {
        wp_send_json_error('Order reference is required.', 400);
    }

    $order = $wpdb->get_row($wpdb->prepare(
        "SELECT id, order_ref, status, total_amount, items, created_at FROM {$wpdb->prefix}mgd_orders WHERE order_ref = %s",
        $ref
    ));

    if (!$order) {
        wp_send_json_error('Order not found. Please check your reference number.', 404);
    }

    $raw_items = json_decode($order->items, true) ?: [];
    $items = array_map(function($i) {
        return [
            'productId'   => $i['productId']   ?? 0,
            'productName' => $i['productName']  ?? '',
            'quantity'    => $i['quantity']     ?? 0,
            'unitPrice'   => floatval($i['unitPrice']  ?? 0),
            'subtotal'    => floatval($i['subtotal']   ?? 0),
        ];
    }, $raw_items);

    wp_send_json_success([
        'orderRef'    => $order->order_ref,
        'status'      => $order->status,
        'totalAmount' => floatval($order->total_amount),
        'createdAt'   => $order->created_at,
        'items'       => $items,
    ]);
}
add_action('wp_ajax_mgd_track_order',        'mgd_track_order_ajax');
add_action('wp_ajax_nopriv_mgd_track_order', 'mgd_track_order_ajax');

// ── Database Tables ──────────────────────────────────────────────────────────
function mgd_create_tables() {
    global $wpdb;
    $charset = $wpdb->get_charset_collate();

    $sql = "CREATE TABLE IF NOT EXISTS {$wpdb->prefix}mgd_orders (
        id bigint(20) NOT NULL AUTO_INCREMENT,
        order_ref varchar(20) NOT NULL,
        full_name varchar(200) NOT NULL,
        phone varchar(50) NOT NULL,
        email varchar(200) NOT NULL,
        delivery_address text NOT NULL,
        suburb varchar(200) NOT NULL,
        special_instructions text,
        status varchar(50) NOT NULL DEFAULT 'pending',
        total_amount decimal(10,2) NOT NULL DEFAULT 0,
        delivery_fee decimal(10,2) NOT NULL DEFAULT 0,
        items longtext NOT NULL,
        created_at datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
        PRIMARY KEY (id)
    ) $charset;

    CREATE TABLE IF NOT EXISTS {$wpdb->prefix}mgd_contacts (
        id bigint(20) NOT NULL AUTO_INCREMENT,
        name varchar(200) NOT NULL,
        email varchar(200) NOT NULL,
        phone varchar(50),
        message text NOT NULL,
        created_at datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
        PRIMARY KEY (id)
    ) $charset;";

    require_once ABSPATH . 'wp-admin/includes/upgrade.php';
    dbDelta($sql);
}
register_activation_hook(__FILE__, 'mgd_create_tables');

// Run on every load so tables exist even without activation hook
add_action('init', function() {
    if (get_option('mgd_db_version') !== '1.0') {
        mgd_create_tables();
        update_option('mgd_db_version', '1.0');
    }
});

// ── Products Data ─────────────────────────────────────────────────────────────
function mgd_get_products() {
    return [
        ['id'=>1,'name'=>'5kg Gas Refill','price'=>150,'unit'=>'5kg','description'=>'Perfect for small households and camping. Safe, clean-burning LPG gas.'],
        ['id'=>2,'name'=>'9kg Gas Refill','price'=>250,'unit'=>'9kg','description'=>'Ideal for average households. Our most popular size for everyday cooking.'],
        ['id'=>3,'name'=>'19kg Gas Refill','price'=>490,'unit'=>'19kg','description'=>'Great for large families and small businesses. Extended cooking time.'],
        ['id'=>4,'name'=>'48kg Gas Refill','price'=>1250,'unit'=>'48kg','description'=>'Industrial grade. Suitable for restaurants and large operations.'],
    ];
}

// ── Order Reference Generator ─────────────────────────────────────────────────
function mgd_generate_ref() {
    return 'MGD-' . strtoupper(base_convert(time(), 10, 36)) . '-' . strtoupper(substr(wp_generate_uuid4(), 0, 4));
}

// ── Order Form Handler ────────────────────────────────────────────────────────
function mgd_handle_order() {
    if (!isset($_POST['mgd_order_nonce']) || !wp_verify_nonce($_POST['mgd_order_nonce'], 'mgd_place_order')) {
        wp_die('Security check failed.');
    }

    global $wpdb;

    $full_name   = sanitize_text_field($_POST['full_name'] ?? '');
    $phone       = sanitize_text_field($_POST['phone'] ?? '');
    $email       = sanitize_email($_POST['email'] ?? '');
    $address     = sanitize_text_field($_POST['delivery_address'] ?? '');
    $suburb      = sanitize_text_field($_POST['suburb'] ?? '');
    $instructions= sanitize_textarea_field($_POST['special_instructions'] ?? '');

    $products = mgd_get_products();
    $items = [];
    $total = 0;

    foreach ($products as $p) {
        $qty = intval($_POST['qty_' . $p['id']] ?? 0);
        if ($qty > 0) {
            $subtotal = $p['price'] * $qty;
            $items[] = ['productId'=>$p['id'],'productName'=>$p['name'],'quantity'=>$qty,'unitPrice'=>$p['price'],'subtotal'=>$subtotal];
            $total += $subtotal;
        }
    }

    if (empty($items) || !$full_name || !$email || !$address || !$suburb) {
        wp_redirect(add_query_arg('order_error', '1', get_permalink()));
        exit;
    }

    $order_ref = mgd_generate_ref();
    $kempton_suburbs = ['kempton','glen marais','birchleigh','norkem'];
    $is_kempton = false;
    foreach ($kempton_suburbs as $k) {
        if (str_contains(strtolower($suburb), $k)) { $is_kempton = true; break; }
    }

    $wpdb->insert($wpdb->prefix . 'mgd_orders', [
        'order_ref'            => $order_ref,
        'full_name'            => $full_name,
        'phone'                => $phone,
        'email'                => $email,
        'delivery_address'     => $address,
        'suburb'               => $suburb,
        'special_instructions' => $instructions,
        'status'               => 'pending',
        'total_amount'         => $total,
        'delivery_fee'         => 0,
        'items'                => wp_json_encode($items),
    ]);

    $order_id = $wpdb->insert_id;

    // Send confirmation emails
    mgd_send_order_emails($order_id, [
        'order_ref'=>$order_ref,'full_name'=>$full_name,'phone'=>$phone,'email'=>$email,
        'delivery_address'=>$address,'suburb'=>$suburb,'special_instructions'=>$instructions,
        'items'=>$items,'total_amount'=>$total,'delivery_fee'=>0,
    ]);

    wp_redirect(add_query_arg(['order_id'=>$order_id,'order_ref'=>$order_ref], home_url('/order-success/')));
    exit;
}
add_action('admin_post_mgd_place_order', 'mgd_handle_order');
add_action('admin_post_nopriv_mgd_place_order', 'mgd_handle_order');

// ── Contact Form Handler ──────────────────────────────────────────────────────
function mgd_handle_contact() {
    if (!isset($_POST['mgd_contact_nonce']) || !wp_verify_nonce($_POST['mgd_contact_nonce'], 'mgd_contact_form')) {
        wp_die('Security check failed.');
    }

    global $wpdb;
    $name    = sanitize_text_field($_POST['contact_name'] ?? '');
    $email   = sanitize_email($_POST['contact_email'] ?? '');
    $phone   = sanitize_text_field($_POST['contact_phone'] ?? '');
    $message = sanitize_textarea_field($_POST['contact_message'] ?? '');

    if (!$name || !$email || !$message) {
        wp_redirect(add_query_arg('contact_error', '1', get_permalink()));
        exit;
    }

    $wpdb->insert($wpdb->prefix . 'mgd_contacts', [
        'name'=>$name,'email'=>$email,'phone'=>$phone,'message'=>$message,
    ]);

    // Email admin
    $admin_email = get_option('admin_email');
    mgd_send_email(
        $admin_email,
        "New Contact Message from $name",
        "<h2>New Contact Form Submission</h2><p><strong>Name:</strong> $name</p><p><strong>Email:</strong> $email</p><p><strong>Phone:</strong> $phone</p><p><strong>Message:</strong><br>" . nl2br(esc_html($message)) . "</p>"
    );

    wp_redirect(add_query_arg('contact_success', '1', get_permalink()));
    exit;
}
add_action('admin_post_mgd_contact', 'mgd_handle_contact');
add_action('admin_post_nopriv_mgd_contact', 'mgd_handle_contact');

// ── Email Helpers ─────────────────────────────────────────────────────────────
function mgd_send_email($to, $subject, $html) {
    $brevo_key = defined('BREVO_API_KEY') ? BREVO_API_KEY : (getenv('BREVO_API_KEY') ?: '');
    $sender_email = defined('MGD_SENDER_EMAIL') ? MGD_SENDER_EMAIL : get_option('admin_email');

    if ($brevo_key) {
        $response = wp_remote_post('https://api.brevo.com/v3/smtp/email', [
            'headers' => ['api-key' => $brevo_key, 'Content-Type' => 'application/json', 'accept' => 'application/json'],
            'body'    => wp_json_encode([
                'sender'      => ['name' => 'Matiyane Gas Distributors', 'email' => $sender_email],
                'to'          => [['email' => $to]],
                'subject'     => $subject,
                'htmlContent' => $html,
            ]),
        ]);
        return !is_wp_error($response);
    }

    // Fallback: WordPress mail
    add_filter('wp_mail_content_type', fn() => 'text/html');
    $result = wp_mail($to, $subject, $html, ['From: Matiyane Gas Distributors <' . $sender_email . '>']);
    remove_filter('wp_mail_content_type', '__return_false');
    return $result;
}

function mgd_send_order_emails($order_id, $data) {
    $admin_email = get_option('admin_email');
    $items_html = '';
    foreach ($data['items'] as $item) {
        $items_html .= "<tr><td style='padding:8px 12px;border-bottom:1px solid #e5e7eb;'>{$item['productName']}</td><td style='padding:8px 12px;border-bottom:1px solid #e5e7eb;text-align:center;'>{$item['quantity']}</td><td style='padding:8px 12px;border-bottom:1px solid #e5e7eb;text-align:right;'>R{$item['unitPrice']}</td><td style='padding:8px 12px;border-bottom:1px solid #e5e7eb;text-align:right;'>R{$item['subtotal']}</td></tr>";
    }
    $total = number_format($data['total_amount'], 2);
    $ref   = $data['order_ref'];
    $name  = $data['full_name'];

    $customer_html = "<!DOCTYPE html><html><head><meta charset='UTF-8'></head><body style='margin:0;padding:0;font-family:Arial,sans-serif;background:#f3f4f6;'><div style='max-width:600px;margin:32px auto;background:#fff;border-radius:8px;overflow:hidden;'><div style='background:#1a2f5e;padding:32px;text-align:center;'><h1 style='color:#f0c040;margin:0;'>Matiyane Gas Distributors</h1><p style='color:#fff;margin:8px 0 0;'>Safe, Reliable and Affordable</p></div><div style='padding:32px;'><h2 style='color:#1a2f5e;'>Order Confirmation</h2><p>Dear <strong>$name</strong>, thank you for your order!</p><div style='background:#f9fafb;padding:16px;border-radius:6px;margin:24px 0;'><p style='margin:0;color:#6b7280;font-size:14px;'>Order Reference</p><p style='margin:4px 0 0;font-size:20px;font-weight:bold;color:#1a2f5e;'>$ref</p></div><table style='width:100%;border-collapse:collapse;font-size:14px;'><thead><tr style='background:#1a2f5e;color:#fff;'><th style='padding:10px 12px;text-align:left;'>Product</th><th style='padding:10px 12px;text-align:center;'>Qty</th><th style='padding:10px 12px;text-align:right;'>Unit</th><th style='padding:10px 12px;text-align:right;'>Subtotal</th></tr></thead><tbody>$items_html</tbody></table><p style='margin-top:24px;'>Total: <strong>R$total</strong></p><p>We will contact you shortly to confirm delivery.</p><p>Tel: 076 748 8597 / 082 467 6584</p></div><div style='background:#1a2f5e;padding:24px;text-align:center;'><p style='color:#9ca3af;font-size:12px;margin:0;'>Matiyane Gas Distributors | 5 Kanonkop Place, Glen Marais, Kempton Park</p></div></div></body></html>";

    mgd_send_email($data['email'], "Order Confirmation — $ref | Matiyane Gas", $customer_html);
    mgd_send_email($admin_email, "New Order: $ref — {$data['full_name']} — R$total", "<h2>New Order Received</h2><p><strong>Ref:</strong> $ref</p><p><strong>Customer:</strong> {$data['full_name']}</p><p><strong>Phone:</strong> {$data['phone']}</p><p><strong>Email:</strong> {$data['email']}</p><p><strong>Address:</strong> {$data['delivery_address']}, {$data['suburb']}</p><p><strong>Total:</strong> R$total</p><table style='width:100%;border-collapse:collapse;font-size:14px;'><thead><tr style='background:#1a2f5e;color:#fff;'><th style='padding:8px;text-align:left;'>Product</th><th>Qty</th><th>Subtotal</th></tr></thead><tbody>$items_html</tbody></table>");
}

// ── PayFast Helper ────────────────────────────────────────────────────────────
function mgd_payfast_url() {
    $sandbox = defined('PAYFAST_SANDBOX') ? PAYFAST_SANDBOX : true;
    return $sandbox ? 'https://sandbox.payfast.co.za/eng/process' : 'https://www.payfast.co.za/eng/process';
}

function mgd_payfast_merchant_id() {
    return defined('PAYFAST_MERCHANT_ID') ? PAYFAST_MERCHANT_ID : '10000100';
}

function mgd_payfast_merchant_key() {
    return defined('PAYFAST_MERCHANT_KEY') ? PAYFAST_MERCHANT_KEY : '46f0cd694581a';
}

// ── Admin Pages ───────────────────────────────────────────────────────────────
function mgd_orders_page() {
    global $wpdb;
    $status_filter = sanitize_text_field($_GET['status'] ?? '');
    $where = $status_filter ? $wpdb->prepare("WHERE status = %s", $status_filter) : '';
    $orders = $wpdb->get_results("SELECT * FROM {$wpdb->prefix}mgd_orders $where ORDER BY created_at DESC");

    if (isset($_POST['update_status']) && isset($_POST['order_id'])) {
        check_admin_referer('mgd_update_status');
        $wpdb->update($wpdb->prefix . 'mgd_orders', ['status' => sanitize_text_field($_POST['new_status'])], ['id' => intval($_POST['order_id'])]);
        echo '<div class="notice notice-success"><p>Status updated.</p></div>';
        $orders = $wpdb->get_results("SELECT * FROM {$wpdb->prefix}mgd_orders $where ORDER BY created_at DESC");
    }

    $statuses = ['pending','confirmed','out_for_delivery','delivered','paid','cancelled'];
    $status_labels = ['pending'=>'Pending','confirmed'=>'Confirmed','out_for_delivery'=>'Out for Delivery','delivered'=>'Delivered','paid'=>'Paid','cancelled'=>'Cancelled'];

    echo '<div class="wrap"><h1>Gas Orders</h1>';
    echo '<p><strong>Filter:</strong> ';
    echo '<a href="?page=mgd-orders">All</a> | ';
    foreach ($statuses as $s) echo "<a href='?page=mgd-orders&status=$s'>{$status_labels[$s]}</a> | ";
    echo '</p>';
    echo '<table class="widefat striped"><thead><tr><th>Ref</th><th>Customer</th><th>Phone</th><th>Suburb</th><th>Amount</th><th>Status</th><th>Date</th><th>Action</th></tr></thead><tbody>';
    foreach ($orders as $o) {
        $items = json_decode($o->items, true);
        $items_str = implode(', ', array_map(fn($i) => "{$i['productName']} ×{$i['quantity']}", $items));
        echo "<tr><td><strong>{$o->order_ref}</strong><br><small>{$items_str}</small></td><td>{$o->full_name}<br><small>{$o->email}</small></td><td>{$o->phone}</td><td>{$o->suburb}</td><td><strong>R" . number_format($o->total_amount,2) . "</strong></td><td>{$status_labels[$o->status]}</td><td>" . date('d M Y', strtotime($o->created_at)) . "</td><td><form method='post'>" . wp_nonce_field('mgd_update_status','_wpnonce',true,false) . "<input type='hidden' name='order_id' value='{$o->id}'><select name='new_status'>";
        foreach ($statuses as $s) echo "<option value='$s'" . ($o->status==$s?' selected':'') . ">{$status_labels[$s]}</option>";
        echo "</select> <input type='submit' name='update_status' class='button button-small' value='Update'></form></td></tr>";
    }
    echo '</tbody></table></div>';
}

function mgd_messages_page() {
    global $wpdb;
    $messages = $wpdb->get_results("SELECT * FROM {$wpdb->prefix}mgd_contacts ORDER BY created_at DESC");
    echo '<div class="wrap"><h1>Contact Messages</h1><table class="widefat striped"><thead><tr><th>Name</th><th>Email</th><th>Phone</th><th>Message</th><th>Date</th></tr></thead><tbody>';
    foreach ($messages as $m) {
        echo "<tr><td><strong>{$m->name}</strong></td><td>{$m->email}</td><td>{$m->phone}</td><td>" . esc_html($m->message) . "</td><td>" . date('d M Y', strtotime($m->created_at)) . "</td></tr>";
    }
    echo '</tbody></table></div>';
}
