import readlineSync from 'readline-sync';

const questions = [
  {
    id: 1,
    question: "Which keyword is used to declare a block-scoped variable in JavaScript?",
    options: ["var", "let", "global", "assign"],
    correctIndex: 1,
    timeLimitSeconds: 10
  },
  {
    id: 2,
    question: "What does the array method `.map()` return?",
    options: [
      "A single aggregated value",
      "A boolean indicating if an item exists",
      "A new array containing transformed elements",
      "The original modified array"
    ],
    correctIndex: 2,
    timeLimitSeconds: 10
  },
  {
    id: 3,
    question: "Which function is used to schedule execution after a timed delay?",
    options: ["setInterval()", "setTimeout()", "asyncDelay()", "wait()"],
    correctIndex: 1,
    timeLimitSeconds: 8
  },
  {
    id: 4,
    question: "What is the output of `typeof null` in JavaScript?",
    options: ["'null'", "'undefined'", "'object'", "'boolean'"],
    correctIndex: 2,
    timeLimitSeconds: 8
  },
  {
    id: 5,
    question: "Which method joins all elements of an array into a single string?",
    options: [".concat()", ".join()", ".push()", ".split()"],
    correctIndex: 1,
    timeLimitSeconds: 10
  }
];

const userAnswers = [];

function askWithTimeout(promptText, timeLimitSeconds) {
  return new Promise((resolve) => {
    const startTime = Date.now();
    let timedOut = false;

    const timer = setTimeout(() => {
      timedOut = true;
      console.log(`\n⏰ [TIME'S UP!] You ran out of time (${timeLimitSeconds}s limit).`);
      readlineSync.write('\n');
    }, timeLimitSeconds * 1000);

    const input = readlineSync.question(promptText);
    const durationMs = Date.now() - startTime;

    if (!timedOut) {
      clearTimeout(timer);
      resolve({ input: input.trim(), timedOut: false, durationMs });
    } else {
      resolve({ input: null, timedOut: true, durationMs: timeLimitSeconds * 1000 });
    }
  });
}

function formatOptions(q) {
  return q.options.map((opt, index) => `  ${index + 1}. ${opt}`);
}

function showWelcomeScreen() {
  console.clear();
  console.log("==========================================");
  console.log("      🚀 JAVASCRIPT CLI TRIVIA GAME      ");
  console.log("==========================================");
  console.log("Welcome! Answer each question before the time expires.");
  console.log("Enter the option number (1-4) corresponding to your answer.\n");

  readlineSync.keyInPause("Press any key to start the game...");
}

async function runQuizLoop() {
  userAnswers.length = 0;

  for (let i = 0; i < questions.length; i++) {
    const q = questions[i];
    
    console.clear();
    console.log(`--- Question ${i + 1} of ${questions.length} ---`);
    console.log(`⏱️  Time Limit: ${q.timeLimitSeconds} seconds\n`);
    console.log(`❓ ${q.question}\n`);

    const formattedChoices = formatOptions(q);
    formattedChoices.forEach((choice) => console.log(choice));

    console.log("");
    const { input, timedOut, durationMs } = await askWithTimeout(
      "Your choice (1-4): ",
      q.timeLimitSeconds
    );

    let isCorrect = false;
    let selectedOptionText = "No answer";

    if (!timedOut) {
      const selectedIndex = parseInt(input, 10) - 1;

      if (!isNaN(selectedIndex) && selectedIndex >= 0 && selectedIndex < q.options.length) {
        selectedOptionText = q.options[selectedIndex];
        isCorrect = selectedIndex === q.correctIndex;
      } else {
        selectedOptionText = `Invalid input ("${input}")`;
      }
    }

    userAnswers.push({
      questionId: q.id,
      questionText: q.question,
      selected: selectedOptionText,
      correct: q.options[q.correctIndex],
      isCorrect,
      timedOut,
      timeTakenSec: (durationMs / 1000).toFixed(1)
    });

    console.log("\n------------------------------------------");
    if (timedOut) {
      console.log("❌ Result: TIMEOUT");
    } else if (isCorrect) {
      console.log("✅ Result: CORRECT!");
    } else {
      console.log(`❌ Result: INCORRECT. Correct answer: ${q.options[q.correctIndex]}`);
    }
    console.log("------------------------------------------");

    readlineSync.keyInPause("Press any key for the next question...");
  }
}

function showGameOverScreen() {
  console.clear();
  console.log("==========================================");
  console.log("             🏆 GAME OVER 🏆             ");
  console.log("==========================================");

  const correctCount = userAnswers.filter((ans) => ans.isCorrect).length;

  const totalTimeSeconds = userAnswers.reduce((accum, ans) => {
    return accum + parseFloat(ans.timeTakenSec);
  }, 0);

  const percentage = Math.round((correctCount / questions.length) * 100);

  console.log(`Final Score : ${correctCount} / ${questions.length} (${percentage}%)`);
  console.log(`Total Time  : ${totalTimeSeconds.toFixed(1)} seconds`);
  console.log("------------------------------------------\n");

  console.log("Summary Breakdown:");
  userAnswers.forEach((ans, idx) => {
    const statusSymbol = ans.isCorrect ? "✅" : ans.timedOut ? "⏰" : "❌";
    console.log(`${idx + 1}. ${ans.questionText}`);
    console.log(`   Your Answer: ${ans.selected} [${statusSymbol}] (${ans.timeTakenSec}s)`);
    if (!ans.isCorrect && !ans.timedOut) {
      console.log(`   Correct Answer: ${ans.correct}`);
    }
  });

  console.log("\n==========================================");
}

async function startGame() {
  showWelcomeScreen();
  await runQuizLoop();
  showGameOverScreen();
}

startGame();