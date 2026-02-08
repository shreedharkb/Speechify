-- DropForeignKey
ALTER TABLE "submission_evaluations" DROP CONSTRAINT IF EXISTS "submission_evaluations_submission_id_fkey";

-- DropIndex
DROP INDEX IF EXISTS "submission_evaluations_submission_id_key";

-- DropIndex
DROP INDEX IF EXISTS "idx_evaluations_submission_id";

-- AlterTable
ALTER TABLE "submission_evaluations" DROP COLUMN IF EXISTS "submission_id";
ALTER TABLE "submission_evaluations" DROP COLUMN IF EXISTS "actual_answer";
ALTER TABLE "submission_evaluations" DROP COLUMN IF EXISTS "similarity_score";
ALTER TABLE "submission_evaluations" DROP COLUMN IF EXISTS "marks_awarded";

ALTER TABLE "submission_evaluations" 
  ADD COLUMN IF NOT EXISTS "student_id" INTEGER NOT NULL DEFAULT 1,
  ADD COLUMN IF NOT EXISTS "quiz_id" INTEGER NOT NULL DEFAULT 1,
  ADD COLUMN IF NOT EXISTS "question_results" JSONB NOT NULL DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS "total_similarity" DECIMAL(5,4) NOT NULL DEFAULT 0.0000,
  ADD COLUMN IF NOT EXISTS "total_marks" DECIMAL(5,2) NOT NULL DEFAULT 0.00;

-- AlterTable - Make timestamps NOT NULL
ALTER TABLE "submission_evaluations" 
  ALTER COLUMN "evaluated_at" SET NOT NULL,
  ALTER COLUMN "evaluated_at" DROP DEFAULT,
  ALTER COLUMN "evaluated_at" SET DEFAULT CURRENT_TIMESTAMP,
  ALTER COLUMN "created_at" SET NOT NULL,
  ALTER COLUMN "created_at" DROP DEFAULT,
  ALTER COLUMN "created_at" SET DEFAULT CURRENT_TIMESTAMP;

-- CreateIndex
CREATE INDEX IF NOT EXISTS "idx_evaluations_student_id" ON "submission_evaluations"("student_id");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "idx_evaluations_quiz_id" ON "submission_evaluations"("quiz_id");

-- CreateIndex (Unique constraint)
CREATE UNIQUE INDEX IF NOT EXISTS "unique_student_quiz_evaluation" ON "submission_evaluations"("student_id", "quiz_id");

-- AddForeignKey
ALTER TABLE "submission_evaluations" ADD CONSTRAINT "submission_evaluations_student_id_fkey" FOREIGN KEY ("student_id") REFERENCES "students"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "submission_evaluations" ADD CONSTRAINT "submission_evaluations_quiz_id_fkey" FOREIGN KEY ("quiz_id") REFERENCES "quizzes"("id") ON DELETE CASCADE ON UPDATE CASCADE;
