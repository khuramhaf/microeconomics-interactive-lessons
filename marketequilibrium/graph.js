/* ==========================================================
   graph.js (Equilibrium Edition)
   Requires: model.js
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

const xAxis = d3.axisBottom(xScale).ticks(10).tickSizeOuter(0);
const yAxis = d3.axisLeft(yScale).ticks(10).tickSizeOuter(0);

g.append("g").attr("class", "axis x-axis").attr("transform", `translate(0,${innerH})`).call(xAxis);
g.append("g").attr("class", "axis y-axis").call(yAxis);

g.append("text").attr("class", "axis-label")
  .attr("x", innerW / 2).attr("y", innerH + 38).attr("text-anchor", "middle")
  .text("Quantity (Q)");

g.append("text").attr("class", "axis-label")
  .attr("transform", "rotate(-90)").attr("x", -innerH / 2).attr("y", -32)
  .attr("text-anchor", "middle").text("Price (P)");

/* ---------- curves ---------- */
function buildLineData(priceFn) {
  return d3.range(Q_MIN, Q_MAX + 0.01, 0.05).map(q => ({
    q,
    p: clamp(priceFn(q), P_MIN, P_MAX)
  }));
}

const lineGen = d3.line().x(d => xScale(d.q)).y(d => yScale(d.p));

// Demand Curve
g.append("path")
  .datum(buildLineData(priceFromQtyD))
  .attr("class", "demand-line")
  .attr("d", lineGen);

// Supply Curve (reuses your existing styling methods)
g.append("path")
  .datum(buildLineData(priceFromQtyS))
  .attr("class", "supply-line") // Styled through your CSS or matching demand-line
  .attr("d", lineGen)
  .attr("stroke", "red");

/* ---------- interactive elements ---------- */



// Draggable horizontal price line
const priceDragLine = g.append("line")
  .attr("class", "price-line")
  .style("stroke-width", "5px")
  .style("cursor", "grab")
  .attr("stroke", "#ff9800");

  const priceDragHitbox = g.append("line")
  .attr("class", "price-line")
  .style("stroke-width", "24px")        // Generous grab area
  .style("stroke", "transparent")       // Invisible to the user    // Captures clicks/drags anywhere on the thick stroke
  .style("cursor", "grab");


  

// Two separate projection vertical lines to the X-axis
const qtyDLine = g.append("line").attr("class", "proj-line");
const qtySLine = g.append("line").attr("class", "proj-line");

// Two intersection points
const isMobile = window.innerWidth <= 900;
const dotRadius = isMobile ? 18 : 12;

const demandDot = g.append("circle").attr("class", "drag-dot").attr("r", dotRadius);
const supplyDot = g.append("circle").attr("class", "drag-dot").attr("r", dotRadius);

/* ---------- drag behavior ---------- */
const drag = d3.drag()
  .on("start", function () { d3.select(this).attr("cursor", "grabbing"); })
  .on("drag", function (event) {
    const rawP = yScale.invert(event.y);
    setFromP(rawP);
  })
  .on("end", function () { d3.select(this).attr("cursor", "ns-resize"); });

// The user can drag the entire horizontal line up and down


priceDragLine.call(drag);
priceDragHitbox.call(drag);

const dragDot = d3.drag()
  .on("start", function () { 
    // Targets whatever is being dragged (line or dots)
    d3.select(this).attr("cursor", "grabbing"); 
  })
  .on("drag", function (event) {
    // Both horizontal movement and vertical movement will change price based on Y position
    const rawP = yScale.invert(event.y);
    setFromP(rawP);
  })
  .on("end", function () { 
    // Restore correct cursors on drop
    const isLine = d3.select(this).node().tagName === "line";
    d3.select(this).attr("cursor", isLine ? "ns-resize" : "grab"); 
  });

// Attach the same drag handler to all three interactive components

demandDot.style("cursor", "grab").call(dragDot);
supplyDot.style("cursor", "grab").call(dragDot);