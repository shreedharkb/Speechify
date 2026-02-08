// Test Prisma connection and basic operations
require('dotenv').config();
const prisma = require('./config/prisma');

async function testPrisma() {
  console.log('🧪 Testing Prisma Connection...\n');

  try {
    // Test 1: Database Connection
    console.log('1️⃣ Testing database connection...');
    await prisma.$connect();
    console.log('✅ Connected to database successfully!\n');

    // Test 2: Count Users
    console.log('2️⃣ Counting users...');
    const userCount = await prisma.user.count();
    console.log(`✅ Found ${userCount} users in database\n`);

    // Test 3: Count Quiz Events
    console.log('3️⃣ Counting quiz events...');
    const quizEventCount = await prisma.quizEvent.count();
    console.log(`✅ Found ${quizEventCount} quiz events\n`);

    // Test 4: Fetch a sample user with relations
    console.log('4️⃣ Fetching sample user with relations...');
    const sampleUser = await prisma.user.findFirst({
      include: {
        _count: {
          select: {
            createdQuizEvents: true,
            quizAttempts: true
          }
        }
      }
    });
    
    if (sampleUser) {
      console.log(`✅ Sample user: ${sampleUser.name} (${sampleUser.email})`);
      console.log(`   Role: ${sampleUser.role}`);
      console.log(`   Quiz Events Created: ${sampleUser._count.createdQuizEvents}`);
      console.log(`   Quiz Attempts: ${sampleUser._count.quizAttempts}\n`);
    } else {
      console.log('⚠️  No users found in database\n');
    }

    // Test 5: Fetch quiz event with questions
    console.log('5️⃣ Fetching sample quiz event with questions...');
    const sampleQuiz = await prisma.quizEvent.findFirst({
      include: {
        questions: true,
        teacher: {
          select: { name: true }
        }
      }
    });

    if (sampleQuiz) {
      console.log(`✅ Sample quiz: ${sampleQuiz.title}`);
      console.log(`   Subject: ${sampleQuiz.subject}`);
      console.log(`   Teacher: ${sampleQuiz.teacher?.name || 'Unknown'}`);
      console.log(`   Questions: ${sampleQuiz.questions.length}`);
      console.log(`   Start Time: ${sampleQuiz.startTime}`);
      console.log(`   End Time: ${sampleQuiz.endTime}\n`);
    } else {
      console.log('⚠️  No quiz events found in database\n');
    }

    // Test 6: Raw query test
    console.log('6️⃣ Testing raw SQL query...');
    const result = await prisma.$queryRaw`SELECT COUNT(*) as count FROM users`;
    console.log(`✅ Raw query result: ${result[0].count} users\n`);

    console.log('🎉 All tests passed! Prisma is working correctly!\n');
    console.log('📚 Check PRISMA_MIGRATION_GUIDE.md for usage instructions');

  } catch (error) {
    console.error('❌ Error testing Prisma:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

// Run tests
testPrisma();
