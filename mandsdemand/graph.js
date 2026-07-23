/* ==========================================================
   graph.js
   D3 scales, axes, the demand curve, and the draggable dot.
   REQUIRES: model.js (state, Q_MIN/MAX, P_MIN/MAX, priceFromQty, clamp),
             validation.js (not used directly here, but ghost.js needs
             this file's exports and loads right after it)
   Must load AFTER <svg id="graph-svg"> exists in the DOM (i.e. at the
   bottom of <body>, not in <head>).
   ========================================================== */

const svgEl = d3.select("#graph-svg");
const viewW = 560, viewH = 420;
const margin = { top: 16, right: 20, bottom: 40, left: 48 };
const innerW = viewW - margin.left - margin.right;
const innerH = viewH - margin.top - margin.bottom;

const g = svgEl.append("g")
  .attr("transform", `translate(${margin.left},${margin.top})`);

const xScale = d3.scaleLinear().domain([Q_MIN, Q_MAX]).range([0, innerW]);
const yScale = d3.scaleLinear().domain([P_MIN, P_MAX]).range([innerH, 0]);

const xAxis = d3.axisBottom(xScale).ticks(13).tickSizeOuter(0);
const yAxis = d3.axisLeft(yScale).ticks(13).tickSizeOuter(0);

g.append("g").attr("class", "axis x-axis").attr("transform", `translate(0,${innerH})`).call(xAxis);
g.append("g").attr("class", "axis y-axis").call(yAxis);

g.append("text").attr("class", "axis-label")
  .attr("x", innerW / 2).attr("y", innerH + 38).attr("text-anchor", "middle")
  .text("Quantity (Q)");

g.append("text").attr("class", "axis-label")
  .attr("transform", "rotate(-90)").attr("x", -innerH / 2).attr("y", -32)
  .attr("text-anchor", "middle").text("Price (P)");

/* ---------- demand curve ----------
   Split into a data-builder + a line-generator on purpose: both are
   reused later (e.g. a curve-shift ghost animation, or a second demand
   curve) without duplicating this math. */












const demandGroup = g.append("g");
        
        

        const demandLineVisible = demandGroup.append("line")
            .attr("class", "demand-line");

            const demandLineHitbox = demandGroup.append("line")
            .attr("class", "demand-line-hitbox");


             const xDropLine = g.append("line").attr("class", "proj-line");
        const yDropLine = g.append("line").attr("class", "proj-line");
const isMobile = window.innerWidth <= 900;
        
        const dot = g.append("circle")
            .attr("class", "drag-dot")
            .attr("r", isMobile? 18:12);



let dragStartIntercept = state.intercept;
const dragLine = d3.drag()
    .on("start", function() {
        // Double-check: Ensure 'intercept' here matches your state variable name
        dragStartIntercept = state.intercept; 
    })
    .on("drag", function(event) {


       const Q = xScale.invert(event.x);
const P = yScale.invert(event.y);

let intercept = P + 2 * Q;
intercept = clamp(intercept, 0, 26);
intercept = roundStep(intercept, 0.2);

   
        state.intercept = intercept

       

        renderAll();
    });

        demandLineHitbox.call(dragLine);

        // Drag behavior for the dot (slides along the existing demand line)
        const dragDot = d3.drag()
        .on("start", function(event) {
    event.sourceEvent.stopPropagation();
})
            .on("drag", function(event) {
                // Determine drag position based on closest coordinate
               let newPrice = yScale.invert(event.y);

// Price bounds: can't go below 0 or above the current intercept
newPrice = Math.max(0, Math.min(state.intercept, newPrice));

// Snap to the nearest 0.2
newPrice = roundStep(newPrice, 0.2);

state.P = newPrice;
                renderAll();
            });

        dot.call(dragDot);
