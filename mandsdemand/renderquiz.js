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
    return String(getQuantity().toFixed(1));
}

const quizQuestions = [

    {
    "id": 1,
    "title": "Question 1: Find the Intercept",
    "prompt": "Move the graph until Intercept = 22.",
    "validationState": { "intercept": 22 },
    "render": renderQuiz,
    "evaluate": evaluateGraph,
    "startAnimation":  () => animateIntercept(22, 1000)
  },


    {
    "id": 2,
    "title": "Question 2: Find the Intercept",
    "prompt": "Move the graph until Intercept = 14.",
    "validationState": { "intercept": 14 },
    "render": renderQuiz,
    "evaluate": evaluateGraph,
    "startAnimation":  () => animateIntercept(14, 1000)
  },
  
  {
    "id": 3,
    "title": "Question 3: Find the Quantity",
    "prompt": "Set Price = $14. What is the quantity demanded?",
    "options": generateQuantityOptions,
    "correctAnswer": getQuantityString,
    "validationState": { "price": 14 },
    "render": renderQuiz,
    "evaluate": evaluateGraphandOptions,
    "startAnimation": () => animatePriceChange(14, 2000)
  },
{
  id: 4,
  title: "Question 4: Find the Quantity",
  prompt: "Set Price = $8 and Intercept = 24. What is the Quantity Demanded?",
  options: ["4", "6", "8", "10"],
  correctAnswer: "8",
  validationState: {
    price: 8,
    intercept: 24
  },
  render: renderQuiz,
  evaluate: evaluateDoubleGraphandOptions,
  startAnimation: () => animatePriceandIntercept(8, 24, 2000)
},

{
  id: 5,
  title: "Question 5: Find the Quantity",
  prompt: "Set Price = $6 and Intercept = 16. What is the Quantity Demanded?",
  options: ["12", "6", "5", "2"],
  correctAnswer: "5",
  validationState: {
    price: 6,
    intercept: 16
  },
  render: renderQuiz,
  evaluate: evaluateDoubleGraphandOptions,
  startAnimation: () => animatePriceandIntercept(6, 16, 2000)
}
  
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
    const correctQty = Number(getQuantity().toFixed(1));
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