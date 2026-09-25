/* ==========================================================
   model.js
   State, constants, and economic math for Price Floor.
   Demand equation: P = 24 - 2Q
   Supply equation: P = 2Q
   Equilibrium: Pe = 12, Qe = 6
   A floor is binding only when set ABOVE equilibrium (P > Pe).
   REQUIRES: nothing.
   ========================================================== */

const Q_MIN = 0, Q_MAX = 12;
const P_MIN = 0, P_MAX = 24;

const DEMAND_A = 24;
const DEMAND_B = 2;
const SUPPLY_C = 2;

const P_DRAG_STEP = 0.2;
const P_STEP = 0.2;
const DWL_STEP = 0.2;

function clamp(v, lo, hi) {
  return Math.max(lo, Math.min(hi, v));
}

function demandP(q) {
  return DEMAND_A - DEMAND_B * q;
}

function demandQ(p) {
  return (DEMAND_A - p) / DEMAND_B;
}

function supplyP(q) {
  return SUPPLY_C * q;
}

function supplyQ(p) {
  return p / SUPPLY_C;
}

// Equilibrium constants
const P_EQ = 12;
const Q_EQ = 6;

const state = {
  P: 18,          // Price Floor (default above equilibrium)
  Qd: 3,          // Quantity Demanded
  Qs: 9,          // Quantity Supplied
  Q_actual: 3,    // Actual traded quantity = min(Qd, Qs) = Qd under a floor
  isBinding: true,
  CS: 0,
  PS: 0,
  DWL: 0,
  surplus: 0      // Excess supply = Qs - Qd
};

/* State recalculation logic based on price floor rules */
function updateState() {
  if (state.P <= P_EQ) {
    // Non-binding price floor (at or below equilibrium)
    state.isBinding = false;
    state.Qd = Q_EQ;
    state.Qs = Q_EQ;
    state.Q_actual = Q_EQ;
    state.surplus = 0;

    // Standard market equilibrium surpluses
    state.CS = 0.5 * (DEMAND_A - P_EQ) * Q_EQ; // 36
    state.PS = 0.5 * P_EQ * Q_EQ;              // 36
    state.DWL = 0;
  } else {
    // Binding price floor
    state.isBinding = true;
    state.Qd = demandQ(state.P);
    state.Qs = supplyQ(state.P);
    state.Q_actual = state.Qd; // Traded quantity is limited by demand
    state.surplus = state.Qs - state.Qd;

    const Q = state.Q_actual;
    const P_supply_at_Q = supplyP(Q);

    // Consumer Surplus = Triangle under Demand curve above Floor Price
    state.CS = 0.5 * (DEMAND_A - state.P) * Q;

    // Producer Surplus = Trapezoid under Floor Price above Supply curve
    state.PS = state.P * Q - 0.5 * SUPPLY_C * Q * Q;

    // Deadweight Loss = Triangle between Demand and Supply from Q_actual to Q_EQ
    state.DWL = 0.5 * (state.P - P_supply_at_Q) * (Q_EQ - Q);
  }
}

function setFromP(rawP) {
  const snapped = Math.round(rawP / P_STEP) * P_STEP;
  // toFixed avoids floating-point drift (e.g. 12.000000000000002) at the P_EQ boundary
  state.P = clamp(parseFloat(snapped.toFixed(1)), P_MIN, P_MAX);
  updateState();
  if (typeof renderAll === "function") renderAll();
}

function setFromDWL(rawDWL) {
  const maxDWL = 72;
  const clampedDWL = clamp(rawDWL, 0, maxDWL);
  // DWL = 2 * (Q_EQ - Q)^2, and under a floor Q is read off the demand curve
  const targetQ = Math.max(0, Q_EQ - Math.sqrt(clampedDWL / 2));
  const targetP = demandP(targetQ);
  setFromP(targetP);
}

// Initial calculation
updateState();
