(() => {
  "use strict";

  const LANGUAGE_KEY = "portfolio-language";
  const SUPPORTED_LANGUAGES = ["fr", "en"];
  const layout = window.PortfolioLayout;
  const data = window.SITE_DATA || {};
  const slug = document.body.dataset.project;
  const fallback = {
    title: document.querySelector("#detail-title")?.textContent.trim() || "",
    description: document.querySelector('meta[name="description"]')?.content || ""
  };

  const fallbackUi = {
    fr: {
      skip: "Aller au contenu",
      home: "Accueil du portfolio",
      back: "Retour aux projets",
      navigation: "Navigation du projet",
      language: "Choix de la langue",
      project: "Projet",
      technologies: "Technologies utilisées",
      contents: "Dans cette étude de cas",
      resourcesEyebrow: "Ressources",
      resourcesTitle: "Documents & ressources",
      resourcesIntro: "Accédez aux ressources publiques actuellement configurées pour ce projet.",
      unavailable: "Aucun document public n’est configuré pour ce projet.",
      unavailableAction: "Documents bientôt disponibles",
      pageUnavailable: "Les informations détaillées de ce projet seront publiées après validation du contenu réel.",
      footer: "Portfolio de Koessivi Jean HONOU",
      status: { completed: "Terminé", progress: "En cours", upcoming: "À venir" },
      document: { pdf: "Voir le PDF", pptx: "Télécharger la présentation", code: "Voir le code", repository: "Voir le dépôt", external: "Ouvrir la ressource", default: "Ouvrir le document" }
    },
    en: {
      skip: "Skip to content",
      home: "Portfolio home",
      back: "Back to projects",
      navigation: "Project navigation",
      language: "Language selection",
      project: "Project",
      technologies: "Technologies used",
      contents: "In this case study",
      resourcesEyebrow: "Resources",
      resourcesTitle: "Documents & resources",
      resourcesIntro: "Access the public resources currently configured for this project.",
      unavailable: "No public document is configured for this project yet.",
      unavailableAction: "Documents coming soon",
      pageUnavailable: "Detailed information about this project will be published after the actual content has been verified.",
      footer: "Portfolio of Koessivi Jean HONOU",
      status: { completed: "Completed", progress: "In progress", upcoming: "Upcoming" },
      document: { pdf: "View PDF", pptx: "Download presentation", code: "View code", repository: "View repository", external: "Open resource", default: "Open document" }
    }
  };
  const ui = Object.fromEntries(SUPPORTED_LANGUAGES.map((language) => {
    const translations = window.TRANSLATIONS?.[language] || {};
    const detail = translations.detail || {};
    return [language, {
      ...fallbackUi[language],
      ...detail,
      skip: translations.a11y?.skip || fallbackUi[language].skip,
      status: { ...fallbackUi[language].status, ...(translations.common?.status || {}) },
      document: { ...fallbackUi[language].document, ...(detail.document || {}) }
    }];
  }));

  function readStoredLanguage() {
    try {
      const stored = window.localStorage.getItem(LANGUAGE_KEY);
      return SUPPORTED_LANGUAGES.includes(stored) ? stored : "fr";
    } catch (error) {
      return "fr";
    }
  }

  function storeLanguage(language) {
    try {
      window.localStorage.setItem(LANGUAGE_KEY, language);
    } catch (error) {
      // The page remains bilingual when storage is unavailable.
    }
  }

  function localize(value, language) {
    if (value === null || value === undefined) return "";
    if (typeof value === "string" || typeof value === "number") return String(value);
    if (Array.isArray(value)) return value.map((item) => localize(item, language)).filter(Boolean);
    if (typeof value === "object") {
      return value[language] ?? value.fr ?? value.en ?? "";
    }
    return "";
  }

  function projectSummary() {
    return (data.projects || []).find((project) => project.slug === slug) || {};
  }

  function projectDetail() {
    return data.projectDetails?.[slug] || {};
  }

  function text(element, value) {
    if (element) element.textContent = value || "";
  }

  function setHidden(element, hidden) {
    if (element) element.hidden = hidden;
  }

  function safeId(value, index) {
    const base = String(value || `section-${index + 1}`)
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "");
    return `detail-${base || `section-${index + 1}`}`;
  }

  function isConfiguredHref(value) {
    if (typeof value !== "string") return false;
    const href = value.trim();
    if (!href || href === "#" || href.startsWith("//") || /YOUR_|TO_BE_ADDED|PLACEHOLDER/i.test(href)) return false;
    const scheme = href.match(/^([a-z][a-z0-9+.-]*):/i)?.[1]?.toLowerCase();
    return !scheme || scheme === "http" || scheme === "https";
  }

  function resolveHref(value) {
    if (layout?.resolveSitePath) return layout.resolveSitePath(value);
    const href = value.trim();
    if (/^(?:[a-z]+:|\/|#)/i.test(href) || href.startsWith("../") || href.startsWith("./")) return href;
    return `../${href}`;
  }

  function projectThemeKey(summary, detail) {
    const requested = String(detail?.theme ?? summary?.theme ?? "default").toLowerCase();
    return data.projectThemes?.[requested] ? requested : "default";
  }

  function poissonScatterPoints() {
    const prng = window.PortfolioPRNG;
    if (!prng) return [];
    const random = prng.mulberry32(20250809);
    const horizon = 9;
    const arrivals = prng.homogeneousPoissonArrivals(random, 1, horizon);
    const count = arrivals.length;
    if (!count) return [];
    return arrivals.map((t, index) => ({
      x: `${(6 + Math.min(1, t / horizon) * 88).toFixed(1)}%`,
      y: `${(12 + ((index + 1) / count) * 66).toFixed(1)}%`
    }));
  }

  function appendGeneratedVisual(scene, generator) {
    if (generator === "poisson-scatter") {
      poissonScatterPoints().forEach((point) => {
        const dot = document.createElement("i");
        dot.style.setProperty("--x", point.x);
        dot.style.setProperty("--y", point.y);
        scene.append(dot);
      });
    }
  }

  function createThemeVisual(themeKey) {
    const theme = data.projectThemes?.[themeKey] || data.projectThemes?.default || {};
    const visual = theme.visual || {};
    const scene = document.createElement("div");
    scene.className = `visual-scene ${String(visual.className || "visual-generic").replace(/[^a-z0-9 _-]/gi, "").trim()}`;
    scene.setAttribute("aria-hidden", "true");
    const allowedTags = new Set(["span", "i"]);
    (Array.isArray(visual.elements) ? visual.elements : []).forEach((definition) => {
      const element = document.createElement(allowedTags.has(definition?.tag) ? definition.tag : "span");
      const className = String(definition?.className || "").replace(/[^a-z0-9 _-]/gi, "").trim();
      if (className) element.className = className;
      Object.entries(definition?.variables || {}).forEach(([name, value]) => {
        if (/^[a-z][a-z0-9-]*$/i.test(name) && !/[;<>"']/.test(String(value))) element.style.setProperty(`--${name}`, String(value));
      });
      scene.append(element);
    });
    appendGeneratedVisual(scene, visual.generator);
    if (visual.label) {
      const label = document.createElement("b");
      label.textContent = visual.label;
      scene.append(label);
    }
    return scene;
  }

  function normalizeMediaItem(value, language, fallbackAlt) {
    if (!value) return null;
    const item = typeof value === "string" ? { src: value } : value;
    const src = item?.src || item?.path;
    if (item?.available === false || typeof src !== "string" || !src.trim() || src.trim().startsWith("//") || /YOUR_|TO_BE_ADDED|PLACEHOLDER/i.test(src)) return null;
    const scheme = src.trim().match(/^([a-z][a-z0-9+.-]*):/i)?.[1]?.toLowerCase();
    if (scheme && scheme !== "http" && scheme !== "https") return null;
    return {
      src: resolveHref(src.trim()),
      alt: localize(item.alt, language) || fallbackAlt,
      caption: localize(item.caption ?? item.description, language)
    };
  }

  function renderMedia(summary, detail, language, title, themeKey) {
    const hero = document.querySelector(".detail-hero-inner");
    if (!hero) return;
    let region = document.querySelector("#detail-project-media");
    if (!region) {
      region = document.createElement("div");
      region.id = "detail-project-media";
      region.className = "detail-project-media";
      hero.append(region);
    }
    region.replaceChildren();

    const fallbackVisual = document.createElement("div");
    fallbackVisual.className = "detail-visual-fallback";
    fallbackVisual.append(createThemeVisual(themeKey));
    region.append(fallbackVisual);

    const cover = normalizeMediaItem(detail.coverImage, language, title)
      || normalizeMediaItem(summary.coverImage, language, title);
    const mediaValues = [
      ...(Array.isArray(summary.media) ? summary.media : []),
      ...(Array.isArray(detail.media) ? detail.media : [])
    ];
    const seen = new Set(cover ? [cover.src] : []);
    const media = mediaValues
      .map(value => normalizeMediaItem(value, language, title))
      .filter((item) => {
        if (!item || seen.has(item.src)) return false;
        seen.add(item.src);
        return true;
      });
    const items = [...(cover ? [cover] : []), ...media];
    if (!items.length) return;

    const gallery = document.createElement("div");
    gallery.className = "detail-media-grid";
    gallery.hidden = true;
    region.append(gallery);
    let pending = items.length;
    let loaded = 0;

    items.forEach((item, index) => {
      const figure = document.createElement("figure");
      figure.className = `detail-media-item${index === 0 && cover ? " detail-media-item--cover" : ""}`;
      figure.hidden = true;
      const image = document.createElement("img");
      image.alt = item.alt;
      image.decoding = "async";
      image.loading = index === 0 ? "eager" : "lazy";
      image.addEventListener("load", () => {
        pending -= 1;
        loaded += 1;
        figure.hidden = false;
        gallery.hidden = false;
        fallbackVisual.hidden = true;
      }, { once: true });
      image.addEventListener("error", () => {
        pending -= 1;
        figure.remove();
        if (!loaded && !pending) {
          gallery.hidden = true;
          fallbackVisual.hidden = false;
        }
      }, { once: true });
      image.src = item.src;
      figure.append(image);
      if (item.caption) {
        const caption = document.createElement("figcaption");
        caption.textContent = item.caption;
        figure.append(caption);
      }
      gallery.append(figure);
    });
  }

  function normalizeDocuments(source) {
    if (Array.isArray(source)) return source;
    if (!source || typeof source !== "object") return [];
    return Object.entries(source).map(([type, entry]) => {
      if (typeof entry === "string") return { type, href: entry };
      const normalized = { type, ...(entry || {}) };
      if (!normalized.href && normalized.path) normalized.href = normalized.path;
      return normalized;
    });
  }

  function renderTags(tags, language) {
    const list = document.querySelector("#detail-tags");
    const block = document.querySelector("#detail-technologies");
    if (!list || !block) return;
    list.replaceChildren();
    const values = Array.isArray(tags) ? tags.map((tag) => localize(tag, language)).filter(Boolean) : [];
    values.forEach((value) => {
      const item = document.createElement("li");
      const iconPath = data.icons?.technologies?.[value];
      if (iconPath) {
        const icon = document.createElement("img");
        icon.className = "technology-logo";
        icon.src = iconPath.startsWith("assets/") ? `../${iconPath}` : iconPath;
        icon.alt = "";
        icon.setAttribute("aria-hidden", "true");
        icon.loading = "lazy";
        icon.decoding = "async";
        item.append(icon);
      }
      const label = document.createElement("span");
      label.textContent = value;
      item.append(label);
      list.append(item);
    });
    block.hidden = values.length === 0;
  }

  function appendParagraphs(container, value, language) {
    const values = Array.isArray(value) ? value : value ? [value] : [];
    values.forEach((paragraph) => {
      const content = localize(paragraph, language);
      if (!content) return;
      const element = document.createElement("p");
      element.textContent = content;
      container.append(element);
    });
  }

  function renderSections(sections, language) {
    const container = document.querySelector("#detail-sections");
    const toc = document.querySelector("#detail-toc");
    const tocList = document.querySelector("#detail-toc-list");
    if (!container || !toc || !tocList) return;

    container.replaceChildren();
    tocList.replaceChildren();
    const validSections = Array.isArray(sections)
      ? sections.filter((section) => localize(section?.title, language))
      : [];

    if (validSections.length === 0) {
      const notice = document.createElement("section");
      notice.className = "detail-section detail-section--notice";
      notice.setAttribute("aria-label", ui[language].project);
      const marker = document.createElement("p");
      marker.className = "detail-section-number";
      marker.setAttribute("aria-hidden", "true");
      marker.textContent = "—";
      const copy = document.createElement("div");
      copy.className = "detail-section-copy";
      const paragraph = document.createElement("p");
      paragraph.textContent = ui[language].pageUnavailable;
      copy.append(paragraph);
      notice.append(marker, copy);
      container.append(notice);
      toc.hidden = true;
      return;
    }

    validSections.forEach((section, index) => {
      const title = localize(section.title, language);
      const sectionId = safeId(section.id || `section-${index + 1}`, index);
      const sectionElement = document.createElement("section");
      sectionElement.className = "detail-section";
      sectionElement.id = sectionId;

      const number = document.createElement("p");
      number.className = "detail-section-number";
      number.setAttribute("aria-hidden", "true");
      number.textContent = String(index + 1).padStart(2, "0");

      const copy = document.createElement("div");
      copy.className = "detail-section-copy";
      const heading = document.createElement("h2");
      heading.textContent = title;
      copy.append(heading);
      appendParagraphs(copy, section.body ?? section.description, language);

      if (Array.isArray(section.items) && section.items.length) {
        const list = document.createElement("ul");
        list.className = "detail-list";
        section.items.forEach((item) => {
          const value = localize(item, language);
          if (!value) return;
          const listItem = document.createElement("li");
          listItem.textContent = value;
          list.append(listItem);
        });
        if (list.children.length) copy.append(list);
      }

      const noteValue = localize(section.note, language);
      if (noteValue) {
        const note = document.createElement("p");
        note.className = "detail-note";
        note.textContent = noteValue;
        copy.append(note);
      }

      sectionElement.append(number, copy);
      container.append(sectionElement);

      if (section.type === "interactive" && section.component) {
        const mount = window.PortfolioDemos?.[section.component];
        if (typeof mount === "function") {
          const mountPoint = document.createElement("div");
          mountPoint.className = "detail-interactive";
          copy.insertBefore(mountPoint, noteValue ? copy.querySelector(".detail-note") : null);
          try { mount(mountPoint, { language }); }
          catch (_error) { mountPoint.remove(); }
        }
      }

      const tocItem = document.createElement("li");
      const tocLink = document.createElement("a");
      tocLink.href = `#${sectionId}`;
      tocLink.textContent = title;
      tocItem.append(tocLink);
      tocList.append(tocItem);
    });

    toc.hidden = validSections.length < 2;
  }

  function documentLabel(entry, language) {
    const configuredLabel = localize(entry.label ?? entry.title, language);
    if (configuredLabel) return configuredLabel;
    const type = String(entry.type || "default").toLowerCase();
    return ui[language].document[type] || ui[language].document.default;
  }

  function renderDocuments(source, language) {
    const list = document.querySelector("#detail-document-actions");
    const unavailable = document.querySelector("#detail-documents-unavailable");
    if (!list || !unavailable) return;

    list.replaceChildren();
    const entries = normalizeDocuments(source);
    let configuredCount = 0;

    entries.forEach((entry) => {
      const label = documentLabel(entry, language);
      if (!label) return;
      const href = entry.href || entry.path;
      if (entry.available !== true || !isConfiguredHref(href)) {
        const disabled = document.createElement("button");
        disabled.type = "button";
        disabled.disabled = true;
        disabled.className = "button secondary detail-document-action detail-document-action--disabled";
        disabled.textContent = label;
        list.append(disabled);
        return;
      }

      configuredCount += 1;
      const link = document.createElement("a");
      link.className = "button secondary detail-document-action";
      link.href = resolveHref(href);
      link.textContent = label;
      if (entry.download) link.setAttribute("download", "");
      if (/^https?:\/\//i.test(href)) {
        link.target = "_blank";
        link.rel = "noopener noreferrer";
      }
      list.append(link);
    });

    if (entries.length === 0) {
      const disabled = document.createElement("button");
      disabled.type = "button";
      disabled.disabled = true;
      disabled.className = "button secondary detail-document-action detail-document-action--disabled";
      disabled.textContent = ui[language].unavailableAction;
      list.append(disabled);
    }

    unavailable.hidden = configuredCount > 0;
    unavailable.textContent = ui[language].unavailable;
  }

  function updateMetadata(title, description, tags) {
    const pageTitle = title ? `${title} — Koessivi Jean HONOU` : "Projet — Koessivi Jean HONOU";
    document.title = pageTitle;
    const descriptionMeta = document.querySelector('meta[name="description"]');
    const ogTitle = document.querySelector('meta[property="og:title"]');
    const ogDescription = document.querySelector('meta[property="og:description"]');
    if (descriptionMeta && description) descriptionMeta.content = description;
    if (ogTitle) ogTitle.content = pageTitle;
    if (ogDescription && description) ogDescription.content = description;

    const schema = document.querySelector("#project-schema");
    if (schema) {
      schema.textContent = JSON.stringify({
        "@context": "https://schema.org",
        "@type": "CreativeWork",
        name: title,
        description,
        author: { "@type": "Person", name: "Koessivi Jean HONOU" },
        keywords: Array.isArray(tags) ? tags.join(", ") : undefined
      });
    }
  }

  function updateStaticUi(language) {
    document.querySelectorAll("[data-detail-ui]").forEach((element) => {
      const value = ui[language][element.dataset.detailUi];
      if (typeof value === "string") element.textContent = value;
    });
    document.querySelectorAll("[data-detail-ui-aria]").forEach((element) => {
      const value = ui[language][element.dataset.detailUiAria];
      if (typeof value === "string") element.setAttribute("aria-label", value);
    });
  }

  function render(language) {
    const summary = projectSummary();
    const detail = projectDetail();
    const title = localize(detail.title ?? summary.title, language) || fallback.title;
    const subtitle = localize(detail.subtitle, language);
    const lead = localize(detail.lead ?? detail.description ?? summary.description, language) || fallback.description;
    const category = localize(detail.category ?? summary.category, language);
    const number = detail.number ?? summary.number;
    const year = detail.year ?? summary.year;
    const statusKey = detail.status ?? summary.status;
    const technologies = detail.technologies ?? detail.tags ?? summary.technologies ?? summary.tags ?? [];
    const localizedTechnologies = Array.isArray(technologies)
      ? technologies.map((tag) => localize(tag, language)).filter(Boolean)
      : [];
    const themeKey = projectThemeKey(summary, detail);

    updateStaticUi(language);
    document.body.dataset.projectTheme = themeKey;
    text(document.querySelector("#detail-title"), title);
    text(document.querySelector("#detail-subtitle"), subtitle);
    text(document.querySelector("#detail-lead"), lead || ui[language].pageUnavailable);
    text(document.querySelector("#detail-category"), category || ui[language].project);
    text(document.querySelector("#detail-number"), number ? `${ui[language].project} ${number}` : ui[language].project);
    text(document.querySelector("#detail-year"), year || "");
    text(document.querySelector("#detail-status"), ui[language].status[statusKey] || "");
    setHidden(document.querySelector("#detail-subtitle"), !subtitle);
    setHidden(document.querySelector("#detail-year-wrap"), !year);
    setHidden(document.querySelector("#detail-status-wrap"), !ui[language].status[statusKey]);

    renderTags(technologies, language);
    renderMedia(summary, detail, language, title, themeKey);
    renderSections(detail.sections, language);
    renderDocuments(detail.documents ?? detail.resources, language);
    updateMetadata(title, lead || ui[language].pageUnavailable, localizedTechnologies);
  }

  function applyLanguage(nextLanguage, persist = true) {
    const language = SUPPORTED_LANGUAGES.includes(nextLanguage) ? nextLanguage : "fr";
    if (persist && layout?.setLanguage) {
      layout.setLanguage(language);
      return;
    }
    document.documentElement.lang = language;
    if (persist) storeLanguage(language);
    document.querySelectorAll("[data-lang]").forEach((button) => {
      const isActive = button.dataset.lang === language;
      button.classList.toggle("active", isActive);
      button.setAttribute("aria-pressed", String(isActive));
    });
    render(language);
  }

  function init() {
    if (layout?.subscribeLanguage) {
      layout.subscribeLanguage((nextLanguage) => applyLanguage(nextLanguage, false));
      return;
    }
    document.querySelectorAll("[data-lang]").forEach((button) => {
      button.addEventListener("click", () => applyLanguage(button.dataset.lang));
    });
    text(document.querySelector("#detail-year-current"), new Date().getFullYear());
    applyLanguage(readStoredLanguage(), false);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init, { once: true });
  } else {
    init();
  }
})();
