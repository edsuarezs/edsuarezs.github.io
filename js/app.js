/* ============================================================
   Edward Suarez — Portfolio 2026 · app.js
   Vanilla JS — no jQuery
   ============================================================ */

'use strict';

/* ── Age Calculation ──────────────────────────────────────── */
function calcAge(dob) {
  const today = new Date(), birth = new Date(dob);
  let age = today.getFullYear() - birth.getFullYear();
  const m = today.getMonth() - birth.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) age--;
  return age;
}

/* ── Preloader ────────────────────────────────────────────── */
function initPreloader() {
  const loader = document.querySelector('.preloader');
  if (!loader) return;
  window.addEventListener('load', () => {
    setTimeout(() => loader.classList.add('done'), 300);
  });
}

/* ── Pulse Line Animation ─────────────────────────────────── */
function initPulseLine() {
  const path = document.querySelector('.pulse-path');
  if (!path) return;
  const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (prefersReduced) return;

  const len = path.getTotalLength();
  path.style.strokeDasharray = len;
  path.style.strokeDashoffset = len;

  setTimeout(() => {
    path.style.transition = 'stroke-dashoffset 1.8s cubic-bezier(0.4, 0, 0.2, 1)';
    path.style.strokeDashoffset = '0';
  }, 600);
}

/* ── Hero Role Cycler ─────────────────────────────────────── */
function initRoleCycler() {
  const el = document.getElementById('hero-role');
  if (!el) return;
  const roles = ['Senior DevSecOps Engineer', 'Cloud Architect', 'Backend Developer (Go)'];
  let idx = 0;

  function cycle() {
    el.style.opacity = '0';
    el.style.transform = 'translateY(8px)';
    setTimeout(() => {
      idx = (idx + 1) % roles.length;
      el.textContent = roles[idx];
      el.style.opacity = '1';
      el.style.transform = 'translateY(0)';
    }, 320);
  }

  el.style.transition = 'opacity 0.3s ease, transform 0.3s ease';
  setInterval(cycle, 3200);
}

/* ── Mobile Navigation ────────────────────────────────────── */
function initMobileNav() {
  const toggle = document.querySelector('.nav-toggle');
  const mobileNav = document.getElementById('mobile-nav');
  if (!toggle || !mobileNav) return;

  toggle.addEventListener('click', () => {
    const open = mobileNav.classList.toggle('open');
    toggle.classList.toggle('open', open);
    toggle.setAttribute('aria-expanded', String(open));
    mobileNav.setAttribute('aria-hidden', String(!open));
    document.body.style.overflow = open ? 'hidden' : '';
  });

  mobileNav.querySelectorAll('a').forEach(a => {
    a.addEventListener('click', () => {
      mobileNav.classList.remove('open');
      toggle.classList.remove('open');
      toggle.setAttribute('aria-expanded', 'false');
      mobileNav.setAttribute('aria-hidden', 'true');
      document.body.style.overflow = '';
    });
  });
}

/* ── Active Nav Highlighting ──────────────────────────────── */
function initNavHighlight() {
  const sections = document.querySelectorAll('main section[id]');
  const navLinks = document.querySelectorAll('.nav-links a[href^="#"]');
  if (!sections.length || !navLinks.length) return;

  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        navLinks.forEach(a => {
          a.classList.toggle('active', a.getAttribute('href') === `#${entry.target.id}`);
        });
      }
    });
  }, { rootMargin: '-40% 0px -55% 0px' });

  sections.forEach(s => observer.observe(s));
}

/* ── Scroll Reveal ────────────────────────────────────────── */
function initScrollReveal() {
  const els = document.querySelectorAll('.reveal');
  if (!els.length) return;
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    els.forEach(el => el.classList.add('visible'));
    return;
  }
  const observer = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (e.isIntersecting) { e.target.classList.add('visible'); observer.unobserve(e.target); }
    });
  }, { threshold: 0.12 });
  els.forEach(el => observer.observe(el));
}

/* ── Project Filtering ────────────────────────────────────── */
function initProjectFilter() {
  const btns  = document.querySelectorAll('.filter-btn');
  const cards = document.querySelectorAll('.project-card');
  if (!btns.length || !cards.length) return;

  btns.forEach(btn => {
    btn.addEventListener('click', () => {
      btns.forEach(b => { b.classList.remove('active'); b.removeAttribute('aria-pressed'); });
      btn.classList.add('active');
      btn.setAttribute('aria-pressed', 'true');

      const filter = btn.dataset.filter;
      cards.forEach(card => {
        const match = filter === 'all' || card.dataset.category === filter;
        card.classList.toggle('hidden', !match);
        card.setAttribute('aria-hidden', String(!match));
      });
    });
  });
}

