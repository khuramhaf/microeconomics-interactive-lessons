/* ==========================================================
   DOM control wiring + the master render loop + app startup.
   Loads LAST — this is the one file allowed to know about every
   other piece (model, graph) and wire them together.
   REQUIRES: model.js, graph.js

   EXPECTED DOM (not included in these three files):
     #graph-svg              the SVG graph.js draws into
     #price-number, #price-range   number + range inputs, 0–20 step 0.1
     #ps-number,    #ps-range      number + range inputs, 0–100 step 0.1
     #ps-display               text node for the PS readout
     #equation-display         text node for the P = 2Q readout
   ========================================================== */

const priceNumber = document.getElementById("price-number");
const priceRange  = document.getElementById("price-range");
const psNumber    = document.getElementById("ps-number");
const psRange     = document.getElementById("ps-range");




const priceNumberM = document.getElementById("price-number-m");
const psNumberM   = document.getElementById("ps-number-m");
const priceMinus = document.getElementById("price-minus");
const pricePlus  = document.getElementById("price-plus");
const psMinus    = document.getElementById("ps-minus");
const psPlus     = document.getElementById("ps-plus");


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
    else setFromPS(state.PS + dir * PS_STEP);
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
    const currentQuestion = quizQuestions[qIndex];
    currentQuestion.lockState?.();
    finish();
  });
 
  btn.addEventListener("pointercancel", finish);
  btn.addEventListener("blur", finish);
}
 
bindStepper(priceMinus, -1, "price");
bindStepper(pricePlus, 1, "price");
bindStepper(psMinus, -1, "ps");
bindStepper(psPlus, 1, "ps");



/* ---------- input wiring ----------
   Both sliders (and their paired number inputs) drive the same shared
   state through model.js's setters — setFromP and setFromPS just enter
   the supply curve from two different sides. */

function handleInputInteraction(action, value) {
  action(value);
}

priceNumber.addEventListener("input", e => handleInputInteraction(setFromP, parseFloat(e.target.value)));
priceRange.addEventListener("input", e => handleInputInteraction(setFromP, parseFloat(e.target.value)));
psNumber.addEventListener("input", e => handleInputInteraction(setFromPS, parseFloat(e.target.value)));
psRange.addEventListener("input", e => handleInputInteraction(setFromPS, parseFloat(e.target.value)));


priceRange.addEventListener("change", () => {
  const currentQuestion = quizQuestions[qIndex];

  // Validate boundaries and reset to minimum if out of bounds
  currentQuestion.lockState?.();
});


psRange.addEventListener("change", () => {
  const currentQuestion = quizQuestions[qIndex];

  // Validate boundaries and reset to minimum if out of bounds
  currentQuestion.lockState?.();
});

/* ---------- master render: syncs every DOM element to `state` ---------- */

function updateUnitDividers() {
  const maxUnit = Math.floor(state.Q);
  const units = d3.range(1, maxUnit + 1);

  // 1. Divider lines — only at whole units
  const lines = unitDividers.selectAll("line.unit-divider").data(units);

  lines.enter()
    .append("line")
    .attr("class", "unit-divider")
    .attr("stroke", "#0d47a1")
    .attr("stroke-width", 3)
    .attr("pointer-events", "none")
    .merge(lines)
    .attr("x1", d => xScale(d))
    .attr("x2", d => xScale(d))
    .attr("y1", yScale(state.P))
    .attr("y2", d => yScale(clamp(priceFromQty(d), P_MIN, P_MAX)));

  lines.exit().remove();

  // 2. Surplus labels — blocks include a trailing partial block if Q isn't a whole number
  const blocks = units.map(d => ({ left: d - 1, right: d }));
  const hasPartial = state.Q > maxUnit + 1e-9;
  if (hasPartial) blocks.push({ left: maxUnit, right: state.Q });

  const labels = unitDividers.selectAll("text.unit-surplus").data(blocks);

  // Labels sit at the TOP-LEFT of each partition: just under the price
  // line (the top edge of every PS block, regardless of how tall that
  // block is) and pinned to the block's left edge, same left-edge
  // convention as the consumer-surplus lesson's per-unit labels.
  labels.enter()
    .append("text")
    .attr("class", "unit-surplus")
    .attr("text-anchor", "start")
    .attr("font-size", "16px")
    .attr("font-weight", "bold")
    .attr("fill", "#0d47a1")
    .attr("pointer-events", "none")
    .merge(labels)
    .attr("x", d => xScale(d.left) + 2)
    .attr("y", yScale(state.P) + 18)
    .text(d => {
      const pLeft = clamp(priceFromQty(d.left), P_MIN, P_MAX);
      const pRight = clamp(priceFromQty(d.right), P_MIN, P_MAX);
      const width = d.right - d.left;
      const area = ((state.P - pLeft) + (state.P - pRight)) / 2 * width;
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
  const psStr = state.PS.toFixed(1);

  if (document.activeElement !== priceNumber) priceNumber.value = pStr;
  priceRange.value = pStr;
  if (document.activeElement !== psNumber) psNumber.value = psStr;
  psRange.value = psStr;

  if (document.activeElement !== priceNumberM) priceNumberM.value = pStr;
  if (document.activeElement !== psNumberM) psNumberM.value = psStr;



  // Rebuild the shaded region from the shared lineData, clipped to
  // [0, state.Q] so it always matches the current price line exactly.
  const psData = lineData.filter(d => d.q <= state.Q);
  psArea.datum(psData).attr("d", psAreaGen);

updateUnitDividers();

  const cx = xScale(state.Q);
  const cy = yScale(state.P);



  priceLine.attr("y1", cy).attr("y2", cy);
  priceLineHit.attr("y", cy - hitHeight / 2);
  priceHandle.attr("cx", cx).attr("cy", cy);

  qtyLine.attr("x1", cx).attr("y1", innerH).attr("x2", cx).attr("y2", cy);

  basedisplay.textContent = "Base: " + qStr; ;
  heightdisplay.textContent = `${pStr} − 0 = ${pStr}`


  


 



}

/* ---------- kick things off ---------- */

const currentQuestion = quizQuestions[qIndex];

    // Safely run setState if it exists, passing the question's current price state
    currentQuestion.setState?.(currentQuestion.questionState.price);

    currentQuestion.render();

renderAll();
