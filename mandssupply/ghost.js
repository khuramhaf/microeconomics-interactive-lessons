function animatePriceChange(newPrice, duration) {

    // Stop previous animation
    g.selectAll(".ghost-dot, .ghost-proj")
        .interrupt()
        .remove();

    const startPrice = state.P;
    const endPrice = newPrice;

    const intercept = state.intercept;
    const slope = state.slope;

    const qFromPrice = p => (p - state.intercept) / state.slope;

    const ghostH = g.append("line")
        .attr("class", "ghost-proj")
        .attr("opacity", 0.55);


    const ghostDot = g.append("circle")
        .attr("class", "ghost-dot")
        .attr("r", 12)
        .attr("opacity", 0.55);

    d3.transition()
        .duration(duration)
        .ease(d3.easeCubicInOut)
        .tween("move", () => {

            const interpPrice = d3.interpolateNumber(startPrice, endPrice);

            return t => {

                const P = interpPrice(t);
                const Q = qFromPrice(P);

                ghostDot
                    .attr("cx", xScale(Q))
                    .attr("cy", yScale(P));

                ghostH
                    .attr("x1", xScale(0))
                    .attr("y1", yScale(P))
                    .attr("x2", xScale(Q))
                    .attr("y2", yScale(P));

            };
        })
        .on("end", () => {
            ghostDot
        .transition()
        .delay(1000)
        .remove();

    ghostH
        .transition()
        .delay(1000)
        .remove();
            
        });
}


function animateIntercept(targetIntercept, duration = 2000) {


    g.selectAll(".ghost-layer")
        .interrupt()
        .remove();

    const startIntercept = state.intercept;

    const moveIntercept = Math.abs(startIntercept - targetIntercept) > 0.001;

    if (!moveIntercept) return;

    const ghostGroup = g.append("g")
        .attr("class", "ghost-layer");

    const ghostCurve = ghostGroup.append("line")
        .attr("class", "demand-line")
        .attr("opacity", 0.55);

    const interceptInterp = d3.interpolateNumber(
        startIntercept,
        targetIntercept
    );

    ghostGroup
        .transition()
        .duration(duration)
        .ease(d3.easeCubicInOut)
        .tween("hint", () => {

            return function (t) {

                const intercept = interceptInterp(t);

                // Two points on P = intercept + slope * Q
                const q1 = 0;
                const p1 = intercept;

                const q2 = 13;      // or your graph's maximum quantity
                const p2 = intercept + state.slope * q2;

                ghostCurve
                    .attr("x1", xScale(q1))
                    .attr("y1", yScale(p1))
                    .attr("x2", xScale(q2))
                    .attr("y2", yScale(p2));

            };

        })
        .on("end", () => {
            ghostGroup
                .transition()
                .delay(1000)
                .remove();
        });

}



function animatePriceandIntercept(targetPrice, targetIntercept, duration = 2000) {

    g.selectAll(".ghost-layer")
        .interrupt()
        .remove();

    const startPrice = state.P;
    const startIntercept = state.intercept;

    const movePrice = Math.abs(startPrice - targetPrice) > 0.001;
    const moveIntercept = Math.abs(startIntercept - targetIntercept) > 0.001;

    // Nothing to animate
    if (!movePrice && !moveIntercept) {
        return;
    }

    // ---------- Ghost Elements ----------
    const ghostGroup = g.append("g")
        .attr("class", "ghost-layer");

    const ghostCurve = ghostGroup.append("line")
        .attr("class", "demand-line")
        .attr("opacity", 0.55);

    const ghostDot = ghostGroup.append("circle")
        .attr("class", "ghost-dot")
        .attr("r", 12)
        .attr("opacity", 0.55);

    const ghostX = ghostGroup.append("line")
        .attr("class", "proj-line")
        .attr("opacity", 0.55);

    const ghostY = ghostGroup.append("line")
        .attr("class", "proj-line")
        .attr("opacity", 0.55);

    const priceInterp = d3.interpolateNumber(startPrice, targetPrice);
    const interceptInterp = d3.interpolateNumber(startIntercept, targetIntercept);

    ghostGroup
        .transition()
        .duration(duration)
        .ease(d3.easeCubicInOut)
        .tween("hint", () => {

            return function(t) {

                let P;
                let intercept;

                if (movePrice && moveIntercept) {

                    // First move along the curve, then shift the curve
                    if (t < 0.5) {

                        const u = t * 2;

                        P = priceInterp(u);
                        intercept = startIntercept;

                    } else {

                        const u = (t - 0.5) * 2;

                        P = targetPrice;
                        intercept = interceptInterp(u);

                    }

                } else if (movePrice) {

                    // Only move along the curve
                    P = priceInterp(t);
                    intercept = startIntercept;

                } else {

                    // Only shift the curve
                    P = targetPrice;
                    intercept = interceptInterp(t);

                }

                // Supply equation:
                // P = intercept + slope * Q
                const Q = (P - intercept) / state.slope;

                const dotX = xScale(Q);
                const dotY = yScale(P);

                // Supply curve
                ghostCurve
    .attr("x1", xScale(0))
    .attr("y1", yScale(intercept))
    .attr("x2", xScale((P - intercept) / state.slope))
    .attr("y2", yScale(P));

                ghostDot
                    .attr("cx", dotX)
                    .attr("cy", dotY);

                // Horizontal projection
                ghostX
                    .attr("x1", dotX)
                    .attr("y1", dotY)
                    .attr("x2", xScale(0))
                    .attr("y2", dotY);

               

            };

        })
        .on("end", () => {

            ghostGroup
                .transition()
                .delay(1000)
                .remove();

        });

}