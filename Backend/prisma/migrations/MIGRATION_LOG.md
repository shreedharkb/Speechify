# Migration: Remove Legacy Quiz Tables

**Migration ID:** `20260203074356_initial_without_legacy_tables`  
**Date:** February 3, 2026  
**Status:** ✅ Applied Successfully

## Changes Made

### Tables Removed
1. **`quizzes`** - Legacy quiz table (no longer needed)
2. **`quiz_questions`** - Legacy quiz questions table (no longer needed)

### Reason for Removal
The application now exclusively uses the `quiz_events` and `questions` tables for quiz management. The legacy `quizzes` and `quiz_questions` tables were deprecated and no longer serving any purpose.

## Current Database Schema

After this migration, the database contains the following tables:

### Core Tables
1. **`users`** - Student and teacher accounts
2. **`quiz_events`** - Quiz events created by teachers
3. **`questions`** - Questions belonging to quiz events
4. **`quiz_attempts`** - Student quiz submissions
5. **`attempt_answers`** - Individual answers with audio storage (BYTEA + file path)

## Schema Changes in Detail

### User Model
- ❌ Removed: `createdQuizzes` relation (pointed to legacy Quiz table)
- ✅ Kept: `createdQuizEvents` relation (current quiz system)
- ✅ Kept: `quizAttempts` relation

### Prisma Schema Updates

**Before:**
```prisma
model User {
  // ... other fields
  createdQuizEvents QuizEvent[] @relation("TeacherQuizEvents")
  createdQuizzes    Quiz[]      @relation("TeacherQuizzes")  // Removed
}

model Quiz {
  // Entire model removed
}

model QuizQuestion {
  // Entire model removed
}
```

**After:**
```prisma
model User {
  // ... other fields
  createdQuizEvents QuizEvent[] @relation("TeacherQuizEvents")
  // createdQuizzes removed
}

// Quiz and QuizQuestion models completely removed
```

## Migration Details

### Generated SQL
The migration creates a clean baseline with only the active tables:
- users
- quiz_events
- questions
- quiz_attempts
- attempt_answers

### Indexes Created
- `idx_users_email` on users(email)
- `idx_users_role` on users(role)
- `idx_quiz_events_created_by` on quiz_events(created_by)
- `idx_quiz_events_start_time` on quiz_events(start_time)
- `idx_quiz_events_end_time` on quiz_events(end_time)
- `idx_questions_quiz_event_id` on questions(quiz_event_id)
- `idx_quiz_attempts_quiz_event_id` on quiz_attempts(quiz_event_id)
- `idx_quiz_attempts_student_id` on quiz_attempts(student_id)
- `idx_attempt_answers_attempt_id` on attempt_answers(attempt_id)
- `idx_attempt_answers_question_id` on attempt_answers(question_id)

### Foreign Keys
All proper foreign key constraints are in place with CASCADE delete behavior.

## Files Modified

1. **`prisma/schema.prisma`**
   - Removed `Quiz` model
   - Removed `QuizQuestion` model
   - Removed `createdQuizzes` relation from `User` model

2. **`models/Quiz.prisma.js`** (should be deleted)
   - No longer needed since Quiz model removed from schema

## Code Impact

### Files to Update/Remove
- ❌ `models/Quiz.prisma.js` - Can be deleted
- ⚠️ `models/Quiz.js` - Legacy model (keep if needed for old data migration)
- ✅ `models/index.js` - Update to remove Quiz exports

### Controllers
No controller changes needed if you're already using `QuizEvent` for all quiz operations.

## Verification Commands

```bash
# Check migration status
npx prisma migrate status

# View database schema
npx prisma studio

# Regenerate Prisma Client
npx prisma generate

# List all tables in database
psql -U quiz_admin -d quiz_app -c "\dt"
```

## Rollback Instructions

⚠️ **WARNING:** This migration drops tables. If you need the legacy data, you must restore from backup.

