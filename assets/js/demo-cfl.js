/*
 * Live Lax-Wendroff / CFL-stability demo mounted into the scientific-computing
 * project page (assets/js/site-data.js projectDetails["scientific-computing"]).
 * A real finite-difference integration of the 1D advection equation runs in
 * the browser — below Courant number 1 the pulse propagates cleanly, above 1
 * the scheme genuinely and visibly diverges. Deterministic, no randomness.
 */
(() => {
  "use strict";

  const STRINGS = {
    fr: {
      courant: "Nombre de Courant ν",
      play: "Lancer",
      pause: "Pause",
      reset: "Réinitialiser",
      stable: "stable",
      unstable: "instable — divergence numérique",
      state: (nu, label) => `ν = ${nu} — schéma ${label}`
    },
    en: {
      courant: "Courant number ν",
      play: "Play",
      pause: "Pause",
      reset: "Reset",
      stable: "stable",
      unstable: "unstable — numerical blow-up",
      state: (nu, label) => `ν = ${nu} — scheme ${label}`
    }
  };

  const POINTS = 150;

  function initialField() {
    const field = new Array(POINTS);
    const center = POINTS * 0.28;
    const width = POINTS * 0.055;
    for (let i = 0; i < POINTS; i += 1) field[i] = Math.exp(-(((i - center) / width) ** 2));
    return field;
  }

  function laxWendroffStep(field, nu) {
    const n = field.length;
    const next = new Array(n);
    for (let i = 0; i < n; i += 1) {
      const previous = field[(i - 1 + n) % n];
      const current = field[i];
      const forward = field[(i + 1) % n];
      next[i] = current - (nu / 2) * (forward - previous) + ((nu * nu) / 2) * (forward - 2 * current + previous);
    }
    return next;
  }

  function draw(canvas, field) {
    const context = canvas.getContext("2d");
    const ratio = window.devicePixelRatio || 1;
    const width = canvas.clientWidth;
    const height = canvas.clientHeight;
    canvas.width = width * ratio;
    canvas.height = height * ratio;
    context.setTransform(ratio, 0, 0, ratio, 0, 0);
    context.clearRect(0, 0, width, height);

    const styles = getComputedStyle(canvas);
    const accent = styles.getPropertyValue("--project-accent").trim() || "#e8bd79";
    const line = styles.getPropertyValue("--project-line").trim() || "rgba(232,189,121,.35)";
    const midY = height / 2;
    const scale = height * 0.38;
    const clampScale = 2.4;

    context.strokeStyle = line;
    context.lineWidth = 1;
    context.beginPath();
    context.moveTo(0, midY);
    context.lineTo(width, midY);
    context.stroke();

    context.strokeStyle = accent;
    context.lineWidth = 1.8;
    context.beginPath();
    field.forEach((value, index) => {
      const x = (index / (field.length - 1)) * width;
      const clamped = Math.max(-clampScale, Math.min(clampScale, value));
      const y = midY - clamped * scale;
      if (index === 0) context.moveTo(x, y);
      else context.lineTo(x, y);
    });
    context.stroke();
  }

  function maxAbs(field) {
    return field.reduce((max, value) => Math.max(max, Math.abs(value)), 0);
  }

  function mount(container, options) {
    const language = options && STRINGS[options.language] ? options.language : "fr";
    const strings = STRINGS[language];
    container.classList.add("demo-cfl");
    container.innerHTML = `
      <div class="demo-controls">
        <div class="demo-field">
          <label for="demo-cfl-nu">${strings.courant} — <span id="demo-cfl-nu-value">0.8</span></label>
          <input id="demo-cfl-nu" type="range" min="0" max="1.5" step="0.02" value="0.8">
        </div>
        <div class="demo-field-inline">
          <button type="button" class="button demo-cfl-play">${strings.play}</button>
          <button type="button" class="button demo-cfl-reset">${strings.reset}</button>
        </div>
      </div>
      <div class="demo-canvas-wrap"><canvas class="demo-canvas" aria-hidden="true"></canvas></div>
      <p class="demo-stats" role="status" aria-live="polite"></p>
    `;

    const nuInput = container.querySelector("#demo-cfl-nu");
    const nuValue = container.querySelector("#demo-cfl-nu-value");
    const playButton = container.querySelector(".demo-cfl-play");
    const resetButton = container.querySelector(".demo-cfl-reset");
    const canvas = container.querySelector(".demo-canvas");
    const statsLine = container.querySelector(".demo-stats");
    const reducedMotion = () => window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    let field = initialField();
    let playing = false;
    let rafId = null;

    function currentNu() {
      return Number(nuInput.value) || 0;
    }

    function report() {
      const nu = currentNu();
      const unstable = maxAbs(field) > 2.05;
      statsLine.textContent = strings.state(nu.toFixed(2), unstable ? strings.unstable : strings.stable);
      draw(canvas, field);
    }

    function tick() {
      field = laxWendroffStep(field, currentNu());
      report();
      if (playing) rafId = window.requestAnimationFrame(tick);
    }

    function stopLoop() {
      playing = false;
      playButton.textContent = strings.play;
      if (rafId) window.cancelAnimationFrame(rafId);
      rafId = null;
    }

    function startLoop() {
      playing = true;
      playButton.textContent = strings.pause;
      rafId = window.requestAnimationFrame(tick);
    }

    playButton.addEventListener("click", () => {
      if (reducedMotion()) {
        for (let step = 0; step < 90; step += 1) field = laxWendroffStep(field, currentNu());
        report();
        return;
      }
      if (playing) stopLoop();
      else startLoop();
    });

    resetButton.addEventListener("click", () => {
      stopLoop();
      field = initialField();
      report();
    });

    nuInput.addEventListener("input", () => {
      nuValue.textContent = currentNu().toFixed(2);
      if (!playing) report();
    });

    report();
  }

  window.PortfolioDemos = window.PortfolioDemos || {};
  window.PortfolioDemos["cfl-stability"] = mount;
})();
