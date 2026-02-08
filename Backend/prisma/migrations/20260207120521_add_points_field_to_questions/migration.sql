-- ============================================
-- Migration: Add Points Field to Quiz Questions
-- Date: February 7, 2026
-- Purpose: Add 'points' field to each question in the questions JSONB column
-- ============================================

-- Add helpful comment to the questions column
COMMENT ON COLUMN "quizzes"."questions" IS 'Array of question objects: [{id, text, points, image?}]. Each question should include a points field indicating marks allocated.';

-- Update existing quiz records to add 'points' field to questions
-- This adds a default of 10 points to any question that doesn't have it
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

-- AlterTable: Clean up submission_evaluations defaults
ALTER TABLE "submission_evaluations" ALTER COLUMN "student_id" DROP DEFAULT,
ALTER COLUMN "quiz_id" DROP DEFAULT,
ALTER COLUMN "question_results" DROP DEFAULT,
ALTER COLUMN "total_similarity" DROP DEFAULT,
ALTER COLUMN "total_marks" DROP DEFAULT;
