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
        .attr("opacity", 0);

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

    // --------------------------------
    // Graph limits
    // --------------------------------

    const xMin = xScale.domain()[0];
    const xMax = xScale.domain()[1];

    function clampQ(Q) {
        return Math.max(
            xMin,
            Math.min(xMax, Q)
        );
    }

    // --------------------------------
    // Interpolators
    // --------------------------------

    const priceInterp = d3.interpolateNumber(
        startPrice,
        targetPrice
    );

    const interceptInterp = d3.interpolateNumber(
        startIntercept,
        targetIntercept
    );

    // --------------------------------
    // Timing
    // --------------------------------

    const pauseDuration = 2000;

    const stage1Duration = duration;
    const stage2Duration = duration;

    const totalAnimation =
        stage1Duration + stage2Duration;

    const cycleDuration =
        totalAnimation + pauseDuration;

    // --------------------------------
    // Repeat animation
    // --------------------------------

    ghostAnimTimer = d3.timer(elapsed => {

        const cycleTime =
            elapsed % cycleDuration;


        // ==================================================
        // STAGE 1
        //
        // Dot + projection lines move along
        // ORIGINAL curve
        //
        // Curve itself remains hidden
        // ==================================================

        if (cycleTime < stage1Duration) {

            const t =
                cycleTime / stage1Duration;

            const easedT =
                d3.easeCubicInOut(t);

            // --------------------------------
            // Price moves
            // --------------------------------

            const P =
                priceInterp(easedT);

            // --------------------------------
            // IMPORTANT:
            // Use ORIGINAL intercept
            // --------------------------------

            const Q =
                (P - startIntercept) /
                state.slope;

            const safeQ =
                clampQ(Q);

            const dotX =
                xScale(safeQ);

            const dotY =
                yScale(P);

            // --------------------------------
            // Ghost dot
            // --------------------------------

            ghostDot
                .attr("cx", dotX)
                .attr("cy", dotY)
                .attr("opacity", 0.55);

            // --------------------------------
            // HORIZONTAL projection
            // --------------------------------

            ghostX
                .attr("x1", xScale(0))
                .attr("y1", dotY)
                .attr("x2", dotX)
                .attr("y2", dotY)
                .attr("opacity", 0.55);

            // --------------------------------
            // VERTICAL projection
            // --------------------------------

            ghostY
                .attr("x1", dotX)
                .attr("y1", dotY)
                .attr("x2", dotX)
                .attr("y2", yScale(0))
                .attr("opacity", 0.55);

            // --------------------------------
            // CURVE HIDDEN
            // --------------------------------

            ghostCurve
                .attr("opacity", 0);

            return;
        }


        // ==================================================
        // STAGE 2
        //
        // Curve appears.
        //
        // Curve + dot + projections move together.
        // ==================================================

        const stage2Time =
            cycleTime - stage1Duration;

        let t;

        if (stage2Time < stage2Duration) {

            t =
                stage2Time / stage2Duration;

        } else {

            t = 1;
        }

        const easedT =
            d3.easeCubicInOut(t);

        // --------------------------------
        // Interpolate intercept
        // --------------------------------

        const intercept =
            interceptInterp(easedT);

        // --------------------------------
        // Price stays at target
        // --------------------------------

        const P =
            targetPrice;

        // --------------------------------
        // Quantity on shifting curve
        // --------------------------------

        const Q =
            (P - intercept) /
            state.slope;

        const safeQ =
            clampQ(Q);

        const dotX =
            xScale(safeQ);

        const dotY =
            yScale(P);

        // --------------------------------
        // Ghost dot
        // --------------------------------

        ghostDot
            .attr("cx", dotX)
            .attr("cy", dotY)
            .attr("opacity", 0.55);

        // --------------------------------
        // Ghost curve
        // --------------------------------

        const curveQ = xMax;

        const curveP =
            intercept +
            state.slope * curveQ;

        ghostCurve
            .attr("x1", xScale(xMin))
            .attr(
                "y1",
                yScale(
                    intercept +
                    state.slope * xMin
                )
            )
            .attr("x2", xScale(curveQ))
            .attr("y2", yScale(curveP))
            .attr("opacity", 0.55);

        // --------------------------------
        // Horizontal projection
        // --------------------------------

        ghostX
            .attr("x1", xScale(0))
            .attr("y1", dotY)
            .attr("x2", dotX)
            .attr("y2", dotY)
            .attr("opacity", 0.55);

        // --------------------------------
        // Vertical projection
        // --------------------------------

        ghostY
            .attr("x1", dotX)
            .attr("y1", dotY)
            .attr("x2", dotX)
            .attr("y2", yScale(0))
            .attr("opacity", 0.55);

    });
}