/* ============================================================
   AyuSutra — script.js
   Features: Particles · Cursor · Scroll · Counter · Carousel
             · Chakra Wheel · Intersection Observer · Form
   ============================================================ */

// ── DOM READY ────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  initCursor();
  initParticles();
  initNavbar();
  initScrollReveal();
  initCounters();
  initChakraWheel();
  initTestimonials();
  initForm();
  initHamburger();
});

// ── CUSTOM CURSOR RING ────────────────────────────────────────
function initCursor() {
  const glow = document.getElementById('cursorGlow');
  if (!glow || window.matchMedia('(pointer: coarse)').matches) return;

  let mx = -100, my = -100;
  let cx = -100, cy = -100;

  document.addEventListener('mousemove', e => { mx = e.clientX; my = e.clientY; });

  function animateCursor() {
    // Faster easing (0.22) so ring closely follows the real cursor
    cx += (mx - cx) * 0.22;
    cy += (my - cy) * 0.22;
    glow.style.left = cx + 'px';
    glow.style.top  = cy + 'px';
    requestAnimationFrame(animateCursor);
  }
  animateCursor();

  // Use .hovering class for interactive elements
  const interactiveSelectors = 'a, button, .condition-card, .dosha-badge, .hub-card, .hub-btn, .hub-card-btn, .dot, select, input, textarea';
  document.querySelectorAll(interactiveSelectors).forEach(el => {
    el.addEventListener('mouseenter', () => glow.classList.add('hovering'));
    el.addEventListener('mouseleave', () => glow.classList.remove('hovering'));
  });

  // Hide ring when cursor leaves window
  document.addEventListener('mouseleave', () => { glow.style.opacity = '0'; });
  document.addEventListener('mouseenter', () => { glow.style.opacity = '1'; });
}

// ── GOLD PARTICLE SYSTEM ──────────────────────────────────────
function initParticles() {
  const canvas = document.getElementById('particles');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');

  function resize() {
    canvas.width  = window.innerWidth;
    canvas.height = window.innerHeight;
  }
  resize();
  window.addEventListener('resize', resize);

  const PARTICLE_COUNT = 60;
  const particles = Array.from({ length: PARTICLE_COUNT }, () => createParticle());

  function createParticle() {
    return {
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      size: Math.random() * 2.5 + 0.5,
      speedX: (Math.random() - 0.5) * 0.4,
      speedY: (Math.random() - 0.5) * 0.4 - 0.2,
      opacity: Math.random() * 0.5 + 0.1,
      pulse: Math.random() * Math.PI * 2,
    };
  }

  function drawParticle(p) {
    p.pulse += 0.02;
    const alpha = p.opacity * (0.6 + 0.4 * Math.sin(p.pulse));
    ctx.beginPath();
    ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
    ctx.fillStyle = `rgba(212, 160, 23, ${alpha})`;
    ctx.fill();
  }

  function animate() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    particles.forEach(p => {
      drawParticle(p);
      p.x += p.speedX;
      p.y += p.speedY;

      if (p.y < -10) { p.y = canvas.height + 10; p.x = Math.random() * canvas.width; }
      if (p.x < -10) { p.x = canvas.width + 10; }
      if (p.x > canvas.width + 10) { p.x = -10; }
    });

    // Draw connecting lines between nearby particles
    particles.forEach((a, i) => {
      for (let j = i + 1; j < particles.length; j++) {
        const b = particles[j];
        const dist = Math.hypot(a.x - b.x, a.y - b.y);
        if (dist < 100) {
          ctx.beginPath();
          ctx.moveTo(a.x, a.y);
          ctx.lineTo(b.x, b.y);
          ctx.strokeStyle = `rgba(212, 160, 23, ${0.07 * (1 - dist / 100)})`;
          ctx.lineWidth = 0.5;
          ctx.stroke();
        }
      }
    });

    requestAnimationFrame(animate);
  }
  animate();
}

