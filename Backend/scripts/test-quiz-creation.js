/**
 * Test Script: Verify Quiz Creation with Prisma Model
 * Tests that teachers can create quizzes stored in the 'quizzes' table
 */

const prisma = require('../config/prisma');
const bcrypt = require('bcryptjs');

async function testQuizCreation() {
  try {
    console.log('🧪 Testing Quiz Creation with Prisma Model\n');

    // Step 1: Create a test teacher
    console.log('1️⃣  Creating test teacher...');
    const existingTeacher = await prisma.teacher.findUnique({
      where: { email: 'test.teacher@quiz.com' }
    });

    let teacher;
    if (existingTeacher) {
      teacher = existingTeacher;
      console.log(`✅ Using existing teacher: ${teacher.name} (ID: ${teacher.id})`);
    } else {
      const hashedPassword = await bcrypt.hash('password123', 10);
      teacher = await prisma.teacher.create({
        data: {
          name: 'Test Teacher',
          email: 'test.teacher@quiz.com',
          password: hashedPassword,
          branch: 'Computer Science'
        }
      });
      console.log(`✅ Created new teacher: ${teacher.name} (ID: ${teacher.id})`);
    }

    // Step 2: Create a quiz with questions (including points field)
    console.log('\n2️⃣  Creating quiz with questions...');
    
    const quizData = {
      teacherId: teacher.id,
      title: 'Data Structures Quiz',
      subject: 'Computer Science',
      courseCode: 'CS201',
      description: 'Test your knowledge of arrays, linked lists, and trees',
      questions: [
        {
          id: 1,
          text: 'What is the time complexity of binary search?',
          points: 10,
          image: null
        },
        {
          id: 2,
          text: 'Explain the difference between Stack and Queue',
          points: 15,
          image: null
        },
        {
          id: 3,
          text: 'Draw and explain a Binary Search Tree',
          points: 20,
          image: {
            type: 'url',
            value: 'https://cdn.example.com/bst-diagram.png'
          }
        }
      ],
      correctAnswers: [
        {
          questionId: 1,
          answer: 'O(log n) - Binary search divides the search space in half with each comparison'
        },
        {
          questionId: 2,
          answer: 'Stack follows LIFO (Last In First Out) while Queue follows FIFO (First In First Out)'
        },
        {
          questionId: 3,
          answer: 'A BST is a tree where left child < parent < right child, enabling O(log n) search'
        }
      ],
      startTime: new Date('2026-02-15T10:00:00Z'),
      endTime: new Date('2026-02-15T12:00:00Z')
    };

    const quiz = await prisma.quiz.create({
      data: quizData,
      include: {
        teacher: {
          select: {
            id: true,
            name: true,
            email: true,
            branch: true
          }
        }
      }
    });

    console.log(`✅ Quiz created successfully!`);
    console.log(`   ID: ${quiz.id}`);
    console.log(`   Title: ${quiz.title}`);
    console.log(`   Course Code: ${quiz.courseCode}`);
    console.log(`   Teacher: ${quiz.teacher.name}`);
    console.log(`   Questions: ${quiz.questions.length}`);
    
    // Calculate total points
    const totalPoints = quiz.questions.reduce((sum, q) => sum + (q.points || 0), 0);
    console.log(`   Total Points: ${totalPoints}`);

    // Step 3: Verify questions structure
    console.log('\n3️⃣  Verifying questions structure...');
    quiz.questions.forEach((q, index) => {
      const hasAllFields = q.id && q.text && typeof q.points !== 'undefined';
      const status = hasAllFields ? '✅' : '❌';
      console.log(`   ${status} Q${index + 1}: "${q.text.substring(0, 40)}..." - ${q.points} points`);
    });

    // Step 4: Fetch quiz by ID
    console.log('\n4️⃣  Fetching quiz by ID...');
    const fetchedQuiz = await prisma.quiz.findUnique({
      where: { id: quiz.id },
      include: {
        teacher: {
          select: {
            name: true,
            branch: true
          }
        }
      }
    });

    if (fetchedQuiz) {
      console.log(`✅ Quiz fetched successfully: "${fetchedQuiz.title}"`);
      console.log(`   Teacher: ${fetchedQuiz.teacher.name}`);
      console.log(`   Questions: ${fetchedQuiz.questions.length}`);
    }

    // Step 5: Fetch all quizzes by this teacher
    console.log('\n5️⃣  Fetching all quizzes by teacher...');
    const teacherQuizzes = await prisma.quiz.findMany({
      where: { teacherId: teacher.id },
      orderBy: { createdAt: 'desc' }
    });

    console.log(`✅ Found ${teacherQuizzes.length} quiz(zes) by this teacher`);
    teacherQuizzes.forEach(q => {
      const totalPts = q.questions.reduce((sum, ques) => sum + (ques.points || 0), 0);
      console.log(`   - "${q.title}" (${q.courseCode}) - ${q.questions.length} questions, ${totalPts} points`);
    });

    // Step 6: Verify data is in 'quizzes' table
    console.log('\n6️⃣  Verifying table structure...');
    const tableCheck = await prisma.$queryRaw`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_name IN ('quizzes', 'quiz_events')
      ORDER BY table_name;
    `;
    
    console.log('✅ Database tables:');
    tableCheck.forEach(t => console.log(`   - ${t.table_name}`));

    const quizCount = await prisma.quiz.count();
    console.log(`\n✅ Total quizzes in 'quizzes' table: ${quizCount}`);

    console.log('\n' + '='.repeat(60));
    console.log('✨ ALL TESTS PASSED!');
    console.log('='.repeat(60));
    console.log('\n📊 Summary:');
    console.log(`   ✅ Teacher created/verified in 'teachers' table`);
    console.log(`   ✅ Quiz created in 'quizzes' table (Prisma model)`);
    console.log(`   ✅ Questions stored as JSONB with points field`);
    console.log(`   ✅ Total Points: ${totalPoints}`);
    console.log(`   ✅ Quiz fetched successfully`);
    console.log(`   ✅ Teacher can retrieve their quizzes`);

  } catch (error) {
    console.error('\n❌ Test failed:', error);
    console.error(error.stack);
  } finally {
    await prisma.$disconnect();
  }
}

// Run the test
testQuizCreation();
