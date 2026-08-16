/* ==========================================================
   DOM control wiring + the master render loop + app startup.
   Loads LAST — this is the one file allowed to know about every
   other piece (model, graph) and wire them together.
   REQUIRES: model.js, graph.js

   EXPECTED DOM (not included in these three files):
     #graph-svg              the SVG graph.js draws into
     #price-number, #price-range   number + range inputs, 0–20 step 0.1
     #cs-number,    #cs-range      number + range inputs, 0–100 step 0.1
     #cs-display              text node for the CS readout
     #equation-display         text node for the P = 20 − 2Q readout
   ========================================================== */

const priceNumber = document.getElementById("price-number");
const priceRange  = document.getElementById("price-range");
const csNumber    = document.getElementById("cs-number");
const csRange     = document.getElementById("cs-range");




const priceNumberM = document.getElementById("price-number-m");
const csNumberM   = document.getElementById("qty-number-m");
const priceMinus = document.getElementById("price-minus");
const pricePlus  = document.getElementById("price-plus");
const csMinus    = document.getElementById("qty-minus");
const csPlus     = document.getElementById("qty-plus");


const basedisplay = document.getElementById("base-display")

const heightdisplay = document.getElementById("height-display")


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
    else setFromCS(state.CS + dir * CS_STEP);
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
bindStepper(csMinus, -1, "cs");
bindStepper(csPlus, 1, "cs");



/* ---------- input wiring ----------
   Both sliders (and their paired number inputs) drive the same shared
   state through model.js's setters — setFromP and setFromCS just enter
   the demand curve from two different sides. */

function handleInputInteraction(action, value) {
  action(value);
}

priceNumber.addEventListener("input", e => handleInputInteraction(setFromP, parseFloat(e.target.value)));
priceRange.addEventListener("input", e => handleInputInteraction(setFromP, parseFloat(e.target.value)));
csNumber.addEventListener("input", e => handleInputInteraction(setFromCS, parseFloat(e.target.value)));
csRange.addEventListener("input", e => handleInputInteraction(setFromCS, parseFloat(e.target.value)));

/* ---------- master render: syncs every DOM element to `state` ---------- */

function renderAll() {

  qStatusEl.textContent = "";
  const pStr  = state.P.toFixed(1);
  const qStr  = state.Q.toFixed(1);
  const csStr = state.CS.toFixed(1);

  if (document.activeElement !== priceNumber) priceNumber.value = pStr;
  priceRange.value = pStr;
  if (document.activeElement !== csNumber) csNumber.value = csStr;
  csRange.value = csStr;

  if (document.activeElement !== priceNumberM) priceNumberM.value = pStr;
  if (document.activeElement !== csNumberM) csNumberM.value = csStr;

 

  // Rebuild the shaded region from the shared lineData, clipped to
  // [0, state.Q] so it always matches the current price line exactly.
  const csData = lineData.filter(d => d.q <= state.Q);
  csArea.datum(csData).attr("d", csAreaGen);

  const cx = xScale(state.Q);
  const cy = yScale(state.P);



  priceLine.attr("y1", cy).attr("y2", cy);
  priceLineHit.attr("y", cy - hitHeight / 2);
  priceHandle.attr("cx", cx).attr("cy", cy);

  qtyLine.attr("x1", cx).attr("y1", innerH).attr("x2", cx).attr("y2", cy);

  const height = 20 - pStr

  basedisplay.textContent = "Base: " + qStr; ;
  heightdisplay.textContent = `20 − ${pStr} = ${height.toFixed(1)}`

  
}

/* ---------- kick things off ---------- */

quizQuestions[qIndex].render();

renderAll();