// ── NAVBAR SCROLL ────────────────────────────────────────────
function initNavbar() {
  const navbar = document.getElementById('navbar');
  if (!navbar) return;

  window.addEventListener('scroll', () => {
    navbar.classList.toggle('scrolled', window.scrollY > 60);
  }, { passive: true });

  // Smooth active link highlighting
  const sections = document.querySelectorAll('section[id]');
  const navLinks = document.querySelectorAll('.nav-links a');

  window.addEventListener('scroll', () => {
    let current = '';
    sections.forEach(s => {
      if (window.scrollY >= s.offsetTop - 200) current = s.id;
    });
    navLinks.forEach(a => {
      a.style.color = a.getAttribute('href') === '#' + current
        ? 'var(--saffron)' : '';
    });
  }, { passive: true });
}

// ── INTERSECTION OBSERVER (SCROLL REVEAL) ─────────────────────
function initScrollReveal() {
  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const delay = parseInt(entry.target.dataset.delay || 0);
        setTimeout(() => {
          entry.target.classList.add('visible');
        }, delay);
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.15 });

  document.querySelectorAll('.condition-card').forEach(card => {
    observer.observe(card);
  });
}

// ── ANIMATED COUNTERS ──────────────────────────────────────────
function initCounters() {
  const counters = document.querySelectorAll('.stat-num[data-target]');
  if (!counters.length) return;

  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        animateCounter(entry.target);
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.8 });

  counters.forEach(c => observer.observe(c));

  function animateCounter(el) {
    const target = parseInt(el.dataset.target);
    const duration = 2000;
    const start = performance.now();

    function update(now) {
      const elapsed = now - start;
      const progress = Math.min(elapsed / duration, 1);
      // Ease out cubic
      const eased = 1 - Math.pow(1 - progress, 3);
      el.textContent = Math.round(eased * target).toLocaleString('en-IN');
      if (progress < 1) requestAnimationFrame(update);
    }
    requestAnimationFrame(update);
  }
}

// ── CHAKRA WHEEL POSITIONING ───────────────────────────────────
function initChakraWheel() {
  const wheel  = document.getElementById('chakraWheel');
  if (!wheel) return;

  const petals = wheel.querySelectorAll('.chakra-petal');
  const count  = petals.length;
  const radius = 120;

  petals.forEach((petal, i) => {
    const angle = (i / count) * 2 * Math.PI - Math.PI / 2;
    const x = Math.cos(angle) * radius;
    const y = Math.sin(angle) * radius;
    petal.style.transform = `translate(calc(${x}px - 50%), calc(${y}px - 50%))`;
  });

  // Slowly rotate on scroll
  window.addEventListener('scroll', () => {
    const deg = window.scrollY * 0.02;
    const center = wheel.querySelector('.chakra-center');
    if (center) center.style.transform = `translate(-50%, -50%) rotate(${deg}deg)`;
  }, { passive: true });
}

// ── TESTIMONIAL CAROUSEL ───────────────────────────────────────
function initTestimonials() {
  const cards = document.querySelectorAll('.testimonial-card');
  const dots  = document.querySelectorAll('.dot');
  if (!cards.length) return;

  let current = 0;
  let timer;

  function goTo(idx) {
    cards[current].classList.remove('active');
    dots[current].classList.remove('active');
    current = (idx + cards.length) % cards.length;
    cards[current].classList.add('active');
    dots[current].classList.add('active');
  }

  function startAutoplay() {
    timer = setInterval(() => goTo(current + 1), 5000);
  }

  dots.forEach(dot => {
    dot.addEventListener('click', () => {
      clearInterval(timer);
      goTo(parseInt(dot.dataset.idx));
      startAutoplay();
    });
  });

  startAutoplay();

  // Swipe support
  let startX = 0;
  const track = document.getElementById('testimonialTrack');
  if (track) {
    track.addEventListener('touchstart', e => { startX = e.touches[0].clientX; }, { passive: true });
    track.addEventListener('touchend', e => {
      const diff = startX - e.changedTouches[0].clientX;
      if (Math.abs(diff) > 50) {
        clearInterval(timer);
        goTo(current + (diff > 0 ? 1 : -1));
        startAutoplay();
      }
    }, { passive: true });
  }
}

