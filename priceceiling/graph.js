/* ==========================================================
   graph.js
   D3 rendering setup for Demand, Supply, CS, PS, DWL regions,
   interactive price line, left-aligned area text labels, and
   right-side SVG panel for numerical surplus values.
   ========================================================== */

const svgEl = d3.select("#graph-svg");
const viewW = 680, viewH = 420; // Expanded width to accommodate the right-side values panel
const margin = { top: 16, right: 140, bottom: 40, left: 48 };
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

/* ---------- Data Generators & Area Path Structures ---------- */

function buildLineData(fn) {
  return d3.range(Q_MIN, Q_MAX + 0.01, 0.05).map(q => ({
    q,
    p: clamp(fn(q), P_MIN, P_MAX)
  }));
}

const lineGen = d3.line().x(d => xScale(d.q)).y(d => yScale(d.p));
const demandData = buildLineData(demandP);
const supplyData = buildLineData(supplyP);

// Regions (Shaded Paths)
const csArea = g.append("path").attr("fill", "yellow").attr("opacity", 0.6); // Green CS
const psArea = g.append("path").attr("fill", "green").attr("opacity", 0.6); // Blue PS
const dwlArea = g.append("path").attr("fill", "orange").attr("opacity", 1); // Red DWL

// Curves
g.append("path").datum(demandData).attr("class", "demand-line").attr("d", lineGen);
g.append("path").datum(supplyData).attr("class", "supply-line").attr("d", lineGen).attr("stroke", "red");

/* ---------- On-Graph Region Text Labels (Left-Aligned to Shapes) ---------- */

const graphLabelsGroup = g.append("g").attr("class", "graph-labels");

const csLabel = graphLabelsGroup.append("text")
  .attr("class", "area-label")
  .attr("fill", "#1b5e20")
  .attr("font-weight", "bold")
  .attr("font-size", "15px")
  .attr("text-anchor", "start") // Left-aligned text
  .text("CS");

const psLabel = graphLabelsGroup.append("text")
  .attr("class", "area-label")
  .attr("fill", "#0d47a1")
  .attr("font-weight", "bold")
  .attr("font-size", "15px")
  .attr("text-anchor", "start") // Left-aligned text
  .text("PS");

const dwlLabel = graphLabelsGroup.append("text")
  .attr("class", "area-label")
  .attr("fill", "#b71c1c")
  .attr("font-weight", "bold")
  .attr("font-size", "15px")
  .attr("text-anchor", "start") // Left-aligned text
  .text("DWL");

// Projection lines
const qtyLine = g.append("line").attr("class", "proj-line").attr("stroke-dasharray", "4,4");
const qtyDemandedLine = g.append("line").attr("class", "proj-line").attr("stroke-dasharray", "4,4");

/* ---------- Draggable Price Ceiling Line & Dots ---------- */

const isMobile = window.innerWidth <= 900;
const hitHeight = isMobile ? 36 : 24;

const priceGroup = g.append("g").attr("class", "price-line-group");

const priceLineHit = priceGroup.append("rect")
  .attr("x", 0)
  .attr("width", innerW)
  .attr("height", hitHeight)
  .attr("fill", "transparent")
  .attr("pointer-events", "all");

const priceLine = priceGroup.append("line")
  .attr("x1", 0)
  .attr("x2", innerW)
  .style("stroke-width", "4px")
  .attr("stroke", "#ff9800")
  .style("pointer-events", "none");

// Primary handle on Supply curve (Traded Q)
const priceHandle = priceGroup.append("circle")
  .attr("class", "drag-dot supply-dot")
  .attr("r", isMobile ? 16 : 10)
  .attr("fill", "#ff9800");

// Secondary dot on Demand curve (Quantity Demanded)
const priceHandleDemand = priceGroup.append("circle")
  .attr("class", "drag-dot demand-dot")
  .attr("r", isMobile ? 16 : 10)
  .attr("fill", "#e91e63")

let startY = 0;
let startP = 0;

const drag = d3.drag()
  .container(g.node())
  .on("start", function (event) {
    priceLineHit.attr("cursor", "grabbing");
    priceHandle.attr("cursor", "grabbing");
    priceHandleDemand.attr("cursor", "grabbing");
    startY = event.y;
    startP = state.P;
  })
  .on("drag", function (event) {
    const dy = event.y - startY;
    const rawP = yScale.invert(yScale(startP) + dy);
    setFromP(rawP);
  })
  .on("end", function () {
    priceLineHit.attr("cursor", "ns-resize");
    priceHandle.attr("cursor", "grab");
    priceHandleDemand.attr("cursor", "grab");
    const currentQuestion = quizQuestions[qIndex];

    // Safely run setState if it exists, passing the question's current price state
    currentQuestion.lockState?.();
  });

priceLineHit.call(drag);
priceHandle.call(drag);
priceHandleDemand.call(drag);

/* ---------- Right Side SVG Values Panel ---------- */


