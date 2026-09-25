/* ==========================================================
   Ghost Animation Engine
   ----------------------------------------------------------
   Each ghost animation:
     start → target → hold 2 sec → start → target → ...
   until stopGhostAnimation() is called.
   ========================================================== */

const GHOST_PAUSE = 2000;


/* ----------------------------------------------------------
   Stop ALL ghost animations
   ---------------------------------------------------------- */

function stopGhostAnimation() {

    g.selectAll(".ghost-animation")
        .interrupt()
        .remove();
}


/* ----------------------------------------------------------
   Loop a ghost transition forever
   ---------------------------------------------------------- */

function loopGhostAnimation(selection, duration, tweenName, tweenFunction) {

    function run() {

        // If the element was removed, do nothing
        if (selection.empty()) return;

        selection
            .interrupt()
            .transition()
            .duration(duration)
            .ease(d3.easeCubicInOut)
            .tween(tweenName, tweenFunction)
            .on("end", function () {

                // Stay at target for 2 seconds
                d3.select(this)
                    .transition()
                    .delay(GHOST_PAUSE)
                    .duration(0)
                    .on("end", function () {

                        // Start the animation again
                        run();

                    });

            });
    }

    run();
}



function animatePriceChange(newPrice, duration = 2000) {

    stopGhostAnimation();

    const startPrice = state.P;
    const endPrice = newPrice;

    if (Math.abs(startPrice - endPrice) < 0.001) {
        return;
    }

    const qFromPrice = p =>
        (p - state.intercept) / state.slope;


    const ghostGroup = g.append("g")
        .attr("class", "ghost-animation");


    const ghostH = ghostGroup.append("line")
        .attr("class", "ghost-proj")
        .attr("opacity", 0.55);


    const ghostDot = ghostGroup.append("circle")
        .attr("class", "ghost-dot")
        .attr("r", 12)
        .attr("opacity", 0.55);


    const priceInterp =
        d3.interpolateNumber(startPrice, endPrice);


    loopGhostAnimation(
        ghostGroup,
        duration,
        "move",

        () => {

            return function(t) {

                const P = priceInterp(t);
                const Q = qFromPrice(P);

                const dotX = xScale(Q);
                const dotY = yScale(P);


                ghostDot
                    .attr("cx", dotX)
                    .attr("cy", dotY);


                ghostH
                    .attr("x1", xScale(0))
                    .attr("y1", dotY)
                    .attr("x2", dotX)
                    .attr("y2", dotY);
            };
        }
    );
}




function animateDemandIntercept(targetIntercept, duration = 2000) {

    stopGhostAnimation();

    const startIntercept = state.demandIntercept;

    if (Math.abs(startIntercept - targetIntercept) < 0.001) {
        return;
    }


    const ghostGroup = g.append("g")
        .attr("class", "ghost-animation");


    const ghostCurve = ghostGroup.append("line")
        .attr("class", "demand-line")
        .attr("opacity", 0.55);


    const interceptInterp =
        d3.interpolateNumber(
            startIntercept,
            targetIntercept
        );


    loopGhostAnimation(
        ghostGroup,
        duration,
        "hint",

        () => {

            return function(t) {

                const intercept =
                    interceptInterp(t);


                const q1 = 0;
                const p1 = intercept;

                const q2 = intercept / 2;
                const p2 = 0;


                ghostCurve
                    .attr("x1", xScale(q1))
                    .attr("y1", yScale(p1))
                    .attr("x2", xScale(q2))
                    .attr("y2", yScale(p2));
            };
        }
    );
}



function animateSupplyIntercept(targetIntercept, duration = 2000) {


    
if (quizQuestions[qIndex].id===3){

}

else{
    stopGhostAnimation();

}

    const startIntercept = state.supplyIntercept;

    if (Math.abs(startIntercept - targetIntercept) < 0.001) {
        return;
    }

    const ghostGroup = g.append("g")
        .attr("class", "ghost-animation");

    const ghostCurve = ghostGroup.append("line")
        .attr("class", "demand-line")
        .attr("opacity", 0.55);

    const interceptInterp = d3.interpolateNumber(
        startIntercept,
        targetIntercept
    );

    loopGhostAnimation(
        ghostGroup,
        duration,
        "hint",

        () => {

            return function(t) {

                const intercept = interceptInterp(t);

                const q1 = 0;
                const p1 = intercept;

                const q2 = 13;
                const p2 = intercept + 2 * q2;

                ghostCurve
                    .attr("x1", xScale(q1))
                    .attr("y1", yScale(p1))
                    .attr("x2", xScale(q2))
                    .attr("y2", yScale(p2));
            };
        }
    );
}



function animatePriceandIntercept(
    targetPrice,
    targetIntercept,
    duration = 2000
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


    const ghostGroup = g.append("g")
        .attr("class", "ghost-animation");


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


    const priceInterp =
        d3.interpolateNumber(
            startPrice,
            targetPrice
        );


    const interceptInterp =
        d3.interpolateNumber(
            startIntercept,
            targetIntercept
        );


    loopGhostAnimation(
        ghostGroup,
        duration,
        "hint",

        () => {

            return function(t) {

                let P;
                let intercept;


                /* -----------------------------------------
                   BOTH PRICE AND INTERCEPT MOVE
                   ----------------------------------------- */

                if (movePrice && moveIntercept) {

                    if (t < 0.5) {

                        // First: move along the curve

                        const u = t * 2;

                        P = priceInterp(u);
                        intercept = startIntercept;

                    } else {

                        // Second: shift the curve

                        const u = (t - 0.5) * 2;

                        P = targetPrice;
                        intercept = interceptInterp(u);
                    }
                }


                /* -----------------------------------------
                   ONLY PRICE MOVES
                   ----------------------------------------- */

                else if (movePrice) {

                    P = priceInterp(t);
                    intercept = startIntercept;
                }


                /* -----------------------------------------
                   ONLY INTERCEPT MOVES
                   ----------------------------------------- */

                else {

                    P = targetPrice;
                    intercept = interceptInterp(t);
                }


                /* -----------------------------------------
                   CALCULATE QUANTITY
                   ----------------------------------------- */

                const Q =
                    (P - intercept) / state.slope;


                const dotX = xScale(Q);
                const dotY = yScale(P);


                /* -----------------------------------------
                   GHOST CURVE
                   ----------------------------------------- */

                ghostCurve
                    .attr("x1", xScale(0))
                    .attr("y1", yScale(intercept))
                    .attr("x2", xScale(Q))
                    .attr("y2", yScale(P));


                /* -----------------------------------------
                   GHOST DOT
                   ----------------------------------------- */

                ghostDot
                    .attr("cx", dotX)
                    .attr("cy", dotY);


                /* -----------------------------------------
                   HORIZONTAL PROJECTION
                   ----------------------------------------- */

                ghostX
                    .attr("x1", dotX)
                    .attr("y1", dotY)
                    .attr("x2", xScale(0))
                    .attr("y2", dotY);


                /* -----------------------------------------
                   VERTICAL PROJECTION
                   ----------------------------------------- */

                ghostY
                    .attr("x1", dotX)
                    .attr("y1", dotY)
                    .attr("x2", dotX)
                    .attr("y2", yScale(0));
            };
        }
    );
}



function animateTwoIntercept(){

    animateDemandIntercept(18)
    animateSupplyIntercept(-2)
}