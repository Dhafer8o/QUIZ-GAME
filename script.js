// ===== DOM Elements =====
const startScreen = document.getElementById("start-screen");
const quizScreen = document.getElementById("quiz-screen");
const resultScreen = document.getElementById("result-screen");
const categoriesContainer = document.getElementById("categories");
const timeLimitSpan = document.getElementById("time-limit");
const categoryLabel = document.getElementById("category-label");
const questionText = document.getElementById("question-text");
const answersContainer = document.getElementById("answers-container");
const currentQuestionSpan = document.getElementById("current-question");
const totalQuestionsSpan = document.getElementById("total-questions");
const scoreSpan = document.getElementById("score");
const timerEl = document.getElementById("timer");
const timeLeftSpan = document.getElementById("time-left");
const timerFill = document.getElementById("timer-fill");
const feedback = document.getElementById("feedback");
const finalScoreSpan = document.getElementById("final-score");
const maxScoreSpan = document.getElementById("max-score");
const resultMessage = document.getElementById("result-message");
const bestScoreText = document.getElementById("best-score");
const restartButton = document.getElementById("restart-btn");
const changeCategoryButton = document.getElementById("change-category-btn");
const progressContainer = document.querySelector(".progress-bar");
const progressBar = document.getElementById("progress");

// ===== Settings =====
const TIME_PER_QUESTION = 15; // seconds
const NEXT_QUESTION_DELAY = 1200; // ms to show the correct answer before moving on
const STORAGE_KEY = "quiz-best-scores";

// ===== Questions =====
const categories = {
  general: {
    name: "General Knowledge",
    icon: "🌍",
    questions: [
      {
        question: "What is the capital of France?",
        answers: [
          { text: "London", correct: false },
          { text: "Berlin", correct: false },
          { text: "Paris", correct: true },
          { text: "Madrid", correct: false },
        ],
      },
      {
        question: "Which planet is known as the Red Planet?",
        answers: [
          { text: "Venus", correct: false },
          { text: "Mars", correct: true },
          { text: "Jupiter", correct: false },
          { text: "Saturn", correct: false },
        ],
      },
      {
        question: "What is the largest ocean on Earth?",
        answers: [
          { text: "Atlantic Ocean", correct: false },
          { text: "Indian Ocean", correct: false },
          { text: "Arctic Ocean", correct: false },
          { text: "Pacific Ocean", correct: true },
        ],
      },
      {
        question: "What is the chemical symbol for gold?",
        answers: [
          { text: "Go", correct: false },
          { text: "Gd", correct: false },
          { text: "Au", correct: true },
          { text: "Ag", correct: false },
        ],
      },
      {
        question: "How many continents are there on Earth?",
        answers: [
          { text: "5", correct: false },
          { text: "6", correct: false },
          { text: "7", correct: true },
          { text: "8", correct: false },
        ],
      },
      {
        question: "What is the largest planet in our solar system?",
        answers: [
          { text: "Saturn", correct: false },
          { text: "Jupiter", correct: true },
          { text: "Earth", correct: false },
          { text: "Neptune", correct: false },
        ],
      },
      {
        question: "How many sides does a hexagon have?",
        answers: [
          { text: "5", correct: false },
          { text: "6", correct: true },
          { text: "7", correct: false },
          { text: "8", correct: false },
        ],
      },
      {
        question: "Which of these is NOT a programming language?",
        answers: [
          { text: "Java", correct: false },
          { text: "Python", correct: false },
          { text: "Banana", correct: true },
          { text: "JavaScript", correct: false },
        ],
      },
    ],
  },

  webdev: {
    name: "Web Development",
    icon: "💻",
    questions: [
      {
        question: "What does HTML stand for?",
        answers: [
          { text: "HyperText Markup Language", correct: true },
          { text: "HighText Machine Language", correct: false },
          { text: "Hyperlink and Text Markup Language", correct: false },
          { text: "Home Tool Markup Language", correct: false },
        ],
      },
      {
        question: "Which CSS property changes the text color?",
        answers: [
          { text: "color", correct: true },
          { text: "font-color", correct: false },
          { text: "text-color", correct: false },
          { text: "foreground", correct: false },
        ],
      },
      {
        question: "Which HTML tag creates a hyperlink?",
        answers: [
          { text: "<a>", correct: true },
          { text: "<link>", correct: false },
          { text: "<href>", correct: false },
          { text: "<url>", correct: false },
        ],
      },
      {
        question: "Which method adds an item to the end of a JavaScript array?",
        answers: [
          { text: "push()", correct: true },
          { text: "pop()", correct: false },
          { text: "shift()", correct: false },
          { text: "unshift()", correct: false },
        ],
      },
      {
        question: "What does the === operator compare in JavaScript?",
        answers: [
          { text: "Value and type", correct: true },
          { text: "Value only", correct: false },
          { text: "Type only", correct: false },
          { text: "It assigns a value", correct: false },
        ],
      },
      {
        question: "Which CSS layout system is built for rows AND columns at the same time?",
        answers: [
          { text: "Grid", correct: true },
          { text: "Flexbox", correct: false },
          { text: "Float", correct: false },
          { text: "Inline-block", correct: false },
        ],
      },
      {
        question: "Which HTTP status code means \"Not Found\"?",
        answers: [
          { text: "404", correct: true },
          { text: "200", correct: false },
          { text: "500", correct: false },
          { text: "301", correct: false },
        ],
      },
      {
        question: "Which keyword declares a variable that can't be reassigned in JavaScript?",
        answers: [
          { text: "const", correct: true },
          { text: "let", correct: false },
          { text: "var", correct: false },
          { text: "static", correct: false },
        ],
      },
    ],
  },
};

