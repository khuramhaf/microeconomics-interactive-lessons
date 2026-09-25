


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
    "prompt": "Move the graph until Price = $16.",
    "validationState": { "price": 16 },
    "render": renderQuiz,
    "evaluate": evaluateGraph,
    "startAnimation": noHint
  },
   {
    "id": 2,
    "title": "Question 2: Set the Producer Surplus",
    "prompt": "Move the graph until Deadweight Loss = $32.",
    "validationState": { "price": 20 },
    "render": renderQuiz,
    "evaluate": evaluateGraph,
    "startAnimation": noHint
  },
  {
    "id": 3,
    "title": "Question 3: Find the Producer Surplus",
    "prompt": "Set Price = $14. What is the Producer Surplus?",
    "options": ["$8", "$16", "$45", "$36"],
    "correctAnswer": "$45",
    "validationState": { "price": 14 },
    "render": renderQuiz,
    "evaluate": evaluateGraphandOptions,
    "startAnimation": noHint
  },


   {
    "id": 3,
    "title": "Question 3: Find the Consumer Surplus",
    "prompt": "Set Price = $18. What is the Consumer Surplus?",
    "options": ["$8", "$9", "$15", "$36"],
    "correctAnswer": "$9",
    "validationState": { "price": 18 },
    "render": renderQuiz,
    "evaluate": evaluateGraphandOptions,
    "startAnimation": noHint
  },


   {
    "id": 2,
    "title": "Question 2: Find the Deadweight Loss",
    "prompt": "Find the price at which deadweight loss is maximum.",
    "validationState": { "price": 24 },
    "render": renderQuiz,
    "evaluate": evaluateGraph,
    "startAnimation": noHint
  },

   {
    "id": 7,
    "title": "Question 7: Set the Price",
    "prompt": "The graph is currently set at Price = $18. Move the graph until Price = $14. What happens to Deadweight Loss?",
    "options": ["It decreases", "It increases", "It remains the same"],
    "correctAnswer": "It decreases",
    "questionState": {"price": 18},
    "validationState": { "price": 14 },
    "render": renderQuizLock,
    "setState": setState,
    "lockState": lockStateDecrease,
    "evaluate": evaluateGraphandOptions,
    "lockUnlockReset": graphStateLockUnlock,
    "startAnimation": noHint,
    
  },

     {
    "id": 8,
    "title": "Question 8: Set the Price",
    "prompt": "The graph is currently set at Price = $16. Move the graph until Price = $20. What happens to Producer Surplus?",
    "options": ["It increases", "It decreases", "It remains the same"],
    "correctAnswer": "It decreases",
    "questionState": {"price": 16},
    "validationState": { "price": 20 },
    "render": renderQuizLock,
    "setState": setState,
    "lockState": lockStateIncrease,
    "evaluate": evaluateGraphandOptions,
    "lockUnlockReset": graphStateLockUnlock,
    "startAnimation": noHint,
    
  },


     {
    "id": 9,
    "title": "Question 9: Set the Producer Surplus",
    "prompt": "The graph is currently set at Producer Surplus = $45. Move the graph until Producer Surplus = $36. What happens to Price?",
    "options": ["It decreases", "It increases", "It remains the same"],
    "correctAnswer": "It decreases",
    "questionState": {"price": 18},
    "validationState": { "price": 12 },
    "render": renderQuizLock,
    "setState": setState,
    "lockState": lockStateDecrease,
    "evaluate": evaluateGraphandOptions,
    "lockUnlockReset": graphStateLockUnlock,
    "startAnimation": noHint,
    
  },

 {
  "id": 10,
  "title": "Question 10: Non-Binding Price Ceiling",
  "prompt": "The graph is currently at the equilibrium price of $12. Move the price floor to $8. What is the effect on the market?",
  "options": [
    "Consumer Surplus increases",
    "Deadweight Loss increases",
    "No Effect",
    "Producer Surplus decreases"
  ],
  "correctAnswer": "No Effect",
  "questionState": { "price": 12 },
  "validationState": { "price": 8 },
  "render": renderQuizLock,
  "setState": setState,
  "lockState": lockStateDecrease,
  "evaluate": evaluateGraphandOptions,
  "lockUnlockReset": graphStateLockUnlock,
  "startAnimation": noHint
},


  {
    "id": 10,
    "type":true,
    "title": "Question 10: Set the Intercept",
    "prompt": "The graph is currently set at Price = $14. Move the price line in a direction that increases the producer surplus.",
    "questionState": {"price": 14},
    "validationState": { "price":24 },
    "render": renderQuizLock,
    "setState": setState,
    "evaluate": function() { evaluateGraphPlain.call(this, '>'); },
    "lockUnlockReset": resetGraph,
    "startAnimation": noHint,
    
  },


   {
    "id": 10,
    "type":true,
    "title": "Question 10: Set the Intercept",
    "prompt": "The graph is currently set at Price = $12. Move the price line in a direction that increases deadweight Loss.",
    "questionState": {"price": 12},
    "validationState": { "price": 16 },
    "render": renderQuizLock,
    "setState": setState,
    "evaluate": function() { evaluateGraphPlain.call(this, '>'); },
    "lockUnlockReset": resetGraph,
    "startAnimation": noHint,
    
  },
  
  
];

//we can ask something like this mid of the demand curve and base is this height is this what is ps or cs






function setState(newPrice) {

  setFromP(newPrice)
  

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


function graphStateLockUnlock(){

  

  if (graphStateLock===false){

        setState(quizQuestions[qIndex].questionState.price)


   
  }

  else{

  }

}


function resetGraph(){

    if(quizQuestions[qIndex].type){

    setState(quizQuestions[qIndex].questionState.price)

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


function evaluateGraphPlain(operator) {
  const currentPrice = state.P;
  const targetPrice = this.questionState.price;
  
  const isCorrect = operator === '<' 
    ? currentPrice < targetPrice 
    : currentPrice > targetPrice;

  qStatusEl.textContent = isCorrect 
    ? "Answer is ✓ Correct" 
    : "Adjust the graph to match the target";
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
