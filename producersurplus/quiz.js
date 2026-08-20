


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
    "prompt": "Move the graph until Price = $6.",
    "validationState": { "price": 6 },
    "render": renderQuiz,
    "evaluate": evaluateGraph,
    "startAnimation": noHint
  },
   {
    "id": 2,
    "title": "Question 2: Set the Producer Surplus",
    "prompt": "Move the graph until Producer Surplus = $49.",
    "validationState": { "consumerSurplus": 49 },
    "render": renderQuiz,
    "evaluate": evaluateGraph,
    "startAnimation": noHint
  },
  {
    "id": 3,
    "title": "Question 3: Find the Producer Surplus",
    "prompt": "Set Price = $8. What is the Producer Surplus?",
    "options": ["$8", "$16", "$70", "$56"],
    "correctAnswer": "$16",
    "validationState": { "price": 8 },
    "render": renderQuiz,
    "evaluate": evaluateGraphandOptions,
    "startAnimation": noHint
  },
  {
    "id": 4,
    "title": "Question 4: Find the Price",
    "prompt": "Set Producer Surplus = $64. What is the Price?",
    "options": ["$18", "$16", "$2", "$10"],
    "correctAnswer": "$16",
    "validationState": { "consumerSurplus": 64 },
    "render": renderQuiz,
    "evaluate": evaluateGraphandOptions,
    "startAnimation": noHint
  },

    {
    "id": 5,
    "title": "Question 5: Find the Base",
    "prompt": "Set Producer Surplus = $49. What is the Base (Quantity)?",
    "options": ["3", "9", "4", "7"],
    "correctAnswer": "7",
    "validationState": { "consumerSurplus": 49 },
    "render": renderQuiz,
    "evaluate": evaluateGraphandOptions,
    "startAnimation": noHint
  },

    {
    "id": 6,
    "title": "Question 6: Find the Height",
    "prompt": "Set Price = $12. What is the Height (Price - YIntercept)?",
    "options": ["3", "12", "4", "7"],
    "correctAnswer": "12",
    "validationState": { "price": 12 },
    "render": renderQuiz,
    "evaluate": evaluateGraphandOptions,
    "startAnimation": noHint
  },
  

   {
    "id": 7,
    "title": "Question 7: Set the Price",
    "prompt": "The graph is currently set at Price = $8. Move the graph until Price = $12. What happens to Producer Surplus?",
    "options": ["It decreases", "It increases", "It remains the same"],
    "correctAnswer": "It increases",
    "questionState": {"price": 8},
    "validationState": { "price": 12 },
    "render": renderQuizLock,
    "setState": setState,
    "lockState": lockStateIncrease,
    "evaluate": evaluateGraphandOptions,
    "startAnimation": noHint,
    
  },

     {
    "id": 8,
    "title": "Question 8: Set the Price",
    "prompt": "The graph is currently set at Price = $16. Move the graph until Price = $12. What happens to Producer Surplus?",
    "options": ["It decreases", "It increases", "It remains the same"],
    "correctAnswer": "It decreases",
    "questionState": {"price": 16},
    "validationState": { "price": 12 },
    "render": renderQuizLock,
    "setState": setState,
    "lockState": lockStateDecrease,
    "evaluate": evaluateGraphandOptions,
    "startAnimation": noHint,
    
  },


     {
    "id": 9,
    "title": "Question 9: Set the Producer Surplus",
    "prompt": "The graph is currently set at Producer Surplus = $9. Move the graph until Producer Surplus = $25. What happens to Price?",
    "options": ["It decreases", "It increases", "It remains the same"],
    "correctAnswer": "It increases",
    "questionState": {"price": 6},
    "validationState": { "price": 10 },
    "render": renderQuizLock,
    "setState": setState,
    "lockState": lockStateIncrease,
    "evaluate": evaluateGraphandOptions,
    "startAnimation": noHint,
    
  },

     {
    "id": 10,
    "title": "Question 10: Set the Producer Surplus",
    "prompt": "The graph is currently set at Producer Surplus = $81. Move the graph until Producer Surplus = $49. What happens to Price?",
    "options": ["It decreases", "It increases", "It remains the same"],
    "correctAnswer": "It decreases",
    "questionState": {"price": 18},
    "validationState": { "price": 14 },
    "render": renderQuizLock,
    "setState": setState,
    "lockState": lockStateDecrease,
    "evaluate": evaluateGraphandOptions,
    "startAnimation": noHint,
    
  },
  
  
];

//we can ask something like this mid of the demand curve and base is this height is this what is ps or cs






function setState(newPrice) {

  // Update model state
  state.P = newPrice;
  state.Q = qtyFromPrice(newPrice);
  state.PS = producerSurplusFromPrice(newPrice);

  renderAll();

}

function lockStateIncrease(){

  if(graphStateLock===true){

  if (state.P < this.questionState.price || state.P > this.validationState.price){

    

setState(this.questionState.price)


  }
  }

  else{


  }


}


function lockStateDecrease(){

  if(graphStateLock===true){

  if (state.P > this.questionState.price || state.P < this.validationState.price){

    

setState(this.questionState.price)


  }
  }

  else{


  }


}


function graphStateLockFun(){

  

  if (graphStateLock===false){

        setState(quizQuestions[qIndex].questionState.price)


   
  }

  else{

  }

}


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
  intercept: 0.05, // Easily add future field tolerances here
  consumerSurplus:0.05
};

// Maps the validation target keys to the current state keys
const STATE_KEY_MAP = {
  price: 'P',
  quantity: 'Q',
  totalRevenue: 'R',
  intercept: 'intercept', // Future-proofed mapping
  consumerSurplus: 'PS'
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
