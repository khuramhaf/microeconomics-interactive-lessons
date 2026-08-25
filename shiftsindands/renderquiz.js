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


  {
    "id": 7,
    "title": "Question 7: Set the Intercept",
    "prompt": "The demand intercept is currently 18. Move the demand intercept until it reaches 22. What happens to equilibrium price and quantity?",
    "options": ["Price increases, Quantity decreases", "Price decreases, Quantity increases", "Price increases, Quantity increases", "Price decreases, Quantity decreases"],
    "correctAnswer": "Price increases, Quantity increases",
    "questionState": { "demandIntercept": 18 },
    "validationState": { "demandIntercept": 22 },
    "type": "demandIntercept",
    "render": renderQuizLock,
    "setState": function(val) { setStateIntercept(this.questionState); },
    "lockState": lockStateIntercept,
    "evaluate": evaluateGraphandOptions,
    "startAnimation": noHint
  },
    {
    "id": 8,
    "title": "Question 8: Set the Intercept",
    "prompt": "The demand intercept is currently 24. Move the demand intercept until it reaches 20. What happens to equilibrium price and quantity?",
    "options": ["Price increases, Quantity decreases", "Price decreases, Quantity increases", "Price increases, Quantity increases", "Price decreases, Quantity decreases"],
    "correctAnswer": "Price decreases, Quantity decreases",
    "questionState": { "demandIntercept": 24 },
    "validationState": { "demandIntercept": 20 },
    "type": "demandIntercept",
    "render": renderQuizLock,
    "setState": function(val) { setStateIntercept(this.questionState); },
    "lockState": lockStateIntercept,
    "evaluate": evaluateGraphandOptions,
    "startAnimation": noHint
  },
  {
    "id": 9,
    "title": "Question 9: Set the Intercept",
    "prompt": "The supply intercept is currently 2 on price axis. Move the supply intercept until it reaches 6 on price axis. What happens to equilibrium price and quantity?",
    "options": ["Price increases, Quantity decreases", "Price decreases, Quantity increases", "Price increases, Quantity increases", "Price decreases, Quantity decreases"],
    "correctAnswer": "Price increases, Quantity decreases",
    "questionState": { "supplyIntercept": 2 },
    "validationState": { "supplyIntercept": 6 },
    "type": "supplyIntercept",
    "render": renderQuizLock,
    "setState": function(val) { setStateIntercept(this.questionState); },
    "lockState": lockStateIntercept,
    "evaluate": evaluateGraphandOptions,
    "startAnimation": noHint
  },


    {
    "id": 10,
    "title": "Question 10: Set the Intercept",
    "prompt": "The supply intercept is currently 1 on quantity axis. Move the supply intercept until it reaches 2 on quantity axis. What happens to equilibrium price and quantity?",
    "options": ["Price increases, Quantity decreases", "Price decreases, Quantity increases", "Price increases, Quantity increases", "Price decreases, Quantity decreases"],
    "correctAnswer": "Price decreases, Quantity increases",
    "questionState": { "supplyIntercept": -2 },
    "validationState": { "supplyIntercept": -4 },
    "type": "supplyIntercept",
    "render": renderQuizLock,
    "setState": function(val) { setStateIntercept(this.questionState); },
    "lockState": lockStateIntercept,
    "evaluate": evaluateGraphandOptions,
    "startAnimation": noHint
  },




  {
  "id": 11,
  "title": "Question 11: Set the Intercept",
  "prompt": "Move the demand intercept to 24 and the supply intercept to 2 on quantity axis. What happens to equilibrium price and quantity?",
  "options": [
    "Price increases, Quantity decreases",
    "Price decreases, Quantity increases",
    "Price remains same, Quantity decreases",
    "Price remains same, Quantity increases"
  ],
  "correctAnswer": "Price remains same, Quantity increases",
  "questionState": { 
    "demandIntercept": 20, 
    "supplyIntercept": 0 
  },
  "validationState": { 
    "demandIntercept": 24, 
    "supplyIntercept": -4 
  },
  "render": renderQuizLock,
  "setState": (val) => setStateIntercept(val),
  "lockState": lockStateIntercept,
  "evaluate": evaluateDoubleGraphandOptions,
  "startAnimation": noHint
},




  {
  "id": 12,
  "title": "Question 12: Set the Intercept",
  "prompt": "Move the demand intercept to 20 and the supply intercept to 4 on price axis. What happens to equilibrium price and quantity?",
  "options": [
    "Price increases, Quantity decreases",
    "Price decreases, Quantity increases",
    "Price remains same, Quantity decreases",
    "Price decreases, Quantity remains same"
  ],
  "correctAnswer": "Price remains same, Quantity decreases",
  "questionState": { 
    "demandIntercept": 24, 
    "supplyIntercept": 0 
  },
  "validationState": { 
    "demandIntercept": 20, 
    "supplyIntercept": 4 
  },
  "render": renderQuizLock,
  "setState": (val) => setStateIntercept(val),
  "lockState": lockStateIntercept,
  "evaluate": evaluateDoubleGraphandOptions,
  "startAnimation": noHint
},




 {
  "id": 13,
  "title": "Question 12: Set the Intercept",
  "prompt": "Move the demand intercept to 16 and the supply intercept to 2 on quantity axis. What happens to equilibrium price and quantity?",
  "options": [
    "Price increases, Quantity decreases",
    "Price decreases, Quantity increases",
    "Price remains same, Quantity decreases",
    "Price decreases, Quantity remains same"
  ],
  "correctAnswer": "Price decreases, Quantity remains same",
  "questionState": { 
    "demandIntercept": 20, 
    "supplyIntercept": 0 
  },
  "validationState": { 
    "demandIntercept": 16, 
    "supplyIntercept": -4 
  },
  "render": renderQuizLock,
  "setState": (val) => setStateIntercept(val),
  "lockState": lockStateIntercept,
  "evaluate": evaluateDoubleGraphandOptions,
  "startAnimation": noHint
},
    


