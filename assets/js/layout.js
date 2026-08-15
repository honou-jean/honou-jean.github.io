(() => {
  "use strict";

  if (window.PortfolioLayout) return;

  const LANGUAGE_KEY = "portfolio-language";
  const SUPPORTED_LANGUAGES = ["fr", "en"];
  const BACK_TO_TOP_THRESHOLD = 600;
  const NAV_ITEMS = [
    { key: "home", path: "index.html" },
    { key: "profile", path: "profile.html" },
    { key: "expertise", path: "expertise.html" },
    { key: "background", path: "background.html" },
    { key: "projects", path: "projects.html" },
    { key: "thesis", path: "thesis.html" },
    { key: "teaching", path: "teaching.html" },
    { key: "contact", path: "contact.html" }
  ];
  const FALLBACK_COPY = {
    fr: {
      a11y: {
        skip: "Aller au contenu",
        nav: "Navigation principale",
        brandHome: "Koessivi Jean HONOU — Accueil",
        menuOpen: "Ouvrir le menu",
        menuClose: "Fermer le menu",
        language: "Choix de la langue",
        backToTop: "Retour en haut"
      },
      nav: {
        home: "Accueil",
        profile: "Profil",
        expertise: "Expertise",
        background: "Parcours",
        projects: "Projets",
        thesis: "Mémoire",
        teaching: "Enseignement",
        contact: "Contact"
      },
      footer: {
        tagline: "Data Science • Intelligence Artificielle • Statistiques • Mathématiques appliquées",
        email: "E-mail",
        emailLabel: "Envoyer un e-mail à Koessivi Jean HONOU",
        studentPortal: "Espace élèves",
        top: "Retour en haut"
      },
      contact: {
        cv: "Télécharger mon CV",
        cvUnavailable: "CV à ajouter",
        linkedinLabel: "Voir mon profil LinkedIn",
        githubLabel: "Voir mon GitHub"
      }
    },
    en: {
      a11y: {
        skip: "Skip to content",
        nav: "Main navigation",
        brandHome: "Koessivi Jean HONOU — Home",
        menuOpen: "Open menu",
        menuClose: "Close menu",
        language: "Language selection",
        backToTop: "Back to top"
      },
      nav: {
        home: "Home",
        profile: "Profile",
        expertise: "Expertise",
        background: "Background",
        projects: "Projects",
        thesis: "Thesis",
        teaching: "Teaching",
        contact: "Contact"
      },
      footer: {
        tagline: "Data Science • Artificial Intelligence • Statistics • Applied Mathematics",
        email: "Email",
        emailLabel: "Email Koessivi Jean HONOU",
        studentPortal: "Student portal",
        top: "Back to top"
      },
      contact: {
        cv: "Download my CV",
        cvUnavailable: "CV to be added",
        linkedinLabel: "View my LinkedIn profile",
        githubLabel: "View my GitHub"
      }
    }
  };

  const listeners = new Set();
  let language = readStoredLanguage();
  let initialized = false;
  let scrollUpdatePending = false;

  const body = () => document.body;
  const translations = () => window.TRANSLATIONS || {};
  const siteData = () => window.SITE_DATA || {};

  function readStoredLanguage() {
    try {
      const stored = window.localStorage.getItem(LANGUAGE_KEY);
      return SUPPORTED_LANGUAGES.includes(stored) ? stored : "fr";
    } catch {
      return "fr";
    }
  }

  function storeLanguage(value) {
    try {
      window.localStorage.setItem(LANGUAGE_KEY, value);
    } catch {
      // Language switching remains available without persistent storage.
    }
  }

  function normalizeLanguage(value) {
    return SUPPORTED_LANGUAGES.includes(value) ? value : "fr";
  }

  function page() {
    return body()?.dataset.page || "home";
  }

  function navActivePage() {
    return body()?.dataset.navActive || (page() === "project-detail" ? "projects" : page());
  }

  function rootPath() {
    const value = body()?.dataset.rootPath || "";
    if (value === "" || value === "./" || /^(?:\.\.\/)+$/.test(value)) return value;
    return "";
  }

  function resolveSitePath(value) {
    if (typeof value !== "string") return "";
    const path = value.trim();
    if (!path) return "";
    if (/^(?:[a-z][a-z0-9+.-]*:|\/\/|\/|#|\.\.\/|\.\/)/i.test(path)) return path;
    return `${rootPath()}${path}`;
  }

  function byPath(object, path) {
    return String(path || "").split(".").reduce((value, key) => value?.[key], object);
  }

  function translationValue(path, selectedLanguage = language) {
    const copy = translations()?.[selectedLanguage] || {};
    const layoutValue = byPath(copy.layout, path);
    const existingValue = byPath(copy, path);
    const fallbackValue = byPath(FALLBACK_COPY[selectedLanguage], path);
    return layoutValue ?? existingValue ?? fallbackValue;
  }

  function t(path, fallback = "") {
    const value = translationValue(path);
    return typeof value === "string" || typeof value === "number" ? String(value) : fallback;
  }

  function localize(value, selectedLanguage = language) {
    if (value === null || value === undefined) return "";
    if (typeof value === "string" || typeof value === "number") return String(value);
    if (Array.isArray(value)) return value.map((item) => localize(item, selectedLanguage)).filter(Boolean);
    if (typeof value === "object") return value[selectedLanguage] ?? value.fr ?? value.en ?? "";
    return "";
  }

  function escapeHtml(value) {
    return String(value ?? "").replace(/[&<>"']/g, (character) => ({
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#39;"
    })[character]);
  }

  function configured(value) {
    return typeof value === "string" && value.trim() !== "" && !/YOUR_|REPLACE_WITH|TO_BE_ADDED|PLACEHOLDER/i.test(value);
  }

  function publicHttpHref(value) {
    if (!configured(value)) return "";
    try {
      const url = new URL(value);
      return url.protocol === "https:" || url.protocol === "http:" ? value.trim() : "";
    } catch {
      return "";
    }
  }

  function localDocumentHref(value) {
    if (!configured(value)) return "";
    const path = value.trim();
    if (path.startsWith("//") || /^(?:javascript|data|vbscript):/i.test(path) || /[\u0000-\u001f]/.test(path)) return "";
    return resolveSitePath(path);
  }

  function socialIcon(platform) {
    const path = siteData().icons?.socials?.[platform];
    if (!configured(path)) return "";
    return `<img class="social-icon" src="${escapeHtml(resolveSitePath(path))}" alt="" aria-hidden="true" loading="lazy" decoding="async">`;
  }

  function closeMenu(returnFocus = false) {
    const button = document.querySelector("#layout-menu-toggle");
    const menu = document.querySelector("#nav-links");
    if (!button || !menu) return;
    const wasOpen = button.getAttribute("aria-expanded") === "true";
    button.setAttribute("aria-expanded", "false");
    menu.classList.remove("open");
    body()?.classList.remove("menu-open");
    updateMenuLabel();
    if (returnFocus && wasOpen) button.focus();
  }

  function updateMenuLabel() {
    const button = document.querySelector("#layout-menu-toggle");
    if (!button) return;
    const open = button.getAttribute("aria-expanded") === "true";
    const label = t(open ? "a11y.menuClose" : "a11y.menuOpen", open ? "Close menu" : "Open menu");
    button.setAttribute("aria-label", label);
    const hiddenLabel = button.querySelector(".sr-only");
    if (hiddenLabel) hiddenLabel.textContent = label;
  }

  function renderHeader() {
    const mount = document.querySelector("[data-layout-header]");
    if (!mount) return;
    closeMenu();
    mount.classList.add("site-header");
    mount.removeAttribute("id");
    mount.id = "site-header";
    const activePage = navActivePage();
    const links = NAV_ITEMS.map(({ key, path }) => {
      const active = key === activePage;
      return `<a href="${escapeHtml(resolveSitePath(path))}"${active ? ' class="active" aria-current="page"' : ""}>${escapeHtml(t(`nav.${key}`, key))}</a>`;
    }).join("");
    mount.innerHTML = `
      <nav class="nav container" aria-label="${escapeHtml(t("a11y.nav", "Main navigation"))}">
        <a class="brand" href="${escapeHtml(resolveSitePath("index.html"))}" aria-label="${escapeHtml(t("a11y.brandHome", "Koessivi Jean HONOU — Home"))}"><span aria-hidden="true">KJ</span><strong>HONOU</strong></a>
        <button class="menu-toggle" id="layout-menu-toggle" type="button" aria-expanded="false" aria-controls="nav-links"><span></span><span></span><span></span><span class="sr-only">${escapeHtml(t("a11y.menuOpen", "Open menu"))}</span></button>
        <div class="nav-links" id="nav-links">${links}</div>
        <div class="language-switcher" aria-label="${escapeHtml(t("a11y.language", "Language selection"))}"><button type="button" data-layout-lang="fr" class="${language === "fr" ? "active" : ""}" aria-pressed="${language === "fr"}">FR</button><span aria-hidden="true">|</span><button type="button" data-layout-lang="en" class="${language === "en" ? "active" : ""}" aria-pressed="${language === "en"}">EN</button></div>
      </nav>`;

    const menuButton = mount.querySelector("#layout-menu-toggle");
    const menu = mount.querySelector("#nav-links");
    menuButton?.addEventListener("click", () => {
      const open = menuButton.getAttribute("aria-expanded") !== "true";
      menuButton.setAttribute("aria-expanded", String(open));
      menu?.classList.toggle("open", open);
      body()?.classList.toggle("menu-open", open);
      updateMenuLabel();
      if (open) window.requestAnimationFrame(() => menu?.querySelector("a")?.focus());
    });
    menu?.addEventListener("click", (event) => {
      if (event.target.closest("a")) closeMenu();
    });
    mount.querySelectorAll("[data-layout-lang]").forEach((button) => {
      button.addEventListener("click", () => setLanguage(button.dataset.layoutLang));
    });
    updateMenuLabel();
  }

  function renderFooter() {
    const mount = document.querySelector("[data-layout-footer]");
    if (!mount) return;
    const data = siteData();
    const contact = data.contact || {};
    const linkedin = publicHttpHref(contact.linkedin);
    const github = publicHttpHref(contact.github);
    const socials = [];
    if (linkedin) socials.push(`<a class="social-icon-button" href="${escapeHtml(linkedin)}" target="_blank" rel="noopener noreferrer" aria-label="${escapeHtml(t("contact.linkedinLabel", "LinkedIn"))}">${socialIcon("linkedin")}</a>`);
    if (github) socials.push(`<a class="social-icon-button" href="${escapeHtml(github)}" target="_blank" rel="noopener noreferrer" aria-label="${escapeHtml(t("contact.githubLabel", "GitHub"))}">${socialIcon("github")}</a>`);

    const professionalLinks = [];
    const email = configured(contact.email) && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(contact.email.trim()) ? contact.email.trim() : "";
    if (email) professionalLinks.push(`<a href="mailto:${escapeHtml(email)}" aria-label="${escapeHtml(t("footer.emailLabel", "Email Koessivi Jean HONOU"))}">${escapeHtml(t("footer.email", "Email"))}</a>`);
    const cv = data.documents?.cv || {};
    const cvHref = cv.available === true ? localDocumentHref(cv.path) : "";
    if (cvHref) professionalLinks.push(`<a class="footer-professional-link" href="${escapeHtml(cvHref)}" download>${escapeHtml(t("contact.cv", "Download my CV"))}</a>`);
    else professionalLinks.push(`<span class="footer-professional-link footer-link-unavailable" aria-disabled="true" title="${escapeHtml(t("contact.cvUnavailable", "CV unavailable"))}">${escapeHtml(t("contact.cv", "CV"))}</span>`);
    professionalLinks.push(`<a href="${escapeHtml(resolveSitePath("teaching/index.html"))}">${escapeHtml(t("footer.studentPortal", "Student portal"))}</a>`);

    mount.innerHTML = `<div class="container footer-grid"><div><a class="brand footer-brand" href="${escapeHtml(resolveSitePath("index.html"))}"><span aria-hidden="true">KJ</span><strong>Koessivi Jean HONOU</strong></a><p>${escapeHtml(t("footer.tagline", "Data Science • Artificial Intelligence • Statistics • Applied Mathematics"))}</p></div><div class="footer-actions"><div class="footer-socials">${socials.join("")}</div><div class="footer-professional-links">${professionalLinks.join("")}</div><p>© <span>${new Date().getFullYear()}</span> Koessivi Jean HONOU</p></div></div>`;
  }

  function applyTranslationHooks() {
    document.querySelectorAll("[data-i18n]").forEach((element) => {
      const value = t(element.dataset.i18n);
      if (value) element.textContent = value;
    });
    document.querySelectorAll("[data-i18n-aria]").forEach((element) => {
      const value = t(element.dataset.i18nAria);
      if (value) element.setAttribute("aria-label", value);
    });
    document.querySelectorAll("[data-i18n-alt]").forEach((element) => {
      const value = t(element.dataset.i18nAlt);
      if (value) element.setAttribute("alt", value);
    });
  }

  function applyPageMetadata() {
    if (page() === "project-detail") return;
    const copy = translations()?.[language] || {};
    const pageCopy = copy.pages?.[page()];
    const meta = pageCopy?.meta || pageCopy || (page() === "home" ? copy.meta : null);
    if (!meta) return;
    if (meta.title) document.title = meta.title;
    const description = document.querySelector('meta[name="description"]');
    const ogTitle = document.querySelector('meta[property="og:title"]');
    const ogDescription = document.querySelector('meta[property="og:description"]');
    if (description && meta.description) description.content = meta.description;
    if (ogTitle && (meta.ogTitle || meta.title)) ogTitle.content = meta.ogTitle || meta.title;
    if (ogDescription && (meta.ogDescription || meta.description)) ogDescription.content = meta.ogDescription || meta.description;
  }

  function ensureFallbackStyles() {
    if (document.querySelector("#layout-fallback-styles")) return;
    const style = document.createElement("style");
    style.id = "layout-fallback-styles";
    style.textContent = `@layer portfolio-layout-fallback {
      .back-to-top { position: fixed; z-index: 80; right: max(18px, env(safe-area-inset-right)); bottom: max(18px, env(safe-area-inset-bottom)); display: grid; width: 48px; height: 48px; place-items: center; padding: 0; border: 1px solid var(--line, #cfdbda); border-radius: 50%; background: var(--navy, #0b1f33); color: #fff; box-shadow: 0 12px 35px rgba(11,31,51,.2); cursor: pointer; }
      .back-to-top[hidden] { display: none !important; }
    }`;
    document.head.append(style);
  }

  function ensureBackToTop() {
    let button = document.querySelector("#back-to-top");
    if (!button) {
      button = document.createElement("button");
      button.id = "back-to-top";
      button.className = "back-to-top";
      button.type = "button";
      button.hidden = true;
      button.innerHTML = '<span aria-hidden="true">↑</span>';
      body()?.append(button);
    }
    button.setAttribute("aria-label", t("a11y.backToTop", t("footer.top", "Back to top")));
    return button;
  }

  function updateBackToTop() {
    const button = document.querySelector("#back-to-top");
    if (button) button.hidden = window.scrollY < BACK_TO_TOP_THRESHOLD;
  }

  function setupGlobalListeners() {
    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape") closeMenu(true);
    });
    window.addEventListener("resize", () => {
      if (window.innerWidth > 1080) closeMenu();
    });
    window.addEventListener("scroll", () => {
      if (scrollUpdatePending) return;
      scrollUpdatePending = true;
      window.requestAnimationFrame(() => {
        updateBackToTop();
        scrollUpdatePending = false;
      });
    }, { passive: true });
    ensureBackToTop().addEventListener("click", () => {
      const reducedMotion = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches === true;
      window.scrollTo({ top: 0, behavior: reducedMotion ? "auto" : "smooth" });
    });
  }

  function notifyLanguageSubscribers(previousLanguage) {
    listeners.forEach((listener) => {
      try {
        listener(language, { previousLanguage, page: page(), rootPath: rootPath() });
      } catch (error) {
        window.setTimeout(() => { throw error; }, 0);
      }
    });
  }

  function setLanguage(value, options = {}) {
    const nextLanguage = normalizeLanguage(value);
    const previousLanguage = language;
    language = nextLanguage;
    if (options.persist !== false) storeLanguage(language);
    document.documentElement.lang = language;
    renderHeader();
    renderFooter();
    applyTranslationHooks();
    applyPageMetadata();
    ensureBackToTop().setAttribute("aria-label", t("a11y.backToTop", t("footer.top", "Back to top")));
    notifyLanguageSubscribers(previousLanguage);
    if (options.emit !== false && previousLanguage !== language) {
      document.dispatchEvent(new CustomEvent("portfolio:languagechange", {
        detail: { language, previousLanguage, page: page(), rootPath: rootPath() }
      }));
    }
    return language;
  }

  function subscribeLanguage(listener, options = {}) {
    if (typeof listener !== "function") return () => {};
    listeners.add(listener);
    if (options.immediate !== false) listener(language, { previousLanguage: language, page: page(), rootPath: rootPath() });
    return () => listeners.delete(listener);
  }

  const api = {};
  Object.defineProperties(api, {
    language: { enumerable: true, get: () => language },
    page: { enumerable: true, get: page },
    rootPath: { enumerable: true, get: rootPath },
    ready: { enumerable: true, get: () => initialized }
  });
  Object.assign(api, { t, localize, resolveSitePath, setLanguage, subscribeLanguage });
  window.PortfolioLayout = Object.freeze(api);

  function init() {
    if (initialized || !body()) return;
    initialized = true;
    ensureFallbackStyles();
    setupGlobalListeners();
    setLanguage(language, { persist: false, emit: false });
    updateBackToTop();
    document.dispatchEvent(new CustomEvent("portfolio:layoutready", {
      detail: { language, page: page(), rootPath: rootPath() }
    }));
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init, { once: true });
  else init();
})();
