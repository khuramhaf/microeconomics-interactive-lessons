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

/* ---------- demand curve ----------
   Split into a data-builder + a line-generator on purpose: both are
   reused later (e.g. a curve-shift ghost animation, or a second demand
   curve) without duplicating this math. */

function buildDemandLineData(priceFn) {
  return d3.range(Q_MIN, Q_MAX + 0.01, 0.05).map(q => ({
    q,
    p: clamp(priceFn(q), P_MIN, P_MAX)
  }));
}

const lineGen = d3.line().x(d => xScale(d.q)).y(d => yScale(d.p));
const lineData = buildDemandLineData(priceFromQty);

g.append("path")
  .datum(lineData)
  .attr("class", "demand-line")
  .attr("d", lineGen)
  .attr("stroke", "red");

// Projection lines (dashed) for the real, non-ghost dot
const priceLine = g.append("line").attr("class", "proj-line");
const qtyLine = g.append("line").attr("class", "proj-line");

/* ---------- the draggable dot ---------- */

const isMobile = window.innerWidth <= 900;
const dot = g.append("circle")
  .attr("class", "drag-dot")
  .attr("r", isMobile ? 18 : 12)
  .attr("cx", xScale(state.Q))
  .attr("cy", yScale(state.P));

let isDragging = false;

const drag = d3.drag()
  .on("start", function () {
    isDragging = true;
    d3.select(this).attr("cursor", "grabbing");
  })
  .on("drag", function (event) {
    const rawQ = xScale.invert(event.x);
    setFromQ(rawQ);
  })
  .on("end", function () {
    isDragging = false;
    d3.select(this).attr("cursor", "grab");
  });

dot.call(drag);
