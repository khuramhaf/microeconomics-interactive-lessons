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
const priceNumber = document.getElementById("price-number");
const priceNumberM = document.getElementById("price-number-m");
const priceMinus = document.getElementById("price-minus");
const pricePlus = document.getElementById("price-plus");

// Supply controls
const qtyRange = document.getElementById("qty-range");
const qtyNumber = document.getElementById("qty-number");
const qtyNumberM = document.getElementById("qty-number-m");
const qtyMinus = document.getElementById("qty-minus");
const qtyPlus = document.getElementById("qty-plus");


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
    if (type === "price") {
      adjustDemandIntercept(dir); 
    } else {
      adjustSupplyIntercept(dir);  
    }
    renderAll();
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

bindStepper(priceMinus, -1, "price");
bindStepper(pricePlus, 1, "price");
bindStepper(qtyMinus, -1, "qty");
bindStepper(qtyPlus, 1, "qty");


/* ---------- orchestrator ---------- */
function renderAll() {
  renderGraph();   // graph.js — draws from current state
  syncInputs();     // below — mirrors state into the DOM controls
  
  
  equationDisplay.textContent = `Equilibrium Price: ${state.eqP.toFixed(2)}`;
  revenueDisplay.textContent = `Equilibrium Quantity: ${state.eqQ.toFixed(2)}`;
   if (typeof quizQuestions !== "undefined" && typeof qIndex !== "undefined") {
        if (typeof quizQuestions[qIndex].options === "function") {
            quizQuestions[qIndex].options();
            quizQuestions[qIndex].render();
        }
    }
}

function syncInputs() {
  const dStr = state.demandIntercept.toFixed(2);
  const sStr = state.supplyIntercept.toFixed(2);

  // Demand controls
  if (document.activeElement !== priceNumber && priceNumber) priceNumber.value = dStr;
  if (document.activeElement !== priceNumberM && priceNumberM) priceNumberM.value = dStr;
  if (priceRange) priceRange.value = dStr;

  // Supply controls
  if (document.activeElement !== qtyNumber && qtyNumber) qtyNumber.value = sStr;
  if (document.activeElement !== qtyNumberM && qtyNumberM) qtyNumberM.value = sStr;
  if (qtyRange) qtyRange.value = sStr;

  // (Optional) equilibrium readouts, if present in your DOM:
  // if (eqPriceOut) eqPriceOut.textContent = state.eqP.toFixed(2);
  // if (eqQtyOut) eqQtyOut.textContent = state.eqQ.toFixed(2);

  renderDynamicLines()
}

/* ---------- input listeners ---------- */
// Every handler here calls a model.js mutator, then renderAll().
// No handler ever touches `state` directly.
function initInputListeners() {
  // Demand
  const handleDemandChange = (val) => {
    setDemandIntercept(val);
    renderAll();
  };
  if (priceRange) priceRange.addEventListener("input", (e) => handleDemandChange(e.target.value));
  if (priceNumber) priceNumber.addEventListener("input", (e) => handleDemandChange(e.target.value));
  if (priceNumberM) priceNumberM.addEventListener("input", (e) => handleDemandChange(e.target.value));
  

  // Supply
  const handleSupplyChange = (val) => {
    setSupplyIntercept(val);
    renderAll();
  };
  if (qtyRange) qtyRange.addEventListener("input", (e) => handleSupplyChange(e.target.value));
  if (qtyNumber) qtyNumber.addEventListener("input", (e) => handleSupplyChange(e.target.value));
  if (qtyNumberM) qtyNumberM.addEventListener("input", (e) => handleSupplyChange(e.target.value));
  
}


function renderDynamicLines() {
  // --- 1. Calculate dynamic upper bound for Supply ---
  // If supplyIntercept is 0: (26 - 0) / 2 = 13 (Full width)
  // If supplyIntercept is 4: (26 - 4) / 2 = 11 (Maintains neat cutoff at top axis)
  const dynamicSupplyQMax = (P_MAX - state.supplyIntercept) / SLOPE_S;

  // --- 2. Update Demand Path ---
  // Demand slopes downward, so it always starts at Q=0 and hits the X-axis before Q_MAX
  demandPath
    .datum(buildLineData(getDemandPrice))
    .attr("d", lineGen);

  // --- 3. Update Supply Path with Dynamic Limit ---
  supplyPath
    .datum(buildLineData(getSupplyPrice, dynamicSupplyQMax))
    .attr("d", lineGen);

  // --- 4. Update Equilibrium Dot ---
  // Using the freshly calculated state values from your mutators
  
}
/* ---------- kick things off ---------- */
calculateEquilibrium();
initInputListeners();
renderAll();
quizQuestions[qIndex].render();
