<?php get_header(); ?>

<main>
<section class="page-hero">
    <div class="container">
        <span class="section-eyebrow">Order Tracking</span>
        <h1>Where's My Gas?</h1>
        <p>Enter your order reference number to see a real-time status update on your delivery.</p>
    </div>
</section>

<section class="section">
<div class="container" style="max-width:680px;">
    <!-- Search Form -->
    <div class="card" style="margin-bottom:2rem;">
        <h2 class="mb-1">Track Your Order</h2>
        <p class="text-muted mb-4" style="font-size:0.9rem;">Your reference was emailed when you placed the order (format: MGD-XXXXX-XXXX).</p>
        <form id="trackForm" onsubmit="mgdTrackOrder(event)">
            <div style="display:flex;gap:0.75rem;">
                <input type="text" id="trackRef" placeholder="e.g. MGD-M3KJV8-A2X4"
                    class="form-input" style="flex:1;font-family:monospace;text-transform:uppercase;letter-spacing:1px;" required>
                <button type="submit" class="btn btn-primary" id="trackBtn" style="min-width:100px;">
                    🔍 Track
                </button>
            </div>
        </form>
        <div id="trackError" style="display:none;margin-top:1rem;" class="alert alert-error"></div>
    </div>

    <!-- Result -->
    <div id="trackResult" style="display:none;">
        <!-- Reference header -->
        <div class="card mb-3" style="display:flex;justify-content:space-between;flex-wrap:wrap;gap:1rem;align-items:center;">
            <div>
                <p style="font-size:0.75rem;color:var(--muted);margin:0 0 0.25rem;">Order Reference</p>
                <p id="resRef" style="font-size:1.75rem;font-weight:900;color:var(--secondary);font-family:monospace;margin:0;"></p>
            </div>
            <div style="text-align:right;">
                <p style="font-size:0.75rem;color:var(--muted);margin:0 0 0.25rem;">Placed on</p>
                <p id="resDate" style="font-weight:700;color:var(--primary);margin:0;"></p>
            </div>
        </div>

        <!-- Status Stepper -->
        <div class="card mb-3" id="stepperCard">
            <h2 class="mb-4">Delivery Status</h2>
            <div class="track-steps" id="trackSteps"></div>
        </div>

        <!-- Cancelled Message -->
        <div id="cancelledCard" class="alert alert-error mb-3" style="display:none;text-align:center;padding:2rem;">
            <p style="font-size:2rem;margin-bottom:0.5rem;">❌</p>
            <p style="font-weight:700;margin-bottom:0.25rem;">Order Cancelled</p>
            <p style="font-size:0.9rem;">This order has been cancelled. Please contact us if you have questions.</p>
        </div>

        <!-- Items -->
        <div class="card mb-3">
            <h2 class="mb-4">Order Summary</h2>
            <div id="resItems"></div>
        </div>

        <!-- Help -->
        <div class="card" style="text-align:center;background:var(--surface);">
            <div style="font-size:2rem;margin-bottom:0.75rem;">🕐</div>
            <p style="font-weight:700;color:var(--primary);margin-bottom:0.25rem;">Need help with your order?</p>
            <p class="text-muted mb-4" style="font-size:0.9rem;">Our team is available 7 days a week, 7am – 8pm.</p>
            <div style="display:flex;gap:0.75rem;justify-content:center;flex-wrap:wrap;">
                <a href="tel:0767488597" class="btn btn-primary">📞 076 748 8597</a>
                <a href="https://wa.me/27767488597" class="btn btn-outline" target="_blank" rel="noopener">💬 WhatsApp</a>
            </div>
        </div>
    </div>

    <!-- How it works (shown before search) -->
    <div id="howItWorks">
        <div class="grid-3" style="text-align:center;margin-top:2rem;">
            <?php
            $steps = [
                ['📩','Find your reference','Check your confirmation email for a code like MGD-XXXXX-XXXX.'],
                ['🔍','Enter the code','Type it in the search box above and hit Track.'],
                ['🚚','See live status','Get an instant update on where your delivery is.'],
            ];
            foreach ($steps as $s):
            ?>
            <div class="card">
                <div style="font-size:2.5rem;margin-bottom:1rem;"><?php echo $s[0]; ?></div>
                <p style="font-weight:700;color:var(--primary);margin-bottom:0.5rem;"><?php echo esc_html($s[1]); ?></p>
                <p class="text-muted" style="font-size:0.85rem;"><?php echo esc_html($s[2]); ?></p>
            </div>
            <?php endforeach; ?>
        </div>
    </div>
</div>
</section>
</main>

