(() => {
  "use strict";

  const STRINGS = {
    fr: { close: "Fermer", prev: "Image précédente", next: "Image suivante" },
    en: { close: "Close", prev: "Previous image", next: "Next image" }
  };
  const SELECTOR = ".detail-media-item img, .detail-section-media img";

  let overlay = null;
  let imageElement = null;
  let captionElement = null;
  let counterElement = null;
  let closeButton = null;
  let prevButton = null;
  let nextButton = null;
  let group = [];
  let index = 0;
  let lastFocused = null;

  function currentLanguage() {
    const lang = document.documentElement.lang;
    return STRINGS[lang] ? lang : "fr";
  }

  function buildOverlay() {
    if (overlay) return;
    overlay = document.createElement("div");
    overlay.className = "lightbox-overlay";
    overlay.setAttribute("role", "dialog");
    overlay.setAttribute("aria-modal", "true");
    overlay.hidden = true;
    overlay.addEventListener("click", (event) => {
      if (event.target === overlay) close();
    });

    const figure = document.createElement("figure");
    figure.className = "lightbox-figure";

    imageElement = document.createElement("img");
    imageElement.className = "lightbox-image";
    imageElement.alt = "";

    captionElement = document.createElement("figcaption");
    captionElement.className = "lightbox-caption";

    figure.append(imageElement, captionElement);

    closeButton = document.createElement("button");
    closeButton.type = "button";
    closeButton.className = "lightbox-close";
    closeButton.innerHTML = "&times;";
    closeButton.addEventListener("click", close);

    prevButton = document.createElement("button");
    prevButton.type = "button";
    prevButton.className = "lightbox-nav lightbox-prev";
    prevButton.innerHTML = "&#8249;";
    prevButton.addEventListener("click", () => step(-1));

    nextButton = document.createElement("button");
    nextButton.type = "button";
    nextButton.className = "lightbox-nav lightbox-next";
    nextButton.innerHTML = "&#8250;";
    nextButton.addEventListener("click", () => step(1));

    counterElement = document.createElement("p");
    counterElement.className = "lightbox-counter";

    overlay.append(closeButton, prevButton, figure, nextButton, counterElement);
    document.body.append(overlay);
  }

  function galleryFor(image) {
    const container = image.closest(".detail-media-grid, .detail-section-media");
    if (!container) return [image];
    return Array.from(container.querySelectorAll("img"));
  }

  function show(nextIndex) {
    index = ((nextIndex % group.length) + group.length) % group.length;
    const image = group[index];
    imageElement.src = image.currentSrc || image.src;
    imageElement.alt = image.alt || "";
    const caption = image.closest("figure")?.querySelector("figcaption")?.textContent?.trim() || "";
    captionElement.textContent = caption;
    captionElement.hidden = !caption;
    const multiple = group.length > 1;
    prevButton.hidden = !multiple;
    nextButton.hidden = !multiple;
    counterElement.hidden = !multiple;
    if (multiple) counterElement.textContent = `${index + 1} / ${group.length}`;
  }

  function step(delta) {
    show(index + delta);
  }

  function onKeydown(event) {
    if (event.key === "Escape") close();
    else if (event.key === "ArrowLeft") step(-1);
    else if (event.key === "ArrowRight") step(1);
  }

  function open(image) {
    buildOverlay();
    const language = STRINGS[currentLanguage()];
    closeButton.setAttribute("aria-label", language.close);
    prevButton.setAttribute("aria-label", language.prev);
    nextButton.setAttribute("aria-label", language.next);

    group = galleryFor(image);
    index = Math.max(0, group.indexOf(image));
    lastFocused = document.activeElement;

    overlay.hidden = false;
    document.body.classList.add("lightbox-open");
    show(index);
    closeButton.focus();
    document.addEventListener("keydown", onKeydown);
  }

  function close() {
    if (!overlay || overlay.hidden) return;
    overlay.hidden = true;
    document.body.classList.remove("lightbox-open");
    document.removeEventListener("keydown", onKeydown);
    imageElement.src = "";
    if (lastFocused && typeof lastFocused.focus === "function") lastFocused.focus();
  }

  document.addEventListener("click", (event) => {
    const image = event.target.closest(SELECTOR);
    if (!image) return;
    event.preventDefault();
    open(image);
  });
})();
