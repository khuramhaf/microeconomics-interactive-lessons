/* ============================================================
   MODEL
   Single source of truth for state. Nothing outside this file
   should ever write to `state` directly — graph.js (drag) and
   main.js (inputs) both go through the functions below.
   ============================================================ */

/* ---------- constants ---------- */
const INIT_DEMAND_INT = 20;
const INIT_SUPPLY_INT = 0;
const SLOPE_D = -2; // P = Intercept - 2Q
const SLOPE_S = 2;  // P = Intercept + 2Q

const DEMAND_MIN = 14, DEMAND_MAX = 26;
const SUPPLY_MIN = -6, SUPPLY_MAX = 6;

const Q_MIN = 0, Q_MAX = 13;
const P_MIN = 0, P_MAX = 26;

/* ---------- state ---------- */
let state = {
  demandIntercept: INIT_DEMAND_INT,
  supplyIntercept: INIT_SUPPLY_INT,
  eqQ: 5,
  eqP: 10
};

/* ---------- pure helpers (read-only, no mutation) ---------- */
function clamp(val, min, max) {
  return Math.max(min, Math.min(max, val));
}

function getDemandPrice(q) { return state.demandIntercept + (SLOPE_D * q); }
function getSupplyPrice(q) { return state.supplyIntercept + (SLOPE_S * q); }

function calculateEquilibrium() {
  // P_D = P_S  =>  Int_D - 2Q = Int_S + 2Q  =>  Int_D - Int_S = 4Q
  state.eqQ = (state.demandIntercept - state.supplyIntercept) / 4;
  state.eqP = getSupplyPrice(state.eqQ);

  state.eqQ = clamp(state.eqQ, Q_MIN, Q_MAX);
  state.eqP = clamp(state.eqP, P_MIN, P_MAX);
}

/* ============================================================
   MUTATORS
   These are the ONLY functions allowed to change state.
   Every one of them re-derives equilibrium before returning,
   so callers never need to remember to do it themselves.
   ============================================================ */

// Direct set — used by sliders/number inputs
/* ---------- pure helpers (read-only, no mutation) ---------- */
function clamp(val, min, max) {
  return Math.max(min, Math.min(max, val));
}

// New helper: Rounds a value to the nearest increment (e.g., 0.2)
function roundToStep(val, step) {
  return Math.round(val / step) * step;
}


/* ============================================================
   MUTATORS
   ============================================================ */

const STEP_SIZE = 0.2; // Define your step size here

function setDemandIntercept(val) {
  // 1. Round to nearest 0.2 step
  let steppedVal = roundToStep(+val, STEP_SIZE);
  // 2. Clamp within min/max boundaries
  state.demandIntercept = clamp(steppedVal, DEMAND_MIN, DEMAND_MAX);
  
  calculateEquilibrium();
}

function setSupplyIntercept(val) {
  // 1. Round to nearest 0.2 step
  let steppedVal = roundToStep(+val, STEP_SIZE);
  // 2. Clamp within min/max boundaries
  state.supplyIntercept = clamp(steppedVal, SUPPLY_MIN, SUPPLY_MAX);
  
  calculateEquilibrium();
}

function adjustDemandIntercept(dir) {
  // Multiply the direction (-1 or 1) directly by your STEP_SIZE constant
  const target = state.demandIntercept + (dir * STEP_SIZE);
  // Fix JavaScript floating point precision issues (e.g., 0.2 + 0.1 = 0.300000000004)
  setDemandIntercept(Number(target.toFixed(2)));
}

function adjustSupplyIntercept(dir) {
  const target = state.supplyIntercept + (dir * STEP_SIZE);
  setSupplyIntercept(Number(target.toFixed(2)));
}

// Reverse-solve from a dragged (q, p) point on the line back to
// the intercept that would produce it. Used by graph.js drag handlers.
function setDemandFromPoint(q, p) {
  // Int = P - (Slope * Q)
  setDemandIntercept(p - (SLOPE_D * q));
}

function setSupplyFromPoint(q, p) {
  setSupplyIntercept(p - (SLOPE_S * q));
}



// Moves both curves simultaneously so that they intersect exactly at the dragged (q, p) point
function setEquilibriumFromPoint(q, p) {
  // 1. Calculate what the intercepts *would* be for this Q and P
  // Int = P - (Slope * Q)
  let targetDemandInt = p - (SLOPE_D * q);
  let targetSupplyInt = p - (SLOPE_S * q);

  // 2. Round to step size
  targetDemandInt = roundToStep(targetDemandInt, STEP_SIZE);
  targetSupplyInt = roundToStep(targetSupplyInt, STEP_SIZE);

  // 3. Clamp both intercepts within their respective limits
  state.demandIntercept = clamp(targetDemandInt, DEMAND_MIN, DEMAND_MAX);
  state.supplyIntercept = clamp(targetSupplyInt, SUPPLY_MIN, SUPPLY_MAX);

  // 4. Re-derive the actual equilibrium based on the clamped intercepts
  calculateEquilibrium();
}
