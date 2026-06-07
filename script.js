/* =========================================
   PIZZATWIST — script.js
   Vanilla JS · no external dependencies
   ========================================= */

document.addEventListener('DOMContentLoaded', () => {
  initNavScroll();
  initMobileMenu();
  initCarousel();
  initContactForm();
  setFooterYear();
  initParticles();
  initMenuFilter();
});

/* -----------------------------------------
   Sticky nav: add .scrolled class on scroll
   ----------------------------------------- */
function initNavScroll() {
  const header = document.getElementById('site-header');
  const threshold = 60;

  const update = () => header.classList.toggle('scrolled', window.scrollY > threshold);

  window.addEventListener('scroll', update, { passive: true });
  update(); // run once on load
}

/* -----------------------------------------
   Mobile nav: toggle open / close
   ----------------------------------------- */
function initMobileMenu() {
  const toggle  = document.querySelector('.nav-toggle');
  const navMenu = document.getElementById('nav-menu');
  if (!toggle || !navMenu) return;

  const open  = () => { navMenu.classList.add('open');    toggle.setAttribute('aria-expanded', 'true');  };
  const close = () => { navMenu.classList.remove('open'); toggle.setAttribute('aria-expanded', 'false'); };

  toggle.addEventListener('click', () =>
    navMenu.classList.contains('open') ? close() : open()
  );

  // Close when any nav link is clicked
  navMenu.querySelectorAll('a').forEach(a => a.addEventListener('click', close));

  // Close on outside click
  document.addEventListener('click', (e) => {
    if (navMenu.classList.contains('open') &&
        !toggle.contains(e.target) &&
        !navMenu.contains(e.target)) {
      close();
    }
  });

  // Close on Escape key
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && navMenu.classList.contains('open')) close();
  });
}

/* -----------------------------------------
   Reviews carousel
   - Responsive: 1 / 2 / 3 cards visible
   - Auto-advances every 5 s
   - Touch / swipe support
   - Keyboard ← → navigation
   ----------------------------------------- */
function initCarousel() {
  const track        = document.getElementById('reviews-track');
  const dotsWrap     = document.getElementById('carousel-dots');
  const prevBtn      = document.getElementById('prev-btn');
  const nextBtn      = document.getElementById('next-btn');
  if (!track) return;

  const cards = Array.from(track.querySelectorAll('.review-card'));
  if (!cards.length) return;

  let current   = 0;
  let autoTimer = null;

  /* How many cards fit side-by-side at current viewport width */
  function visibleCount() {
    if (window.innerWidth >= 1040) return 3;
    if (window.innerWidth >= 680)  return 2;
    return 1;
  }

  function maxIndex() {
    return Math.max(0, cards.length - visibleCount());
  }

  /* Slide the track to position `idx` */
  function goTo(idx) {
    current = Math.max(0, Math.min(idx, maxIndex()));

    // Measure the rendered card width + gap (24 px = 1.5rem)
    const cardRect = cards[0].getBoundingClientRect();
    const offset   = current * (cardRect.width + 24);
    track.style.transform = `translateX(-${offset}px)`;

    updateDots();
  }

  function advance() { goTo(current >= maxIndex() ? 0 : current + 1); }
  function retreat() { goTo(current <= 0 ? maxIndex() : current - 1); }

  /* Build / rebuild dot indicators */
  function buildDots() {
    dotsWrap.innerHTML = '';
    const count = maxIndex() + 1;
    for (let i = 0; i < count; i++) {
      const btn = document.createElement('button');
      btn.className = 'dot' + (i === current ? ' active' : '');
      btn.setAttribute('aria-label', `Go to review ${i + 1}`);
      btn.setAttribute('role', 'tab');
      btn.addEventListener('click', () => { goTo(i); resetAuto(); });
      dotsWrap.appendChild(btn);
    }
  }

  function updateDots() {
    dotsWrap.querySelectorAll('.dot').forEach((d, i) =>
      d.classList.toggle('active', i === current)
    );
  }

  /* Auto-play */
  function startAuto() { autoTimer = setInterval(advance, 5000); }
  function resetAuto()  { clearInterval(autoTimer); startAuto(); }

  /* Button listeners */
  prevBtn.addEventListener('click', () => { retreat(); resetAuto(); });
  nextBtn.addEventListener('click', () => { advance(); resetAuto(); });

  /* Keyboard */
  document.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowLeft')  { retreat(); resetAuto(); }
    if (e.key === 'ArrowRight') { advance(); resetAuto(); }
  });

  /* Touch / swipe */
  let touchStartX = 0;
  track.addEventListener('touchstart', (e) => {
    touchStartX = e.touches[0].clientX;
  }, { passive: true });
  track.addEventListener('touchend', (e) => {
    const delta = touchStartX - e.changedTouches[0].clientX;
    if (Math.abs(delta) > 45) {
      delta > 0 ? advance() : retreat();
      resetAuto();
    }
  });

  /* Pause on hover / focus */
  track.addEventListener('mouseenter', () => clearInterval(autoTimer));
  track.addEventListener('mouseleave', startAuto);
  track.addEventListener('focusin',   () => clearInterval(autoTimer));
  track.addEventListener('focusout',  startAuto);

  /* Rebuild on resize (debounced) */
  let resizeTimer;
  window.addEventListener('resize', () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => {
      buildDots();
      goTo(Math.min(current, maxIndex()));
    }, 200);
  });

  buildDots();
  startAuto();
}

