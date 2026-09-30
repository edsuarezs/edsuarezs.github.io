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

function initBackToTop() {
  const button = $("#back-to-top");
  if (!button) return;
  const hero = $(".hero");

  if (hero && "IntersectionObserver" in window) {
    const observer = new IntersectionObserver(
      ([entry]) => button.classList.toggle("visible", !entry.isIntersecting),
      { threshold: 0 }
    );
    observer.observe(hero);
  }

  button.addEventListener("click", () => window.scrollTo({ top: 0, behavior: "smooth" }));
}

function trackEvent(name, params = {}) {
  if (typeof window.gtag !== "function") return;
  window.gtag("event", name, params);
}

function initAnalyticsEvents() {
  document.addEventListener("click", (event) => {
    const link = event.target.closest("a[href]");
    if (!link || link.classList.contains("open-calendly")) return;

    const href = link.getAttribute("href") || "";
    if (href.includes("EdwardSuarezResume.pdf")) {
      trackEvent("file_download", {
        file_name: "EdwardSuarezResume.pdf",
        link_url: link.href,
      });
      return;
    }

    if (href.startsWith("mailto:")) {
      trackEvent("contact", { method: "email" });
      return;
    }

    if (href.startsWith("tel:")) {
      trackEvent("contact", { method: "phone" });
      return;
    }

    if (href.includes("wa.me")) {
      trackEvent("contact", { method: "whatsapp" });
      return;
    }

    if (link.hostname && link.hostname !== window.location.hostname) {
      trackEvent("click", {
        link_url: link.href,
        link_domain: link.hostname,
      });
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
      trackEvent("generate_lead", {
        method: "contact_form",
      });
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
  initBackToTop();
  initAnalyticsEvents();
  initContactForm();
});
