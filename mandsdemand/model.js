/* ==========================================================
   model.js
   Core state + demand-curve math. No DOM, no D3 in this file —
   it could be unit-tested with zero browser involvement.
   REQUIRES: nothing. Must load FIRST.
   ========================================================== */

const state = {
  Q: 4,
  P: 12, // P = 20 - 2Q
  get R() { return this.P * this.Q; },
  intercept:20,
  slope:2,
};


function getQuantity() {
            return Math.max(0, (state.intercept - state.P) / state.slope);
        }

const Q_MIN = 0, Q_MAX = 13, Q_STEP = 0.2;
const P_MIN = 0, P_MAX = 26, P_STEP = 0.2;

function priceFromQty(q) { return 20 - 2 * q; }
function qtyFromPrice(p) { return (20 - p) / 2; }

function roundStep(value, step) { return Math.round(value / step) * step; }
function clamp(value, min, max) { return Math.max(min, Math.min(max, value)); }
function fix(n) { return Math.round(n * 100) / 100; }

// setFromQ/setFromP call renderAll() — defined later in main.js.
// This is a SAFE forward reference: setFromQ/setFromP are only ever
// actually invoked by user interaction (drag, typing, stepper buttons),
// which can't happen until every script below has already loaded and
// renderAll() genuinely exists. Forward-referencing a function NAME is
// fine; the problem would only be calling it before it's defined.
function setFromQ(rawQ) {
  if (!Number.isFinite(rawQ)) return;
  let q = clamp(rawQ, Q_MIN, Q_MAX);
  q = fix(roundStep(q, Q_STEP));
  let p = fix(priceFromQty(q));
  p = clamp(p, P_MIN, P_MAX);
  state.Q = q;
  state.P = p;
  renderAll();
}

function setFromP(rawP) {
  if (!Number.isFinite(rawP)) return;
  let p = clamp(rawP, P_MIN, P_MAX);
  p = fix(roundStep(p, P_STEP));
  let q = fix(qtyFromPrice(p));
  q = clamp(q, Q_MIN, Q_MAX);
  state.P = p;
  state.Q = q;
  renderAll();
}



    function handleInterceptChange(newValue) {
            let val = parseFloat(newValue);
            if (isNaN(val)) return;
            state.intercept = Number(Math.max(0, Math.min(26, val)).toFixed(1));
            if (state.P > state.intercept) state.P = state.intercept;
            renderAll();
        }

        function handlePriceChange(newValue) {
            let val = parseFloat(newValue);
            if (isNaN(val)) return;
            state.P = Number(Math.max(0, Math.min(state.intercept, val)).toFixed(1));
            renderAll();
        }

