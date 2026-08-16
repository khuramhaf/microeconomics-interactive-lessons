/* ==========================================================
   graph.js
   D3 scales, axes, the demand curve, the shaded consumer-surplus
   region, and the draggable price line.
   REQUIRES: model.js (state, Q_MIN/MAX, P_MIN/MAX, priceFromQty,
             clamp, setFromP)
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
   Split into a data-builder + a line-generator, same pattern as the
   movement/shift lesson: the same lineData array feeds both the curve
   stroke and the CS-region area generator below, so the shaded area
   always tracks the actual curve with no separate math to keep in sync. */

function buildDemandLineData(priceFn) {
  return d3.range(Q_MIN, Q_MAX + 0.01, 0.05).map(q => ({
    q,
    p: clamp(priceFn(q), P_MIN, P_MAX)
  }));
}

const lineGen = d3.line().x(d => xScale(d.q)).y(d => yScale(d.p));
const lineData = buildDemandLineData(priceFromQty);

// Area generator for the shaded CS triangle: top edge follows the demand
// curve (y1), bottom edge sits flat at the current price line (y0).
const csAreaGen = d3.area()
  .x(d => xScale(d.q))
  .y0(() => yScale(state.P))
  .y1(d => yScale(d.p));

// Appended before the demand line so the curve's stroke renders crisply
// on top of the shaded fill rather than under it.
const csArea = g.append("path")

.attr("fill", "#4CAF50");

g.append("path")
  .datum(lineData)
  .attr("class", "demand-line")
  .attr("d", lineGen);

/* ---------- the draggable price line ---------- */


const isMobile = window.innerWidth <= 900;

const hitHeight = isMobile ? 36 : 24;
 

// Wide, invisible hit-region centered directly over the price line

const priceLineHit = g.append("rect")
  .attr("x", 0)
  .attr("width", innerW)
  .attr("height", hitHeight)
  .attr("fill", "transparent")
  .attr("pointer-events", "all");


const priceLine = g.append("line")
  .attr("x1", 0)
  .attr("x2", innerW)
  .style("stroke-width", "5px")
  .attr("stroke", "#ff9800")
  .style("pointer-events", "none");



// Handle where the price line meets the demand curve — the visual
// drag anchor, echoing the draggable dot from the movement/shift lesson.
const priceHandle = g.append("circle")
  .attr("class", "drag-dot")
  .attr("r", isMobile ? 18 : 12);

// Dashed drop-line down to the Q axis, same "proj-line" convention as
// the movement/shift lesson's projection lines.
const qtyLine = g.append("line").attr("class", "proj-line");

let isDragging = false;
let startY = 0;
let startP = 0;

const drag = d3.drag()
  .container(g.node())
  .on("start", function (event) {
    isDragging = true;
    priceLineHit.attr("cursor", "grabbing");
    priceHandle.attr("cursor", "grabbing");
    // Capture initial touch/click point and state price
    startY = event.y;
    startP = state.P;
  })
  .on("drag", function (event) {
    // Calculate distance moved from the drag start point
    const dy = event.y - startY;
    const rawP = yScale.invert(yScale(startP) + dy);
    const steppedP = Math.round(rawP / P_DRAG_STEP) * P_DRAG_STEP;
    setFromP(steppedP);
  })
  .on("end", function () {
    isDragging = false;
    priceLineHit.attr("cursor", "ns-resize");
    priceHandle.attr("cursor", "grab");
  });

priceLineHit.call(drag);
priceHandle.call(drag);