/* -----------------------------------------
   Contact form — client-side validation
   The form uses a mailto: action which opens
   the user's default email client. For
   production, replace with a backend endpoint
   or a service like Formspree / EmailJS.
   ----------------------------------------- */
function initContactForm() {
  const form   = document.getElementById('contact-form');
  const status = document.getElementById('form-status');
  if (!form || !status) return;

  const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  form.addEventListener('submit', (e) => {
    const name    = form.name.value.trim();
    const email   = form.email.value.trim();
    const message = form.message.value.trim();

    if (!name || !email || !message) {
      e.preventDefault();
      showStatus('Please fill in all required fields.', 'error');
      return;
    }

    if (!emailRe.test(email)) {
      e.preventDefault();
      showStatus('Please enter a valid email address.', 'error');
      return;
    }

    // Validation passed — mailto: will fire; inform the user.
    showStatus('Opening your email client to send the message…', 'success');
  });

  function showStatus(msg, type) {
    status.textContent = msg;
    status.style.color = type === 'error' ? 'var(--red)' : '#27ae60';
  }
}

/* -----------------------------------------
   Footer: set current year dynamically
   ----------------------------------------- */
function setFooterYear() {
  const el = document.getElementById('year');
  if (el) el.textContent = new Date().getFullYear();
}

/* -----------------------------------------
   Hero particles — floating spice dots
   ----------------------------------------- */
function initParticles() {
  const container = document.querySelector('.hero-particles');
  if (!container) return;

  const colors  = ['#F39C12', '#C0392B', '#f8c471', '#e74c3c', '#FFF8F0', '#F39C12'];
  const COUNT   = 20;

  for (let i = 0; i < COUNT; i++) {
    const p    = document.createElement('div');
    p.className = 'particle';

    const size    = 3 + Math.random() * 7;
    const left    = 3 + Math.random() * 94;
    const dur     = 7  + Math.random() * 9;
    const del     = Math.random() * 12;
    const opacity = 0.2 + Math.random() * 0.45;
    const color   = colors[Math.floor(Math.random() * colors.length)];

    p.style.cssText = [
      `width:${size}px`,
      `height:${size}px`,
      `background:${color}`,
      `left:${left}%`,
      `bottom:-${size + 10}px`,
      `--dur:${dur}s`,
      `--del:${del}s`,
      `--op:${opacity}`,
    ].join(';');

    container.appendChild(p);
  }
}

/* -----------------------------------------
   Menu filter — show / hide by pizza type
   ----------------------------------------- */
function initMenuFilter() {
  const btns  = document.querySelectorAll('.filter-btn');
  const cards = document.querySelectorAll('.menu-card');
  if (!btns.length || !cards.length) return;

  btns.forEach(btn => {
    btn.addEventListener('click', () => {
      btns.forEach(b => { b.classList.remove('active'); b.setAttribute('aria-pressed', 'false'); });
      btn.classList.add('active');
      btn.setAttribute('aria-pressed', 'true');

      const filter = btn.dataset.filter;
      cards.forEach(card => {
        const visible = filter === 'all' || card.dataset.type === filter;
        card.style.display = visible ? '' : 'none';
      });
    });
  });
}