// ===== Quiz state =====
let categoryKey = null;
let questions = [];
let currentQuestionIndex = 0;
let score = 0;
let answersDisabled = false;
let timerId = null;
let timeLeft = TIME_PER_QUESTION;

timeLimitSpan.textContent = TIME_PER_QUESTION;

// ===== Best scores (saved in the browser) =====
function loadBestScores() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY)) || {};
  } catch {
    return {};
  }
}

function saveBestScore(key, value) {
  const scores = loadBestScores();
  scores[key] = value;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(scores));
  } catch {
    // storage unavailable: the game still works, it just won't remember
  }
}

// ===== Helpers =====

// Returns a shuffled copy (Fisher-Yates), so every round has a new order
function shuffle(items) {
  const copy = [...items];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

function setProgress(percent) {
  progressBar.style.width = percent + "%";
  progressContainer.setAttribute("aria-valuenow", Math.round(percent));
}

function showScreen(screen) {
  [startScreen, quizScreen, resultScreen].forEach((s) => s.classList.remove("active"));
  screen.classList.add("active");
}

// ===== Start screen =====
function renderCategories() {
  const best = loadBestScores();
  categoriesContainer.innerHTML = "";

  Object.entries(categories).forEach(([key, category]) => {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "category-btn";

    const title = document.createElement("span");
    title.className = "category-name";
    title.textContent = `${category.icon} ${category.name}`;

    const meta = document.createElement("span");
    meta.className = "category-meta";
    meta.textContent = key in best
      ? `Best: ${best[key]} / ${category.questions.length}`
      : `${category.questions.length} questions · Not played yet`;

    button.append(title, meta);
    button.addEventListener("click", () => startQuiz(key));
    categoriesContainer.appendChild(button);
  });
}

// ===== Timer =====
function stopTimer() {
  clearInterval(timerId);
  timerId = null;
}

function updateTimerDisplay() {
  timeLeftSpan.textContent = timeLeft;
  timerFill.style.width = (timeLeft / TIME_PER_QUESTION) * 100 + "%";
  timerEl.classList.toggle("warning", timeLeft <= 5);
  timerFill.classList.toggle("warning", timeLeft <= 5);
}

function startTimer() {
  stopTimer();
  timeLeft = TIME_PER_QUESTION;
  updateTimerDisplay();

  timerId = setInterval(() => {
    timeLeft--;
    updateTimerDisplay();
    if (timeLeft <= 0) {
      handleTimeUp();
    }
  }, 1000);
}

// ===== Quiz flow =====
function startQuiz(key) {
  categoryKey = key;
  const category = categories[key];

  questions = shuffle(category.questions);
  currentQuestionIndex = 0;
  score = 0;
  scoreSpan.textContent = 0;
  categoryLabel.textContent = `${category.icon} ${category.name}`;
  totalQuestionsSpan.textContent = questions.length;

  showScreen(quizScreen);
  showQuestion();
}

function showQuestion() {
  answersDisabled = false;
  feedback.textContent = "";
  feedback.className = "feedback";

  const currentQuestion = questions[currentQuestionIndex];

  currentQuestionSpan.textContent = currentQuestionIndex + 1;
  setProgress((currentQuestionIndex / questions.length) * 100);
  questionText.textContent = currentQuestion.question;

  // Remove the previous question's buttons
  answersContainer.innerHTML = "";

  shuffle(currentQuestion.answers).forEach((answer) => {
    const button = document.createElement("button");
    button.type = "button";
    button.textContent = answer.text; // textContent, so answers like "<a>" show as text
    button.classList.add("answer-btn");
    button.dataset.correct = answer.correct;
    button.addEventListener("click", selectAnswer);
    answersContainer.appendChild(button);
  });

  startTimer();
}

// Shows the right answer, locks the buttons, and moves on after a short pause
function revealAnswer(selectedButton) {
  answersDisabled = true;
  stopTimer();

  Array.from(answersContainer.children).forEach((button) => {
    if (button.dataset.correct === "true") {
      button.classList.add("correct");
    } else if (button === selectedButton) {
      button.classList.add("incorrect");
    }
    button.disabled = true;
  });

  // Fill the bar for this question, so it reaches 100% on the last one
  setProgress(((currentQuestionIndex + 1) / questions.length) * 100);

  setTimeout(() => {
    currentQuestionIndex++;

    if (currentQuestionIndex < questions.length) {
      showQuestion();
    } else {
      showResults();
    }
  }, NEXT_QUESTION_DELAY);
}

function selectAnswer(event) {
  // Ignore extra clicks while the answer is being shown
  if (answersDisabled) return;

  const selectedButton = event.currentTarget;
  const isCorrect = selectedButton.dataset.correct === "true";

  if (isCorrect) {
    score++;
    scoreSpan.textContent = score;
    feedback.textContent = "Correct!";
    feedback.className = "feedback correct";
  } else {
    feedback.textContent = "Wrong answer";
    feedback.className = "feedback incorrect";
  }

  revealAnswer(selectedButton);
}

function handleTimeUp() {
  if (answersDisabled) return;
  feedback.textContent = "⏱ Time's up!";
  feedback.className = "feedback incorrect";
  revealAnswer(null);
}

function showResults() {
  stopTimer();
  showScreen(resultScreen);

  const total = questions.length;
  finalScoreSpan.textContent = score;
  maxScoreSpan.textContent = total;

  const percentage = (score / total) * 100;

  if (percentage === 100) {
    resultMessage.textContent = "Perfect! You're a genius!";
  } else if (percentage >= 80) {
    resultMessage.textContent = "Great job! You know your stuff!";
  } else if (percentage >= 60) {
    resultMessage.textContent = "Good effort! Keep learning!";
  } else if (percentage >= 40) {
    resultMessage.textContent = "Not bad! Try again to improve!";
  } else {
    resultMessage.textContent = "Keep studying! You'll get better!";
  }

  // Best score for this category
  const best = loadBestScores();
  const previousBest = best[categoryKey];

  if (previousBest === undefined || score > previousBest) {
    saveBestScore(categoryKey, score);
    bestScoreText.textContent = previousBest === undefined
      ? `Best score saved: ${score} / ${total}`
      : `🏆 New best score! (previous: ${previousBest} / ${total})`;
    bestScoreText.classList.toggle("new-best", previousBest !== undefined);
  } else {
    bestScoreText.textContent = `Your best: ${previousBest} / ${total}`;
    bestScoreText.classList.remove("new-best");
  }
}

// ===== Buttons =====
restartButton.addEventListener("click", () => startQuiz(categoryKey));

changeCategoryButton.addEventListener("click", () => {
  renderCategories();
  showScreen(startScreen);
});

renderCategories();
