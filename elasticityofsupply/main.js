/* ============================================================
   MAIN
   Owns the DOM input elements and wires them to model.js.
   Also owns renderAll(), the single orchestrator that graph.js's
   drag handlers and this file's input handlers both call after
   any model change: render the graph, then sync the inputs.
   ============================================================ */

/* ---------- DOM refs ---------- */
// Demand controls
const priceRange = document.getElementById("price-range");
const pricedota = document.getElementById("price-number-dota");
const qtydota = document.getElementById("qty-number-dota");


// Supply controls
const qtyRange = document.getElementById("qty-range");
const pricedotb = document.getElementById("price-number-dotb");
const qtydotb = document.getElementById("qty-number-dotb");

const interceptRange = document.getElementById("intercept-range");
const interceptNumber = document.getElementById("intercept-number");


const pricedotam = document.getElementById("price-number-dota-m");
const qtydotam = document.getElementById("qty-number-dota-m");

const pricedotbm = document.getElementById("price-number-dotb-m");
const qtydotbm = document.getElementById("qty-number-dotb-m");

const interceptNumberm = document.getElementById("intercept-number-m");



const priceMinus = document.getElementById("price-minus");
const pricePlus = document.getElementById("price-plus");
const qtyPlus = document.getElementById("qty-plus");
const qtyMinus = document.getElementById("qty-minus");

const interceptPlus = document.getElementById("intercept-plus");
const interceptMinus = document.getElementById("intercept-minus");


const revenueDisplay = document.getElementById("revenue-display");
const equationDisplay = document.getElementById("equation-display");

const STEP = 0.2; // amount changed per +/- click


/* step binder */


function bindStepper(btn, dir, type) {
  const HOLD_DELAY = 300;
  const REPEAT_INTERVAL = 70;
  const MOVE_THRESHOLD = 20;

  let holdTimer = null;
  let repeatTimer = null;
  let startX = 0, startY = 0;
  let longPress = false;
  let cancelled = false;
  let activePointerId = null;

  function step() {
    if (type === "dotA") {
      adjustDotAPrice(dir); 
    } else if (type === "dotB") {
      adjustDotBPrice(dir);  
    }
    else {
      adjustSupplyIntercept(dir)
    }
    render();
  }

  function clearAll() {
    clearTimeout(holdTimer);
    clearInterval(repeatTimer);
    holdTimer = null;
    repeatTimer = null;
  }

  function finish() {
    if (activePointerId !== null) {
      try { btn.releasePointerCapture(activePointerId); } catch (err) {}
    }
    clearAll();
    cancelled = false;
    longPress = false;
    activePointerId = null;
  }

  btn.addEventListener("pointerdown", e => {
    if (!e.isPrimary || activePointerId !== null) return;
    activePointerId = e.pointerId;
    btn.setPointerCapture(e.pointerId);
    
    // CRITICAL: Block default actions for all pointer types to kill ghost clicks
    e.preventDefault(); 

    startX = e.clientX;
    startY = e.clientY;
    cancelled = false;
    longPress = false;

    holdTimer = setTimeout(() => {
      if (cancelled) return;
      longPress = true;
      step();
      repeatTimer = setInterval(step, REPEAT_INTERVAL);
    }, HOLD_DELAY);
  });

  btn.addEventListener("pointermove", e => {
    if (e.pointerId !== activePointerId || cancelled) return;
    const dx = Math.abs(e.clientX - startX);
    const dy = Math.abs(e.clientY - startY);
    if (dx > MOVE_THRESHOLD || dy > MOVE_THRESHOLD) {
      cancelled = true;
      clearAll();
    }
  });

  btn.addEventListener("pointerup", e => {
    if (e.pointerId !== activePointerId) return;
    
    // CRITICAL: Prevent default browser behavior here too
    e.preventDefault(); 
    
    if (!cancelled && !longPress) step();
    finish();
  });

  btn.addEventListener("pointercancel", finish);
  btn.addEventListener("blur", finish);
  
  // CRITICAL: Completely kill any native click events hitting this button element
  btn.addEventListener("click", e => e.preventDefault());
}

bindStepper(priceMinus, -1, "dotA");
bindStepper(pricePlus, 1, "dotA");
bindStepper(qtyMinus, -1, "dotB");
bindStepper(qtyPlus, 1, "dotB");
bindStepper(interceptMinus, -1, "interceptPlus");
bindStepper(interceptPlus, 1, "interceptMinus");


