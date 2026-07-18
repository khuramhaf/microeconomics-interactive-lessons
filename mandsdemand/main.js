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

  qStatusEl.textContent = "";
  

 
    latestState = { intercept: state.intercept, P: state.P };
    
        doRender(latestState);
}

function doRender({ intercept, P }) {



    const currentQ = getQuantity();



     equationDisplay.textContent = `${state.P.toFixed(1)} = ${state.intercept.toFixed(1)} − 2(${currentQ.toFixed(1)})`;
  revenueDisplay.textContent = "Quantity: " + currentQ.toFixed(2);

    // Only touch max/value if they actually changed
    const newMax = intercept;
    if (inputPriceNum.property("max") !== newMax) {
        inputPriceNum.attr("max", Number(intercept.toFixed(1)));
        inputPriceSlider.attr("max", Number(intercept.toFixed(1)));
    }
    inputInterceptNum.property("value", Number(intercept.toFixed(1)));
    inputInterceptSlider.property("value", Number(intercept.toFixed(1)));
    inputPriceNum.property("value", Number(P.toFixed(1)));
    inputPriceSlider.property("value", Number(P.toFixed(1)));
    
     inputPriceNumM.property("value", Number(P.toFixed(1)));
        
        
      inputInterceptNumM.property("value", Number(intercept.toFixed(1)));

      




    // ... rest of your SVG attribute updates unchanged

     // 4. Recalculate line endpoints mapping to current intercept
            // Endpoint 1: Q = 0 -> P = Intercept
            const x1 = xScale(0);
            const y1 = yScale(state.intercept);

            // Endpoint 2: P = 0 -> Q = Intercept / 2
            const x2 = xScale(state.intercept / state.slope);
            const y2 = yScale(0);

            // 5. Update Line Elements attributes
            demandLineVisible
                .attr("x1", x1).attr("y1", y1)
                .attr("x2", x2).attr("y2", y2);

            demandLineHitbox
                .attr("x1", x1).attr("y1", y1)
                .attr("x2", x2).attr("y2", y2);


               

            // 6. Update Dot location attributes
            const dotX = xScale(currentQ);
            const dotY = yScale(Math.min(intercept, P));

            dot.attr("cx", dotX).attr("cy", dotY);

            // 7. Draw the Dashed reference lines
            xDropLine
                .attr("x1", dotX).attr("y1", dotY)
                .attr("x2", xScale(0)).attr("y2", dotY);

            yDropLine
                .attr("x1", dotX).attr("y1", dotY)
                .attr("x2", dotX).attr("y2", yScale(0));

                if(typeof quizQuestions[qIndex].options === "function"){

                  quizQuestions[qIndex].correctAnswer()
                  quizQuestions[qIndex].options()

                  
                  

              quizQuestions[qIndex].render()
            
            }
}






/* ---------- kick things off ---------- */

quizQuestions[qIndex].render();
renderAll();
