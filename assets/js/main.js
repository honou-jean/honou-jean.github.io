(() => {
  "use strict";

  const data = window.SITE_DATA;
  const translations = window.TRANSLATIONS;
  if (!data || !translations) return;

  const $ = (selector, root = document) => root.querySelector(selector);
  const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];
  const configured = value => Boolean(value) && !String(value).startsWith("YOUR_");
  const local = value => value && typeof value === "object" && ("fr" in value || "en" in value) ? value[currentLanguage] : value;
  const byPath = (object, path) => path.split(".").reduce((value, key) => value?.[key], object);
  const escapeHtml = value => String(value ?? "").replace(/[&<>"']/g, character => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[character]);

  let currentLanguage = readLanguage();
  let activeFilter = "all";

  function readLanguage() {
    try { return localStorage.getItem("portfolio-language") === "en" ? "en" : "fr"; }
    catch { return "fr"; }
  }

  function saveLanguage(language) {
    try { localStorage.setItem("portfolio-language", language); }
    catch { /* The site remains usable when storage is unavailable. */ }
  }

  function technologyIcon(technology) {
    const path = data.icons?.technologies?.[technology];
    return path ? `<img class="technology-logo" src="${path}" alt="" aria-hidden="true" loading="lazy" decoding="async">` : "";
  }

  function technologyBadge(technology) {
    return `<span class="project-technology">${technologyIcon(technology)}<span>${technology}</span></span>`;
  }

  function projectThemeKey(project) {
    const requested = String(project?.theme || "default").toLowerCase();
    return data.projectThemes?.[requested] ? requested : "default";
  }

  function themeVisualElement(element) {
    const allowedTags = new Set(["span", "i"]);
    const tag = allowedTags.has(element?.tag) ? element.tag : "span";
    const className = String(element?.className || "").replace(/[^a-z0-9 _-]/gi, "").trim();
    const variables = Object.entries(element?.variables || {}).filter(([name, value]) => /^[a-z][a-z0-9-]*$/i.test(name) && !/[;<>"']/.test(String(value)));
    const style = variables.length ? ` style="${variables.map(([name, value]) => `--${name}:${value}`).join(";")}"` : "";
    return `<${tag}${className ? ` class="${className}"` : ""}${style}></${tag}>`;
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

  function dampedSinePoints() {
    const samples = 40;
    const points = [];
    for (let i = 0; i <= samples; i += 1) {
      const x = i / samples;
      const y = 0.5 - 0.42 * Math.exp(-x * 2.6) * Math.sin(x * Math.PI * 3.1);
      points.push(`${(x * 100).toFixed(2)},${(y * 100).toFixed(2)}`);
    }
    return points.join(" ");
  }

  function generatedVisualMarkup(generator) {
    if (generator === "poisson-scatter") {
      return poissonScatterPoints().map(point => `<i style="--x:${point.x};--y:${point.y}"></i>`).join("");
    }
    if (generator === "damped-sine") {
      return `<svg class="wave-svg" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true"><polyline points="${dampedSinePoints()}"></polyline></svg>`;
    }
    return "";
  }

  function projectVisual(project) {
    const theme = data.projectThemes?.[projectThemeKey(project)] || data.projectThemes?.default || {};
    const visual = theme.visual || {};
    const className = String(visual.className || "visual-generic").replace(/[^a-z0-9 _-]/gi, "").trim();
    const elements = Array.isArray(visual.elements) ? visual.elements.map(themeVisualElement).join("") : "";
    const generated = generatedVisualMarkup(visual.generator);
    const label = visual.label ? `<b>${escapeHtml(visual.label)}</b>` : "";
    return `<div class="visual-scene ${className}" aria-hidden="true">${elements}${generated}${label}</div>`;
  }

  function normalizeMediaItem(value, fallbackAlt = "") {
    if (!value) return null;
    const item = typeof value === "string" ? { src: value } : value;
    const src = item?.src || item?.path;
    if (item?.available === false || typeof src !== "string" || !src.trim() || src.trim().startsWith("//") || /YOUR_|TO_BE_ADDED|PLACEHOLDER/i.test(src)) return null;
    const normalizedSrc = src.trim();
    const scheme = normalizedSrc.match(/^([a-z][a-z0-9+.-]*):/i)?.[1]?.toLowerCase();
    if (scheme && scheme !== "http" && scheme !== "https") return null;
    return { src: normalizedSrc, alt: local(item.alt) || fallbackAlt };
  }

  function projectCoverMarkup(project) {
    const cover = normalizeMediaItem(project.coverImage, local(project.title));
    if (!cover) return "";
    return `<img class="project-cover-image" src="${escapeHtml(cover.src)}" alt="${escapeHtml(cover.alt)}" loading="lazy" decoding="async">`;
  }

  function setupProjectCovers(root) {
    $$('.project-cover-image', root).forEach(image => {
      const visual = image.closest('.project-visual');
      const show = () => visual?.classList.add('has-cover');
      const fallback = () => { visual?.classList.remove('has-cover'); image.remove(); };
      image.addEventListener('load', show, { once: true });
      image.addEventListener('error', fallback, { once: true });
      if (image.complete) image.naturalWidth ? show() : fallback();
    });
  }

  function socialIcon(platform) {
    const path = data.icons?.socials?.[platform];
    return path ? `<img class="social-icon" src="${path}" alt="" aria-hidden="true" loading="lazy" decoding="async">` : "";
  }

  function renderExpertise() {
    const fullList = $('#expertise-list');
    if (fullList) {
      fullList.innerHTML = data.expertise.map(item => `
        <article class="expertise-item">
          <span class="expertise-number" aria-hidden="true">${item.number}</span>
          <div><h3>${local(item.title)}</h3><p>${local(item.description)}</p></div>
          <ul aria-label="${translations[currentLanguage].a11y.keywords}">${item.keywords.map(keyword => `<li>${keyword}</li>`).join("")}</ul>
        </article>`).join("");
    }
    const previewList = $('#expertise-preview-list');
    if (previewList) {
      previewList.innerHTML = data.expertise.map(item => `
        <article class="expertise-preview-item">
          <span class="expertise-number" aria-hidden="true">${item.number}</span>
          <h3>${local(item.title)}</h3>
          <p>${local(item.description)}</p>
        </article>`).join("");
    }
  }

  function renderTechnologies() {
    const container = $('#technology-list');
    if (!container) return;
    container.innerHTML = data.technologies.map((technology, index) => {
      const icon = technologyIcon(technology);
      const number = String(index + 1).padStart(2, "0");
      return `<span class="technology-index-item"><span class="technology-index-number" aria-hidden="true">${number}</span>${icon}<strong${icon ? "" : ' class="technology-name-only"'}>${technology}</strong></span>`;
    }).join("");
  }

  function renderBackground() {
    const experienceList = $('#experience-list');
    if (experienceList) {
      experienceList.innerHTML = data.experience.map(item => `
        <article class="background-item">
          <p class="item-period">${local(item.period)}</p>
          <h4>${local(item.role)}</h4>
          <p class="item-organisation">${local(item.organisation)}</p>
          ${item.location ? `<p class="item-location">${local(item.location)}</p>` : ""}
          <p class="item-description">${local(item.description)}</p>
          ${item.relatedProject ? (() => {
            const project = data.projects.find(candidate => candidate.slug === item.relatedProject);
            return project?.href ? `<a class="background-project-link arrow-link" href="${project.href}"><span>${translations[currentLanguage].projects.view}</span><span aria-hidden="true">↗</span></a>` : "";
          })() : ""}
        </article>`).join("");
    }
    const educationList = $('#education-list');
    if (educationList) {
      educationList.innerHTML = data.education.map(item => `
        <article class="background-item education-item">
          <p class="item-period">${item.period}</p>
          <h4>${local(item.degree)}</h4>
          <p class="item-organisation">${item.institution}</p>
          <p class="item-focus">${local(item.focus)}</p>
        </article>`).join("");
    }
  }

  function renderFilters() {
    const container = $('#project-filters');
    if (!container) return;
    container.innerHTML = data.filters.map(filter => `<button type="button" data-filter="${filter.id}" class="${activeFilter === filter.id ? "active" : ""}" aria-pressed="${activeFilter === filter.id}">${filter[currentLanguage]}</button>`).join("");
    $$('[data-filter]', container).forEach(button => button.addEventListener("click", () => {
      activeFilter = button.dataset.filter;
      renderFilters();
      renderProjects();
    }));
  }

  function projectCardMarkup(project) {
    return `<article class="project-card ${project.featured ? "project-featured" : ""}" data-project-theme="${projectThemeKey(project)}">
      <div class="project-visual">${projectVisual(project)}${projectCoverMarkup(project)}</div>
      <div class="project-content">
        <div class="project-meta"><span>${local(project.category)}</span>${project.year ? `<time>${project.year}</time>` : ""}</div>
        <h3>${local(project.title)}</h3>
        ${project.subtitle ? `<p class="project-subtitle">${local(project.subtitle)}</p>` : ""}
        <p class="project-description">${local(project.description)}</p>
        <div class="tags project-technologies">${project.technologies.map(technologyBadge).join("")}</div>
        <a class="project-link arrow-link" href="${project.href}"><span>${translations[currentLanguage].projects.view}</span><span aria-hidden="true">↗</span></a>
      </div>
    </article>`;
  }

  function renderProjects() {
    const container = $('#projects-list');
    if (!container) return;
    const projects = data.projects.filter(project => activeFilter === "all" || project.categories.includes(activeFilter));
    container.innerHTML = projects.length ? projects.map(projectCardMarkup).join("") : `<p class="no-results">${translations[currentLanguage].projects.noResult}</p>`;
    setupProjectCovers(container);
    const countMessage = projects.length === 1 ? translations[currentLanguage].projects.resultOne : translations[currentLanguage].projects.resultMany.replace("{count}", projects.length);
    const status = $('#filter-status');
    if (status) status.textContent = countMessage;
  }

  function renderFeaturedProjects() {
    const container = $('#featured-projects-list');
    if (!container) return;
    const featured = data.projects.filter(project => project.featured);
    const projects = [...featured, ...data.projects.filter(project => !project.featured)].slice(0, 3);
    container.innerHTML = projects.map(projectCardMarkup).join("");
    setupProjectCovers(container);
  }

  function unavailableAction(label) {
    return `<button class="button document-button" type="button" disabled title="${translations[currentLanguage].thesis.unavailable}">${label}</button>`;
  }

  function renderThesis() {
    const technologies = $('#thesis-technologies');
    const actionsContainer = $('#thesis-actions');
    if (technologies) technologies.innerHTML = data.thesis.technologies.map(technologyBadge).join("");
    const copy = translations[currentLanguage].thesis;
    const thesis = data.documents.thesis;
    const presentationPdf = data.documents.thesisPresentationPdf;
    const presentation = data.documents.thesisPresentation;
    const actions = [];
    if (thesis.available) {
      actions.push(`<a class="button primary" href="${thesis.path}" target="_blank" rel="noopener noreferrer">${copy.read}</a>`);
      actions.push(`<a class="button document-button" href="${thesis.path}" download>${copy.download}</a>`);
    } else {
      actions.push(unavailableAction(copy.read));
      actions.push(unavailableAction(copy.download));
    }
    if (presentationPdf.available) actions.push(`<a class="button document-button" href="${presentationPdf.path}" target="_blank" rel="noopener noreferrer">${copy.presentation}</a>`);
    else if (presentation.available) actions.push(`<a class="button document-button" href="${presentation.path}" download>${copy.presentation}</a>`);
    else actions.push(unavailableAction(copy.presentation));
    const relatedProject = data.projects.find(project => project.slug === data.thesis.relatedProject);
    if (relatedProject?.href) actions.push(`<a class="button document-button thesis-project-link arrow-link" href="${relatedProject.href}"><span>${translations[currentLanguage].projects.view}</span><span aria-hidden="true">↗</span></a>`);
    if (actionsContainer) actionsContainer.innerHTML = actions.join("");

    const researchContainer = $('#thesis-research-sections');
    const detail = data.projectDetails?.[data.thesis.relatedProject];
    if (researchContainer && Array.isArray(detail?.sections)) {
      researchContainer.innerHTML = detail.sections.slice(0, 3).map((section, index) => `
        <article class="thesis-research-item">
          <span aria-hidden="true">${String(index + 1).padStart(2, "0")}</span>
          <div><h3>${local(section.title)}</h3><p>${local(section.body)}</p></div>
        </article>`).join("");
    }
    const relatedContainer = $('#thesis-related-project');
    if (relatedContainer && relatedProject) {
      relatedContainer.innerHTML = projectCardMarkup(relatedProject);
      setupProjectCovers(relatedContainer);
    }
  }

  function renderContact() {
    const linksContainer = $('#contact-links');
    const socialsContainer = $('#contact-socials');
    const contact = data.contact;
    const copy = translations[currentLanguage].contact;
    if (linksContainer) {
      linksContainer.innerHTML = `
        <a href="mailto:${contact.email}"><span>${copy.email}</span><strong>${contact.email}</strong></a>
        <div><span>${copy.phone}</span><span class="contact-phone-value" data-tel="${escapeHtml(contact.phone.href)}" data-display="${escapeHtml(contact.phone.display)}"><button type="button" class="contact-phone-reveal">${copy.phoneReveal}</button></span></div>
        <div><span>${copy.location}</span><strong>${local(contact.location)}</strong></div>`;
      const phoneButton = linksContainer.querySelector('.contact-phone-reveal');
      phoneButton?.addEventListener('click', () => {
        const holder = phoneButton.closest('.contact-phone-value');
        if (!holder) return;
        holder.innerHTML = `<a href="tel:${holder.dataset.tel}"><strong>${holder.dataset.display}</strong></a>`;
      }, { once: true });
    }
    const socials = [];
    if (configured(contact.linkedin)) socials.push(`<a class="social-button" href="${contact.linkedin}" target="_blank" rel="noopener noreferrer" aria-label="${copy.linkedinLabel}">${socialIcon("linkedin")}<span>LinkedIn</span></a>`);
    if (configured(contact.github)) socials.push(`<a class="social-button" href="${contact.github}" target="_blank" rel="noopener noreferrer" aria-label="${copy.githubLabel}">${socialIcon("github")}<span>GitHub</span></a>`);
    if (socialsContainer) {
      socialsContainer.innerHTML = socials.join("");
      socialsContainer.hidden = socials.length === 0;
    }
    const schemaElement = $('#person-schema');
    if (schemaElement) {
      try {
        const schema = JSON.parse(schemaElement.textContent);
        schema.email = `mailto:${contact.email}`;
        schema.telephone = contact.phone.href;
        schema.sameAs = [contact.linkedin, contact.github].filter(configured);
        schemaElement.textContent = JSON.stringify(schema);
      } catch { /* Keep the valid static fallback if metadata cannot be updated. */ }
    }
  }

  function renderCv() {
    const cv = data.documents.cv;
    const heroLabel = translations[currentLanguage].hero.cv;
    const contactCopy = translations[currentLanguage].contact;
    const action = label => cv.available
      ? `<a class="button secondary cv-button" href="${cv.path}" download>${label}</a>`
      : `<button class="button secondary cv-button cv-button-unavailable" type="button" disabled aria-label="${label} — ${contactCopy.cvUnavailable}" title="${contactCopy.cvUnavailable}">${label}</button>`;
    const heroAction = $('#hero-cv-action');
    const contactAction = $('#contact-cv-action');
    const backgroundAction = $('#background-cv-action');
    if (heroAction) heroAction.innerHTML = action(heroLabel);
    if (contactAction) contactAction.innerHTML = action(contactCopy.cv);
    if (backgroundAction) backgroundAction.innerHTML = action(contactCopy.cv);
  }

  function renderDynamicContent() {
    renderExpertise();
    renderTechnologies();
    renderBackground();
    renderFilters();
    renderProjects();
    renderFeaturedProjects();
    renderThesis();
    renderContact();
    renderCv();
  }

  function loadPortrait() {
    const image = $('#profile-image');
    const placeholder = $('#portrait-placeholder');
    if (!image || !placeholder) return;
    const candidates = [...data.profile.portraitCandidates];
    const tryNext = () => {
      const source = candidates.shift();
      if (!source) { image.hidden = true; placeholder.hidden = false; return; }
      const test = new Image();
      test.onload = () => { image.src = source; image.hidden = false; placeholder.hidden = true; };
      test.onerror = tryNext;
      test.src = source;
    };
    tryNext();
  }

  function setupReveals() {
    const elements = $$('.reveal');
    if (!("IntersectionObserver" in window)) { elements.forEach(element => element.classList.add("visible")); return; }
    const observer = new IntersectionObserver(entries => entries.forEach(entry => {
      if (entry.isIntersecting) { entry.target.classList.add("visible"); observer.unobserve(entry.target); }
    }), { threshold: .12 });
    elements.forEach(element => observer.observe(element));
  }

  loadPortrait();
  setupReveals();
  const layout = window.PortfolioLayout;
  if (layout?.subscribeLanguage) {
    layout.subscribeLanguage(language => {
      currentLanguage = language === "en" ? "en" : "fr";
      renderDynamicContent();
    });
  } else {
    renderDynamicContent();
  }
})();
