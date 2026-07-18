/* ==========================================================
   model.js
   Core state + supply-curve math. No DOM, no D3 in this file.
   REQUIRES: nothing. Must load FIRST.
   ========================================================== */

const state = {
  Q: 4,
  P: 8, 
  intercept: 0,
  slope: 2, // P = 2Q + intercept
};

// Helper utility functions if not defined elsewhere
function clamp(val, min, max) {
  return Math.max(min, Math.min(max, val));
}

function roundStep(val, step) {
  return Number((Math.round(val / step) * step).toFixed(1));
}

function getQuantity() {
  // Supply formula: Q = (P - intercept) / slope
  return Math.max(0, (state.P - state.intercept) / state.slope);
}

const Q_MIN = 0, Q_MAX = 13, Q_STEP = 0.2;
const P_MIN = 0, P_MAX = 26, P_STEP = 0.2;

function handleInterceptChange(newValue) {
  let val = parseFloat(newValue);
  if (isNaN(val)) return;
  
  // Clamp intercept between -6 and 6
  state.intercept = Number(Math.max(-6, Math.min(6, val)).toFixed(1));
  
  // For Supply: Price cannot fall below the intercept (if positive) or below 0
  let minPrice = Math.max(0, state.intercept);
  if (state.P < minPrice) {
    state.P = minPrice;
  }
  
  renderAll();
}

function handlePriceChange(newValue) {
  let val = parseFloat(newValue);
  if (isNaN(val)) return;
  
  // Price floor is 0 or the intercept (whichever is higher)
  let minPrice = Math.max(0, state.intercept);
  state.P = Number(Math.max(minPrice, Math.min(26, val)).toFixed(1));
  
  renderAll();
}