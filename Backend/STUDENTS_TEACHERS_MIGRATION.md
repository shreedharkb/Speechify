# ✅ Users Table Replaced with Students and Teachers

**Date:** February 3, 2026  
**Migration:** `20260203080819_replace_users_with_students_and_teachers`  
**Status:** Successfully Applied ✅

---

## Summary

Successfully replaced the single `users` table with separate `students` and `teachers` tables, providing better data structure and role-specific fields.

## What Changed

### ❌ Removed Table
- **users** - Single table with role field (removed)

### ✅ New Tables Created

#### 1. Students Table
**Fields:**
- `id` - Primary key (auto-increment)
- `name` - Student name (VARCHAR 255)
- `email` - Unique email address (VARCHAR 255)
- `password` - Hashed password (VARCHAR 255)
- `roll_no` - Unique roll number (VARCHAR 50) ⭐
- `year` - Academic year (INTEGER) ⭐
- `branch` - Department/Branch (VARCHAR 100) ⭐
- `semester` - Current semester (INTEGER) ⭐
- `created_at` - Creation timestamp
- `updated_at` - Update timestamp

**Indexes:**
- Unique index on `email`
- Unique index on `roll_no`
- Index on `email` (for fast lookups)
- Index on `roll_no` (for fast lookups)

**Relations:**
- `quizAttempts` - One-to-many with quiz_attempts

#### 2. Teachers Table
**Fields:**
- `id` - Primary key (auto-increment)
- `name` - Teacher name (VARCHAR 255)
- `email` - Unique email address (VARCHAR 255)
- `password` - Hashed password (VARCHAR 255)
- `branch` - Department/Branch (VARCHAR 100) ⭐
- `created_at` - Creation timestamp
- `updated_at` - Update timestamp

**Indexes:**
- Unique index on `email`
- Index on `email` (for fast lookups)

**Relations:**
- `createdQuizEvents` - One-to-many with quiz_events

## Database Schema

### Current Tables (7 total)
```
_prisma_migrations    (Prisma migration tracking)
students             ⭐ NEW
teachers             ⭐ NEW
quiz_events          (Updated FK to teachers)
questions
quiz_attempts        (Updated FK to students)
attempt_answers
```

### Foreign Key Updates
- `quiz_events.created_by` → Now references `teachers.id`
- `quiz_attempts.student_id` → Now references `students.id`

## Migration Details

### SQL Operations Performed
1. ✅ Dropped foreign key: `quiz_attempts.student_id → users.id`
2. ✅ Dropped foreign key: `quiz_events.created_by → users.id`
3. ✅ Dropped table: `users`
4. ✅ Created table: `students` with all fields and indexes
5. ✅ Created table: `teachers` with all fields and indexes
6. ✅ Added foreign key: `quiz_events.created_by → teachers.id`
7. ✅ Added foreign key: `quiz_attempts.student_id → students.id`

## Prisma Schema Changes

### Before (Single User Model)
```prisma
model User {
  id        Int    @id @default(autoincrement())
  name      String
  email     String @unique
  password  String
  role      String @default("student")  // ❌ Role-based approach
  // ... timestamps
}
```

### After (Separate Models)
```prisma
model Student {
  id           Int     @id @default(autoincrement())
  name         String
  email        String  @unique
  password     String
  rollNo       String  @unique  // ⭐ NEW
  year         Int              // ⭐ NEW
  branch       String           // ⭐ NEW
  semester     Int              // ⭐ NEW
  quizAttempts QuizAttempt[]
}

model Teacher {
  id                Int         @id @default(autoincrement())
  name              String
  email             String      @unique
  password          String
  branch            String      // ⭐ NEW
  createdQuizEvents QuizEvent[]
}
```

## Benefits

### 1. **Better Data Structure**
- Separate concerns for students and teachers
- Role-specific fields (rollNo, year, semester for students)
- Cleaner schema without conditional fields

### 2. **Type Safety**
- No more role checking in code
- Prisma generates separate types for Student and Teacher
- Compile-time safety for relationships

### 3. **Query Performance**
- Smaller table sizes (data separated)
- More targeted indexes
- No need to filter by role

### 4. **Maintainability**
- Clear separation of concerns
- Easier to add role-specific features
- Better code organization

## Code Changes

### New Model Files
- ✅ `models/Student.prisma.js` - Student operations
- ✅ `models/Teacher.prisma.js` - Teacher operations