/* ── Project Modal ────────────────────────────────────────── */
function initProjectModal() {
  const modal    = document.getElementById('project-modal');
  const backdrop = document.getElementById('modal-backdrop');
  const closeBtn = document.getElementById('modal-close');
  const content  = document.getElementById('modal-content');
  const cards    = document.querySelectorAll('.project-card[data-portfolio]');
  if (!modal || !cards.length) return;

  function openModal(portfolioFile) {
    modal.setAttribute('aria-hidden', 'false');
    modal.classList.add('open');
    document.body.style.overflow = 'hidden';
    content.innerHTML = `<div style="padding:var(--s12);text-align:center;"><div class="preloader-ring" style="margin:0 auto;"></div></div>`;

    fetch(portfolioFile)
      .then(r => { if (!r.ok) throw new Error('Not found'); return r.text(); })
      .then(html => {
        const doc = new DOMParser().parseFromString(`<div>${html}</div>`, 'text/html');
        renderModal(doc, content, portfolioFile);
      })
      .catch(() => {
        content.innerHTML = `<div style="padding:var(--s8);text-align:center;color:var(--muted);">Failed to load project details.</div>`;
      });

    setTimeout(() => closeBtn.focus(), 100);
  }

  function closeModal() {
    modal.setAttribute('aria-hidden', 'true');
    modal.classList.remove('open');
    document.body.style.overflow = '';
  }

  function renderModal(doc, container, portfolioFile) {
    const titleEl = doc.querySelector('h1');
    const title   = titleEl ? titleEl.textContent.trim() : 'Project';

    const paragraphs = doc.querySelectorAll('.project-description p.text-justify');
    const desc = Array.from(paragraphs).map(p => `<p>${p.innerHTML}</p>`).join('');

    const tags = doc.querySelectorAll('.tags li');
    const techTags = Array.from(tags).map(t => `<span class="tech-tag">${t.textContent.trim()}</span>`).join('');

    const metaItems = doc.querySelectorAll('.project-general-info li p');
    let metaHTML = '';
    metaItems.forEach(m => {
      const icon = m.querySelector('i');
      const text = m.textContent.trim();
      if (icon) icon.remove();
      metaHTML += `<div><p>${m.textContent.trim()}</p></div>`;
    });

    /* Build images list */
    const imgs = doc.querySelectorAll('.project-images img');
    const imageHTML = Array.from(imgs).map(img =>
      `<img src="${img.getAttribute('src')}" alt="${img.getAttribute('alt') || ''}" loading="lazy" />`
    ).join('');

    /* Share links from original */
    const shareLinksRaw = doc.querySelectorAll('.share-buttons a');
    const shareHTML = Array.from(shareLinksRaw).map(a => {
      const icon = a.querySelector('i');
      return `<a href="${a.href}" target="_blank" rel="noopener noreferrer" class="share-link" aria-label="Share on ${icon ? icon.className : 'social'}">${icon ? icon.outerHTML : ''}</a>`;
    }).join('');

    container.innerHTML = `
      <h1>${title}</h1>
      ${imageHTML ? `<div class="project-images">${imageHTML}</div>` : ''}
      <div>${desc}</div>
      ${techTags ? `
        <div class="meta-group" style="margin-top:var(--s4);">
          <label>Technology</label>
          <div class="tech-tags">${techTags}</div>
        </div>` : ''}
      ${shareHTML ? `
        <div class="share-links">
          <span style="font-size:0.78rem;color:var(--muted);margin-right:var(--s1);font-family:var(--f-mono);text-transform:uppercase;letter-spacing:0.06em;">Share</span>
          ${shareHTML}
        </div>` : ''}
      <div class="modal-book-cta">
        <p>Interested in building something like this?</p>
        <a
          href="https://calendly.com/edsuarez0299/1-1-technical-consultation?utm_source=project-modal&utm_campaign=portfolio_booking"
          class="btn btn-primary open-calendly"
          data-utm="project-modal"
        >
          <i class="far fa-calendar-alt" aria-hidden="true"></i>&nbsp;Schedule a Discovery Call
        </a>
      </div>
    `;
  }

  cards.forEach(card => {
    card.addEventListener('click', () => openModal(card.dataset.portfolio));
    card.addEventListener('keydown', e => {
      if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); openModal(card.dataset.portfolio); }
    });
  });

  closeBtn.addEventListener('click', closeModal);
  backdrop.addEventListener('click', closeModal);
  document.addEventListener('keydown', e => { if (e.key === 'Escape' && modal.classList.contains('open')) closeModal(); });
}

