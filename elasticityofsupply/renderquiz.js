let qIndex = 0;
/* ==========================================================
   quiz.js
   Quiz content (quizQuestions) + evaluator functions + panel rendering.

   WHY THIS IS ONE FILE (not split into "data" vs "logic"):
   quizQuestions below references renderQuiz/evaluateGraphOnly/etc. by
   name BEFORE they're written further down. That only works because
   function declarations are hoisted within a single script file. If
   this array and those functions were split across two separate
   <script> files, the array would throw "not defined" the moment the
   page loads — the exact bug this whole refactor was meant to remove.
   Keeping them together keeps that hoisting safe and visible.

   REQUIRES: model.js (state), validation.js (checkStateValidation,
   checkOptionAnswer), ghost.js (stopGhostAnimation, animateGhostPrice/
   Quantity/Both).
   ========================================================== */

      function getQuantityString() {
    return String(state.eqQ.toFixed(1));
}


     function getPriceString() {
    return String(state.eqP.toFixed(1));
}



function noHint()
{

if(this.id === 4){
qStatusEl.textContent = "Drag the Dot on the Graph to reach the Price = 12";
}


else if(this.id === 5){
qStatusEl.textContent = "Drag the Dot on the Graph to reach the Quantity = 8";
}


else if(this.id===6){
qStatusEl.textContent = "Drag the Dot on the Graph to reach the Price = 14 and Quantity = 4";
}

else{

  qStatusEl.textContent = "No Hint available";

}

  
}

const quizQuestions = [

   {
    "id": 1,
    "title": "Question 1: Find the Quantity",
    "prompt": "Set Demand Intercept = 24. What is the equilibrium quantity?",
    "options": generateQuantityOptions,
    "correctAnswer": getQuantityString,
    "validationState": { "demandIntercept": 24 },
    "render": renderQuiz,
    "evaluate": evaluateGraphandOptions,
    "startAnimation": () => animateDemandIntercept(24, 2000)
  },


     {
    "id": 2,
    "title": "Question 2: Find the Price",
    "prompt": "Set Supply Intercept = 4. What is the equilibrium price?",
    "options": generatePriceOptions,
    "correctAnswer": getPriceString,
    "validationState": { "supplyIntercept": 4 },
    "render": renderQuiz,
    "evaluate": evaluateGraphandOptions,
    "startAnimation": () => animateSupplyIntercept(4, 2000)
  },


  {
    "id": 3,
    "title": "Question 3: Find the Price and Quantity",
    "prompt": "Set Demand Intercept = 18. Set the Supply Intercept = 1 on Quantity axis What is the equilibrium price and quantity?",
    "options": ["Price = 5 and Quantity = 5", "Price = 2 and Quantity = 7", "Price = 8 and Quantity = 5", "Price = 24 and Quantity = 10"],
    "correctAnswer": "Price = 8 and Quantity = 5",
    "validationState": { "demandIntercept":18, "supplyIntercept": -2 },
    "render": renderQuiz,
    "evaluate": evaluateDoubleGraphandOptions,
    "startAnimation": noHint
  },


    {
    "id": 4,
    "title": "Question 4: Find the Price",
    "prompt": "Set graph where Equilibrium Price = $12",
    "validationState": { "price":12 },
    "render": renderQuiz,
    "evaluate": evaluateGraph,
    "startAnimation": noHint
  },


     {
    "id": 5,
    "title": "Question 5: Find the Quantity",
    "prompt": "Set graph where Equilibrium Quantity = 8",
    "validationState": { "quantity":8 },
    "render": renderQuiz,
    "evaluate": evaluateGraph,
    "startAnimation": noHint
  },


    {
    "id": 6,
    "title": "Question 6: Find the Price and Quantity",
    "prompt": "Set graph where Equilibrium Price = 14 and Equilibrium Quantity = 4",
    "validationState": { "price": 14, "quantity": 4 },
    "render": renderQuiz,
    "evaluate": evaluateDoubleGraph,
    "startAnimation": noHint
  },



   
];


















const qTextEl = document.getElementById("q-text");
const qOptionsEl = document.getElementById("q-options");
const qStatusEl = document.getElementById("q-status");
const qIndexEl = document.getElementById("q-index");
const qPrevBtn = document.getElementById("q-prev");
const qNextBtn = document.getElementById("q-next");

// 1. Build a single action row that holds Hint (left) + Check Answer (right).
const qActionRow = document.createElement("div");
qActionRow.className = "quiz-action-row";

const qCheckBtn = document.createElement("button");
qCheckBtn.id = "q-check";
qCheckBtn.className = "primary";
qCheckBtn.textContent = "Check Answer";




