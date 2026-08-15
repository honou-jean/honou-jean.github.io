/*
 * Deterministic sampling helpers shared by the project-card visuals and the
 * interactive project-page demos. A fixed seed keeps generated layouts
 * stable across reloads instead of jittering on every page view.
 */
(() => {
  "use strict";

  function mulberry32(seed) {
    let state = seed >>> 0;
    return function random() {
      state |= 0;
      state = (state + 0x6D2B79F5) | 0;
      let t = Math.imul(state ^ (state >>> 15), 1 | state);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }

  function exponentialInterarrivals(random, rate, count) {
    const values = [];
    for (let i = 0; i < count; i += 1) values.push(-Math.log(1 - random()) / rate);
    return values;
  }

  function homogeneousPoissonArrivals(random, rate, horizon) {
    const arrivals = [];
    let t = 0;
    while (true) {
      t += -Math.log(1 - random()) / rate;
      if (t > horizon) break;
      arrivals.push(t);
    }
    return arrivals;
  }

  function nonHomogeneousPoissonArrivals(random, intensity, rateMax, horizon) {
    const arrivals = [];
    let t = 0;
    while (true) {
      t += -Math.log(1 - random()) / rateMax;
      if (t > horizon) break;
      if (random() * rateMax <= intensity(t)) arrivals.push(t);
    }
    return arrivals;
  }

  window.PortfolioPRNG = Object.freeze({
    mulberry32,
    exponentialInterarrivals,
    homogeneousPoissonArrivals,
    nonHomogeneousPoissonArrivals
  });
})();
