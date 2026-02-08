const prisma = require('../config/prisma');

async function checkQuizImages() {
  try {
    const quizzes = await prisma.quiz.findMany();
    
    console.log(`\n📊 Checking ${quizzes.length} quiz(zes) for image data...\n`);
    
    quizzes.forEach(q => {
      console.log(`Quiz: "${q.title}" (ID: ${q.id})`);
      console.log(`Course: ${q.courseCode}`);
      console.log(`Questions: ${q.questions.length}\n`);
      
      q.questions.forEach((ques, i) => {
        const hasImage = ques.image !== null;
        const status = hasImage ? '✅' : '❌';
        console.log(`  ${status} Q${i+1}: ${ques.text.substring(0, 50)}...`);
        console.log(`      Points: ${ques.points}`);
        if (hasImage) {
          console.log(`      Image Type: ${ques.image.type}`);
          console.log(`      Image Value: ${ques.image.value}`);
        } else {
          console.log(`      Image: null`);
        }
        console.log('');
      });
      console.log('-'.repeat(60) + '\n');
    });
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkQuizImages();
