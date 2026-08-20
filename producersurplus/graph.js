
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

/* ---------- supply curve ----------
   Split into a data-builder + a line-generator, same pattern as the
   consumer-surplus lesson: the same lineData array feeds both the curve
   stroke and the PS-region area generator below, so the shaded area
   always tracks the actual curve with no separate math to keep in sync. */

function buildSupplyLineData(priceFn) {
  return d3.range(Q_MIN, Q_MAX + 0.01, 0.05).map(q => ({
    q,
    p: clamp(priceFn(q), P_MIN, P_MAX)
  }));
}

const lineGen = d3.line().x(d => xScale(d.q)).y(d => yScale(d.p));
const lineData = buildSupplyLineData(priceFromQty);

// Area generator for the shaded PS triangle: bottom edge follows the
// supply curve (y1), top edge sits flat at the current price line (y0).
// The supply curve is below the price line for every q < Q, so the
// fill sits under the price line and above the rising supply curve —
// same "one boundary is the state.P line, one boundary is the curve"
// shape as the CS lesson's shaded region, just mirrored top-to-bottom.
const psAreaGen = d3.area()
  .x(d => xScale(d.q))
  .y0(() => yScale(state.P))
  .y1(d => yScale(d.p));

const psArea = g.append("path")
  .attr("fill", "#2196F3");

// group for the per-unit divider lines, appended once
const unitDividers = g.append("g");

g.append("path")
  .datum(lineData)
  .attr("class", "demand-line")
  .attr("fill", "none")
  .attr("stroke","red")
  .attr("stroke-width", 4)
  .attr("d", lineGen);

// Appended before the supply line so the curve's stroke renders crisply
// on top of the shaded fill rather than under it.

/* ---------- the draggable price line ---------- */

const isMobile = window.innerWidth <= 900;

const hitHeight = isMobile ? 36 : 24;

// Wide, invisible hit-region centered directly over the price line

// 1. Create a dedicated container group
const priceGroup = g.append("g");

// 2. Append elements to priceGroup instead of g
const priceLineHit = priceGroup.append("rect")
  .attr("x", 0)
  .attr("width", innerW)
  .attr("height", hitHeight)
  .attr("fill", "transparent")
  .attr("pointer-events", "all");

const priceLine = priceGroup.append("line")
  .attr("x1", 0)
  .attr("x2", innerW)
  .style("stroke-width", "5px")
  .attr("stroke", "#ff9800")
  .style("pointer-events", "none");

const priceHandle = priceGroup.append("circle")
  .attr("class", "drag-dot")
  .attr("r", isMobile ? 18 : 12);

// 3. Bring the entire group to the front of container 'g'

// Dashed drop-line down to the Q axis, same "proj-line" convention as
// the consumer-surplus lesson's projection lines.
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

     const currentQuestion = quizQuestions[qIndex];

    // Safely run setState if it exists, passing the question's current price state
    currentQuestion.lockState?.();
  });

priceLineHit.call(drag);
priceHandle.call(drag);