To rollback:
1. Restore database from backup before this migration
2. Revert prisma/schema.prisma to include Quiz and QuizQuestion models
3. Run `npx prisma generate`

## Next Steps

1. ✅ Remove `models/Quiz.prisma.js` (no longer needed)
2. ✅ Update `models/index.js` to remove Quiz exports
3. ✅ Verify all quiz functionality uses `QuizEvent` model
4. ✅ Update documentation to reflect schema changes
5. ✅ Test quiz creation and submission

## Migration History

```
prisma/migrations/
└─ 20260203074356_initial_without_legacy_tables/
   └─ migration.sql (128 lines)
```

This is now the baseline migration for the application with a clean, streamlined schema focused on the `quiz_events` system.

---

**Status:** ✅ Complete  
**Migration Version:** 20260203074356_initial_without_legacy_tables  
**Database:** quiz_app (PostgreSQL)  
**Tables:** 5 active tables (no legacy tables)

---

# Migration: Add Points Field to Quiz Questions

**Migration ID:** `20260207120521_add_points_field_to_questions`  
**Date:** February 7, 2026  
**Status:** ✅ Applied Successfully

## Changes Made

### JSON Schema Update
Updated the `quizzes.questions` JSONB column structure to include a `points` field for each question, indicating the marks/points allocated to that question.

### Schema Changes

**Before:**
```json
{
  "id": 1,
  "text": "What is the OSI Model?",
  "image": null
}
```

**After:**
```json
{
  "id": 1,
  "text": "What is the OSI Model?",
  "points": 10,
  "image": null
}
```

### Database Operations

1. **Added Column Comment**
   - Added descriptive comment to `quizzes.questions` column
   - Documents the expected structure: `{id, text, points, image?}`

2. **Data Migration**
   - Updated all existing quiz records
   - Added `points: 10` (default) to questions without the field
   - Uses PostgreSQL JSONB functions for safe updates

### Migration SQL

```sql
-- Add helpful comment
COMMENT ON COLUMN "quizzes"."questions" IS 'Array of question objects: [{id, text, points, image?}]';

-- Update existing records to add points field
UPDATE "quizzes"
SET "questions" = (
  SELECT jsonb_agg(
    CASE 
      WHEN question ? 'points' THEN question
      ELSE question || jsonb_build_object('points', 10)
    END
  )
  FROM jsonb_array_elements("questions") AS question
)
WHERE EXISTS (
  SELECT 1
  FROM jsonb_array_elements("questions") AS question
  WHERE NOT (question ? 'points')
);
```

## Prisma Schema Update

Updated schema comment:
```prisma
questions      Json  // Array of question objects: {id, text, points, image?}
```

## Files Updated

1. ✅ `prisma/schema.prisma` - Updated comment for questions field
2. ✅ `verify-json-schema.js` - Added points to example questions
3. ✅ `JSON_SCHEMA_IMPLEMENTATION.md` - Updated documentation
4. ✅ `scripts/add-points-to-questions.js` - Created migration script
5. ✅ `POINTS_FIELD_IMPLEMENTATION.md` - Created implementation guide

## Verification

Run the verification script:
```bash
node Backend/verify-json-schema.js
```

Expected output shows questions with `points` field included.

## Benefits

- ✅ Each question can have different point values
- ✅ Enables weighted scoring (e.g., 10 points for easy, 15 for hard)
- ✅ Calculate total quiz points dynamically
- ✅ Better grade calculation: `(score / totalPoints) * 100`

## Backward Compatibility

- ✅ Existing questions automatically get 10 points
- ✅ Controllers should use fallback: `q.points || 10`
- ✅ No breaking changes to existing code

---

**Status:** ✅ Complete  
**Migration Version:** 20260207120521_add_points_field_to_questions  
**Database:** quiz_app (PostgreSQL)  
**Quizzes Updated:** All existing quiz records migrated
