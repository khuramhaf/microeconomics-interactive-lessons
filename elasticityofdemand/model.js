// Global constants based on the P = 20 - 2Q equation
const Q_MIN = 0, Q_MAX = 10; // Max Q is 10 when P = 0
const P_MIN = 0, P_MAX = 20; // Max P is 20 when Q = 0

// 1. The 5 Core State Variables
window.state = {
  priceA: 14,
  qtyA: 3,
  priceB: 10,
  qtyB: 5,
  elasticity: null
};

// 2. Mutator functions that take Price and calculate exact Quantity
window.updateDotA = function(newPrice) {
  // 1. Clamp price within valid market bounds
  let clampedP = Math.max(P_MIN, Math.min(P_MAX, newPrice));
  
  // 2. Round Price to the nearest 0.2 step
  clampedP = Math.round(clampedP / 0.2) * 0.2;
  
  // 3. Calculate Quantity and round it to the nearest 0.1 step
  let calculatedQ = (20 - clampedP) / 2;
  calculatedQ = Math.round(calculatedQ / 0.1) * 0.1;
  
  // 4. Update the state
  window.state.priceA = clampedP;
  window.state.qtyA = calculatedQ;
  
  window.calculateElasticity();
};

window.updateDotB = function(newPrice) {
  // 1. Clamp price within valid market bounds
  let clampedP = Math.max(P_MIN, Math.min(P_MAX, newPrice));
  
  // 2. Round Price to the nearest 0.2 step
  clampedP = Math.round(clampedP / 0.2) * 0.2;
  
  // 3. Calculate Quantity and round it to the nearest 0.1 step
  let calculatedQ = (20 - clampedP) / 2;
  calculatedQ = Math.round(calculatedQ / 0.1) * 0.1;
  
  // 4. Update the state
  window.state.priceB = clampedP;
  window.state.qtyB = calculatedQ;
  
  window.calculateElasticity();
};
const STEP_SIZE = 0.2

function adjustDemandIntercept(dir) {
  // Multiply the direction (-1 or 1) directly by your STEP_SIZE constant
  const target = state.priceA + (dir * STEP_SIZE);
  // Fix JavaScript floating point precision issues (e.g., 0.2 + 0.1 = 0.300000000004)
  window.updateDotA(Number(target.toFixed(2)));
}

function adjustSupplyIntercept(dir) {
  const target = state.priceB + (dir * STEP_SIZE);
  window.updateDotB(Number(target.toFixed(2)));
}

// 3. Percentage Formula Elasticity Calculation
window.calculateElasticity = function() {
  const s = window.state;
  const deltaQ = s.qtyB - s.qtyA;
  const deltaP = s.priceB - s.priceA;

  // Prevent division by zero if starting point is at an axis intercept
  if (s.qtyA === 0 || s.priceA === 0) {
    s.elasticity = NaN;
    return;
  }

  // Handle perfectly elastic scenario (no price change, but quantity changed)
  if (deltaP === 0) {
    s.elasticity = (deltaQ === 0) ? 0 : Infinity;
    return;
  }

  const percentChangeQ = deltaQ / s.qtyA;
  const percentChangeP = deltaP / s.priceA;

  s.elasticity = percentChangeQ / percentChangeP;
};

// Run initial calculation on load
window.calculateElasticity();