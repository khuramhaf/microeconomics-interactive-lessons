// Reference the elements using your specific setup
const svgEl = d3.select("#graph-svg");
const viewW = 560, viewH = 420;
const margin = { top: 16, right: 20, bottom: 40, left: 48 };
const innerW = viewW - margin.left - margin.right;
const innerH = viewH - margin.top - margin.bottom;

const g = svgEl.append("g")
  .attr("transform", `translate(${margin.left},${margin.top})`);

/* ---------- Scales & Axes ---------- */
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

/* ---------- Static Full Demand Curve Line ---------- */
// Draws the underlying functional line from Q=0 to Q=10
const backgroundDemandData = d3.range(Q_MIN, Q_MAX + 0.1, 1).map(q => ({ q, p: 20 - 2 * q }));
const lineGen = d3.line().x(d => xScale(d.q)).y(d => yScale(d.p));

g.append("path")
  .datum(backgroundDemandData)
  .attr("class", "demand-line")
  .attr("d", lineGen)
  

/* ---------- Projection Lines ---------- */
const projLineAX = g.append("line").attr("class", "proj-line");
const projLineAY = g.append("line").attr("class", "proj-line");
const projLineBX = g.append("line").attr("class", "proj-line");
const projLineBY = g.append("line").attr("class", "proj-line");

/* ---------- Dots & Labels ---------- */
const isMobile = window.innerWidth <= 900;
const dotRadius = isMobile ? 18 : 12;

// Dot A (Original Blue Accent)
const dotA = g.append("circle")
  .attr("r", dotRadius)
  .style("fill", "var(--accent-dark, #2b5c8f)")
  .style("cursor", "grab")
  .attr("class", "drag-dot");

const labelA = g.append("text")
  .attr("text-anchor", "middle")
  .attr("dy", -dotRadius - 4)
  .style("font-weight", "bold")
  .style("fill", "var(--accent-dark, #2b5c8f)")
  .text("A");

// Dot B (Requested Red Style)
const dotB = g.append("circle")
  .attr("r", dotRadius)
  .style("fill", "red")
  .style("cursor", "grab")
  .attr("class", "drag-dot");

const labelB = g.append("text")
  .attr("text-anchor", "middle")
  .attr("dy", -dotRadius - 4)
  .style("font-weight", "bold")
  .style("fill", "red")
  .text("B");

/* ---------- Drag Handlers ---------- */
const dragBehaviorA = d3.drag()
  .on("drag", function(event) {
    // Determine the Price where the user is dragging along the Y axis
    const currentPrice = yScale.invert(event.y);
    window.updateDotA(currentPrice);
    window.render();
  });

const dragBehaviorB = d3.drag()
  .on("drag", function(event) {
    const currentPrice = yScale.invert(event.y);
    window.updateDotB(currentPrice);
    window.render();
  });

dotA.call(dragBehaviorA);
dotB.call(dragBehaviorB);