### Updated Files
- ✅ `prisma/schema.prisma` - Updated schema
- ✅ `models/index.js` - Exports Student and Teacher models

### Migration Files
```
prisma/migrations/
├── 20260203074356_initial_without_legacy_tables/
└── 20260203080819_replace_users_with_students_and_teachers/  ⭐ NEW
    └── migration.sql
```

## API Examples

### Student Operations
```javascript
const { Student } = require('./models');

// Create student
const student = await Student.create({
  name: 'John Doe',
  email: 'john@college.edu',
  password: 'hashed_password',
  rollNo: 'CS2024001',
  year: 2,
  branch: 'Computer Science',
  semester: 4
});

// Find by roll number
const student = await Student.findByRollNo('CS2024001');

// Find by year and semester
const students = await Student.findByYearAndSemester(2, 4);

// Get with quiz attempts
const studentWithAttempts = await Student.findByIdWithAttempts(1);
```

### Teacher Operations
```javascript
const { Teacher } = require('./models');

// Create teacher
const teacher = await Teacher.create({
  name: 'Jane Smith',
  email: 'jane@college.edu',
  password: 'hashed_password',
  branch: 'Computer Science'
});

// Get quizzes created
const quizzes = await Teacher.getQuizzesCreated(teacherId);

// Get statistics
const stats = await Teacher.getStatistics(teacherId);
// Returns: { totalQuizzes, totalQuestions, totalAttempts }
```

## Verification Results

✅ **All Tests Passed**

```
✓ students table created and accessible
✓ teachers table created and accessible
✓ users table successfully removed
✓ Foreign keys updated correctly
✓ Sample data created successfully
✓ Relationships working correctly
```

### Sample Data Created
- 1 test teacher (Computer Science)
- 1 test student (CS2024001, Year 2, Semester 4)
- 1 test quiz with questions
- All relationships verified

## Migration Commands

```bash
# View migration history
npx prisma migrate status

# View database in GUI
npx prisma studio

# Verify schema
node verify-new-schema.js

# Regenerate Prisma Client
npx prisma generate
```

## Next Steps for Controllers

### Update Authentication Controllers

**Old approach:**
```javascript
const User = require('./models/User');

// Login - check role
if (user.role === 'student') {
  // Student logic
} else if (user.role === 'teacher') {
  // Teacher logic
}
```

**New approach:**
```javascript
const { Student, Teacher } = require('./models');

// Login student
const student = await Student.findByEmail(email);

// Login teacher
const teacher = await Teacher.findByEmail(email);
```

### Update Routes

You'll need to create separate authentication routes:
- `/api/auth/student/signup`
- `/api/auth/student/login`
- `/api/auth/teacher/signup`
- `/api/auth/teacher/login`

Or use a discriminator in existing routes to determine which model to use.

## Migration Safety

### ⚠️ Important Notes
1. **Data Loss:** All existing user data was removed during migration
2. **Fresh Start:** Database reset required for this migration
3. **Production:** Before applying to production, implement data migration script
4. **Backups:** Always backup before running migrations

### For Production Migration
If you have existing production data, create a data migration script:

```javascript
// Example: migrate-user-data.js
// 1. Create temporary backup of users table
// 2. Create new students and teachers from users
// 3. Update quiz_events and quiz_attempts references
// 4. Verify data integrity
// 5. Drop old users table
```

## Documentation

- **Migration SQL:** `prisma/migrations/20260203080819_replace_users_with_students_and_teachers/migration.sql`
- **Verification Script:** `verify-new-schema.js`
- **Student Model:** `models/Student.prisma.js`
- **Teacher Model:** `models/Teacher.prisma.js`

## Support

### Check Migration Status
```bash
npx prisma migrate status
```

### View Current Schema
```bash
npx prisma studio
# Opens at http://localhost:5555
```

### Rollback (Development Only)
```bash
npx prisma migrate reset
# WARNING: This will delete all data!
```

---

**✅ Migration Complete!**

The database now has separate `students` and `teachers` tables with proper role-specific fields, better type safety, and cleaner architecture. All relationships are properly maintained with foreign keys.

**Database Status:** Up to date ✅  
**Tables:** 7 (including 2 new tables)  
**Migration Version:** 20260203080819_replace_users_with_students_and_teachers
