/* ==========================================================
   graph.js
   D3 scales, axes, the supply curve, and the draggable dot.
   REQUIRES: model.js
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

/* ---------- supply curve elements ---------- */
const supplyGroup = g.append("g");
        


const supplyLineVisible = supplyGroup.append("line")
    .attr("class", "supply-line")
    .attr("stroke", "red"); 

    const supplyLineHitbox = supplyGroup.append("line")
    .attr("class", "demand-line-hitbox");

const xDropLine = g.append("line").attr("class", "proj-line");
const yDropLine = g.append("line").attr("class", "proj-line");

const isMobile = window.innerWidth <= 900;
        
const dot = g.append("circle")
    .attr("class", "drag-dot")
    .attr("r", isMobile ? 18 : 12);

/* ---------- drag interaction mechanics ---------- */
let dragStartIntercept = state.intercept;

// Dragging the line changes the intercept (SHIFTS the curve)
const dragLine = d3.drag()
    .on("start", function() {
        dragStartIntercept = state.intercept; 
    })
    .on("drag", function(event) {
        const Q = xScale.invert(event.x);
        const P = yScale.invert(event.y);

        // Supply shift math: P = 2Q + intercept -> intercept = P - 2Q
        let intercept = P - 2 * Q;
        
        intercept = clamp(intercept, -6, 6);
        intercept = roundStep(intercept, 0.2);

        state.intercept = intercept;

        // Keep price above the lower bounds of 0 or positive intercept
        let minPrice = Math.max(0, state.intercept);
        if (state.P < minPrice) {
            state.P = minPrice;
        }

        renderAll();
    });

supplyLineHitbox.call(dragLine); 

// Dragging the dot changes price/quantity (MOVEMENT ALONG the curve)
const dragDot = d3.drag()
    .on("start", function(event) {
        event.sourceEvent.stopPropagation();
    })
    .on("drag", function(event) {
        let newPrice = yScale.invert(event.y);

        let minPrice = Math.max(0, state.intercept);
        newPrice = Math.max(minPrice, Math.min(P_MAX, newPrice));
        newPrice = roundStep(newPrice, 0.2);

        state.P = newPrice;
        renderAll();
    });

dot.call(dragDot);