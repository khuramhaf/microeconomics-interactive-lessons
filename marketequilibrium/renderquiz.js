let qIndex = 0;

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
    currentQuestion.setState?.(currentQuestion.questionState.price);

    currentQuestion.render();
  }
});
qNextBtn.addEventListener("click", () => {
  if (qIndex < quizQuestions.length - 1) {
    qIndex++;
    graphStateLock=true
    const currentQuestion = quizQuestions[qIndex];

    // Safely run setState if it exists, passing the question's current price state
    currentQuestion.setState?.(currentQuestion.questionState.price);

    currentQuestion.render();
  }
});