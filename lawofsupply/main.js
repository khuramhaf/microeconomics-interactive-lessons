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
qtyNumber.addEventListener("input", e => handleInputInteraction(setFromQ, parseFloat(e.target.value)));
qtyRange.addEventListener("input", e => handleInputInteraction(setFromQ, parseFloat(e.target.value)));
priceNumberM.addEventListener("input", e => handleInputInteraction(setFromP, parseFloat(e.target.value)));
qtyNumberM.addEventListener("input", e => handleInputInteraction(setFromQ, parseFloat(e.target.value)));

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

  function step() {
    if (type === "price") setFromP(state.P + dir * P_STEP);
    else setFromQ(state.Q + dir * Q_STEP);
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

  stopGhostAnimation();
  qStatusEl.textContent = "";
  const pStr = state.P.toFixed(1);
  const qStr = state.Q.toFixed(1);
  const rStr = fix(state.R).toFixed(1);

  if (document.activeElement !== priceNumber) priceNumber.value = pStr;
  priceRange.value = pStr;
  if (document.activeElement !== qtyNumber) qtyNumber.value = qStr;
  qtyRange.value = qStr;

  if (document.activeElement !== priceNumberM) priceNumberM.value = pStr;
  if (document.activeElement !== qtyNumberM) qtyNumberM.value = qStr;

  equationDisplay.textContent = `P = 2(${qStr}) = ${pStr}`;
  revenueDisplay.textContent = "Revenue: " + rStr;

  const cx = xScale(state.Q);
  const cy = yScale(state.P);
  dot.attr("cx", cx).attr("cy", cy);

  priceLine.attr("x1", 0).attr("y1", cy).attr("x2", cx).attr("y2", cy);
  qtyLine.attr("x1", cx).attr("y1", innerH).attr("x2", cx).attr("y2", cy);
 // <-- this alone already handles ghost start/stop
}



/* ---------- kick things off ---------- */

quizQuestions[qIndex].render();
renderAll();