const qHintBtn = document.createElement("button");
qHintBtn.id = "q-hint-animation";
qHintBtn.className = "primary";
qHintBtn.textContent = "Hint";

qHintBtn.style.backgroundColor="red"

qActionRow.appendChild(qHintBtn); 

qHintBtn.addEventListener("click", () => {
  if (quizQuestions[qIndex].startAnimation && typeof quizQuestions[qIndex].startAnimation === "function") {
    quizQuestions[qIndex].startAnimation();
  }
});
qActionRow.appendChild(qCheckBtn); // right side

// Insert the action row right after the status container in the DOM hierarchy
qStatusEl.parentNode.insertBefore(qActionRow, qStatusEl.nextSibling);

// 2. Add click listener to the Check Answer button
qCheckBtn.addEventListener("click", () => {
  const q = quizQuestions[qIndex];
  if (q.evaluate) {

     
    
    q.evaluate(qCheckBtn.dataset.selectedAnswer); // pass both if evaluate needs them
  }
});


/* ---------- render the current question into the quiz panel ---------- */
function renderQuiz() {
  if (!quizQuestions || !quizQuestions.length) return;
  
  // Clear any leftover data from the previous question
  qCheckBtn.dataset.selectedAnswer = "none";
  qTextEl.textContent = this.prompt;
  qIndexEl.textContent = `Task ${qIndex + 1} of ${quizQuestions.length}`;
  qPrevBtn.disabled = qIndex === 0;
  qNextBtn.disabled = qIndex === quizQuestions.length - 1;

  // Clear previous options
  qOptionsEl.innerHTML = "";
  
  // Reset UI elements to an empty/neutral state for the new question
  qStatusEl.textContent = "";
  qStatusEl.className = "quiz-status";
  
  const options =
    typeof this.options === "function"
        ? this.options()
        : this.options;

  if (options) {
    options.forEach(opt => {
      const btn = document.createElement("button");
      btn.className = "opt-btn";
      btn.textContent = opt;
      btn.addEventListener("click", (event) => {
  [...qOptionsEl.children].forEach(b => b.style.backgroundColor = "white");
  btn.style.backgroundColor = "lightgray";
  qCheckBtn.dataset.selectedAnswer = event.target.textContent;// fix: selectedAnswer, not correctAnswer


});
      qOptionsEl.appendChild(btn);
    });
  }
}


function generateQuantityOptions() {
    const correctQty = Number(state.eqQ.toFixed(1));
    const options = new Set();
    options.add(correctQty);

    let attempts = 0;
    while (options.size < 4 && attempts < 100) {
        // Generates a random decimal offset between -4.0 and +4.0
        let offset = (Math.random() * 8) - 4; 

        // Avoid an offset of practically zero to ensure we get a different number
        if (Math.abs(offset) < 0.1) continue;

        // Add the offset and round it strictly to 1 decimal place
        const qty = Number((correctQty + offset).toFixed(1));

        if (qty >= 0) {
            options.add(qty);
        }
        
        attempts++; 
    }

    // Fallback: If we still need options, increment by random decimal steps
    while (options.size < 4) {
        let fallbackOffset = Math.random() * 5 + 1; // Random step between 1.0 and 6.0
        options.add(Number((correctQty + fallbackOffset).toFixed(1)));
    }

    // Shuffle and return
    return [...options].sort(() => Math.random() - 0.5);
}




function generatePriceOptions() {
    const correctQty = Number(state.eqP.toFixed(1));
    const options = new Set();
    options.add(correctQty);

    let attempts = 0;
    while (options.size < 4 && attempts < 100) {
        // Generates a random decimal offset between -4.0 and +4.0
        let offset = (Math.random() * 8) - 4; 

        // Avoid an offset of practically zero to ensure we get a different number
        if (Math.abs(offset) < 0.1) continue;

        // Add the offset and round it strictly to 1 decimal place
        const qty = Number((correctQty + offset).toFixed(1));

        if (qty >= 0) {
            options.add(qty);
        }
        
        attempts++; 
    }

    // Fallback: If we still need options, increment by random decimal steps
    while (options.size < 4) {
        let fallbackOffset = Math.random() * 5 + 1; // Random step between 1.0 and 6.0
        options.add(Number((correctQty + fallbackOffset).toFixed(1)));
    }

    // Shuffle and return
    return [...options].sort(() => Math.random() - 0.5);
}

/* ---------- nav buttons ---------- */
qPrevBtn.addEventListener("click", () => {
  if (qIndex > 0) { qIndex--; quizQuestions[qIndex].render(); }
});
qNextBtn.addEventListener("click", () => {
  if (qIndex < quizQuestions.length - 1) { qIndex++; quizQuestions[qIndex].render(); }
});