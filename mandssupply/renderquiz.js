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
    "prompt": "Move the graph until Intercept = 2 on quantity axis.",
    "validationState": { "intercept": -4 },
    "render": renderQuiz,
    "evaluate": evaluateGraph,
    "startAnimation":  () => animateIntercept(-4, 1000)
  },


    {
    "id": 2,
    "title": "Question 2: Find the Intercept",
    "prompt": "Move the graph until Intercept = 6 on price axis",
    "validationState": { "intercept": 6 },
    "render": renderQuiz,
    "evaluate": evaluateGraph,
    "startAnimation":  () => animateIntercept(6, 1000)
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
  prompt: "Set Price = $10 and Intercept = 2 on quantity axis. What is the Quantity Demanded?",
  options: ["4", "6", "7", "10"],
  correctAnswer: "7",
  validationState: {
    price: 10,
    intercept: -4
  },
  render: renderQuiz,
  evaluate: evaluateDoubleGraphandOptions,
  startAnimation: () => animatePriceandIntercept(10, -4, 2000)
},

{
  id: 5,
  title: "Question 5: Find the Quantity",
  prompt: "Set Price = $12 and Intercept = 4 on the price axis. What is the Quantity Demanded?",
  options: ["12", "4", "5", "2"],
  correctAnswer: "4",
  validationState: {
    price: 12,
    intercept: 4
  },
  render: renderQuiz,
  evaluate: evaluateDoubleGraphandOptions,
  startAnimation: () => animatePriceandIntercept(12, 4, 2000)
},


 {
    "id": 6,
    "title": "Question 6: Set the Intercept",
    "prompt": "The graph is currently set at Intercept = 2 on price axis. Move the graph until Intercept = 4 on price axis. What happens to Price?",
    "options": ["It decreases", "It increases", "It remains the same"],
    "correctAnswer": "It remains the same",
    "questionState": {"intercept": 2},
    "validationState": { "intercept": 4 },
    "render": renderQuizLock,
    "setState": setState,
    "lockState": lockStateIncrease,
    "evaluate": evaluateGraphandOptions,
    "lockUnlockReset": graphStateLockUnlock,
    "startAnimation": noHint,
    
  },

  {
    "id": 7,
    "title": "Question 7: Set the Intercept",
    "prompt": "The graph is currently set at Intercept = 2 on quantity axis. Move the graph until Intercept = 3 on quantity axis. What happens to Price?",
    "options": ["It decreases", "It increases", "It remains the same"],
    "correctAnswer": "It remains the same",
    "questionState": {"intercept": -4},
    "validationState": { "intercept": -6 },
    "render": renderQuizLock,
    "setState": setState,
    "lockState": lockStateDecrease,
    "evaluate": evaluateGraphandOptions,
    "lockUnlockReset": graphStateLockUnlock,
    "startAnimation": noHint,
    
  },



 {
    "id": 8,
    "title": "Question 8: Set the Intercept",
    "prompt": "The graph is currently set at Intercept = 0. Move the graph until Intercept = 4 on price axis. What happens to Quantity Supplied?",
    "options": ["It decreases", "It increases", "It remains the same"],
    "correctAnswer": "It decreases",
    "questionState": {"intercept": 0},
    "validationState": { "intercept": 4 },
    "render": renderQuizLock,
    "setState": setState,
    "lockState": lockStateIncrease,
    "evaluate": evaluateGraphandOptions,
    "lockUnlockReset": graphStateLockUnlock,
    "startAnimation": noHint,
    
  },


  {
    "id": 9,
    "title": "Question 9: Set the Intercept",
    "prompt": "The graph is currently set at Intercept = 0. Move the graph until Intercept = 2 on quantity axis. What happens to Quantity Supplied?",
    "options": ["It decreases", "It increases", "It remains the same"],
    "correctAnswer": "It increases",
    "questionState": {"intercept": 0},
    "validationState": { "intercept": -4 },
    "render": renderQuizLock,
    "setState": setState,
    "lockState": lockStateDecrease,
    "evaluate": evaluateGraphandOptions,
    "lockUnlockReset": graphStateLockUnlock,
    "startAnimation": noHint,
    
  },


   {
    "id": 10,
    "title": "Question 10: Set the Intercept",
    "prompt": "The graph is currently set at Intercept = 2 on price axis. Move the graph until Intercept = 6 on price axis. What does this change represent?",
    "options": ["Movement along the Supply Curve", "Shift in Supply Curve", "None of above"],
    "correctAnswer": "Shift in Demand Curve",
    "questionState": {"intercept": 2},
    "validationState": { "intercept": 6 },
    "render": renderQuizLock,
    "setState": setState,
    "lockState": lockStateIncrease,
    "evaluate": evaluateGraphandOptions,
    "lockUnlockReset": graphStateLockUnlock,
    "startAnimation": noHint,
    
  },


   {
    "id": 10,
    "type":true,
    "title": "Question 10: Set the Intercept",
    "prompt": "The graph is currently set at Intercept = 0. Move the intercept in the direction that increases quantity supplied while keeping price unchanged.",
    "questionState": {"intercept": 0},
    "validationState": { "intercept": -6 },
    "render": renderQuizLock,
    "setState": setState,
    "evaluate": function() { evaluateGraphPlain.call(this, '<'); },
    "lockUnlockReset": resetGraph,
    "startAnimation": noHint,
    
  },


    {
    "id": 10,
    "type":true,
    "title": "Question 10: Set the Intercept",
    "prompt": "The graph is currently set at Intercept = 0. Move the intercept in the direction that decreases quantity supplied while keeping price unchanged.",
    "questionState": {"intercept": 0},
    "validationState": { "intercept": 6 },
    "render": renderQuizLock,
    "setState": setState,
    "evaluate": function() { evaluateGraphPlain.call(this, '>'); },
    "lockUnlockReset": resetGraph,
    "startAnimation": noHint,
    
  },



  
];

