// Example comparison: Using Legacy models vs Prisma models
// This file demonstrates the difference in syntax (hint: it's almost identical!)

// ============================================
// LEGACY APPROACH (Raw SQL)
// ============================================

const UserLegacy = require('./models/User');
const QuizEventLegacy = require('./models/QuizEvent');
const QuizAttemptLegacy = require('./models/QuizAttempt');

async function legacyExamples() {
  // Find user by email
  const user = await UserLegacy.findByEmail('student@test.com');
  
  // Create quiz event
  const quiz = await QuizEventLegacy.create({
    title: 'Sample Quiz',
    subject: 'Math',
    description: 'Test your math skills',
    createdBy: 1,
    startTime: new Date(),
    endTime: new Date(Date.now() + 3600000),
    questions: [
      {
        questionText: 'What is 2+2?',
        correctAnswerText: '4',
        points: 10
      }
    ]
  });
  
  // Find all quizzes by teacher
  const teacherQuizzes = await QuizEventLegacy.findByCreator(1);
  
  // Submit quiz attempt
  const attempt = await QuizAttemptLegacy.create({
    quizEventId: quiz.id,
    studentId: user.id,
    score: 10,
    answers: [
      {
        questionId: quiz.questions[0].id,
        question: 'What is 2+2?',
        studentAnswer: '4',
        correctAnswer: '4',
        isCorrect: true,
        pointsEarned: 10,
        maxPoints: 10
      }
    ]
  });
}

// ============================================
// PRISMA APPROACH (Type-Safe ORM)
// ============================================

const { User, QuizEvent, QuizAttempt } = require('./models/index');

async function prismaExamples() {
  // Find user by email - EXACT SAME API!
  const user = await User.findByEmail('student@test.com');
  
  // Create quiz event - EXACT SAME API!
  const quiz = await QuizEvent.create({
    title: 'Sample Quiz',
    subject: 'Math',
    description: 'Test your math skills',
    createdBy: 1,
    startTime: new Date(),
    endTime: new Date(Date.now() + 3600000),
    questions: [
      {
        questionText: 'What is 2+2?',
        correctAnswerText: '4',
        points: 10
      }
    ]
  });
  
  // Find all quizzes by teacher - EXACT SAME API!
  const teacherQuizzes = await QuizEvent.findByCreator(1);
  
  // Submit quiz attempt - EXACT SAME API!
  const attempt = await QuizAttempt.create({
    quizEventId: quiz.id,
    studentId: user.id,
    score: 10,
    answers: [
      {
        questionId: quiz.questions[0].id,
        question: 'What is 2+2?',
        studentAnswer: '4',
        correctAnswer: '4',
        isCorrect: true,
        pointsEarned: 10,
        maxPoints: 10
      }
    ]
  });
}

// ============================================
// DIRECT PRISMA CLIENT USAGE (Advanced)
// ============================================

const prisma = require('./config/prisma');

async function directPrismaExamples() {
  // More powerful queries with Prisma Client directly
  
  // Complex filtering and sorting
  const activeQuizzes = await prisma.quizEvent.findMany({
    where: {
      AND: [
        { startTime: { lte: new Date() } },
        { endTime: { gte: new Date() } }
      ]
    },
    include: {
      questions: true,
      teacher: { select: { name: true, email: true } },
      _count: { select: { quizAttempts: true } }
    },
    orderBy: { startTime: 'desc' }
  });
  
  // Aggregations
  const stats = await prisma.quizAttempt.aggregate({
    where: { quizEventId: 1 },
    _avg: { score: true },
    _max: { score: true },
    _min: { score: true },
    _count: true
  });
  
  // Transactions
  const result = await prisma.$transaction(async (tx) => {
    const user = await tx.user.create({
      data: { name: 'Test', email: 'test@test.com', password: 'hashed' }
    });
    
    const quiz = await tx.quizEvent.create({
      data: {
        title: 'Quiz',
        subject: 'Test',
        createdBy: user.id,
        startTime: new Date(),
        endTime: new Date()
      }
    });
    
    return { user, quiz };
  });
  
  // Upsert (update or create)
  const user = await prisma.user.upsert({
    where: { email: 'student@test.com' },
    update: { name: 'Updated Name' },
    create: {
      name: 'New User',
      email: 'student@test.com',
      password: 'hashed',
      role: 'student'
    }
  });
  
  // Batch operations
  await prisma.user.createMany({
    data: [
      { name: 'User 1', email: 'user1@test.com', password: 'hash1' },
      { name: 'User 2', email: 'user2@test.com', password: 'hash2' }
    ],
    skipDuplicates: true
  });
  
  // Update many
  await prisma.quizAttempt.updateMany({
    where: { score: { lt: 50 } },
    data: { score: { increment: 5 } } // Give everyone a 5 point bonus
  });
  
  // Delete with conditions
  await prisma.attemptAnswer.deleteMany({
    where: {
      attempt: {
        submittedAt: { lt: new Date('2024-01-01') }
      }
    }
  });
}

// ============================================
// BENEFITS OF PRISMA
// ============================================

/*
1. SAME API AS LEGACY MODELS
   - No need to rewrite controller code
   - Drop-in replacement
   
2. BETTER TYPE SAFETY
   - Auto-completion in VS Code
   - Catch errors at compile time
   - IntelliSense for all fields
   
3. MIGRATION MANAGEMENT
   - Track all database changes
   - Easy rollback
   - Version control for schema
   
4. ADVANCED QUERIES
   - Complex filtering
   - Relations
   - Aggregations
   - Transactions
   - Batch operations
   
5. NO SQL INJECTION
   - Parameterized queries by default
   - Secure by design
   
6. VALIDATION
   - Schema validation
   - Type checking
   - Relationship integrity
   
7. PRISMA STUDIO
   - Visual database management
   - Edit data in browser
   - No need for pgAdmin
*/

// ============================================
// MIGRATION STRATEGY
// ============================================

/*
STEP 1: Test in Development
  - Use Prisma models for new features
  - Keep legacy models working
  
STEP 2: Gradual Controller Migration
  - Change one controller at a time
  - Test thoroughly
  - Example:
    // Old:
    const User = require('./models/User');
    
    // New:
    const { User } = require('./models/index');
  
STEP 3: Advanced Features
  - Use direct Prisma Client for complex queries
  - Add TypeScript for better DX
  
STEP 4: Cleanup
  - Remove legacy model files
  - Update all imports
*/

module.exports = {
  legacyExamples,
  prismaExamples,
  directPrismaExamples
};
