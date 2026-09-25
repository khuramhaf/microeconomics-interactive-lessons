let ghostAnimTimer = null;

function stopGhostAnimation() {

    // Stop timer
    if (ghostAnimTimer) {
        ghostAnimTimer.stop();
        ghostAnimTimer = null;
    }

    // Remove ONLY temporary animation elements
    g.selectAll(".animation-ghost")
        .interrupt()
        .remove();
}



function animatePriceChange(newPrice, duration = 800) {

    stopGhostAnimation();

    const startPrice = state.P;
    const endPrice = newPrice;

    const intercept = state.intercept;
    const slope = state.slope;

    const qFromPrice = p => (p - intercept) / slope;

    const ghostH = g.append("line")
        .attr("class", "ghost-proj animation-ghost")
        .attr("opacity", 0.55);

    const ghostDot = g.append("circle")
        .attr("class", "ghost-dot animation-ghost")
        .attr("r", 12)
        .attr("opacity", 0.55);

    const interpPrice = d3.interpolateNumber(
        startPrice,
        endPrice
    );

    const pauseDuration = 2000;
    const cycleDuration = duration + pauseDuration;

    ghostAnimTimer = d3.timer(elapsed => {

        const cycleTime = elapsed % cycleDuration;

        let t;

        // -------------------------
        // MOVE
        // -------------------------
        if (cycleTime < duration) {

            t = cycleTime / duration;

        }

        // -------------------------
        // PAUSE AT TARGET
        // -------------------------
        else {

            t = 1;
        }

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

    });
}



function animateIntercept(targetIntercept, duration = 800) {

    stopGhostAnimation();

    const startIntercept = state.intercept;

    const moveIntercept =
        Math.abs(startIntercept - targetIntercept) > 0.001;

    if (!moveIntercept) return;

    const ghostGroup = g.append("g")
        .attr("class", "ghost-layer animation-ghost");

    const ghostCurve = ghostGroup.append("line")
        .attr("class", "demand-line")
        .attr("opacity", 0.55);

    const interceptInterp = d3.interpolateNumber(
        startIntercept,
        targetIntercept
    );

    const pauseDuration = 2000;
    const cycleDuration = duration + pauseDuration;

    ghostAnimTimer = d3.timer(elapsed => {

        const cycleTime = elapsed % cycleDuration;

        let t;

        // -------------------------
        // MOVE
        // -------------------------
        if (cycleTime < duration) {

            t = cycleTime / duration;

        }

        // -------------------------
        // PAUSE AT TARGET
        // -------------------------
        else {

            t = 1;
        }

        const intercept = interceptInterp(t);

        // Two points on:
        // P = intercept + slope * Q

        const q1 = 0;
        const p1 = intercept;

        const q2 = 13;
        const p2 = intercept + state.slope * q2;

        ghostCurve
            .attr("x1", xScale(q1))
            .attr("y1", yScale(p1))
            .attr("x2", xScale(q2))
            .attr("y2", yScale(p2));

    });
}


function animatePriceandIntercept(
    targetPrice,
    targetIntercept,
    duration = 800
) {

    stopGhostAnimation();

    const startPrice = state.P;
    const startIntercept = state.intercept;

    const movePrice =
        Math.abs(startPrice - targetPrice) > 0.001;

    const moveIntercept =
        Math.abs(startIntercept - targetIntercept) > 0.001;

    // Nothing to animate
    if (!movePrice && !moveIntercept) {
        return;
    }

    // --------------------------------
    // Ghost elements
    // --------------------------------

    const ghostGroup = g.append("g")
        .attr("class", "ghost-layer animation-ghost");

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

    const priceInterp = d3.interpolateNumber(
        startPrice,
        targetPrice
    );

    const interceptInterp = d3.interpolateNumber(
        startIntercept,
        targetIntercept
    );

    const pauseDuration = 2000;
    const cycleDuration = duration + pauseDuration;

    // --------------------------------
    // Repeat animation
    // --------------------------------

    ghostAnimTimer = d3.timer(elapsed => {

        const cycleTime = elapsed % cycleDuration;

        let t;

        // -------------------------
        // MOVE
        // -------------------------
        if (cycleTime < duration) {

            t = cycleTime / duration;

        }

        // -------------------------
        // PAUSE AT TARGET
        // -------------------------
        else {

            t = 1;
        }

        let P;
        let intercept;

        // --------------------------------
        // BOTH PRICE + INTERCEPT CHANGE
        // --------------------------------

        if (movePrice && moveIntercept) {

            /*
             * First:
             * move price along the original curve
             *
             * Then:
             * shift the curve
             */

            if (t < 0.5) {

                const u = t * 2;

                P = priceInterp(u);
                intercept = startIntercept;

            } else {

                const u = (t - 0.5) * 2;

                P = targetPrice;
                intercept = interceptInterp(u);
            }

        }

        // --------------------------------
        // ONLY PRICE CHANGES
        // --------------------------------

        else if (movePrice) {

            P = priceInterp(t);
            intercept = startIntercept;

        }

        // --------------------------------
        // ONLY INTERCEPT CHANGES
        // --------------------------------

        else {

            P = targetPrice;
            intercept = interceptInterp(t);

        }

        // --------------------------------
        // Calculate quantity
        // --------------------------------

        const Q =
            (P - intercept) / state.slope;

        const dotX = xScale(Q);
        const dotY = yScale(P);

        // --------------------------------
        // Ghost curve
        // --------------------------------

        ghostCurve
            .attr("x1", xScale(0))
            .attr("y1", yScale(intercept))
            .attr(
                "x2",
                xScale((P - intercept) / state.slope)
            )
            .attr("y2", yScale(P));

        // --------------------------------
        // Ghost dot
        // --------------------------------

        ghostDot
            .attr("cx", dotX)
            .attr("cy", dotY);

        // --------------------------------
        // Horizontal projection
        // --------------------------------

        ghostX
            .attr("x1", dotX)
            .attr("y1", dotY)
            .attr("x2", xScale(0))
            .attr("y2", dotY);

        // --------------------------------
        // Vertical projection
        // --------------------------------

        ghostY
            .attr("x1", dotX)
            .attr("y1", dotY)
            .attr("x2", dotX)
            .attr("y2", yScale(0));

    });
}