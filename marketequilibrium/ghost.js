/* ==========================================================
   ghost.js - Updated with Disappear & Repeat Cycle
   ========================================================== */

let animTimer = null;
let activeGhosts = [];

function stopGhostAnimation() {
  // Stop the timer
  if (animTimer) {
    animTimer.stop();
    animTimer = null;
  }

  // Hide active ghost elements
  activeGhosts.forEach(ghost => ghost.hide());

  activeGhosts = [];
}

// Shared animation engine
// Animation Cycle:
// 1. Move from current position to target (900ms)
// 2. Stay/Stop at target for 2 seconds (2000ms)
// 3. Disappear (hide elements) for a brief reset period (400ms)
// 4. Repeat continuously until stopGhostAnimation() is called

function runGhosts(ghosts) {
  stopGhostAnimation();

  activeGhosts = ghosts;

  const animationDuration = 900;
  const pauseDuration = 2000;
  const disappearDuration = 400; // Brief hidden phase before restarting
  const cycleDuration = animationDuration + pauseDuration + disappearDuration;

  animTimer = d3.timer(elapsed => {
    const cycleTime = elapsed % cycleDuration;

    if (cycleTime < animationDuration) {
      // Phase 1: Moving from start to target
      const t = cycleTime / animationDuration;
      activeGhosts.forEach(ghost => {
        ghost.show();
        ghost.update(t);
      });
    } else if (cycleTime < animationDuration + pauseDuration) {
      // Phase 2: Stopped / Paused at the target for 2 seconds
      activeGhosts.forEach(ghost => {
        ghost.show();
        ghost.update(1); // Lock at target position (t = 1)
      });
    } else {
      // Phase 3: Disappear before restarting the cycle
      activeGhosts.forEach(ghost => {
        ghost.hide();
      });
    }
  });
}

/* ---------- ghost dot (with price and/or quantity projection lines) ---------- */

const ghostPriceLine = g.append("line").attr("class", "ghost-proj").style("display", "none");
const ghostQtyLine = g.append("line").attr("class", "ghost-proj").style("display", "none");
const ghostDot = g.append("circle").attr("class", "ghost-dot").attr("r", 12).style("display", "none");

function makeGhostDot(targetP, mode) {
  const startP = state.P;
  const startQ = state.Q;
  const targetQ = qtyFromPrice(targetP);

  return {
    show() {
      ghostDot.style("display", null);
      ghostPriceLine.style("display", mode === "quantity" ? "none" : null);
      ghostQtyLine.style("display", mode === "price" ? "none" : null);
    },

    hide() {
      ghostDot.style("display", "none");
      ghostPriceLine.style("display", "none");
      ghostQtyLine.style("display", "none");
    },

    update(t) {
      const animatedP = startP + (targetP - startP) * t;
      const animatedQ = startQ + (targetQ - startQ) * t;

      const gCx = xScale(animatedQ);
      const gCy = yScale(animatedP);

      ghostDot
        .attr("cx", gCx)
        .attr("cy", gCy);

      ghostPriceLine
        .attr("x1", 0)
        .attr("y1", gCy)
        .attr("x2", gCx)
        .attr("y2", gCy);

      ghostQtyLine
        .attr("x1", gCx)
        .attr("y1", innerH)
        .attr("x2", gCx)
        .attr("y2", gCy);
    }
  };
}

/* ---------- shared target-finder ---------- */

function getGhostTargetPrice(item) {
  if (!item || !item.validationState) return null;

  if (item.validationState.price !== undefined) {
    return item.validationState.price;
  }
  if (item.validationState.quantity !== undefined) {
    return priceFromQty(item.validationState.quantity);
  }
  if (item.validationState.totalRevenue !== undefined) {
    const R = item.validationState.totalRevenue;
    const discriminant = 100 - 2 * R;
    if (discriminant < 0) return 10;
    const root = Math.sqrt(discriminant);
    const pHigh = 10 + root;
    const pLow = 10 - root;
    return Math.abs(state.P - pHigh) <= Math.abs(state.P - pLow) ? pHigh : pLow;
  }
  return null;
}

/* ---------- animation triggers ---------- */

function animateGhostPrice() {
  const targetP = getGhostTargetPrice(this);
  if (targetP === null || checkStateValidation(this, state) || isDragging) {
    stopGhostAnimation();
    return;
  }
  runGhosts([makeGhostDot(targetP, "price")]);
}

function animateGhostQuantity() {
  const targetP = getGhostTargetPrice(this);
  if (targetP === null || checkStateValidation(this, state) || isDragging) {
    stopGhostAnimation();
    return;
  }
  runGhosts([makeGhostDot(targetP, "quantity")]);
}

function animateGhostBoth() {
  const targetP = getGhostTargetPrice(this);
  if (targetP === null || checkStateValidation(this, state) || isDragging) {
    stopGhostAnimation();
    return;
  }
  runGhosts([makeGhostDot(targetP, "both")]);
}



/* ---------- hint ghost factory (loops with runGhosts) ---------- */

function makePriceHintGhost(targetPrice) {
  const targetY = yScale(targetPrice);
  const targetQd = fix(qtyDemandedFromPrice(targetPrice));
  const targetQs = fix(qtySuppliedFromPrice(targetPrice));
  
  const targetXd = xScale(targetQd);
  const targetXs = xScale(targetQs);

  const currentY = yScale(state.P);
  const currentXd = xScale(state.Qd);
  const currentXs = xScale(state.Qs);

  // Create a persistent container group for the hint elements
  const hintGroup = g.append("g")
    .attr("class", "hint-group")
    .style("opacity", 0.35)
    .style("pointer-events", "none")
    .style("display", "none"); // Hidden initially until show() is called

  // Create internal elements
  const ghostPriceLine = hintGroup.append("line")
    .attr("class", "price-line")
    .style("stroke-width", "5px")
    .attr("stroke", "#ff9800")
    .attr("x1", 0).attr("x2", innerW);

  const ghostQtyDLine = hintGroup.append("line").attr("class", "proj-line");
  const ghostQtySLine = hintGroup.append("line").attr("class", "proj-line");

  const ghostDemandDot = hintGroup.append("circle")
    .attr("class", "drag-dot")
    .attr("r", dotRadius);

  const ghostSupplyDot = hintGroup.append("circle")
    .attr("class", "drag-dot")
    .attr("r", dotRadius);

  return {
    show() {
      hintGroup.style("display", null);
    },

    hide() {
      hintGroup.style("display", "none");
    },

    update(t) {
      // Interpolate positions based on progress (t from 0 to 1)
      const interP = currentY + (targetY - currentY) * t;
      const interXd = currentXd + (targetXd - currentXd) * t;
      const interXs = currentXs + (targetXs - currentXs) * t;

      ghostPriceLine
        .attr("y1", interP)
        .attr("y2", interP);

      ghostQtyDLine
        .attr("x1", interXd).attr("x2", interXd)
        .attr("y1", interP).attr("y2", innerH);

      ghostQtySLine
        .attr("x1", interXs).attr("x2", interXs)
        .attr("y1", interP).attr("y2", innerH);

      ghostDemandDot
        .attr("cx", interXd)
        .attr("cy", interP);

      ghostSupplyDot
        .attr("cx", interXs)
        .attr("cy", interP);
    },

    // Clean up the DOM element completely when stopGhostAnimation() is called
    cleanup() {
      hintGroup.remove();
    }
  };
}

function showPriceHint(targetPrice) {
  if (checkStateValidation(this, state)) {
    stopGhostAnimation();
    return;
  }

  runGhosts([
    makePriceHintGhost(targetPrice)
  ]);
}
