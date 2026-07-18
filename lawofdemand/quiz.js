


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

const quizQuestions = [
  
  {
    "id": 1,
    "title": "Question 1: Set the Price",
    "prompt": "Move the graph until Price = $8.",
    "validationState": { "price": 8 },
    "render": renderQuiz,
    "evaluate": evaluateGraph,
    "startAnimation": animateGhostPrice
  },
   {
    "id": 2,
    "title": "Question 2: Set the Quantity",
    "prompt": "Move the graph until Quantity = 9.",
    "validationState": { "quantity": 9 },
    "render": renderQuiz,
    "evaluate": evaluateGraph,
    "startAnimation": animateGhostQuantity
  },
  {
    "id": 3,
    "title": "Question 3: Find the Quantity",
    "prompt": "Set Price = $14. What is the quantity demanded?",
    "options": ["2", "3", "5", "6"],
    "correctAnswer": "3",
    "validationState": { "price": 14 },
    "render": renderQuiz,
    "evaluate": evaluateGraphandOptions,
    "startAnimation": animateGhostPrice
  },
  {
    "id": 4,
    "title": "Question 4: Find the Price",
    "prompt": "Set Quantity = 7. What is the price?",
    "options": ["$4", "$6", "$8", "$10"],
    "correctAnswer": "$6",
    "validationState": { "quantity": 7 },
    "render": renderQuiz,
    "evaluate": evaluateGraphandOptions,
    "startAnimation": animateGhostQuantity
  },
  {
    "id": 5,
    "title": "Question 5: Highest Price",
    "prompt": "Find the price intercept (highest possible price) on the demand curve. What is the quantity demanded at this point?",
    "options": ["0", "2", "4", "6"],
    "correctAnswer": "0",
    "validationState": { "price": 20 },
    "render": renderQuiz,
    "evaluate": evaluateGraphandOptions,
    "startAnimation": animateGhostPrice
  },
  {
    "id": 6,
    "title": "Question 6: Highest Quantity",
    "prompt": "Move the graph until Quantity = 10. What is the Price.",
    "options": ["5", "0", "8", "10"],
    "correctAnswer": "0",
    "validationState": { "quantity": 10 },
    "render": renderQuiz,
    "evaluate": evaluateGraphandOptions,
    "startAnimation": animateGhostQuantity
  },
  {
    "id": 7,
    "title": "Question 7: Revenue Challenge",
    "prompt": "Can you find a point where Total Revenue = $32?",
    "validationState": { "totalRevenue": 32 },
    "render": renderQuiz,
    "evaluate": evaluateGraph,
    "startAnimation": animateGhostBoth
  },
  {
    "id": 8,
    "title": "Question 8: Find the Point",
    "prompt": "Find the point on Graph where Price = $10, Quantity = 5, and Total Revenue = $50.",
    "validationState": { "price": 10, "quantity": 5 },
    "render": renderQuiz,
    "evaluate": evaluateGraph,
    "startAnimation": animateGhostBoth
  },
  {
    "id": 9,
    "title": "Question 9: Find the Revenue",
    "prompt": "Set Quantity = 7. What is the Revenue?",
    "options": ["$50", "$30", "$42", "$10"],
    "correctAnswer": "$42",
    "validationState": { "quantity": 7 },
    "render": renderQuiz,
    "evaluate": evaluateGraphandOptions,
    "startAnimation": animateGhostQuantity
  },
  {
    "id": 10,
    "title": "Question 10: Maximum Revenue",
    "prompt": "Move the graph until Total Revenue is as high as possible.",
    "validationState": { "totalRevenue": 50 },
    "render": renderQuiz,
    "evaluate": evaluateGraph,
    "startAnimation": animateGhostBoth
  },
  {
    "id": 11,
    "title": "Question 11: Prediction",
    "prompt": "If price increases, what happens to quantity demanded?",
    "options": ["Quantity increases", "Quantity decreases", "Quantity stays the same"],
    "correctAnswer": "Quantity decreases",
    "render": renderQuiz,
    "evaluate": evaluateOptions,
    "startAnimation": noHint
  },
  {
    "id": 12,
    "title": "Question 12: Prediction",
    "prompt": "If price decreases, what happens to quantity demanded?",
    "options": ["Quantity increases", "Quantity decreases", "Quantity stays the same"],
    "correctAnswer": "Quantity increases",
    "render": renderQuiz,
    "evaluate": evaluateOptions,
    "startAnimation": noHint
  },
  {
    "id": 13,
    "title": "Question 13: Use the Equation",
    "prompt": "Using the equation P = 20 − 2Q If Price (P) = 4, what is the value of Quantity (Q)?",
    "options": ["Q = 4", "Q = 6", "Q = 8", "Q = 12"],
    "correctAnswer": "Q = 8",
    "render": renderQuiz,
    "evaluate": evaluateOptions,
    "startAnimation": noHint
  },
  {
    "id": 14,
    "title": "Question 14: Use the Equation",
    "prompt": "Using the equation P = 20 − 2Q If Quantity (Q) = 6, what is the value of Price (P)?",
    "options": ["P = $6", "P = $8", "P = $10", "P = $12"],
    "correctAnswer": "P = $8",
    "render": renderQuiz,
    "evaluate": evaluateOptions,
    "startAnimation": noHint
  },
  {
    "id": 15,
    "title": "Question 15: Direct Demand Equation",
    "prompt": "The inverse demand equation is P = 20 − 2Q Which of the following is the Direct Demand Equation?",
    "options": ["Q = 20 − 2P", "Q = 10 − 0.5P", "Q = 20 + 2P", "Q = 2P − 20"],
    "correctAnswer": "Q = 10 − 0.5P",
    "render": renderQuiz,
    "evaluate": evaluateOptions,
    "startAnimation": noHint
  },
  {
    "id": 16,
    "title": "Question 16: Inverse Demand Equation",
    "prompt": "The direct demand equation is Q = 10 − 0.5P Which of the following is the Inverse Demand Equation?",
    "options": ["P = 20 − 2Q", "P = 10 − 0.5Q", "P = 2Q − 20", "P = 20 + 2Q"],
    "correctAnswer": "P = 20 − 2Q",
    "render": renderQuiz,
    "evaluate": evaluateOptions,
    "startAnimation": noHint
  }
];