// ── CONTACT FORM ───────────────────────────────────────────────
function initForm() {
  const form    = document.getElementById('contactForm');
  const success = document.getElementById('formSuccess');
  if (!form || !success) return;

  form.addEventListener('submit', e => {
    e.preventDefault();

    const name    = document.getElementById('formName');
    const phone   = document.getElementById('formPhone');
    const concern = document.getElementById('formConcern');

    // Basic validation
    let valid = true;
    [name, phone, concern].forEach(el => {
      if (!el.value.trim()) {
        el.style.borderColor = 'var(--red-indian)';
        el.style.boxShadow   = '0 0 0 3px rgba(139,26,26,0.15)';
        valid = false;
      } else {
        el.style.borderColor = '';
        el.style.boxShadow   = '';
      }
    });

    if (!valid) return;

    // Simulate submission
    const btn = form.querySelector('.form-submit');
    btn.textContent = 'Submitting…';
    btn.disabled = true;

    setTimeout(() => {
      form.reset();
      btn.innerHTML = '<span>Request Consultation</span><span>✦</span>';
      btn.disabled = false;
      success.classList.add('show');
      setTimeout(() => success.classList.remove('show'), 5000);
    }, 1200);
  });

  // Live field validation
  [document.getElementById('formName'), document.getElementById('formPhone')].forEach(el => {
    if (!el) return;
    el.addEventListener('input', () => {
      if (el.value.trim()) {
        el.style.borderColor = '';
        el.style.boxShadow   = '';
      }
    });
  });
}

// ── MOBILE NAV DRAWER ─────────────────────────────────────────
function initHamburger() {
  const hamburger = document.getElementById('hamburger');
  const drawer    = document.getElementById('mobileDrawer');
  const overlay   = document.getElementById('mobileOverlay');
  const closeBtn  = document.getElementById('mobileClose');
  if (!hamburger || !drawer) return;

  // Only make the drawer flex (off-screen via translateX). 
  // NEVER set overlay to display:block on init — it covers the ENTIRE PAGE
  // at z-index:1099 and blocks all clicks (links, buttons, everything)!
  drawer.style.display = 'flex';
  overlay.style.display = 'none'; // stays hidden until drawer opens

  function openDrawer() {
    overlay.style.display = 'block'; // show overlay first
    void overlay.offsetWidth;        // force reflow for transition
    drawer.classList.add('open');
    overlay.classList.add('open');
    hamburger.classList.add('active');
    document.body.style.overflow = 'hidden';
  }

  function closeDrawer() {
    drawer.classList.remove('open');
    overlay.classList.remove('open');
    hamburger.classList.remove('active');
    document.body.style.overflow = '';
    // Hide overlay after fade-out transition (300ms)
    setTimeout(() => { overlay.style.display = 'none'; }, 320);
  }

  hamburger.addEventListener('click', openDrawer);
  if (closeBtn) closeBtn.addEventListener('click', closeDrawer);
  overlay.addEventListener('click', closeDrawer);

  // Close on mobile link click
  drawer.querySelectorAll('a').forEach(a => {
    a.addEventListener('click', closeDrawer);
  });

  // Close on Escape key
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape') closeDrawer();
  });
}

// ── PARALLAX HERO WATERMARK ────────────────────────────────────
window.addEventListener('scroll', () => {
  const bg = document.querySelector('.watermark-bg');
  if (bg) {
    bg.style.transform = `translateY(${window.scrollY * 0.15}px)`;
  }
}, { passive: true });

// ── PAGE LOAD PROGRESS BAR ─────────────────────────────────────
(function initProgressBar() {
  const bar = document.createElement('div');
  bar.id = 'progressBar';
  bar.style.cssText = `
    position: fixed; top: 0; left: 0; z-index: 9999;
    height: 3px; width: 0%;
    background: linear-gradient(to right, var(--gold), var(--saffron));
    transition: width 0.1s;
    box-shadow: 0 0 10px rgba(212,160,23,0.6);
  `;
  document.body.prepend(bar);

  window.addEventListener('scroll', () => {
    const total   = document.body.scrollHeight - window.innerHeight;
    const percent = (window.scrollY / total) * 100;
    bar.style.width = Math.min(percent, 100) + '%';
  }, { passive: true });
})();