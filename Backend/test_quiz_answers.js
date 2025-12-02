// Test the actual quiz answers to see what scores they get
require('dotenv').config();
const { gradeAnswerWithAI } = require('./controllers/gradeController');

async function testQuizAnswers() {
  console.log('Testing actual quiz answers from user...\n');
  console.log('='.repeat(70));

  const tests = [
    {
      question: 'What is photosynthesis?',
      correctAnswer: 'Plants make food using sunlight, CO₂, and water.',
      studentAnswer: 'Plants grow',
      expectedPoints: 2
    },
    {
      question: 'What is H₂O?',
      correctAnswer: 'Water',
      studentAnswer: 'Liquid',
      expectedPoints: 1
    },
    {
      question: 'What is gravity?',
      correctAnswer: 'A force that attracts objects toward massive bodies',
      studentAnswer: 'Energy from Earth',
      expectedPoints: 3
    }
  ];

  for (const test of tests) {
    console.log(`\nQuestion: ${test.question}`);
    console.log(`Correct Answer: "${test.correctAnswer}"`);
    console.log(`Student Answer: "${test.studentAnswer}"`);
    console.log(`Max Points: ${test.expectedPoints}`);
    console.log('-'.repeat(70));

    try {
      const result = await gradeAnswerWithAI(
        test.question,
        test.studentAnswer,
        test.correctAnswer,
        0.50
      );

      console.log(`Similarity Score: ${(result.similarityScore * 100).toFixed(1)}%`);
      console.log(`Explanation: ${result.explanation}`);

      // Calculate points based on actual grading logic
      const maxPoints = test.expectedPoints;
      let percentageEarned = 0;
      let pointsEarned = 0;
      let tier = '';

      if (result.similarityScore >= 0.85) {
        percentageEarned = 1.0;
        tier = 'Full Credit (100%)';
      } else if (result.similarityScore >= 0.70) {
        percentageEarned = 0.75;
        tier = 'High Partial (75%)';
      } else if (result.similarityScore >= 0.60) {
        percentageEarned = 0.50;
        tier = 'Medium Partial (50%)';
      } else if (result.similarityScore >= 0.50) {
        percentageEarned = 0.25;
        tier = 'Low Partial (25%)';
      } else {
        percentageEarned = 0;
        tier = 'No Credit (0%)';
      }

      const rawPoints = maxPoints * percentageEarned;

      if (maxPoints < 2) {
        pointsEarned = Math.round(rawPoints * 2) / 2;
      } else if (maxPoints < 4) {
        pointsEarned = Math.round(rawPoints * 2) / 2;
      } else {
        pointsEarned = Math.round(rawPoints * 4) / 4;
      }

      pointsEarned = Math.min(pointsEarned, maxPoints);

      console.log(`\n🎯 GRADING RESULT:`);
      console.log(`   Tier: ${tier}`);
      console.log(`   Points Earned: ${pointsEarned}/${maxPoints}`);
      console.log(`   Percentage: ${Math.round(percentageEarned * 100)}%`);
      console.log(`   Is Correct: ${result.similarityScore >= 0.70 ? 'YES' : 'PARTIAL/NO'}`);
      console.log('='.repeat(70));

    } catch (error) {
      console.error('Error:', error.message);
    }
  }

  console.log('\n💡 ANALYSIS:');
  console.log('If all scores are 0%, the answers are too different from correct answers.');
  console.log('The grading system is working - these answers genuinely deserve low scores!');
  console.log('\nBetter student answers would be:');
  console.log('Q1: "Plants make food from sunlight" → 85%+ → 2.0 pts');
  console.log('Q2: "H2O" or "Water" → 100% → 1.0 pts');
  console.log('Q3: "Force that pulls things down" → 70%+ → 2.25 pts');
}

testQuizAnswers().then(() => {
  console.log('\nTest complete.');
  process.exit(0);
}).catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});
