/**
 * Migration Script: Add Points Field to Existing Questions in JSONB
 * 
 * This script updates the quizzes table to add a "points" field to each question
 * in the questions JSONB column for existing quiz records that don't have it.
 * 
 * Default: 10 points per question
 */

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function addPointsToQuestions() {
  try {
    console.log('🔄 Starting migration: Adding points to questions...\n');

    // Fetch all quizzes
    const quizzes = await prisma.quiz.findMany({
      select: {
        id: true,
        title: true,
        questions: true
      }
    });

    console.log(`📊 Found ${quizzes.length} quizzes to process\n`);

    let updatedCount = 0;
    let skippedCount = 0;

    for (const quiz of quizzes) {
      const questions = quiz.questions;
      
      if (!Array.isArray(questions)) {
        console.log(`⚠️  Quiz ${quiz.id} - "${quiz.title}": Invalid questions format, skipping`);
        skippedCount++;
        continue;
      }

      // Check if any question is missing the points field
      const needsUpdate = questions.some(q => typeof q.points === 'undefined');

      if (!needsUpdate) {
        console.log(`✅ Quiz ${quiz.id} - "${quiz.title}": Already has points field, skipping`);
        skippedCount++;
        continue;
      }

      // Add points field to questions that don't have it
      const updatedQuestions = questions.map(q => {
        if (typeof q.points === 'undefined') {
          return { ...q, points: 10 }; // Default 10 points
        }
        return q;
      });

      // Update the quiz with new questions
      await prisma.quiz.update({
        where: { id: quiz.id },
        data: { questions: updatedQuestions }
      });

      console.log(`✅ Quiz ${quiz.id} - "${quiz.title}": Added points field to ${questions.length} question(s)`);
      updatedCount++;
    }

    console.log('\n' + '='.repeat(60));
    console.log('✨ Migration Complete!');
    console.log(`   Updated: ${updatedCount} quiz(zes)`);
    console.log(`   Skipped: ${skippedCount} quiz(zes)`);
    console.log('='.repeat(60));

  } catch (error) {
    console.error('❌ Migration failed:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Run the migration
addPointsToQuestions()
  .then(() => {
    console.log('\n✅ Migration script completed successfully');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Migration script failed:', error);
    process.exit(1);
  });
