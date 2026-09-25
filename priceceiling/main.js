
/* ==========================================================
   main.js
   DOM Control Wiring + Master Render Loop
   REQUIRES: model.js, graph.js
   ========================================================== */

const priceNumber = document.getElementById("price-number");
const priceRange  = document.getElementById("price-range");
const dwlNumber   = document.getElementById("dwl-number");
const dwlRange    = document.getElementById("dwl-range");

const priceMinus = document.getElementById("price-minus");
const pricePlus  = document.getElementById("price-plus");
const dwlMinus   = document.getElementById("dwl-minus");
const dwlPlus    = document.getElementById("dwl-plus");

const basedisplay   = document.getElementById("base-display");
const heightdisplay = document.getElementById("height-display");

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
    else setFromDWL(state.DWL + dir * DWL_STEP);
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

if (priceMinus && pricePlus) {
  bindStepper(priceMinus, -1, "price");
  bindStepper(pricePlus, 1, "price");
}
if (dwlMinus && dwlPlus) {
  bindStepper(dwlMinus, -1, "dwl");
  bindStepper(dwlPlus, 1, "dwl");
}

/* ---------- Input Wiring ---------- */

if (priceNumber) priceNumber.addEventListener("input", e => setFromP(parseFloat(e.target.value)));
if (priceRange)  priceRange.addEventListener("input", e => setFromP(parseFloat(e.target.value)));
if (dwlNumber)   dwlNumber.addEventListener("input", e => setFromDWL(parseFloat(e.target.value)));
if (dwlRange)    dwlRange.addEventListener("input", e => setFromDWL(parseFloat(e.target.value)));


priceRange.addEventListener("change", () => {
  const currentQuestion = quizQuestions[qIndex];

  // Validate boundaries and reset to minimum if out of bounds
  currentQuestion.lockState?.();
});


dwlRange.addEventListener("change", () => {
  const currentQuestion = quizQuestions[qIndex];

  // Validate boundaries and reset to minimum if out of bounds
  currentQuestion.lockState?.();
});

/* ---------- Master Render Loop ---------- */

