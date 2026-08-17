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





function updateUnitDividers() {
  const maxUnit = Math.floor(state.Q);
  const units = d3.range(1, maxUnit + 1);

  // 1. Divider lines — only at whole units
  const lines = unitDividers.selectAll("line.unit-divider").data(units);

  lines.enter()
    .append("line")
    .attr("class", "unit-divider")
    .attr("stroke", "#2e7d32")
    .attr("stroke-width", 3)
    .attr("pointer-events", "none")
    .merge(lines)
    .attr("x1", d => xScale(d))
    .attr("x2", d => xScale(d))
    .attr("y1", d => yScale(clamp(priceFromQty(d), P_MIN, P_MAX)))
    .attr("y2", yScale(state.P));

  lines.exit().remove();

  // 2. Surplus labels — blocks include a trailing partial block if Q isn't a whole number
  const blocks = units.map(d => ({ left: d - 1, right: d }));
  const hasPartial = state.Q > maxUnit + 1e-9;
  if (hasPartial) blocks.push({ left: maxUnit, right: state.Q });

  const labels = unitDividers.selectAll("text.unit-surplus").data(blocks);

  labels.enter()
    .append("text")
    .attr("class", "unit-surplus")
    .attr("text-anchor", "start")
    .attr("font-size", "16px")
    .attr("font-weight", "bold")
    .attr("fill", "#aeea00")
    .attr("pointer-events", "none")
    .merge(labels)
    .attr("x", d => xScale(d.left) + 2)
    .attr("y", yScale(state.P) - 6)
    .text(d => {
      const pLeft = clamp(priceFromQty(d.left), P_MIN, P_MAX);
      const pRight = clamp(priceFromQty(d.right), P_MIN, P_MAX);
      const width = d.right - d.left;
      const area = ((pLeft - state.P) + (pRight - state.P)) / 2 * width;
      return area > 0.05 ? area.toFixed(1) : "";
    });

  labels.exit().remove();

  // 3. Layering control
  unitDividers.selectAll("text.unit-surplus").raise(); // Move text above lines within the group
  unitDividers.raise();   
  priceGroup.raise();                             // Move entire container above other SVG elements
}

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

updateUnitDividers();

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
