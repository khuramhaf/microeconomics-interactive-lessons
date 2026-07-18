/* ==========================================================
   ghost.js
   Generic "ghost animation" engine + the 3 animations this lesson
   currently uses.

   THE KEY IDEA: the engine (runGhosts/stopGhostAnimation) has no
   idea what a "ghost" is. It just runs a list of objects shaped like
   { show(), hide(), update(t) } on one shared d3.timer loop. To add:

     - a second/third demand curve            -> write makeGhostCurve()
     - a curve that shifts from A to B         -> write makeGhostCurve()
     - two or three dots animating together    -> pass multiple
                                                   makeGhostDot(...) in
                                                   one array
     - "animate all" of the above at once      -> runGhosts([...all of them])

   ...and NONE of that requires touching runGhosts/stopGhostAnimation.
   Only write a new "make___()" factory function that returns the
   {show, hide, update} shape.

   REQUIRES: model.js (state, qtyFromPrice, priceFromQty), validation.js
   (checkStateValidation), graph.js (g, xScale, yScale, innerH, lineGen,
   isDragging, buildDemandLineData).
   ========================================================== */

let animTimer = null;
let activeGhosts = [];

function stopGhostAnimation() {
  if (animTimer) {
    animTimer.stop();
    animTimer = null;
  }
  activeGhosts.forEach(ghost => ghost.hide());
  activeGhosts = [];
}

// The shared engine. Give it any list of {show, hide, update(t)} objects.
function runGhosts(ghosts) {
  stopGhostAnimation();
  activeGhosts = ghosts;
  activeGhosts.forEach(ghost => ghost.show());
  animTimer = d3.timer(elapsed => {
    const t = (elapsed % 2000) / 2000;
    activeGhosts.forEach(ghost => ghost.update(t));
  });
}

/* ---------- ghost dot (with price and/or quantity projection lines) ---------- */

const ghostPriceLine = g.append("line").attr("class", "ghost-proj").style("display", "none");
const ghostQtyLine = g.append("line").attr("class", "ghost-proj").style("display", "none");
const ghostDot = g.append("circle").attr("class", "ghost-dot").attr("r", 12).style("display", "none");

// mode: "price" | "quantity" | "both" — which projection line(s) to show.
// NOTE: today only one ghost dot ever runs at a time, so it's safe to
// reuse these 3 shared SVG elements. If you later run TWO ghost dots
// simultaneously, switch this to create fresh elements per call (same
// pattern as makeGhostCurve below, which already does that correctly).
function makeGhostDot(targetP, mode) {
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
      const animatedP = state.P + (targetP - state.P) * t;
      const animatedQ = state.Q + (qtyFromPrice(targetP) - state.Q) * t;
      const gCx = xScale(animatedQ);
      const gCy = yScale(animatedP);

      ghostDot.attr("cx", gCx).attr("cy", gCy);
      ghostPriceLine.attr("x1", 0).attr("y1", gCy).attr("x2", gCx).attr("y2", gCy);
      ghostQtyLine.attr("x1", gCx).attr("y1", innerH).attr("x2", gCx).attr("y2", gCy);
    }
  };
}

/* ---------- ghost curve-shift (ready to use, not wired to a question yet) ----------
   Example future use:
     runGhosts([ makeGhostCurve(priceFromQty, q => 24 - 2 * q) ]);
   creates its own <path>, so unlike makeGhostDot it's safe to run
   several of these at once (e.g. animating 2-3 curves together). */

function makeGhostCurve(fromPriceFn, toPriceFn) {
  const ghostPath = g.append("path")
    .attr("class", "demand-line ghost-curve")
    .style("display", "none")
    .style("opacity", 0.55);

  return {
    show() { ghostPath.style("display", null); },
    hide() { ghostPath.style("display", "none"); ghostPath.remove(); },
    update(t) {
      const blended = buildDemandLineData(
        q => fromPriceFn(q) + (toPriceFn(q) - fromPriceFn(q)) * t
      );
      ghostPath.attr("d", lineGen(blended));
    }
  };
}

/* ---------- shared target-finder (same math as before, unchanged) ---------- */

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
    if (discriminant < 0) return 10; // peak fallback
    const root = Math.sqrt(discriminant);
    const pHigh = 10 + root;
    const pLow = 10 - root;
    return Math.abs(state.P - pHigh) <= Math.abs(state.P - pLow) ? pHigh : pLow;
  }
  return null;
}

/* ---------- the 3 existing animations, now thin wrappers around runGhosts ---------- */

function animateGhostPrice() {
  const targetP = getGhostTargetPrice(this);
  if (targetP === null || checkStateValidation(this, state) || isDragging) { stopGhostAnimation(); return; }
  runGhosts([makeGhostDot(targetP, "price")]);
}

function animateGhostQuantity() {
  const targetP = getGhostTargetPrice(this);
  if (targetP === null || checkStateValidation(this, state) || isDragging) { stopGhostAnimation(); return; }
  runGhosts([makeGhostDot(targetP, "quantity")]);
}

function animateGhostBoth() {
  const targetP = getGhostTargetPrice(this);
  if (targetP === null || checkStateValidation(this, state) || isDragging) { stopGhostAnimation(); return; }
  runGhosts([makeGhostDot(targetP, "both")]);
}
 
