const { gradeAnswerWithAI } = require('../controllers/gradeController');

async function runTests() {
  console.log("Testing new grading logic edge cases...\n");
  
  const cases = [
    {
      q: "What is the capital of France?",
      student: "The",
      correct: "The correct capital is Paris."
    },
    {
      q: "Is the earth flat?",
      student: "The earth is flat.",
      correct: "The earth is not flat."
    },
    {
      q: "Explain photosynthesis",
      student: "Plants make food using sunlight",
      correct: "Process by which plants convert light energy into chemical energy"
    }
  ];

  for (let c of cases) {
    console.log(`\nQuestion: ${c.q}`);
    console.log(`Student: ${c.student}`);
    console.log(`Correct: ${c.correct}`);
    try {
      const res = await gradeAnswerWithAI(c.q, c.student, c.correct);
      console.log(`Result: Correct? ${res.isCorrect}, Score: ${res.similarityScore}`);
      console.log(`Explanation: ${res.explanation}`);
    } catch (e) {
      console.error(`Error: ${e.message}`);
    }
  }
  
  console.log("\nFinished edge case testing.");
  process.exit(0);
}

runTests();
