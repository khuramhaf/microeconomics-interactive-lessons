




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

  const correctAnswer =
    typeof quizQuestions[qIndex].correctAnswer === "function"
        ? quizQuestions[qIndex].correctAnswer()
        : quizQuestions[qIndex].correctAnswer;

  const conditions = {
    isAnswerCorrect: parseFloat(chosenAnswer) === parseFloat(correctAnswer),
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


function evaluateDoubleGraphandOptions(chosenAnswer) {
    const question = quizQuestions[qIndex];

    const correctAnswer =
        typeof question.correctAnswer === "function"
            ? question.correctAnswer()
            : question.correctAnswer;

    const conditions = {
        isPriceCorrect: state.P === question.validationState.price,
        isInterceptCorrect: state.intercept === question.validationState.intercept,
        isAnswerCorrect: parseFloat(chosenAnswer) === parseFloat(correctAnswer),
    };

    // FIXED: Changed isAnswertCorrect to isAnswerCorrect
    const outcomeKey = `${conditions.isPriceCorrect}_${conditions.isInterceptCorrect}_${conditions.isAnswerCorrect}`;

    const outcomeMessages = {
        "true_true_true": "Answer is ✓ Correct",
        "false_true_true": "The price on the graph is incorrect.",
        "true_false_true": "The intercept on the graph is incorrect.",
        "true_true_false": "Please select the correct option.",
        "false_false_true": "The price and intercept on graph are incorrect.",
        "false_true_false": "The Price and selected option are incorrect.", // Note: Your message says intercept, but key implies price is false, intercept is true, answer is false. You might want to double-check this string's text!
        "true_false_false": "The intercept and selected options are incorrect.",
        "false_false_false": "The price, intercept, and selected option are all incorrect."
    };

    qStatusEl.textContent =
        outcomeMessages[outcomeKey] ||
        "The graph or the selected option is incorrect.";
}
