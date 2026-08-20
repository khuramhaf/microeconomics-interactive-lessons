/* ==========================================================
   model.js
   State, constants, and pure math for the producer surplus lesson.
   Supply curve: P = b*Q  (b = 2, same slope convention as the PES
   tool's supply curve, intercept fixed at the origin)
   REQUIRES: nothing. Loads FIRST — graph.js and main.js both depend on
   the state object and setters defined here.
   ========================================================== */

const Q_MIN = 0, Q_MAX = 10;
const P_MIN = 0, P_MAX = 20;

const SUPPLY_A = 0;   // supply curve intercept (passes through the origin)
const SUPPLY_B = 2;   // supply curve slope

const P_DRAG_STEP = 0.2;   // price-line drag snaps to this increment, matching the slider's precision

const P_STEP = 0.2;        // price stepper-button increment
const PS_STEP = 1;         // producer-surplus stepper-button increment

function clamp(v, lo, hi) {
  return Math.max(lo, Math.min(hi, v));
}

function priceFromQty(q) {
  return SUPPLY_A + SUPPLY_B * q;
}

function qtyFromPrice(p) {
  return (p - SUPPLY_A) / SUPPLY_B;
}

/* Producer surplus at a given price = the area of the triangle bounded
   by the horizontal price line above and the supply curve below, from
   Q = 0 out to Q = qtyFromPrice(p):
     PS(p) = 0.5 * (p - a) * qtyFromPrice(p) = (p - a)^2 / (2b)          */
function producerSurplusFromPrice(p) {
  const q = qtyFromPrice(p);
  return 0.5 * (p - SUPPLY_A) * q;
}

/* Inverse of the above — given a target PS, solve for the price that
   produces it, so the PS slider can drive state just like the price
   slider does:
     PS = (p-a)^2 / (2b)  =>  p-a = sqrt(2*b*PS)  =>  p = a + sqrt(2*b*PS) */
function priceFromProducerSurplus(ps) {
  return SUPPLY_A + Math.sqrt(2 * SUPPLY_B * ps);
}

const PS_MIN = 0;                                  // PS when P = P_MIN (nothing is supplied)
const PS_MAX = producerSurplusFromPrice(P_MAX);     // PS when P = P_MAX (largest possible)

const state = {
  P: 10,
  Q: qtyFromPrice(10),
  PS: producerSurplusFromPrice(10)
};

/* Every setter recomputes the full state (P, Q, PS all stay in sync off
   the single supply curve) and triggers a render. `renderAll` is defined
   in main.js, which loads last — by the time any of these setters fire
   (drag, slider, or number-input events all happen after full page
   load), renderAll already exists on the page's global scope. */

function setFromP(rawP) {
  state.P = clamp(rawP, P_MIN, P_MAX);
  state.Q = qtyFromPrice(state.P);
  state.PS = producerSurplusFromPrice(state.P);
  renderAll();
}

function setFromQ(rawQ) {
  state.Q = clamp(rawQ, Q_MIN, Q_MAX);
  state.P = priceFromQty(state.Q);
  state.PS = producerSurplusFromPrice(state.P);
  renderAll();
}

function setFromPS(rawPS) {
  const ps = clamp(rawPS, PS_MIN, PS_MAX);
  const p = clamp(priceFromProducerSurplus(ps), P_MIN, P_MAX);
  state.P = p;
  state.Q = qtyFromPrice(p);
  state.PS = producerSurplusFromPrice(p);
  renderAll();
}
