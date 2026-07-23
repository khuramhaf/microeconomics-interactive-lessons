// Global constants based on the supply equation P = intercept + 2Q
const Q_MIN = 0, Q_MAX = 13;
const P_MIN = 0, P_MAX = 26;
const PRICE_STEP = 0.2;
const QTY_STEP = 0.1;
const INTERCEPT_STEP = 0.2; // intercept lives on the price axis, so it steps like price
const SLOPE = 2;            // fixed slope of the supply curve

// 1. The Core State Variables
window.state = {
  priceA: 14,
  qtyA: 7,
  priceB: 10,
  qtyB: 5,
  intercept: 0,   // 'a' in P = a + 2Q — vertical shift of the whole supply curve
  elasticity: null
};

// Shared helper: quantity implied by a given price under a given intercept
function quantityFromPrice(price, intercept) {
  let q = (price - intercept) / SLOPE;
  q = Math.round(q / QTY_STEP) * QTY_STEP;
  return Math.max(Q_MIN, Math.min(Q_MAX, q));
}

// 2. Mutators that take Price and read Quantity off the CURRENT intercept
window.updateDotA = function(newPrice) {
  let clampedP = Math.max(P_MIN, Math.min(P_MAX, newPrice));
  clampedP = Math.round(clampedP / PRICE_STEP) * PRICE_STEP;

  window.state.priceA = clampedP;
  window.state.qtyA = quantityFromPrice(clampedP, window.state.intercept);

  window.calculateElasticity();
};

window.updateDotB = function(newPrice) {
  let clampedP = Math.max(P_MIN, Math.min(P_MAX, newPrice));
  clampedP = Math.round(clampedP / PRICE_STEP) * PRICE_STEP;

  window.state.priceB = clampedP;
  window.state.qtyB = quantityFromPrice(clampedP, window.state.intercept);

  window.calculateElasticity();
};

// 3. Intercept mutator — shifts the whole curve. Prices of A/B stay fixed;
//    their quantities get re-read off the newly shifted curve.
window.updateIntercept = function(newIntercept) {
  // Clamp intercept to -6..6 per the lesson's intended range
  let clampedA = Math.max(-6, Math.min(6, newIntercept));
  clampedA = Math.round(clampedA / INTERCEPT_STEP) * INTERCEPT_STEP;

  window.state.intercept = clampedA;
  window.state.qtyA = quantityFromPrice(window.state.priceA, clampedA);
  window.state.qtyB = quantityFromPrice(window.state.priceB, clampedA);

  window.calculateElasticity();
};

// Renamed from adjustDemandIntercept/adjustSupplyIntercept — those two were
// actually nudging a single dot's price, not the curve's intercept. Kept the
// same +/-STEP_SIZE pattern, just named for what they really do.
function adjustDotAPrice(dir) {
  const target = state.priceA + (dir * PRICE_STEP);
  window.updateDotA(Number(target.toFixed(2)));
}

function adjustDotBPrice(dir) {
  const target = state.priceB + (dir * PRICE_STEP);
  window.updateDotB(Number(target.toFixed(2)));
}

// This is the new, genuine intercept adjuster.
function adjustSupplyIntercept(dir) {
  const target = state.intercept + (dir * INTERCEPT_STEP);
  window.updateIntercept(Number(target.toFixed(2)));
}

// 4. Percentage Formula Elasticity Calculation — logic unchanged, still just
//    compares whatever A and B currently are.
window.calculateElasticity = function() {
  const s = window.state;
  const deltaQ = s.qtyB - s.qtyA;
  const deltaP = s.priceB - s.priceA;

  if (s.qtyA === 0 || s.priceA === 0) {
    s.elasticity = NaN;
    return;
  }

  if (deltaP === 0) {
    s.elasticity = (deltaQ === 0) ? 0 : Infinity;
    return;
  }

  const percentChangeQ = deltaQ / s.qtyA;
  const percentChangeP = deltaP / s.priceA;

  s.elasticity = percentChangeQ / percentChangeP;
};

window.calculateElasticity();