//is this movement along or shift



function setState(newIntercept) {

handleInterceptChange(newIntercept)

}

function lockStateIncrease(){

  if(graphStateLock===true){

  if (state.intercept < this.questionState.intercept || state.intercept > this.validationState.intercept){

    

setState(this.questionState.intercept)


  }
  }

  else{


  }


}


function lockStateDecrease(){

  if(graphStateLock===true){

if (state.intercept > this.questionState.intercept || state.intercept < this.validationState.intercept){
    

setState(this.questionState.intercept)


  }
  }

  else{


  }


}


function graphStateLockUnlock(){

  

  if (graphStateLock===false){

        setState(quizQuestions[qIndex].questionState.intercept)


   
  }



  else{


  }

}


function resetGraph(){

    if(quizQuestions[qIndex].type){

    setState(quizQuestions[qIndex].questionState.intercept)

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


var graphStateLock=true;

const qGraphLockBtn = document.createElement("button");
qGraphLockBtn.id = "q-graph-lock";
qGraphLockBtn.className = "primary";
qGraphLockBtn.style.backgroundColor = 'green'
qGraphLockBtn.textContent = graphStateLock ? "Unlock Graph" : "Lock Graph";

qGraphLockBtn.addEventListener("click", () => {

  if (typeof quizQuestions[qIndex].lockUnlockReset === "function") {
    quizQuestions[qIndex].lockUnlockReset();
  }

  graphStateLock = !graphStateLock;
  const currentQuestion = quizQuestions[qIndex];

  if (currentQuestion && currentQuestion.type) {
    // Mode A: Question has a type -> Always show "Reset Graph"
    qGraphLockBtn.textContent = "Reset Graph";
  } else {
    // Mode B: Standard question -> Toggle between "Unlock Graph" & "Lock Graph"
    qGraphLockBtn.textContent = graphStateLock ? "Unlock Graph" : "Lock Graph";
  }



  
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


  stopGhostAnimation();
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

  stopGhostAnimation();

  qActionRow.appendChild(qGraphLockBtn);
  qGraphLockBtn.textContent = graphStateLock ? "Unlock Graph" : "Lock Graph";
     if(quizQuestions[qIndex].type){
 qGraphLockBtn.textContent="Reset Graph"

  }
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

/* ---------- nav buttons ---------- */
qPrevBtn.addEventListener("click", () => {
  if (qIndex > 0) {
    qIndex--;

    graphStateLock=true
    const currentQuestion = quizQuestions[qIndex];

    // Safely run setState if it exists, passing the question's current price state
    currentQuestion.setState?.(currentQuestion.questionState.intercept);

    currentQuestion.render();
  }
});
qNextBtn.addEventListener("click", () => {
  if (qIndex < quizQuestions.length - 1) {
    qIndex++;
    graphStateLock=true
    const currentQuestion = quizQuestions[qIndex];

    // Safely run setState if it exists, passing the question's current price state
    currentQuestion.setState?.(currentQuestion.questionState.intercept);

    currentQuestion.render();
  }
});