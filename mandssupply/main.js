/* ==========================================================
   DOM control wiring + the master render loop + app startup.
   Loads LAST — this is the one file allowed to know about every
   other piece (model, graph, ghost, quiz) and wire them together.
   REQUIRES: model.js, validation.js, graph.js, ghost.js, quiz.js
   ========================================================== */


        const inputPriceNum = d3.select("#price-number");
        const inputPriceSlider = d3.select("#price-range");
        
        const inputInterceptNum = d3.select("#qty-number");
        const inputInterceptSlider = d3.select("#qty-range");

         const inputPriceNumM = d3.select("#price-number-m");
        
        
        const inputInterceptNumM = d3.select("#qty-number-m");

        

const revenueDisplay = document.getElementById("revenue-display");
const equationDisplay = document.getElementById("equation-display");

/* ---------- single source of truth for "should the ghost restart" ----------
   Previously this same isDragging-check (plus an isTyping-check in one
   spot) was duplicated across 3 evaluator functions and render(), and
   one copy was missing the isTyping check — a real inconsistency bug.
   Now every caller (graph.js's drag handler, quiz.js's evaluators,
   renderAll below) goes through this one function. */




/* ---------- desktop + mobile input wiring ---------- */

inputInterceptNum.on("input", function() { handleInterceptChange(this.value); });
        inputInterceptSlider.on("input", function() { handleInterceptChange(this.value); });
        inputPriceNum.on("input", function() { handlePriceChange(this.value); });
        inputPriceSlider.on("input", function() { handlePriceChange(this.value); });

        inputPriceNumM.on("input", function() { handlePriceChange(this.value); });
        
        
        inputInterceptNumM.on("input", function() { handleInterceptChange(this.value); });


/* ---------- long-press stepper buttons (mobile +/-) ---------- */

const priceMinus = d3.select("#price-minus");
        
        
        const pricePlus = d3.select("#price-plus");


        const qtyMinus = d3.select("#qty-minus");
        
        
        const qtyPlus = d3.select("#qty-plus");
       

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

  // Extract the raw DOM element from the D3 selection
  const rawElement = btn.node(); 

  function step() {
    if (type === "price") handlePriceChange(state.P + dir * P_STEP);
    else handleInterceptChange(state.intercept + dir * Q_STEP);

    console.log(state.P)
  }

  function clearAll() {
    clearTimeout(holdTimer);
    clearInterval(repeatTimer);
    holdTimer = null;
    repeatTimer = null;
  }

  function finish() {
    if (activePointerId !== null && rawElement) {
      try { 
        // FIX: Called on rawElement instead of btn
        rawElement.releasePointerCapture(activePointerId); 
      } catch (err) {}
    }
    clearAll();
    cancelled = false;
    longPress = false;
    activePointerId = null;
  }

  btn.on("pointerdown", e => {
    if (!e.isPrimary || activePointerId !== null) return;
    activePointerId = e.pointerId;
    
    // FIX: Called on rawElement instead of btn
    if (rawElement) rawElement.setPointerCapture(e.pointerId);
    
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

  btn.on("pointermove", e => {
    if (e.pointerId !== activePointerId || cancelled) return;
    const dx = Math.abs(e.clientX - startX);
    const dy = Math.abs(e.clientY - startY);
    if (dx > MOVE_THRESHOLD || dy > MOVE_THRESHOLD) {
      cancelled = true;
      clearAll();
    }
  });

  btn.on("pointerup", e => {
    if (e.pointerId !== activePointerId) return;
    if (!cancelled && !longPress) step();
    finish();
  });

  btn.on("pointercancel", finish);
  btn.on("blur", finish);
}

bindStepper(priceMinus, -1, "price");
bindStepper(pricePlus, 1, "price");
bindStepper(qtyMinus, -1, "qty");
bindStepper(qtyPlus, 1, "qty");

 /*---------- master render: syncs every DOM element to `state` ---------- */

let rafPending = false;
let latestState = null;

function renderAll() {
    if (typeof qStatusEl !== "undefined") qStatusEl.textContent = "";
    latestState = { intercept: state.intercept, P: state.P };
    doRender(latestState);
}

function doRender({ intercept, P }) {
    // 1. Calculate active Quantity from your updated Supply formula
    const currentQ = getQuantity();
    state.Q = currentQ; // Synchronize state.Q

    // Display string fixed to match standard supply form: P = Intercept + 2(Q)
    if (typeof equationDisplay !== "undefined") {
        equationDisplay.textContent = `${state.P.toFixed(1)} = ${state.intercept.toFixed(1)} + 2(${state.Q.toFixed(1)})`;
    }
    if (typeof revenueDisplay !== "undefined") {
        revenueDisplay.textContent = "Quantity: " + state.Q.toFixed(2);
    }

    // Set correct input slider dynamic minimum floor constraints for supply
    const newMinPrice = Math.max(0, intercept);
    if (typeof inputPriceNum !== "undefined" && inputPriceNum.property("min") !== newMinPrice) {
        inputPriceNum.attr("min", Number(newMinPrice.toFixed(1)));
        inputPriceSlider.attr("min", Number(newMinPrice.toFixed(1)));
    }

    // Dynamic UI updates
    if (typeof inputInterceptNum !== "undefined") {
        inputInterceptNum.property("value", Number(intercept.toFixed(1)));
        inputInterceptSlider.property("value", Number(intercept.toFixed(1)));
        inputPriceNum.property("value", Number(P.toFixed(1)));
        inputPriceSlider.property("value", Number(P.toFixed(1)));
    }
    if (typeof inputPriceNumM !== "undefined") {
        inputPriceNumM.property("value", Number(P.toFixed(1)));
    }
    if (typeof inputInterceptNumM !== "undefined") {
        inputInterceptNumM.property("value", Number(intercept.toFixed(1)));
    }

    // 2. Render the endpoints of the supply line based on chart limits
    let qStart = 0;
    let pStart = Math.max(0, state.intercept);

    if (state.intercept < 0) {
        // If intercept is negative, find the exact horizontal intercept on the Q axis
        qStart = -state.intercept / state.slope;
        pStart = 0;
    }

    let qEnd = Q_MAX;
    let pEnd = (state.slope * Q_MAX) + state.intercept;
    if (pEnd > P_MAX) {
        pEnd = P_MAX;
        qEnd = (P_MAX - state.intercept) / state.slope;
    }

    // Update coordinates
    supplyLineVisible
        .attr("x1", xScale(qStart)).attr("y1", yScale(pStart))
        .attr("x2", xScale(qEnd)).attr("y2", yScale(pEnd));

    supplyLineHitbox
        .attr("x1", xScale(qStart)).attr("y1", yScale(pStart))
        .attr("x2", xScale(qEnd)).attr("y2", yScale(pEnd));

    // 3. Render Dot Position
    dot.attr("cx", xScale(state.Q)).attr("cy", yScale(state.P));

    // 4. Render Projection Guidelines
    xDropLine
        .attr("x1", xScale(state.Q)).attr("y1", yScale(state.P))
        .attr("x2", xScale(state.Q)).attr("y2", innerH);

    yDropLine
        .attr("x1", xScale(state.Q)).attr("y1", yScale(state.P))
        .attr("x2", 0).attr("y2", yScale(state.P));

    // Quiz rendering trigger preservation
    if (typeof quizQuestions !== "undefined" && typeof qIndex !== "undefined") {
        if (typeof quizQuestions[qIndex].options === "function") {
            quizQuestions[qIndex].options();
            quizQuestions[qIndex].render();
        }
    }
}




/* ---------- kick things off ---------- */

quizQuestions[qIndex].render();
renderAll();
