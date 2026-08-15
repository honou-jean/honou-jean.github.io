/*
 * Pedagogical multimodal score-fusion simulator, mounted into the
 * multimodal-biometrics project page. Scores are synthetic and
 * user-controlled; the ROC curve comes from a fixed illustrative Gaussian
 * genuine/impostor model, not from the thesis's real evaluation data. This
 * demonstrates the mechanics of weighted score-level fusion and threshold
 * decisions described in the thesis — it is explicitly not a report of
 * real results, which are gated behind the site's own validation rule.
 */
(() => {
  "use strict";

  const WEIGHTS = { face: 0.5, voice: 0.3, ocr: 0.2 };
  const GENUINE = { mean: 75, sd: 10 };
  const IMPOSTOR = { mean: 35, sd: 15 };

  const STRINGS = {
    fr: {
      face: "Score visage",
      voice: "Score voix",
      ocr: "Score OCR",
      threshold: "Seuil d’acceptation",
      fused: "Score fusionné",
      accept: "Accepté",
      reject: "Rejeté",
      weights: "Pondération fixe : visage 0,5 · voix 0,3 · OCR 0,2",
      far: "FAR",
      tar: "TAR",
      disclosure: "Simulateur pédagogique — scores et courbe ROC synthétiques, à visée illustrative. Les résultats réels du mémoire seront publiés séparément, après validation."
    },
    en: {
      face: "Face score",
      voice: "Voice score",
      ocr: "OCR score",
      threshold: "Acceptance threshold",
      fused: "Fused score",
      accept: "Accepted",
      reject: "Rejected",
      weights: "Fixed weights: face 0.5 · voice 0.3 · OCR 0.2",
      far: "FAR",
      tar: "TAR",
      disclosure: "Pedagogical simulator — synthetic scores and ROC curve, for illustration only. Real thesis results will be published separately, once validated."
    }
  };

  function erf(x) {
    const sign = x < 0 ? -1 : 1;
    const absX = Math.abs(x);
    const a1 = 0.254829592, a2 = -0.284496736, a3 = 1.421413741, a4 = -1.453152027, a5 = 1.061405429, p = 0.3275911;
    const t = 1 / (1 + p * absX);
    const y = 1 - (((((a5 * t + a4) * t) + a3) * t + a2) * t + a1) * t * Math.exp(-absX * absX);
    return sign * y;
  }

  function normalCdf(x, mean, sd) {
    return 0.5 * (1 + erf((x - mean) / (sd * Math.SQRT2)));
  }

  function tarAt(threshold) { return 1 - normalCdf(threshold, GENUINE.mean, GENUINE.sd); }
  function farAt(threshold) { return 1 - normalCdf(threshold, IMPOSTOR.mean, IMPOSTOR.sd); }

  function drawRoc(canvas, threshold) {
    const context = canvas.getContext("2d");
    const ratio = window.devicePixelRatio || 1;
    const width = canvas.clientWidth;
    const height = canvas.clientHeight;
    canvas.width = width * ratio;
    canvas.height = height * ratio;
    context.setTransform(ratio, 0, 0, ratio, 0, 0);
    context.clearRect(0, 0, width, height);

    const styles = getComputedStyle(canvas);
    const accent = styles.getPropertyValue("--project-accent-on-light").trim() || styles.getPropertyValue("--project-accent").trim() || "#115563";
    const line = styles.getPropertyValue("--project-line").trim() || "rgba(139,208,210,.4)";
    const pad = 16;
    const plotW = width - pad * 2;
    const plotH = height - pad * 2;

    context.strokeStyle = line;
    context.lineWidth = 1;
    context.strokeRect(pad, pad, plotW, plotH);
    context.beginPath();
    context.moveTo(pad, pad + plotH);
    context.lineTo(pad + plotW, pad);
    context.stroke();

    context.strokeStyle = accent;
    context.lineWidth = 1.8;
    context.beginPath();
    for (let i = 0; i <= 100; i += 1) {
      const t = i;
      const far = farAt(t);
      const tar = tarAt(t);
      const x = pad + far * plotW;
      const y = pad + (1 - tar) * plotH;
      if (i === 0) context.moveTo(x, y);
      else context.lineTo(x, y);
    }
    context.stroke();

    const markerX = pad + farAt(threshold) * plotW;
    const markerY = pad + (1 - tarAt(threshold)) * plotH;
    context.beginPath();
    context.fillStyle = accent;
    context.arc(markerX, markerY, 4.5, 0, Math.PI * 2);
    context.fill();
  }

  function mount(container, options) {
    const language = options && STRINGS[options.language] ? options.language : "fr";
    const strings = STRINGS[language];

    container.classList.add("demo-fusion");
    container.innerHTML = `
      <div class="demo-controls demo-fusion-sliders">
        <div class="demo-field">
          <label for="demo-fusion-face">${strings.face} — <span id="demo-fusion-face-value">70</span></label>
          <input id="demo-fusion-face" type="range" min="0" max="100" step="1" value="70">
        </div>
        <div class="demo-field">
          <label for="demo-fusion-voice">${strings.voice} — <span id="demo-fusion-voice-value">65</span></label>
          <input id="demo-fusion-voice" type="range" min="0" max="100" step="1" value="65">
        </div>
        <div class="demo-field">
          <label for="demo-fusion-ocr">${strings.ocr} — <span id="demo-fusion-ocr-value">80</span></label>
          <input id="demo-fusion-ocr" type="range" min="0" max="100" step="1" value="80">
        </div>
        <div class="demo-field">
          <label for="demo-fusion-threshold">${strings.threshold} — <span id="demo-fusion-threshold-value">60</span></label>
          <input id="demo-fusion-threshold" type="range" min="0" max="100" step="1" value="60">
        </div>
      </div>
      <p class="demo-fusion-weights">${strings.weights}</p>
      <div class="demo-fusion-layout">
        <div class="demo-fusion-result">
          <p class="demo-fusion-score"><span id="demo-fusion-fused">0</span></p>
          <p class="demo-fusion-decision" id="demo-fusion-decision"></p>
        </div>
        <div class="demo-canvas-wrap demo-fusion-roc"><canvas class="demo-canvas" aria-hidden="true"></canvas></div>
      </div>
      <p class="demo-stats" id="demo-fusion-stats" role="status" aria-live="polite"></p>
    `;

    const faceInput = container.querySelector("#demo-fusion-face");
    const voiceInput = container.querySelector("#demo-fusion-voice");
    const ocrInput = container.querySelector("#demo-fusion-ocr");
    const thresholdInput = container.querySelector("#demo-fusion-threshold");
    const faceValue = container.querySelector("#demo-fusion-face-value");
    const voiceValue = container.querySelector("#demo-fusion-voice-value");
    const ocrValue = container.querySelector("#demo-fusion-ocr-value");
    const thresholdValue = container.querySelector("#demo-fusion-threshold-value");
    const fusedEl = container.querySelector("#demo-fusion-fused");
    const decisionEl = container.querySelector("#demo-fusion-decision");
    const statsEl = container.querySelector("#demo-fusion-stats");
    const canvas = container.querySelector(".demo-canvas");

    function update() {
      const face = Number(faceInput.value);
      const voice = Number(voiceInput.value);
      const ocr = Number(ocrInput.value);
      const threshold = Number(thresholdInput.value);

      faceValue.textContent = face;
      voiceValue.textContent = voice;
      ocrValue.textContent = ocr;
      thresholdValue.textContent = threshold;

      const fused = face * WEIGHTS.face + voice * WEIGHTS.voice + ocr * WEIGHTS.ocr;
      fusedEl.textContent = fused.toFixed(1);
      const accepted = fused >= threshold;
      decisionEl.textContent = accepted ? strings.accept : strings.reject;
      decisionEl.dataset.tone = accepted ? "success" : "error";

      drawRoc(canvas, threshold);
      statsEl.textContent = `${strings.far} = ${(farAt(threshold) * 100).toFixed(1)}% · ${strings.tar} = ${(tarAt(threshold) * 100).toFixed(1)}%`;
    }

    [faceInput, voiceInput, ocrInput, thresholdInput].forEach((input) => input.addEventListener("input", update));
    update();
  }

  window.PortfolioDemos = window.PortfolioDemos || {};
  window.PortfolioDemos["fusion-simulator"] = mount;
})();