/* ---------- orchestrator ---------- */
window.render = function() {
  const s = window.state;


const curveData = getSupplyCurveData();
supplyPath.datum(curveData).attr("d", lineGen);
supplyHitbox.datum(curveData).attr("d", lineGen);
  // 1. Map data spaces to pixel spaces
  const ax = xScale(s.qtyA);
  const ay = yScale(s.priceA);
  const bx = xScale(s.qtyB);
  const by = yScale(s.priceB);

  // 2. Position Dot A and its projections
  dotA.attr("cx", ax).attr("cy", ay);
  labelA.attr("x", ax).attr("y", ay);
  projLineAX.attr("x1", ax).attr("y1", ay).attr("x2", ax).attr("y2", innerH);
  projLineAY.attr("x1", ax).attr("y1", ay).attr("x2", 0).attr("y2", ay);

  // 3. Position Dot B and its projections
  dotB.attr("cx", bx).attr("cy", by);
  labelB.attr("x", bx).attr("y", by);
  projLineBX.attr("x1", bx).attr("y1", by).attr("x2", bx).attr("y2", innerH);
  projLineBY.attr("x1", bx).attr("y1", by).attr("x2", 0).attr("y2", by);

  // 4. Update optional DOM text metric display if elements exist

   const dStr = state.priceA.toFixed(2);
   const dStr1 = state.qtyA.toFixed(2);
  const sStr = state.priceB.toFixed(2);
  const sStr1 = state.qtyB.toFixed(2);

  const intercept = state.intercept.toFixed(2)

  // Demand controls
  if (document.activeElement !== pricedota && pricedota) pricedota.value = dStr;
  if (document.activeElement !== qtydota && qtydota) qtydota.value = dStr1;
   if (document.activeElement !== pricedotam && pricedotam) pricedotam.value = dStr;
  if (document.activeElement !== qtydotam && qtydotam) qtydotam.value = dStr1;
  if (priceRange) priceRange.value = dStr;

  // Supply controls
  if (document.activeElement !== pricedotb && pricedotb) pricedotb.value = sStr;
  if (document.activeElement !== qtydotb && qtydotb) qtydotb.value = sStr1;
   if (document.activeElement !== pricedotbm && pricedotbm) pricedotbm.value = sStr;
  if (document.activeElement !== qtydotbm && qtydotbm) qtydotbm.value = sStr1;
  if (qtyRange) qtyRange.value = sStr;

  if (document.activeElement !== interceptNumber && interceptNumber) interceptNumber.value = intercept;
  if (interceptRange) interceptRange.value = intercept;

     if (document.activeElement !== interceptNumberm && interceptNumberm) interceptNumberm.value = intercept;





// 4. Update DOM text metric display
const elDoc = document.getElementById("revenue-display");
if (elDoc) {
  const elType = document.getElementById("equation-display");
  
  if (isNaN(state.elasticity) || !isFinite(state.elasticity)) {
    elDoc.innerText = "N/A";
    elType.innerText = "Undefined";
  } else {
    // 1. Calculate the absolute value
    const absE = Math.abs(state.elasticity);
    
    // 2. Round it to 2 decimal places so the logic MATCHES the screen
    const roundedAbsE = Math.round(absE * 100) / 100;
    
    // Display the signed elasticity value
    elDoc.innerText = state.elasticity.toFixed(2);
    
    // 3. Evaluate using the rounded value
    if (roundedAbsE > 1) {
      elType.innerText = "Elastic (Highly Responsive)";
    } else if (roundedAbsE < 1) {
      elType.innerText = "Inelastic (Low Responsiveness)";
    } else {
      elType.innerText = "Unit Elastic";
    }
  }
}
};

// Initial Render
window.render();


/* ---------- input listeners ---------- */
// Every handler here calls a model.js mutator, then renderAll().
// No handler ever touches `state` directly.
function initInputListeners() {
  // Demand
  const handleDemandChange = (val) => {
    window.updateDotA(val);
    render();
  };
  if (priceRange) priceRange.addEventListener("input", (e) => handleDemandChange(e.target.value));
  if (pricedota) pricedota.addEventListener("input", (e) => handleDemandChange(e.target.value));
  if (qtydota) qtydota.addEventListener("input", (e) => handleDemandChange(e.target.value));
  

  // Supply
  const handleSupplyChange = (val) => {
    window.updateDotB(val);
    render();
  };
  if (qtyRange) qtyRange.addEventListener("input", (e) => handleSupplyChange(e.target.value));
  if (pricedotb) pricedotb.addEventListener("input", (e) => handleSupplyChange(e.target.value));
  if (qtydotb) qtydotb.addEventListener("input", (e) => handleSupplyChange(e.target.value));
  
   const handleInterceptChange = (val) => {
    window.updateIntercept(val);
    render();
  };

    if (interceptRange) interceptRange.addEventListener("input", (e) => handleInterceptChange(e.target.value));

}

initInputListeners()
