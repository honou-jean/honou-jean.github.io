/*
 * Live Poisson-process simulator mounted into the Poisson-processes project
 * page (assets/js/site-data.js projectDetails["poisson-processes"]). Every
 * run samples a real point-process realization in the browser via the
 * shared PRNG module (assets/js/prng.js) — this is an interactive
 * illustration of the method, not a report of the thesis's real results.
 */
(() => {
  "use strict";

  const STRINGS = {
    fr: {
      intensity: "Intensité λ",
      mode: "Type de processus",
      homogeneous: "Homogène",
      nonHomogeneous: "Non homogène — λ(t) variable",
      run: "Simuler une réalisation",
      empty: "Cliquez sur « Simuler » pour générer une réalisation.",
      stats: (n, mean, variance, dispersion) =>
        `n = ${n} arrivées · intervalle moyen = ${mean} · variance = ${variance} · indice de dispersion = ${dispersion}`,
      axis: "temps"
    },
    en: {
      intensity: "Intensity λ",
      mode: "Process type",
      homogeneous: "Homogeneous",
      nonHomogeneous: "Non-homogeneous — variable λ(t)",
      run: "Simulate a realization",
      empty: "Click “Simulate” to generate a realization.",
      stats: (n, mean, variance, dispersion) =>
        `n = ${n} arrivals · mean interarrival = ${mean} · variance = ${variance} · dispersion index = ${dispersion}`,
      axis: "time"
    }
  };

  function formatNumber(value) {
    return Number.isFinite(value) ? value.toFixed(2) : "—";
  }

  function computeStats(arrivals) {
    const gaps = [];
    for (let i = 1; i < arrivals.length; i += 1) gaps.push(arrivals[i] - arrivals[i - 1]);
    const n = arrivals.length;
    if (!gaps.length) return { n, mean: NaN, variance: NaN, dispersion: NaN };
    const mean = gaps.reduce((sum, value) => sum + value, 0) / gaps.length;
    const variance = gaps.reduce((sum, value) => sum + (value - mean) ** 2, 0) / gaps.length;
    return { n, mean, variance, dispersion: mean > 0 ? variance / mean : NaN };
  }

  function drawTimeline(canvas, arrivals, horizon) {
    const context = canvas.getContext("2d");
    const ratio = window.devicePixelRatio || 1;
    const width = canvas.clientWidth;
    const height = canvas.clientHeight;
    canvas.width = width * ratio;
    canvas.height = height * ratio;
    context.setTransform(ratio, 0, 0, ratio, 0, 0);
    context.clearRect(0, 0, width, height);

    const styles = getComputedStyle(canvas);
    const accent = styles.getPropertyValue("--project-accent").trim() || "#176675";
    const line = styles.getPropertyValue("--project-line").trim() || "rgba(23,102,117,.4)";
    const axisY = height * 0.66;
    const padX = 18;
    const usableWidth = width - padX * 2;

    context.strokeStyle = line;
    context.lineWidth = 1;
    context.beginPath();
    context.moveTo(padX, axisY);
    context.lineTo(width - padX, axisY);
    context.stroke();

    arrivals.forEach((t, index) => {
      const x = padX + (t / horizon) * usableWidth;
      const stemTop = axisY - 14 - (index % 4) * 9;
      context.strokeStyle = line;
      context.beginPath();
      context.moveTo(x, axisY);
      context.lineTo(x, stemTop);
      context.stroke();
      context.beginPath();
      context.fillStyle = accent;
      context.arc(x, stemTop, 4, 0, Math.PI * 2);
      context.fill();
    });
  }

  function mount(container, options) {
    const language = options && STRINGS[options.language] ? options.language : "fr";
    const strings = STRINGS[language];
    const prng = window.PortfolioPRNG;
    if (!prng) return;

    container.classList.add("demo-poisson");
    container.innerHTML = `
      <div class="demo-controls">
        <div class="demo-field">
          <label for="demo-poisson-lambda">${strings.intensity} — <span id="demo-poisson-lambda-value">1.0</span></label>
          <input id="demo-poisson-lambda" type="range" min="0.3" max="3" step="0.1" value="1">
        </div>
        <div class="demo-field demo-field-inline">
          <label><input type="radio" name="demo-poisson-mode" value="homogeneous" checked> ${strings.homogeneous}</label>
          <label><input type="radio" name="demo-poisson-mode" value="nonhomogeneous"> ${strings.nonHomogeneous}</label>
        </div>
        <button type="button" class="button demo-run">${strings.run}</button>
      </div>
      <div class="demo-canvas-wrap"><canvas class="demo-canvas" aria-hidden="true"></canvas></div>
      <p class="demo-stats" role="status" aria-live="polite">${strings.empty}</p>
    `;

    const lambdaInput = container.querySelector("#demo-poisson-lambda");
    const lambdaValue = container.querySelector("#demo-poisson-lambda-value");
    const runButton = container.querySelector(".demo-run");
    const canvas = container.querySelector(".demo-canvas");
    const statsLine = container.querySelector(".demo-stats");
    const horizon = 20;

    lambdaInput.addEventListener("input", () => {
      lambdaValue.textContent = Number(lambdaInput.value).toFixed(1);
    });

    function run() {
      const rate = Number(lambdaInput.value) || 1;
      const mode = container.querySelector('input[name="demo-poisson-mode"]:checked')?.value;
      const random = prng.mulberry32(Date.now() % 4294967296);
      const arrivals = mode === "nonhomogeneous"
        ? prng.nonHomogeneousPoissonArrivals(random, t => rate * (1 + 0.6 * Math.sin((2 * Math.PI * t) / (horizon / 2))), rate * 1.6, horizon)
        : prng.homogeneousPoissonArrivals(random, rate, horizon);

      drawTimeline(canvas, arrivals, horizon);
      const stats = computeStats(arrivals);
      statsLine.textContent = arrivals.length > 1
        ? strings.stats(stats.n, formatNumber(stats.mean), formatNumber(stats.variance), formatNumber(stats.dispersion))
        : strings.stats(arrivals.length, "—", "—", "—");
    }

    runButton.addEventListener("click", run);
    window.addEventListener("resize", () => {
      if (canvas.dataset.drawn) run();
    }, { passive: true });
    run();
    canvas.dataset.drawn = "true";
  }

  window.PortfolioDemos = window.PortfolioDemos || {};
  window.PortfolioDemos["poisson-simulator"] = mount;
})();