/* ── Testimonials Scroll + Mouse Drag ────────────────────── */
function initTestimonialsNav() {
  const track = document.getElementById('testimonials-track');
  const prev  = document.getElementById('test-prev');
  const next  = document.getElementById('test-next');
  if (!track || !prev || !next) return;

  const card = track.querySelector('.testimonial-card');
  const scrollAmount = () => (card ? card.offsetWidth + 24 : 480);

  prev.addEventListener('click', () => track.scrollBy({ left: -scrollAmount(), behavior: 'smooth' }));
  next.addEventListener('click', () => track.scrollBy({ left:  scrollAmount(), behavior: 'smooth' }));

  /* Mouse drag-to-scroll */
  let isDragging = false;
  let startX = 0;
  let startScrollLeft = 0;
  let didDrag = false;

  track.addEventListener('mousedown', e => {
    isDragging = true;
    didDrag = false;
    startX = e.pageX - track.offsetLeft;
    startScrollLeft = track.scrollLeft;
    track.style.cursor = 'grabbing';
    track.style.userSelect = 'none';
    e.preventDefault();
  });

  document.addEventListener('mousemove', e => {
    if (!isDragging) return;
    const x    = e.pageX - track.offsetLeft;
    const walk = (x - startX) * 1.2;
    if (Math.abs(walk) > 4) didDrag = true;
    track.scrollLeft = startScrollLeft - walk;
  });

  const stopDrag = () => {
    if (!isDragging) return;
    isDragging = false;
    track.style.cursor = 'grab';
    track.style.userSelect = '';
    if (didDrag) {
      /* Snap to nearest card after drag */
      const snapTo = Math.round(track.scrollLeft / scrollAmount()) * scrollAmount();
      track.scrollTo({ left: snapTo, behavior: 'smooth' });
    }
  };
  document.addEventListener('mouseup',    stopDrag);
  document.addEventListener('mouseleave', stopDrag);

  /* Prevent click on links inside cards when user was dragging */
  track.addEventListener('click', e => {
    if (didDrag) e.preventDefault();
  }, true);

  track.style.cursor = 'grab';
}

/* ── Contact Form ─────────────────────────────────────────── */
function initContactForm() {
  const form     = document.getElementById('contact_form');
  const feedback = document.getElementById('form_feedback');
  const submitBtn = document.getElementById('form_submit');
  if (!form || !feedback) return;

  form.addEventListener('submit', async e => {
    e.preventDefault();
    if (!form.checkValidity()) { form.reportValidity(); return; }

    submitBtn.disabled = true;
    submitBtn.textContent = 'Sending…';
    feedback.textContent = '';

    try {
      const res = await fetch(form.action, {
        method: 'POST',
        body: new FormData(form),
        headers: { 'Accept': 'application/json' }
      });

      if (res.ok) {
        feedback.style.color = 'var(--jade)';
        feedback.textContent = '✓ Message sent! I\'ll get back to you soon.';
        form.reset();
      } else {
        throw new Error('Form submission failed');
      }
    } catch {
      feedback.style.color = 'var(--flare)';
      feedback.textContent = '✗ Something went wrong. Please email me directly at contact@edwardsuarez.com';
    } finally {
      submitBtn.disabled = false;
      submitBtn.textContent = 'Send Message';
    }
  });
}

/* ── Google Maps ──────────────────────────────────────────── */
window.initMap = function() {
  const mapEl = document.getElementById('map');
  if (!mapEl || !window.google) return;

  const medellin = { lat: 6.2442, lng: -75.5812 };
  const map = new google.maps.Map(mapEl, {
    zoom: 12,
    center: medellin,
    disableDefaultUI: true,
    styles: [
      { elementType: 'geometry',            stylers: [{ color: '#0b1120' }] },
      { elementType: 'labels.text.stroke',  stylers: [{ color: '#0b1120' }] },
      { elementType: 'labels.text.fill',    stylers: [{ color: '#7a9ab5' }] },
      { featureType: 'road',                elementType: 'geometry', stylers: [{ color: '#142035' }] },
      { featureType: 'road',                elementType: 'geometry.stroke', stylers: [{ color: '#1b2d47' }] },
      { featureType: 'water',               elementType: 'geometry', stylers: [{ color: '#0d1926' }] },
      { featureType: 'poi',                 stylers: [{ visibility: 'off' }] },
      { featureType: 'transit',             stylers: [{ visibility: 'off' }] },
      { featureType: 'administrative',      elementType: 'geometry.stroke', stylers: [{ color: '#1b2d47' }] },
    ]
  });

  new google.maps.Marker({
    position: medellin,
    map,
    title: 'Medellín, Colombia',
    icon: {
      path: google.maps.SymbolPath.CIRCLE,
      fillColor: '#00D9A6',
      fillOpacity: 1,
      strokeWeight: 0,
      scale: 8
    }
  });
};

