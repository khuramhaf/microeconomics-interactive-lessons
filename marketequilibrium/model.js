/* ==========================================================
   model.js (Equilibrium Edition)
   Core state + supply & demand math. No DOM, no D3.
   ========================================================== */

const state = {
  P: 10, // User adjusts Price directly now
  get Qd() { return fix(qtyDemandedFromPrice(this.P)); },
  get Qs() { return fix(qtySuppliedFromPrice(this.P)); },
  get status() {
    const diff = fix(this.Qs - this.Qd);
    if (diff > 0) return `Surplus of ${diff.toFixed(1)} units`;
    if (diff < 0) return `Shortage of ${Math.abs(diff).toFixed(1)} units`;
    return "Market Equilibrium reached!";
  }
};

const Q_MIN = 0, Q_MAX = 10, Q_STEP = 0.1;
const P_MIN = 0, P_MAX = 20, P_STEP = 0.2;

// Equations: P = 20 - 2Qd  =>  Qd = (20 - P) / 2
function priceFromQtyD(q) { return 20 - 2 * q; }
function qtyDemandedFromPrice(p) { return (20 - p) / 2; }

// Equations: P = 2 + 2Qs   =>  Qs = (P - 2) / 2
function priceFromQtyS(q) { return 0 + 2 * q; }
function qtySuppliedFromPrice(p) { return (p - 0) / 2; }

function roundStep(value, step) { return Math.round(value / step) * step; }
function clamp(value, min, max) { return Math.max(min, Math.min(max, value)); }
function fix(n) { return Math.round(n * 100) / 100; }

function setFromP(rawP) {
  if (!Number.isFinite(rawP)) return;
  let p = clamp(rawP, P_MIN, P_MAX);
  p = fix(roundStep(p, P_STEP));
  state.P = p;
  renderAll();
}



function setAbsoluteGap(targetGap) {
  if (!Number.isFinite(targetGap)) return;
  const targetPrice = targetGap + 10; // Derived from P = targetGap + 10
  setFromP(targetPrice);
  renderAll()
}



function adjustGap(amount) {
  if (!Number.isFinite(amount)) return;
  const currentGap = state.Qs - state.Qd;
  const targetGap = currentGap + amount;
  const targetPrice = targetGap + 10; // Derived from your linear equations
  setFromP(targetPrice);
}