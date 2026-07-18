


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
    "startAnimation": () => showPriceHint(8)
  },

   {
    "id": 2,
    "title": "Question 2: Find the Equilibrium",
    "prompt": "Find the Equilibrium. What is the Price and Quantity at Equilibrium?",
    "options": ["Price = $2 and Quantity = 5", "Price = $5 and Quantity = 10", "Price = $10 and Quantity = 5", "Price = $3 and Quantity = 9"],
    "correctAnswer": "Price = $10 and Quantity = 5",
    "validationState": { "price": 10 },
    "render": renderQuiz,
    "evaluate": evaluateGraphandOptions,
    "startAnimation": () => showPriceHint(10)
  },
  
  
  
  {
    "id": 3,
    "title": "Question 3: Find the Market Condition",
    "prompt": "Set Price = $14. What is the Market Condition?",
    "options": ["Shortage", "Surplus", "Equilibrium"],
    "correctAnswer": "Surplus",
    "validationState": { "price": 14 },
    "render": renderQuiz,
    "evaluate": evaluateGraphandOptions,
    "startAnimation": () => showPriceHint(14)
  },
  {
    "id": 4,
    "title": "Question 4: Find the Shortage",
    "prompt": "Find the Point where Shortage is exactly 4 Units",
    "validationState": { "price": 6 },
    "render": renderQuiz,
    "evaluate": evaluateGraph,
    "startAnimation": noHint
  },
  {
    "id": 5,
    "title": "Question 5: Find the Sruplus",
    "prompt": "Find the Point where Sruplus is exactly 8 Units",
    "validationState": { "price": 18 },
    "render": renderQuiz,
    "evaluate": evaluateGraph,
    "startAnimation": noHint
  },


   {
    "id": 6,
    "title": "Question 6: Find the Maximam Sruplus",
    "prompt": "Find the Point where Sruplus is Maximam",
    "validationState": { "price": 20 },
    "render": renderQuiz,
    "evaluate": evaluateGraph,
    "startAnimation": noHint
  },


   {
    "id": 7,
    "title": "Question 7: Find the Maximam Sruplus",
    "prompt": "Find the Point where Shortage is Maximam",
    "validationState": { "price": 0 },
    "render": renderQuiz,
    "evaluate": evaluateGraph,
    "startAnimation": noHint
  },

   {
    "id": 8,
    "title": "Question 8: Find the Gap",
    "prompt": "Set the Price = $16. What is the Gap?",
    "options": ["4", "10", "2", "6"],
    "correctAnswer": "6",
    "validationState": { "price": 16 },
    "render": renderQuiz,
    "evaluate": evaluateGraphandOptions,
    "startAnimation": () => showPriceHint(16)
  },
  
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
