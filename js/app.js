"use strict";

const $ = (selector, scope = document) => scope.querySelector(selector);
const $$ = (selector, scope = document) => Array.from(scope.querySelectorAll(selector));

function initMobileNav() {
  const toggle = $(".nav-toggle");
  const links = $("#nav-links");
  if (!toggle || !links) return;

  function setOpen(open) {
    toggle.classList.toggle("open", open);
    links.classList.toggle("open", open);
    document.body.classList.toggle("menu-open", open);
    toggle.setAttribute("aria-expanded", String(open));
    toggle.setAttribute("aria-label", open ? "Close menu" : "Open menu");
  }

  toggle.addEventListener("click", () => setOpen(!links.classList.contains("open")));
  $$("#nav-links a").forEach((link) => link.addEventListener("click", () => setOpen(false)));
}

function initActiveNav() {
  const sections = $$("main section[id]");
  const links = $$(".nav-links a[href^='#']");
  if (!sections.length || !links.length) return;

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        const id = `#${entry.target.id}`;
        links.forEach((link) => link.classList.toggle("active", link.getAttribute("href") === id));
      });
    },
    { rootMargin: "-38% 0px -58% 0px" }
  );

  sections.forEach((section) => observer.observe(section));
}

function initReveal() {
  const items = $$(".reveal");
  if (!items.length) return;

  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    items.forEach((item) => item.classList.add("visible"));
    return;
  }

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add("visible");
        observer.unobserve(entry.target);
      });
    },
    { threshold: 0.12 }
  );

  items.forEach((item) => observer.observe(item));
}

function initCounters() {
  const counters = $$(".metric-number[data-count]");
  if (!counters.length || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        observer.unobserve(entry.target);

        const el = entry.target;
        const target = Number(el.dataset.count || 0);
        const start = performance.now();
        const duration = 1200;

        function tick(now) {
          const progress = Math.min((now - start) / duration, 1);
          const eased = 1 - Math.pow(1 - progress, 3);
          el.textContent = String(Math.round(target * eased));
          if (progress < 1) requestAnimationFrame(tick);
        }

        requestAnimationFrame(tick);
      });
    },
    { threshold: 0.6 }
  );

  counters.forEach((counter) => observer.observe(counter));
}

function initBackToTop() {
  const button = $("#back-to-top");
  if (!button) return;

  function update() {
    button.classList.toggle("visible", window.scrollY > 720);
  }

  window.addEventListener("scroll", update, { passive: true });
  button.addEventListener("click", () => window.scrollTo({ top: 0, behavior: "smooth" }));
  update();
}

function initCalendly() {
  const base = "https://calendly.com/edsuarez0299/1-1-technical-consultation";
  const theme = "background_color=070b12&text_color=eef4f8&primary_color=3ee6b5";
  let loadingPromise = null;

  function loadCalendlyAssets() {
    if (window.Calendly && typeof window.Calendly.initPopupWidget === "function") {
      return Promise.resolve();
    }

    if (loadingPromise) return loadingPromise;

    loadingPromise = new Promise((resolve, reject) => {
      if (!document.querySelector("link[data-calendly-css]")) {
        const css = document.createElement("link");
        css.rel = "stylesheet";
        css.href = "https://assets.calendly.com/assets/external/widget.css";
        css.dataset.calendlyCss = "true";
        document.head.appendChild(css);
      }

      const script = document.createElement("script");
      script.src = "https://assets.calendly.com/assets/external/widget.js";
      script.async = true;
      script.onload = () => resolve();
      script.onerror = () => reject(new Error("Calendly failed to load"));
      document.head.appendChild(script);
    });

    return loadingPromise;
  }

  document.addEventListener("click", async (event) => {
    const link = event.target.closest(".open-calendly");
    if (!link) return;
    event.preventDefault();

    const utm = link.dataset.utm || "portfolio";
    const url = `${base}?${theme}&utm_source=${encodeURIComponent(utm)}&utm_campaign=portfolio_booking`;

    try {
      await loadCalendlyAssets();
      window.Calendly.initPopupWidget({ url });
    } catch {
      window.open(url, "_blank", "noopener,noreferrer");
    }
  });
}

function initContactForm() {
  const form = $("#contact_form");
  const feedback = $("#form_feedback");
  const submit = $("#form_submit");
  if (!form || !feedback || !submit) return;

  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    if (!form.checkValidity()) {
      form.reportValidity();
      return;
    }

    submit.disabled = true;
    submit.textContent = "Sending...";
    feedback.className = "form-feedback";
    feedback.textContent = "";

    try {
      const response = await fetch(form.action, {
        method: "POST",
        body: new FormData(form),
        headers: { Accept: "application/json" },
      });

      if (!response.ok) throw new Error("Form submission failed");

      form.reset();
      feedback.className = "form-feedback success";
      feedback.textContent = "Message sent. I will get back to you soon.";
    } catch {
      feedback.className = "form-feedback error";
      feedback.textContent = "The form could not send. Please email me directly at contact@edwardsuarez.com.";
    } finally {
      submit.disabled = false;
      submit.textContent = "Send message";
    }
  });
}

document.addEventListener("DOMContentLoaded", () => {
  initMobileNav();
  initActiveNav();
  initReveal();
  initCounters();
  initBackToTop();
  initCalendly();
  initContactForm();
});
