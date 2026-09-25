/* ==========================================================
   model.js
   State, constants, and economic math for Price Ceiling.
   Demand equation: P = 20 - 2Q
   Supply equation: P = 2Q
   Equilibrium: Pe = 10, Qe = 5
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
  P: 6,           // Price Ceiling (default below equilibrium)
  Qd: 7,          // Quantity Demanded
  Qs: 3,          // Quantity Supplied
  Q_actual: 3,    // Actual traded quantity = min(Qd, Qs)
  isBinding: true,
  CS: 0,
  PS: 0,
  DWL: 0,
  shortage: 0
};

/* State recalculation logic based on price ceiling rules */
function updateState() {
  if (state.P >= P_EQ) {
    // Non-binding price ceiling
    state.isBinding = false;
    state.Qd = Q_EQ;
    state.Qs = Q_EQ;
    state.Q_actual = Q_EQ;
    state.shortage = 0;
    
    // Standard market equilibrium surpluses
    state.CS = 0.5 * (DEMAND_A - P_EQ) * Q_EQ; // 25
    state.PS = 0.5 * P_EQ * Q_EQ;              // 25
    state.DWL = 0;
  } else {
    // Binding price ceiling
    state.isBinding = true;
    state.Qd = demandQ(state.P);
    state.Qs = supplyQ(state.P);
    state.Q_actual = state.Qs; // Traded quantity is limited by supply
    state.shortage = state.Qd - state.Qs;

    const Q = state.Q_actual;
    const P_demand_at_Q = demandP(Q);

    // Consumer Surplus = Trapezoid under Demand curve above Ceiling Price
    state.CS = 0.5 * (DEMAND_A - P_demand_at_Q) * Q + (P_demand_at_Q - state.P) * Q;

    // Producer Surplus = Triangle under Ceiling Price above Supply curve
    state.PS = 0.5 * state.P * Q;

    // Deadweight Loss = Triangle between Demand and Supply from Q_actual to Q_EQ
    state.DWL = 0.5 * (P_demand_at_Q - state.P) * (Q_EQ - Q);
  }
}

function setFromP(rawP) {
  state.P = clamp(Math.round(rawP / P_STEP) * P_STEP, P_MIN, P_MAX);
  updateState();
  if (typeof renderAll === "function") renderAll();
}

function setFromDWL(rawDWL) {
  const maxDWL = 72;
  const clampedDWL = clamp(rawDWL, 0, maxDWL);
  const targetQ = Math.max(0, Q_EQ - Math.sqrt(clampedDWL / 2));
  const targetP = supplyP(targetQ);
  setFromP(targetP);

  
}

// Initial calculation
updateState();