<style>
.track-steps { position:relative; }
.track-step  { display:flex; gap:1rem; padding-bottom:2rem; position:relative; }
.track-step:last-child { padding-bottom:0; }
.track-step-line { position:absolute; left:1.1rem; top:2.75rem; bottom:0; width:2px; background:#e5e7eb; }
.track-step-line.done { background:var(--secondary); }
.track-step-icon { position:relative; z-index:1; width:2.25rem; height:2.25rem; border-radius:50%; display:flex; align-items:center; justify-content:center; flex-shrink:0; font-size:1rem; background:#f3f4f6; color:#9ca3af; transition:all 0.3s; }
.track-step-icon.done   { background:var(--primary); color:#fff; }
.track-step-icon.active { background:var(--secondary); color:#fff; box-shadow:0 0 0 6px rgba(240,192,64,0.2); transform:scale(1.12); }
.track-step-label { font-weight:700; font-size:0.9rem; color:#9ca3af; padding-top:0.4rem; }
.track-step-label.done { color:var(--primary); }
.track-step-desc { font-size:0.8rem; color:var(--muted); margin-top:0.25rem; }
.order-item-row { display:flex; justify-content:space-between; align-items:center; padding:0.75rem 0; border-bottom:1px solid var(--border); }
.order-item-row:last-child { border-bottom:none; }
.order-total-row { display:flex; justify-content:space-between; padding-top:0.75rem; font-size:1.15rem; font-weight:900; color:var(--primary); }
</style>

<script>
var STATUS_STEPS = [
    { key:'pending',          label:'Order Placed',      icon:'📦', desc:'Your order has been received and is awaiting confirmation.' },
    { key:'confirmed',        label:'Confirmed',         icon:'✅', desc:'Your order is confirmed and being prepared for dispatch.' },
    { key:'out_for_delivery', label:'Out for Delivery',  icon:'🚚', desc:'Your gas is on its way — our driver is en route to you.' },
    { key:'delivered',        label:'Delivered',         icon:'📍', desc:'Your gas has been delivered. Enjoy!' },
    { key:'paid',             label:'Completed & Paid',  icon:'🎉', desc:'Order fully completed. Thank you for your business!' },
];
var STATUS_RANK = { pending:0, confirmed:1, out_for_delivery:2, delivered:3, paid:4, cancelled:-1 };

function mgdTrackOrder(e) {
    e.preventDefault();
    var ref = document.getElementById('trackRef').value.trim().toUpperCase();
    if (!ref) return;
    var btn = document.getElementById('trackBtn');
    var errEl = document.getElementById('trackError');
    btn.textContent = 'Checking…'; btn.disabled = true;
    errEl.style.display = 'none';
    document.getElementById('trackResult').style.display = 'none';

    fetch(mgdAjax.ajaxurl + '?action=mgd_track_order&ref=' + encodeURIComponent(ref) + '&_wpnonce=' + mgdAjax.nonce)
        .then(function(r){ return r.json(); })
        .then(function(data) {
            btn.textContent = '🔍 Track'; btn.disabled = false;
            if (data.success) {
                renderResult(data.data);
            } else {
                errEl.textContent = '⚠️ ' + (data.data || 'Order not found. Check your reference and try again.');
                errEl.style.display = '';
            }
        })
        .catch(function() {
            btn.textContent = '🔍 Track'; btn.disabled = false;
            errEl.textContent = '⚠️ Unable to connect. Please try again.';
            errEl.style.display = '';
        });
}

function renderResult(d) {
    document.getElementById('howItWorks').style.display = 'none';
    document.getElementById('trackResult').style.display = '';
    document.getElementById('resRef').textContent = d.orderRef;
    var date = new Date(d.createdAt);
    document.getElementById('resDate').textContent = date.toLocaleDateString('en-ZA', {day:'numeric',month:'long',year:'numeric'});

    var rank = STATUS_RANK[d.status] !== undefined ? STATUS_RANK[d.status] : 0;
    var stepperCard = document.getElementById('stepperCard');
    var cancelledCard = document.getElementById('cancelledCard');
    if (d.status === 'cancelled') {
        stepperCard.style.display = 'none';
        cancelledCard.style.display = '';
    } else {
        stepperCard.style.display = '';
        cancelledCard.style.display = 'none';
        var stepsEl = document.getElementById('trackSteps');
        stepsEl.innerHTML = '';
        STATUS_STEPS.forEach(function(step, i) {
            var done   = rank >= i;
            var active = rank === i;
            var lineClass = (done && i < STATUS_STEPS.length - 1) ? 'done' : '';
            var iconClass = active ? 'active' : done ? 'done' : '';
            var labelClass = done ? 'done' : '';
            var html = '<div class="track-step">';
            if (i < STATUS_STEPS.length - 1) html += '<div class="track-step-line ' + lineClass + '"></div>';
            html += '<div class="track-step-icon ' + iconClass + '">' + step.icon + '</div>';
            html += '<div><div class="track-step-label ' + labelClass + '">' + step.label;
            if (active) html += ' <span style="font-size:0.75rem;background:rgba(240,192,64,0.15);color:var(--secondary);padding:0.15rem 0.5rem;border-radius:999px;margin-left:0.4rem;">Current</span>';
            html += '</div>';
            if (active) html += '<div class="track-step-desc">' + step.desc + '</div>';
            html += '</div></div>';
            stepsEl.insertAdjacentHTML('beforeend', html);
        });
    }

    var itemsEl = document.getElementById('resItems');
    itemsEl.innerHTML = '';
    d.items.forEach(function(item) {
        itemsEl.insertAdjacentHTML('beforeend',
            '<div class="order-item-row">' +
            '<div style="display:flex;align-items:center;gap:0.75rem;">' +
            '<div style="width:2.25rem;height:2.25rem;background:rgba(26,47,94,0.06);border-radius:0.75rem;display:flex;align-items:center;justify-content:center;">🔥</div>' +
            '<div><div style="font-weight:700;font-size:0.9rem;color:var(--primary);">' + item.productName + '</div>' +
            '<div style="font-size:0.8rem;color:var(--muted);">×' + item.quantity + ' @ R' + item.unitPrice.toFixed(2) + ' each</div></div></div>' +
            '<span style="font-weight:700;color:var(--primary);">R' + item.subtotal.toFixed(2) + '</span></div>'
        );
    });
    itemsEl.insertAdjacentHTML('beforeend',
        '<div class="order-total-row"><span>Total</span><span>R' + parseFloat(d.totalAmount).toFixed(2) + '</span></div>'
    );
}
</script>

<?php get_footer(); ?>
