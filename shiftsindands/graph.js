/* ============================================================
   GRAPH
   Owns the D3/SVG layer. Reads from `state` (model.js) and
   draws it. Drag behaviors here call the model's mutators
   (setDemandFromPoint / setSupplyFromPoint) — they never touch
   `state` directly — then call the global renderAll() defined
   in main.js so the rest of the UI stays in sync.
   ============================================================ */

const svgEl = d3.select("#graph-svg");
const viewW = 560, viewH = 420;
const margin = { top: 16, right: 20, bottom: 40, left: 48 };
const innerW = viewW - margin.left - margin.right;
const innerH = viewH - margin.top - margin.bottom;

const g = svgEl.append("g")
  .attr("transform", `translate(${margin.left},${margin.top})`);

/* ---------- scales & axes ---------- */
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

/* ---------- drawing helpers ---------- */
function buildLineData(priceFn, maxQ = Q_MAX) {
  const upperLimit = Math.min(maxQ, Q_MAX);
  return d3.range(Q_MIN, upperLimit + 0.01, 0.05).map(q => {
    const p = priceFn(q);
    return { q, p, valid: p >= P_MIN && p <= P_MAX ? p : null };
  });
}

const lineGen = d3.line()
  .defined(d => d.valid !== null)
  .x(d => xScale(d.q))
  .y(d => yScale(d.valid));
/* ---------- static reference elements (dimmed) ---------- */




/* ---------- dynamic interactive elements ---------- */
const demandPath = g.append("path").attr("class", "demand-line").style("stroke", "var(--accent-dark)")
const supplyPath = g.append("path").attr("class", "demand-line").style("stroke", "red")

// Invisible thick overlay paths for easier touch/drag targeting
const demandDragArea = g.append("path").style("fill", "none").style("stroke", "transparent").style("stroke-width", "24px").style("cursor", "grab");
const supplyDragArea = g.append("path").style("fill", "none").style("stroke", "transparent").style("stroke-width", "24px").style("cursor", "grab");

// Projections from equilibrium to axes
const eqLineX = g.append("line").style("stroke", "#666").attr("class", "proj-line");
const eqLineY = g.append("line").style("stroke", "#666").attr("class", "proj-line");

// Active equilibrium dot
const isMobile = window.innerWidth <= 900;
const dotRadius = isMobile ? 18 : 12;
const eqDot = g.append("circle").attr("class", "drag-dot").attr("r", dotRadius);

/* ---------- drag behaviors ---------- */
// NOTE: these only translate a pointer position into a model call.
// All clamping/derivation happens inside model.js.
const dragDemand = d3.drag().on("drag", function (event) {
  const q = xScale.invert(event.x);
  const p = yScale.invert(event.y);
  setDemandFromPoint(q, p);
  renderAll();
});

const dragSupply = d3.drag().on("drag", function (event) {
  const q = xScale.invert(event.x);
  const p = yScale.invert(event.y);
  setSupplyFromPoint(q, p);
  renderAll();
});

demandDragArea.call(dragDemand);
supplyDragArea.call(dragSupply);


/* ---------- equilibrium dot drag behavior ---------- */
const dragDot = d3.drag().on("drag", function (event) {
  // Convert pixel coordinates of the drag event back into Q and P values
  const q = xScale.invert(event.x);
  const p = yScale.invert(event.y);
  
  // Update both curves in the model
  setEquilibriumFromPoint(q, p);
  
  // Redraw the graph with the updated state
  renderAll(); // Or renderGraph(), depending on what your main script calls
});

// Attach the drag behavior to the dot and change cursor to indicate it's draggable
eqDot.style("cursor", "move").call(dragDot);

/* ---------- render ---------- */
// Pure rendering: reads `state`, updates the SVG. Never mutates state.
function renderGraph() {
  const dData = buildLineData(getDemandPrice);
  const sData = buildLineData(getSupplyPrice);

  demandPath.datum(dData).attr("d", lineGen);
  demandDragArea.datum(dData).attr("d", lineGen);

  supplyPath.datum(sData).attr("d", lineGen);
  supplyDragArea.datum(sData).attr("d", lineGen);

  const cx = xScale(state.eqQ);
  const cy = yScale(state.eqP);
  eqDot.attr("cx", cx).attr("cy", cy);
  eqLineX.attr("x1", cx).attr("y1", cy).attr("x2", cx).attr("y2", innerH);
  eqLineY.attr("x1", cx).attr("y1", cy).attr("x2", 0).attr("y2", cy);
}
