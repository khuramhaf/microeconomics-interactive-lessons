/* ==========================================================
   model.js
   State, constants, and pure math for the consumer surplus lesson.
   Demand curve: P = a - b*Q  (a = 20, b = 2, same demand line used by
   the movement/shift lesson, so the two lessons stay visually consistent)
   REQUIRES: nothing. Loads FIRST — graph.js and main.js both depend on
   the state object and setters defined here.
   ========================================================== */

const Q_MIN = 0, Q_MAX = 10;
const P_MIN = 0, P_MAX = 20;

const DEMAND_A = 20;   // demand curve intercept
const DEMAND_B = 2;    // demand curve slope

const P_DRAG_STEP = 0.2;   // price-line drag snaps to this increment, matching the slider's precision

const P_STEP = 0.2;        // price stepper-button increment
const CS_STEP = 1;


function clamp(v, lo, hi) {
  return Math.max(lo, Math.min(hi, v));
}

function priceFromQty(q) {
  return DEMAND_A - DEMAND_B * q;
}

function qtyFromPrice(p) {
  return (DEMAND_A - p) / DEMAND_B;
}

/* Consumer surplus at a given price = the area of the triangle bounded
   by the demand curve above and the horizontal price line below, from
   Q = 0 out to Q = qtyFromPrice(p):
     CS(p) = 0.5 * (a - p) * qtyFromPrice(p) = (a - p)^2 / (2b)          */
function consumerSurplusFromPrice(p) {
  const q = qtyFromPrice(p);
  return 0.5 * (DEMAND_A - p) * q;
}

/* Inverse of the above — given a target CS, solve for the price that
   produces it, so the CS slider can drive state just like the price
   slider does:
     CS = (a-p)^2 / (2b)  =>  a-p = sqrt(2*b*CS)  =>  p = a - sqrt(2*b*CS) */
function priceFromConsumerSurplus(cs) {
  return DEMAND_A - Math.sqrt(2 * DEMAND_B * cs);
}

const CS_MIN = 0;                                 // CS when P = P_MAX (demand choked off)
const CS_MAX = consumerSurplusFromPrice(P_MIN);    // CS when P = 0 (largest possible)

const state = {
  P: 10,
  Q: qtyFromPrice(10),
  CS: consumerSurplusFromPrice(10)
};

/* Every setter recomputes the full state (P, Q, CS all stay in sync off
   the single demand curve) and triggers a render. `renderAll` is defined
   in main.js, which loads last — by the time any of these setters fire
   (drag, slider, or number-input events all happen after full page
   load), renderAll already exists on the page's global scope. */

function setFromP(rawP) {
  state.P = clamp(rawP, P_MIN, P_MAX);
  state.Q = qtyFromPrice(state.P);
  state.CS = consumerSurplusFromPrice(state.P);
  renderAll();
}

function setFromQ(rawQ) {
  state.Q = clamp(rawQ, Q_MIN, Q_MAX);
  state.P = priceFromQty(state.Q);
  state.CS = consumerSurplusFromPrice(state.P);
  renderAll();
}

function setFromCS(rawCS) {
  const cs = clamp(rawCS, CS_MIN, CS_MAX);
  const p = clamp(priceFromConsumerSurplus(cs), P_MIN, P_MAX);
  state.P = p;
  state.Q = qtyFromPrice(p);
  state.CS = consumerSurplusFromPrice(p);
  renderAll();
}
