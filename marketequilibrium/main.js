/* ==========================================================
   DOM control wiring + the master render loop + app startup.
   Loads LAST — this is the one file allowed to know about every
   other piece (model, graph, ghost, quiz) and wire them together.
   REQUIRES: model.js, validation.js, graph.js, ghost.js, quiz.js
   ========================================================== */

const priceNumber = document.getElementById("price-number");
const priceRange  = document.getElementById("price-range");
const qtyNumber   = document.getElementById("qty-number");
const qtyRange    = document.getElementById("qty-range");

const priceNumberM = document.getElementById("price-number-m");
const qtyNumberM   = document.getElementById("qty-number-m");
const priceMinus = document.getElementById("price-minus");
const pricePlus  = document.getElementById("price-plus");
const qtyMinus   = document.getElementById("qty-minus");
const qtyPlus    = document.getElementById("qty-plus");

const revenueDisplay = document.getElementById("revenue-display");
const equationDisplay = document.getElementById("equation-display");

/* ---------- single source of truth for "should the ghost restart" ----------
   Previously this same isDragging-check (plus an isTyping-check in one
   spot) was duplicated across 3 evaluator functions and render(), and
   one copy was missing the isTyping check — a real inconsistency bug.
   Now every caller (graph.js's drag handler, quiz.js's evaluators,
   renderAll below) goes through this one function. */




/* ---------- desktop + mobile input wiring ---------- */

function handleInputInteraction(action, value) {
  
  action(value);
}

priceNumber.addEventListener("input", e => handleInputInteraction(setFromP, parseFloat(e.target.value)));
priceRange.addEventListener("input", e => handleInputInteraction(setFromP, parseFloat(e.target.value)));
priceNumberM.addEventListener("input", e => handleInputInteraction(setFromP, parseFloat(e.target.value)));
// All inputs now point to setAbsoluteGap so they behave identically
qtyNumber.addEventListener("input", e => handleInputInteraction(setAbsoluteGap, parseFloat(e.target.value)));
qtyRange.addEventListener("input", e => handleInputInteraction(setAbsoluteGap, parseFloat(e.target.value))); 
qtyNumberM.addEventListener("input", e => handleInputInteraction(setAbsoluteGap, parseFloat(e.target.value)));
/* ---------- long-press stepper buttons (mobile +/-) ---------- */

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

  // Define a default step size for the gap adjustment if not defined globally
  const GAP_STEP = 0.2; 

  function step() {
    if (type === "price") {
      setFromP(state.P + dir * P_STEP);
    } else {
      // --- NEW: Handle gap stepper type ---
      adjustGap(dir * GAP_STEP);
    } 
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
    if (e.pointerType === "mouse") e.preventDefault();

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
    if (!cancelled && !longPress) step();
    finish();
  });

  btn.addEventListener("pointercancel", finish);
  btn.addEventListener("blur", finish);
}
bindStepper(priceMinus, -1, "price");
bindStepper(pricePlus, 1, "price");
bindStepper(qtyMinus, -1, "qty");
bindStepper(qtyPlus, 1, "qty");

/* ---------- master render: syncs every DOM element to `state` ---------- */





function renderAll() {
  if (typeof stopGhostAnimation === "function") stopGhostAnimation();
  
  const pStr = state.P.toFixed(1);
  const qdStr = state.Qd.toFixed(1);
  const qsStr = state.Qs.toFixed(1);

  // Calculate the current gap (absolute value or raw depending on your preference)
  // Using raw gap here so the slider can go negative (shortage) and positive (surplus)
  const currentGap = fix(state.Qs - state.Qd);
  const gapStr = currentGap.toFixed(1);

  // Sync Price inputs if they exist in your DOM layout
  if (document.activeElement !== priceNumber && typeof priceNumber !== "undefined") priceNumber.value = pStr;
  if (typeof priceRange !== "undefined") priceRange.value = pStr;

  // --- NEW: Sync Gap inputs so they stay updated when Price changes ---
  if (document.activeElement !== qtyNumber && typeof qtyNumber !== "undefined") qtyNumber.value = gapStr;
  if (document.activeElement !== qtyNumberM && typeof qtyNumberM !== "undefined") qtyNumberM.value = gapStr;
    if (document.activeElement !== priceNumberM && typeof priceNumberM !== "undefined") priceNumberM.value = pStr;

  if (typeof qtyRange !== "undefined") qtyRange.value = gapStr;
  // -------------------------------------------------------------------

  // Render the equations into your existing container elements
  equationDisplay.textContent = `Qd = ${qdStr}  │  Qs = ${qsStr}`;
  revenueDisplay.textContent = state.status;

  // Geometry coordinate calculations
  const cy = yScale(state.P);
  const cxD = xScale(state.Qd);
  const cxS = xScale(state.Qs);

  // Update the horizontal price slider visibility boundary
  priceDragLine.attr("x1", 0).attr("y1", cy).attr("x2", innerW).attr("y2", cy);

  // Update dots positioning on top of respective lines
  demandDot.attr("cx", cxD).attr("cy", cy);
  supplyDot.attr("cx", cxS).attr("cy", cy);

  // Drop vertical lines down to the X-axis for both quantities
  qtyDLine.attr("x1", cxD).attr("y1", innerH).attr("x2", cxD).attr("y2", cy);
  qtySLine.attr("x1", cxS).attr("y1", innerH).attr("x2", cxS).attr("y2", cy);
}

/* ---------- kick things off ---------- */

quizQuestions[qIndex].render();
renderAll();