/* ── Calendly Popup — Event Delegation ───────────────────── */
function initCalendlyLinks() {
  const BASE  = 'https://calendly.com/edsuarez0299/1-1-technical-consultation';
  const THEME = 'background_color=142035&text_color=ebf2fa&primary_color=00d9a6';

  document.addEventListener('click', e => {
    const el = e.target.closest('.open-calendly');
    if (!el) return;
    e.preventDefault();
    const utm = el.dataset.utm || 'website';
    const url = `${BASE}?${THEME}&utm_source=${utm}&utm_campaign=portfolio_booking`;
    if (window.Calendly && typeof Calendly.initPopupWidget === 'function') {
      Calendly.initPopupWidget({ url });
    } else {
      window.open(url, '_blank', 'noopener,noreferrer');
    }
  });
}

/* ── Floating Action Button ──────────────────────────────── */
function initFAB() {
  const fab  = document.getElementById('fab-booking');
  const hero = document.getElementById('hero');
  if (!fab || !hero) return;

  const observer = new IntersectionObserver(
    ([entry]) => fab.classList.toggle('fab-visible', !entry.isIntersecting),
    { threshold: 0.15 }
  );
  observer.observe(hero);
}

/* ── Scroll Progress Bar ─────────────────────────────────── */
function initScrollProgress() {
  const bar = document.getElementById('scroll-progress');
  if (!bar) return;
  window.addEventListener('scroll', () => {
    const scrolled = window.scrollY;
    const total    = document.documentElement.scrollHeight - window.innerHeight;
    bar.style.width = total > 0 ? `${(scrolled / total) * 100}%` : '0%';
  }, { passive: true });
}

/* ── Back to Top ─────────────────────────────────────────── */
function initBackToTop() {
  const btn  = document.getElementById('back-to-top');
  const hero = document.getElementById('hero');
  if (!btn || !hero) return;

  const observer = new IntersectionObserver(
    ([entry]) => btn.classList.toggle('btt-visible', !entry.isIntersecting),
    { threshold: 0.15 }
  );
  observer.observe(hero);

  btn.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));
}

/* ── Stats Counter Animation ─────────────────────────────── */
function initStatsCounters() {
  const counters = document.querySelectorAll('.stat-number');
  if (!counters.length) return;
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      observer.unobserve(entry.target);

      const el     = entry.target;
      const text   = el.textContent.trim();
      const match  = text.match(/^([\d.]+)(.*)$/);
      if (!match) return;

      const target   = parseFloat(match[1]);
      const suffix   = match[2];
      const isFloat  = match[1].includes('.');
      const duration = 1600;
      const start    = performance.now();

      function tick(now) {
        const p    = Math.min((now - start) / duration, 1);
        const ease = 1 - Math.pow(1 - p, 3);
        const val  = target * ease;
        el.textContent = (isFloat ? val.toFixed(1) : Math.floor(val)) + suffix;
        if (p < 1) requestAnimationFrame(tick);
      }
      requestAnimationFrame(tick);
    });
  }, { threshold: 0.6 });

  counters.forEach(c => observer.observe(c));
}

/* ── Init ─────────────────────────────────────────────────── */
document.addEventListener('DOMContentLoaded', () => {
  /* Age */
  const ageEl = document.getElementById('age');
  if (ageEl) ageEl.textContent = calcAge('1999-02-21');

  initPreloader();
  initPulseLine();
  initRoleCycler();
  initMobileNav();
  initNavHighlight();
  initScrollReveal();
  initProjectFilter();
  initProjectModal();
  initTestimonialsNav();
  initContactForm();
  initCalendlyLinks();
  initFAB();
  initScrollProgress();
  initBackToTop();
  initStatsCounters();
});
