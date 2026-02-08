const prisma = require('../config/prisma');

async function checkQuizzes() {
  try {
    const quizzes = await prisma.quiz.findMany({
      select: {
        id: true,
        title: true,
        questions: true
      }
    });

    console.log(`\n📊 Found ${quizzes.length} quiz(zes) in database\n`);

    if (quizzes.length === 0) {
      console.log('✅ No existing quizzes to migrate.\n');
      return;
    }

    quizzes.forEach((quiz, index) => {
      console.log(`Quiz ${index + 1}: "${quiz.title}" (ID: ${quiz.id})`);
      console.log(`  Questions: ${quiz.questions.length}`);
      
      quiz.questions.forEach((q, qIndex) => {
        const hasPoints = typeof q.points !== 'undefined';
        const status = hasPoints ? '✅' : '❌';
        console.log(`    ${status} Q${qIndex + 1}: "${q.text.substring(0, 40)}..." - ${hasPoints ? `${q.points} points` : 'NO POINTS'}`);
      });
      console.log('');
    });

    // Check if all questions have points
    const allHavePoints = quizzes.every(quiz => 
      quiz.questions.every(q => typeof q.points !== 'undefined')
    );

    if (allHavePoints) {
      console.log('✅ All questions have the points field!\n');
    } else {
      console.log('⚠️  Some questions are missing the points field.\n');
    }

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

checkQuizzes();
