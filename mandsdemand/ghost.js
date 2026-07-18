function animatePriceChange(newPrice, duration) {

    // Stop previous animation
    g.selectAll(".ghost-dot, .ghost-proj")
        .interrupt()
        .remove();

    const startPrice = state.P;
    const endPrice = newPrice;

    const intercept = state.intercept;
    const slope = state.slope;

    const qFromPrice = p => (intercept - p) / slope;

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

                    // Both move (50% + 50%)

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

                    // Only price moves

                    P = priceInterp(t);
                    intercept = startIntercept;

                } else {

                    // Only intercept moves

                    P = targetPrice;
                    intercept = interceptInterp(t);

                }

                const Q = (intercept - P) / state.slope;

                const dotX = xScale(Q);
                const dotY = yScale(P);

                ghostCurve
                    .attr("x1", xScale(0))
                    .attr("y1", yScale(intercept))
                    .attr("x2", xScale(intercept / state.slope))
                    .attr("y2", yScale(0));

                ghostDot
                    .attr("cx", dotX)
                    .attr("cy", dotY);

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
        .delay(1000)   // Wait 2 seconds
        .remove();
        });

}



function animateIntercept(targetIntercept, duration = 1000) {

    g.selectAll(".ghost-layer")
        .interrupt()
        .remove();

    const startIntercept = state.intercept;

    const moveIntercept = Math.abs(startIntercept - targetIntercept) > 0.001;

    // Nothing to animate
    if (!moveIntercept) {
        return;
    }

    // ---------- Ghost Elements ----------
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

                ghostCurve
                    .attr("x1", xScale(0))
                    .attr("y1", yScale(intercept))
                    .attr("x2", xScale(intercept / state.slope))
                    .attr("y2", yScale(0));

            };

        })
        .on("end", () => {
            ghostGroup
                .transition()
                .delay(1000)
                .remove();
        });

}