function renderAll() {

   qStatusEl.textContent = "";
  const pStr   = state.P.toFixed(1);
  const qStr   = state.Q_actual.toFixed(1);
  const dwlStr = state.DWL.toFixed(1);

  if (priceNumber && document.activeElement !== priceNumber) priceNumber.value = pStr;
  if (priceRange) priceRange.value = pStr;
  if (dwlNumber && document.activeElement !== dwlNumber) dwlNumber.value = dwlStr;
  if (dwlRange) dwlRange.value = dwlStr;

  const cy = yScale(state.P);
  const cxSupply = xScale(state.Qs);
  const cxDemand = xScale(state.Qd);

  // 1. Position Price Ceiling line and handle dots
  priceLine.attr("y1", cy).attr("y2", cy);
  priceLineHit.attr("y", cy - hitHeight / 2);
  priceHandle.attr("cx", cxSupply).attr("cy", cy);

  if (state.isBinding) {
    priceHandleDemand.style("display", null).attr("cx", cxDemand).attr("cy", cy);
  } else {
    priceHandleDemand.style("display", "none");
  }

  // 2. Render CS, PS, DWL Areas and Left-Aligned Labels
  const leftXMargin = xScale(0.2); // Left offset inside the shape for left-alignment

  if (state.isBinding) {
    const Q = state.Q_actual;

    // CS Polygon
    const csPoints = [
      { q: 0, p: DEMAND_A },
      ...demandData.filter(d => d.q <= Q),
      { q: Q, p: state.P },
      { q: 0, p: state.P }
    ];
    csArea.datum(csPoints).attr("d", d3.area().x(d => xScale(d.q)).y0(yScale(state.P)).y1(d => yScale(d.p)));

    // PS Polygon
    const psPoints = [
      { q: 0, p: 0 },
      ...supplyData.filter(d => d.q <= Q),
      { q: 0, p: state.P }
    ];
    psArea.datum(psPoints).attr("d", d3.area().x(d => xScale(d.q)).y0(d => yScale(d.p)).y1(yScale(state.P)));

    // DWL Triangle
    const dwlPoints = d3.range(Q, Q_EQ + 0.01, 0.05).map(q => ({
      q,
      pDemand: demandP(q),
      pSupply: supplyP(q)
    }));
    dwlArea.datum(dwlPoints).attr("d", d3.area().x(d => xScale(d.q)).y0(d => yScale(d.pSupply)).y1(d => yScale(d.pDemand)));

    // Position "CS", "PS", "DWL" text aligned to the left of their shapes
    csLabel.attr("x", leftXMargin).attr("y", yScale((DEMAND_A + state.P) / 2)).text("CS");
    psLabel.attr("x", leftXMargin).attr("y", yScale(state.P / 2)).text("PS");
    
    // For DWL, left edge starts at Q_actual
    const dwlLeftX = xScale(Q + 0.15);
    dwlLabel.attr("x", dwlLeftX).attr("y", yScale(P_EQ)).text("DWL");

    // Projection lines
    qtyLine.attr("x1", cxSupply).attr("y1", innerH).attr("x2", cxSupply).attr("y2", cy).attr("stroke", "#666");
    qtyDemandedLine.attr("x1", cxDemand).attr("y1", innerH).attr("x2", cxDemand).attr("y2", cy).attr("stroke", "#e91e63");

  } else {
    // Non-binding state
    const csPoints = demandData.filter(d => d.q <= Q_EQ);
    csArea.datum(csPoints).attr("d", d3.area().x(d => xScale(d.q)).y0(yScale(P_EQ)).y1(d => yScale(d.p)));

    const psPoints = supplyData.filter(d => d.q <= Q_EQ);
    psArea.datum(psPoints).attr("d", d3.area().x(d => xScale(d.q)).y0(d => yScale(d.p)).y1(yScale(P_EQ)));

    dwlArea.attr("d", null); // Clear DWL shape

    csLabel.attr("x", leftXMargin).attr("y", yScale(14)).text("CS");
    psLabel.attr("x", leftXMargin).attr("y", yScale(5)).text("PS");
    dwlLabel.text(""); // Hide DWL label when 0

    qtyLine.attr("x1", xScale(Q_EQ)).attr("y1", innerH).attr("x2", xScale(Q_EQ)).attr("y2", yScale(P_EQ)).attr("stroke", "#666");
    qtyDemandedLine.attr("x1", 0).attr("y1", 0).attr("x2", 0).attr("y2", 0);
  }
  


  basedisplay.textContent = `${state.CS.toFixed(1)} | ${state.PS.toFixed(1)}`;



  // 4. Update External Text Displays
  const height = 20 - parseFloat(pStr);

if (heightdisplay) {
    // 1. Check if it's non-binding first based on your price condition
    if (Number(state.P) > 12) {
        heightdisplay.textContent = "Non-Binding";
    }
    // 2. Then check if there's a shortage
    else if (state.shortage > 0) {
        heightdisplay.textContent = `Shortage of ${state.shortage.toFixed(1)} units`;
    }
    // 3. Then check for true equilibrium
    else if (state.shortage === 0) {
        heightdisplay.textContent = "Equilibrium";
    }
    else {
        // Optional: Handle surplus if needed
    }
}



 const showSurplusLabels = state.P > 0.8;
  csLabel.style("display", showSurplusLabels ? null : "none");
  psLabel.style("display", showSurplusLabels ? null : "none");


  // Layering: keep handles and text labels above shaded regions
  priceGroup.raise();
  graphLabelsGroup.raise();
}

const currentQuestion = quizQuestions[qIndex];

    // Safely run setState if it exists, passing the question's current price state
    currentQuestion.setState?.(currentQuestion.questionState.price);

    currentQuestion.render();

renderAll();

  