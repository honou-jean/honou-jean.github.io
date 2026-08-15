/*
 * Public contact form, backed by the same Supabase project as the teaching
 * portal (assets/js/supabase-config.js). Ships safely with an empty config:
 * the form stays visible but disabled and points visitors to the mailto
 * link until real Supabase credentials are set. No message is ever
 * readable through this public key — the contact_messages table has an
 * insert-only RLS policy; the owner reads messages from Supabase Studio.
 */
(() => {
  "use strict";

  const form = document.querySelector("#contact-form");
  if (!form) return;

  const submitButton = document.querySelector("#contact-form-submit");
  const statusRegion = document.querySelector("#contact-form-status");
  const renderedAtIso = new Date().toISOString();
  let client = null;

  function config() {
    return window.SUPABASE_CONFIG || {};
  }

  function isSafeProjectUrl(value) {
    if (typeof value !== "string" || !value.trim()) return false;
    try {
      const url = new URL(value.trim());
      if (url.username || url.password || url.search || url.hash) return false;
      if (url.protocol === "https:") return true;
      return url.protocol === "http:" && ["localhost", "127.0.0.1", "::1"].includes(url.hostname);
    } catch (_error) {
      return false;
    }
  }

  function isBrowserSafeKey(value) {
    if (typeof value !== "string") return false;
    const key = value.trim();
    if (!key) return false;
    if (/^sb_publishable_[A-Za-z0-9_-]{16,}$/.test(key)) return true;
    if (/^sb_secret_/i.test(key)) return false;
    try {
      const parts = key.split(".");
      if (parts.length !== 3) return false;
      const base64 = parts[1].replace(/-/g, "+").replace(/_/g, "/");
      const padded = base64.padEnd(Math.ceil(base64.length / 4) * 4, "=");
      const payload = JSON.parse(window.atob(padded));
      return payload && payload.role === "anon";
    } catch (_error) {
      return false;
    }
  }

  function hasSdk() {
    return Boolean(window.supabase && typeof window.supabase.createClient === "function");
  }

  function isConfigured() {
    const settings = config();
    const key = settings.publishableKey || settings.anonKey;
    return isSafeProjectUrl(settings.url) && isBrowserSafeKey(key) && hasSdk();
  }

  function getClient() {
    if (client) return client;
    const settings = config();
    const key = (settings.publishableKey || settings.anonKey).trim();
    client = window.supabase.createClient(settings.url.trim(), key, { auth: { persistSession: false } });
    return client;
  }

  function formCopy() {
    const language = window.PortfolioLayout?.language || "fr";
    return window.TRANSLATIONS?.[language]?.contact?.form || {};
  }

  function setStatus(message, tone) {
    if (!statusRegion) return;
    statusRegion.textContent = message || "";
    statusRegion.dataset.tone = tone || "";
  }

  function updateAvailability() {
    const strings = formCopy();
    const configured = isConfigured();
    submitButton.disabled = !configured;
    setStatus(configured ? "" : (strings.unavailable || ""), configured ? "" : "info");
  }

  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    const strings = formCopy();
    if (!isConfigured()) {
      updateAvailability();
      return;
    }

    const name = form.elements.name.value.trim();
    const email = form.elements.email.value.trim();
    const subject = form.elements.subject.value.trim();
    const message = form.elements.message.value.trim();
    const honeypot = form.elements.topic.value;

    if (!name) {
      setStatus(strings.nameRequired || "", "error");
      form.elements.name.focus();
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setStatus(strings.emailInvalid || "", "error");
      form.elements.email.focus();
      return;
    }
    if (!message) {
      setStatus(strings.messageRequired || "", "error");
      form.elements.message.focus();
      return;
    }

    submitButton.disabled = true;
    setStatus(strings.sending || "", "info");

    try {
      const { error } = await getClient().from("contact_messages").insert({
        name,
        email,
        subject: subject || null,
        message,
        locale: window.PortfolioLayout?.language || "fr",
        honeypot: honeypot || null,
        rendered_at: renderedAtIso
      });
      if (error) throw error;
      setStatus(strings.success || "", "success");
      form.reset();
    } catch (_error) {
      setStatus(strings.error || "", "error");
      submitButton.disabled = false;
    }
  });

  updateAvailability();
  if (window.PortfolioLayout?.subscribeLanguage) {
    window.PortfolioLayout.subscribeLanguage(() => updateAvailability());
  }
})();
