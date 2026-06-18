/* Matiyane Gas Distributors — Main JS */
(function() {
'use strict';

// ── Mobile Nav ──────────────────────────────────────────────────────────────
var toggle = document.getElementById('navToggle');
var links  = document.getElementById('navLinks');
if (toggle && links) {
    toggle.addEventListener('click', function() {
        links.classList.toggle('open');
    });
}

// ── Sticky Header ────────────────────────────────────────────────────────────
var header = document.getElementById('siteHeader');
if (header) {
    window.addEventListener('scroll', function() {
        header.classList.toggle('scrolled', window.scrollY > 50);
    });
}

// ── Hero Carousel ────────────────────────────────────────────────────────────
var carousel = document.getElementById('heroCarousel');
if (carousel) {
    var messages = [
        'Safe & Certified Gas Supply',
        'Free Delivery in Kempton Park',
        'Available 7 Days a Week',
        'Your Safety is Our Priority',
        'Trusted by Thousands of Households',
        'Competitive Prices, No Compromise',
    ];
    var idx = 0;
    setInterval(function() {
        carousel.style.opacity = '0';
        carousel.style.transform = 'translateY(8px)';
        setTimeout(function() {
            idx = (idx + 1) % messages.length;
            carousel.textContent = messages[idx];
            carousel.style.opacity = '1';
            carousel.style.transform = 'translateY(0)';
        }, 350);
    }, 3000);
    carousel.style.transition = 'opacity 0.35s ease, transform 0.35s ease';
}

// ── Particle Canvas ──────────────────────────────────────────────────────────
var canvas = document.getElementById('particleCanvas');
if (canvas) {
    var ctx = canvas.getContext('2d');
    var particles = [];
    var W, H;

    function resize() {
        W = canvas.width  = canvas.offsetWidth;
        H = canvas.height = canvas.offsetHeight;
    }

    function Particle() {
        this.reset();
    }
    Particle.prototype.reset = function() {
        this.x  = Math.random() * W;
        this.y  = Math.random() * H;
        this.r  = Math.random() * 2 + 0.5;
        this.vx = (Math.random() - 0.5) * 0.4;
        this.vy = -(Math.random() * 0.6 + 0.2);
        this.a  = Math.random() * 0.5 + 0.1;
    };
    Particle.prototype.update = function() {
        this.x += this.vx;
        this.y += this.vy;
        this.a -= 0.002;
        if (this.a <= 0 || this.y < -5) this.reset();
    };
    Particle.prototype.draw = function() {
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.r, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(240,192,64,' + this.a + ')';
        ctx.fill();
    };

    resize();
    window.addEventListener('resize', resize);
    for (var i = 0; i < 80; i++) particles.push(new Particle());

    (function loop() {
        ctx.clearRect(0, 0, W, H);
        particles.forEach(function(p) { p.update(); p.draw(); });
        requestAnimationFrame(loop);
    })();
}

// ── Order Form Quantity Controls ─────────────────────────────────────────────
var products = [
    { id: 1, price: 150 },
    { id: 2, price: 250 },
    { id: 3, price: 490 },
    { id: 4, price: 1250 },
];

function updateOrderSummary() {
    var total = 0;
    var items = [];

    products.forEach(function(p) {
        var qtyInput   = document.getElementById('qty_' + p.id);
        var subtotalEl = document.getElementById('subtotal_' + p.id);
        var row        = document.getElementById('row_' + p.id);
        var display    = document.getElementById('qty_display_' + p.id);
        if (!qtyInput) return;

        var qty = parseInt(qtyInput.value) || 0;
        var sub = qty * p.price;
        total += sub;

        if (display) display.textContent = qty;
        if (subtotalEl) subtotalEl.textContent = qty > 0 ? 'R' + sub.toFixed(0) : '';
        if (row) row.classList.toggle('selected', qty > 0);

        if (qty > 0) {
            var nameEl = row ? row.querySelector('[style*="font-weight:800"]') : null;
            items.push({ name: nameEl ? nameEl.textContent : 'Product', qty: qty, sub: sub });
        }
    });

    var productsEl = document.getElementById('productsTotal');
    var totalEl    = document.getElementById('grandTotal');
    var summaryEl  = document.getElementById('summaryItems');

    if (productsEl) productsEl.textContent = 'R' + total.toFixed(0);
    if (totalEl)    totalEl.textContent    = 'R' + total.toFixed(0);

    if (summaryEl) {
        if (items.length === 0) {
            summaryEl.innerHTML = '<p class="text-muted" style="text-align:center;padding:2rem 0;font-size:0.9rem;">🛒 No items selected</p>';
        } else {
            summaryEl.innerHTML = items.map(function(i) {
                return '<div class="order-summary-item"><div><div style="font-weight:600;">' + i.name + '</div><div style="font-size:0.8rem;color:var(--muted);">×' + i.qty + '</div></div><span style="font-weight:700;color:var(--primary);">R' + i.sub.toFixed(0) + '</span></div>';
            }).join('');
        }
    }
}

document.querySelectorAll('.qty-btn').forEach(function(btn) {
    btn.addEventListener('click', function() {
        var id    = btn.dataset.id;
        var input = document.getElementById('qty_' + id);
        if (!input) return;
        var val = parseInt(input.value) || 0;
        if (btn.classList.contains('plus'))  input.value = val + 1;
        if (btn.classList.contains('minus')) input.value = Math.max(0, val - 1);
        updateOrderSummary();
    });
});

// Pre-select product from URL param
(function() {
    var params = new URLSearchParams(window.location.search);
    var pid = params.get('product');
    if (pid) {
        var input = document.getElementById('qty_' + pid);
        if (input) { input.value = 1; updateOrderSummary(); }
    } else {
        updateOrderSummary();
    }
})();

// ── Suburb delivery note ──────────────────────────────────────────────────────
var suburbInput = document.getElementById('suburb');
var deliveryNote = document.getElementById('deliveryNote');
var deliveryDisplay = document.getElementById('deliveryDisplay');
if (suburbInput) {
    var kempton = ['kempton','glen marais','birchleigh','norkem','esther'];
    suburbInput.addEventListener('input', function() {
        var val = this.value.toLowerCase();
        var free = kempton.some(function(k) { return val.includes(k); });
        if (val.length > 2) {
            if (deliveryNote) {
                deliveryNote.textContent = free ? '✅ Free delivery applies!' : '⚠️ Delivery fee will be confirmed.';
                deliveryNote.style.color = free ? 'var(--success)' : '#92400e';
            }
            if (deliveryDisplay) {
                deliveryDisplay.textContent = free ? 'FREE' : 'TBC';
                deliveryDisplay.style.color = free ? 'var(--success)' : '#92400e';
            }
        }
    });
}

})();
