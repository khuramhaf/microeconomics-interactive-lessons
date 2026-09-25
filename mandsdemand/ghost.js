
let ghostAnimTimer = null;

function stopGhostAnimation() {

    // Stop the timer
    if (ghostAnimTimer) {
        ghostAnimTimer.stop();
        ghostAnimTimer = null;
    }

    // Stop any D3 transitions
    g.selectAll(".ghost-dot, .ghost-proj, .ghost-layer")
        .interrupt();

    // Remove ghost elements
    g.selectAll(".ghost-dot, .ghost-proj, .ghost-layer")
        .remove();
}

function animatePriceChange(newPrice, duration = 800) {

    // Stop previous ghost animation
    stopGhostAnimation();

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

    const pauseDuration = 2000;
    const cycleDuration = duration + pauseDuration;

    const priceInterp =
        d3.interpolateNumber(startPrice, endPrice);

    ghostAnimTimer = d3.timer(elapsed => {

        const cycleTime = elapsed % cycleDuration;

        let t;

        if (cycleTime < duration) {
            t = cycleTime / duration;
        } else {
            t = 1;
        }

        const P = priceInterp(t);
        const Q = qFromPrice(P);

        ghostDot
            .attr("cx", xScale(Q))
            .attr("cy", yScale(P));

        ghostH
            .attr("x1", xScale(0))
            .attr("y1", yScale(P))
            .attr("x2", xScale(Q))
            .attr("y2", yScale(P));
    });
}


function animatePriceandIntercept(
    targetPrice,
    targetIntercept,
    duration = 800
) {

    // Stop previous ghost animation
    stopGhostAnimation();

    const startPrice = state.P;
    const startIntercept = state.intercept;

    const movePrice =
        Math.abs(startPrice - targetPrice) > 0.001;

    const moveIntercept =
        Math.abs(startIntercept - targetIntercept) > 0.001;

    if (!movePrice && !moveIntercept) {
        return;
    }

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

    const priceInterp =
        d3.interpolateNumber(startPrice, targetPrice);

    const interceptInterp =
        d3.interpolateNumber(startIntercept, targetIntercept);

    const pauseDuration = 2000;
    const cycleDuration = duration + pauseDuration;

    ghostAnimTimer = d3.timer(elapsed => {

        const cycleTime = elapsed % cycleDuration;

        let t;

        if (cycleTime < duration) {
            t = cycleTime / duration;
        } else {
            t = 1;
        }

        let P;
        let intercept;

        if (movePrice && moveIntercept) {

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

            P = priceInterp(t);
            intercept = startIntercept;

        } else {

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
    });
}


function animateIntercept(targetIntercept, duration = 800) {

    // Stop previous ghost animation
    stopGhostAnimation();

    const startIntercept = state.intercept;

    const moveIntercept =
        Math.abs(startIntercept - targetIntercept) > 0.001;

    if (!moveIntercept) {
        return;
    }

    const ghostGroup = g.append("g")
        .attr("class", "ghost-layer");

    const ghostCurve = ghostGroup.append("line")
        .attr("class", "demand-line")
        .attr("opacity", 0.55);

    const interceptInterp =
        d3.interpolateNumber(
            startIntercept,
            targetIntercept
        );

    const pauseDuration = 2000;
    const cycleDuration = duration + pauseDuration;

    ghostAnimTimer = d3.timer(elapsed => {

        const cycleTime = elapsed % cycleDuration;

        let t;

        if (cycleTime < duration) {
            t = cycleTime / duration;
        } else {
            t = 1;
        }

        const intercept = interceptInterp(t);

        ghostCurve
            .attr("x1", xScale(0))
            .attr("y1", yScale(intercept))
            .attr("x2", xScale(intercept / state.slope))
            .attr("y2", yScale(0));
    });
}