{
  "id": 14,
  "title": "Question 14: Set the Intercept",
  "prompt": "Move the demand intercept to 24 and the supply intercept to 4 on price axis. What happens to equilibrium price and quantity?",
  "options": [
    "Price increases, Quantity decreases",
    "Price increases, Quantity remains same",
    "Price remains same, Quantity decreases",
    "Price decreases, Quantity remains same"
  ],
  "correctAnswer": "Price increases, Quantity remains same",
  "questionState": { 
    "demandIntercept": 20, 
    "supplyIntercept": 0 
  },
  "validationState": { 
    "demandIntercept": 24, 
    "supplyIntercept": 4
  },
  "render": renderQuizLock,
  "setState": (val) => setStateIntercept(val),
  "lockState": lockStateIntercept,
  "evaluate": evaluateDoubleGraphandOptions,
  "startAnimation": noHint
}
    



   
];



// Helper dictionary mapping keys to their corresponding state update functions
const interceptSetters = {
  demandIntercept: setDemandIntercept,
  supplyIntercept: setSupplyIntercept
};

// 1. Generalized setState to handle single or multiple values
function setStateIntercept(typeOrObject, newIntercept) {
  // If an object is passed, update all keys in it (e.g., { demandIntercept: 24, supplyIntercept: 10 })
  if (typeof typeOrObject === "object" && typeOrObject !== null) {
    Object.keys(typeOrObject).forEach((key) => {
      if (interceptSetters[key]) {
        interceptSetters[key](typeOrObject[key]);
      }
    });
  } 
  // If string type and value are passed (e.g., "demandIntercept", 24)
  else if (typeof typeOrObject === "string" && interceptSetters[typeOrObject]) {
    interceptSetters[typeOrObject](newIntercept);
  }
  
  renderAll();
}

// 2. Generalized lockState for single or dual intercepts
function lockStateIntercept() {
  if (!graphStateLock) return;

  // Check every intercept key present in the question state
  Object.keys(this.questionState).forEach((key) => {
    if (this.validationState[key] !== undefined) {
      const currentVal = state[key];
      const qVal = this.questionState[key];
      const vVal = this.validationState[key];

      const isIncreasing = qVal < vVal;

      if (isIncreasing) {
        if (currentVal < qVal || currentVal > vVal) {
          setStateIntercept(key, qVal);
        }
      } else {
        if (currentVal > qVal || currentVal < vVal) {
          setStateIntercept(key, qVal);
        }
      }
    }
  });
}

// 3. Generalized graphStateLock function
function graphStateLockFun() {
  if (!graphStateLock) {
    const currentQuestion = quizQuestions[qIndex];
    if (currentQuestion.questionState) {
      setStateIntercept(currentQuestion.questionState);
    }
  }
}






function noHint()
{

  qStatusEl.textContent = "No Animated Hint is available";
}




















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




var graphStateLock = true;

const qGraphLockBtn = document.createElement("button");
qGraphLockBtn.id = "q-graph-lock";
qGraphLockBtn.className = "primary";
qGraphLockBtn.style.backgroundColor = 'green';
qGraphLockBtn.textContent = graphStateLock ? "Unlock Graph" : "Lock Graph";

qGraphLockBtn.addEventListener("click", () => {
  graphStateLockFun();

  graphStateLock = !graphStateLock;
  qGraphLockBtn.textContent = graphStateLock ? "Unlock Graph" : "Lock Graph";
});


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


    if (qGraphLockBtn.parentNode === qActionRow) {
    qActionRow.removeChild(qGraphLockBtn);
  }
  
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




function renderQuizLock() {


   qActionRow.appendChild(qGraphLockBtn);
  qGraphLockBtn.textContent = graphStateLock ? "Unlock Graph" : "Lock Graph";
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
    options.add(correctQty.toFixed(1));

    let attempts = 0;
    while (options.size < 4 && attempts < 100) {
        // Generates a random decimal offset between -4.0 and +4.0
        let offset = (Math.random() * 8) - 4; 

        // Avoid an offset of practically zero to ensure we get a different number
        if (Math.abs(offset) < 0.1) continue;

        // Add the offset and round it strictly to 1 decimal place
        const qty = Number((correctQty + offset).toFixed(1));

        if (qty >= 0) {
            options.add(qty.toFixed(1));
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
// Safely extracts starting intercept value, or returns null if none exists
function getInitialInterceptValue(question) {
  const stateObj = question.questionState;
  if (!stateObj) return null;

  if ("demandIntercept" in stateObj) return stateObj.demandIntercept;
  if ("supplyIntercept" in stateObj) return stateObj.supplyIntercept;

  return null;
}

/* ---------- Navigation Buttons ---------- */
qPrevBtn.addEventListener("click", () => {
  if (qIndex > 0) {
    qIndex--;
    graphStateLock = true;
    const currentQuestion = quizQuestions[qIndex];

    if (currentQuestion.questionState) {
      currentQuestion.setState?.(currentQuestion.questionState);
    }

    currentQuestion.render();
  }
});

qNextBtn.addEventListener("click", () => {
  if (qIndex < quizQuestions.length - 1) {
    qIndex++;
    graphStateLock = true;
    const currentQuestion = quizQuestions[qIndex];

    if (currentQuestion.questionState) {
      currentQuestion.setState?.(currentQuestion.questionState);
    }

    currentQuestion.render();
  }
});


//eik type ye b ho sakti hay k sirf less than par lock ho greater than par lock na ho. yani sirf kahan jaye k price ko aisa set karo jahan quantity decrease ho.