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

// A straight line only needs its two clipped endpoints, not a sampled range.
// This finds exactly where P = intercept + 2Q crosses the plot's boundaries,
// so the drawn line always touches the axis precisely instead of stopping
// at the nearest sampled Q value.
function getSupplyCurveData() {
  const intercept = window.state.intercept;
  const slope = 2;

  // Q values where the line crosses P_MIN and P_MAX
  const qAtPMin = (P_MIN - intercept) / slope;
  const qAtPMax = (P_MAX - intercept) / slope;

  // Valid Q range is the overlap between the axis box and the price-bound crossings
  // (slope is positive, so P rises with Q — qAtPMin is the lower bound)
  const qStart = Math.max(Q_MIN, qAtPMin);
  const qEnd = Math.min(Q_MAX, qAtPMax);

  if (qStart > qEnd) return []; // line is entirely outside the visible box

  return [
    { q: qStart, p: intercept + slope * qStart },
    { q: qEnd, p: intercept + slope * qEnd }
  ];
}

const lineGen = d3.line().x(d => xScale(d.q)).y(d => yScale(d.p));

const supplyPath = g.append("path")
  .datum(getSupplyCurveData())
  .attr("class", "demand-line")
  .attr("d", lineGen);

const supplyHitbox = g.append("path")
  .datum(getSupplyCurveData())
  .attr("d", lineGen)
  .attr("fill", "none")
  .attr("stroke", "transparent")
  .attr("stroke-width", 24)
  .style("cursor", "grab")
  .attr("class", "demand-line-hitbox");

let dragStartOffset = 0;

function interceptAtCursor(event) {
  const q = xScale.invert(event.x);
  const p = yScale.invert(event.y);
  return p - 2 * q;
}

const dragSupplyCurve = d3.drag()
  .on("start", function(event) {
    dragStartOffset = window.state.intercept - interceptAtCursor(event);
  })
  .on("drag", function(event) {
    const targetIntercept = interceptAtCursor(event) + dragStartOffset;
    window.updateIntercept(targetIntercept);
    window.render();
  });

supplyHitbox.call(dragSupplyCurve);

/* ---------- Projection Lines, Dots & Labels, dot drag — unchanged below ---------- */

/* ---------- everything below (projection lines, dots, labels, drag) is unchanged ---------- */
  

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