function noHint()
{

  qStatusEl.textContent = "No Animated Hint is available";
}

/* ==========================================================
   validation.js
   Pure "is the target met" logic. No DOM references — could be
   unit-tested standalone. Explicit per-field checks (rather than
   a generic key-loop) so adding a new field like "intercept" is
   just one more clearly-shaped block, not a lookup-table edit.
   REQUIRES: nothing. Loads before graph.js/ghost.js/quiz.js.
   ========================================================== */

const VALIDATION_TOLERANCE = {
  price: 0.05,
  quantity: 0.05,
  totalRevenue: 0.5,
  intercept: 0.05 // Easily add future field tolerances here
};

// Maps the validation target keys to the current state keys
const STATE_KEY_MAP = {
  price: 'P',
  quantity: 'Q',
  totalRevenue: 'R',
  intercept: 'intercept' // Future-proofed mapping
};


function checkStateValidation(question, state) {
  const target = question.validationState;
  if (!target) return null;

  // Loop through defined targets dynamically to avoid repetitive if-statements
  for (const [key, targetValue] of Object.entries(target)) {
    if (targetValue !== undefined && VALIDATION_TOLERANCE[key] !== undefined) {
      const stateKey = STATE_KEY_MAP[key];
      if (Math.abs(state[stateKey] - targetValue) > VALIDATION_TOLERANCE[key]) {
        return false;
      }
    }
  }
  return true;
}


function evaluateGraph(){

  const stateMatch= checkStateValidation(this, state)

  if (stateMatch){

    qStatusEl.textContent = "Answer is ✓ Correct";

  }


  else{

    qStatusEl.textContent = "Adjust the graph to match the target";
  }
}


function evaluateOptions(chosenAnswer) {

 
  if(chosenAnswer ===this.correctAnswer){

    qStatusEl.textContent = "Answer is ✓ Correct";
  }

  else{

    qStatusEl.textContent = "Select the right opiton";
  }
}

function evaluateGraphandOptions(chosenAnswer) {
  // 1. Evaluate all your independent conditions (your "options")
  const conditions = {
    isAnswerCorrect: chosenAnswer === this.correctAnswer,
    isStateValid: checkStateValidation(this, state),
    // Future options can be added right here easily:
    // isOption3Valid: checkOption3(this), 
  };

  // 2. Convert the conditions into a standardized string key (e.g., "true_false")
  // This order must match how you plan to map them below.
  const outcomeKey = `${conditions.isAnswerCorrect}_${conditions.isStateValid}`;

  // 3. Define the map of outcomes to messages
  // This makes it incredibly easy to add or change messages in the future.
  const outcomeMessages = {
    "true_true": "Answer is ✓ Correct",
    "false_true": "The selected option is incorrect.",
    "true_false": "The graph state is incorrect.",
    "false_false": "Both the graph and the selected option are incorrect."
  };

  // 4. Fallback message if a combination isn't explicitly defined
  const defaultMessage = "The graph or the selected option is incorrect.";

  // 5. Apply the text to the element
  qStatusEl.textContent = outcomeMessages[outcomeKey] || defaultMessage;
}
