/*
  Warnings:

  - You are about to drop the `attempt_answers` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `questions` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `quiz_attempts` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `quiz_events` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `users` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "attempt_answers" DROP CONSTRAINT "attempt_answers_attempt_id_fkey";

-- DropForeignKey
ALTER TABLE "attempt_answers" DROP CONSTRAINT "attempt_answers_question_id_fkey";

-- DropForeignKey
ALTER TABLE "questions" DROP CONSTRAINT "questions_quiz_event_id_fkey";

-- DropForeignKey
ALTER TABLE "quiz_attempts" DROP CONSTRAINT "quiz_attempts_quiz_event_id_fkey";

-- DropForeignKey
ALTER TABLE "quiz_attempts" DROP CONSTRAINT "quiz_attempts_student_id_fkey";

-- DropForeignKey
ALTER TABLE "quiz_events" DROP CONSTRAINT "quiz_events_created_by_fkey";

-- DropTable
DROP TABLE "attempt_answers";

-- DropTable
DROP TABLE "questions";

-- DropTable
DROP TABLE "quiz_attempts";

-- DropTable
DROP TABLE "quiz_events";

-- DropTable
DROP TABLE "users";

-- CreateTable
CREATE TABLE "students" (
    "id" SERIAL NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "email" VARCHAR(255) NOT NULL,
    "password" VARCHAR(255) NOT NULL,
    "roll_no" VARCHAR(50) NOT NULL,
    "branch" VARCHAR(100) NOT NULL,
    "semester" INTEGER NOT NULL,
    "created_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "students_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "teachers" (
    "id" SERIAL NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "email" VARCHAR(255) NOT NULL,
    "password" VARCHAR(255) NOT NULL,
    "branch" VARCHAR(100) NOT NULL,
    "created_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "teachers_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "quizzes" (
    "id" SERIAL NOT NULL,
    "teacher_id" INTEGER NOT NULL,
    "title" VARCHAR(255) NOT NULL,
    "subject" VARCHAR(255) NOT NULL,
    "course_code" VARCHAR(50) NOT NULL,
    "description" TEXT,
    "questions" JSONB NOT NULL,
    "correct_answers" JSONB NOT NULL,
    "start_time" TIMESTAMP(6) NOT NULL,
    "end_time" TIMESTAMP(6) NOT NULL,
    "created_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "quizzes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "student_submissions" (
    "id" SERIAL NOT NULL,
    "student_id" INTEGER NOT NULL,
    "quiz_id" INTEGER NOT NULL,
    "question_id" INTEGER NOT NULL,
    "audio_codec" VARCHAR(50),
    "audio_path" VARCHAR(500),
    "transcribed_answer" TEXT,
    "submitted_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,
    "created_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "student_submissions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "submission_evaluations" (
    "id" SERIAL NOT NULL,
    "submission_id" INTEGER NOT NULL,
    "actual_answer" TEXT,
    "similarity_score" DECIMAL(5,4),
    "marks_awarded" DECIMAL(5,2) NOT NULL DEFAULT 0.00,
    "evaluated_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,
    "created_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "submission_evaluations_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "students_email_key" ON "students"("email");

-- CreateIndex
CREATE UNIQUE INDEX "students_roll_no_key" ON "students"("roll_no");

-- CreateIndex
CREATE INDEX "idx_students_email" ON "students"("email");

-- CreateIndex
CREATE INDEX "idx_students_roll_no" ON "students"("roll_no");

-- CreateIndex
CREATE UNIQUE INDEX "teachers_email_key" ON "teachers"("email");

-- CreateIndex
CREATE INDEX "idx_teachers_email" ON "teachers"("email");

-- CreateIndex
CREATE INDEX "idx_quizzes_teacher_id" ON "quizzes"("teacher_id");

-- CreateIndex
CREATE INDEX "idx_quizzes_start_time" ON "quizzes"("start_time");

-- CreateIndex
CREATE INDEX "idx_quizzes_end_time" ON "quizzes"("end_time");

-- CreateIndex
CREATE INDEX "idx_quizzes_course_code" ON "quizzes"("course_code");

-- CreateIndex
CREATE INDEX "idx_submissions_student_id" ON "student_submissions"("student_id");

-- CreateIndex
CREATE INDEX "idx_submissions_quiz_id" ON "student_submissions"("quiz_id");

-- CreateIndex
CREATE INDEX "idx_submissions_question_id" ON "student_submissions"("question_id");

-- CreateIndex
CREATE UNIQUE INDEX "submission_evaluations_submission_id_key" ON "submission_evaluations"("submission_id");

-- CreateIndex
CREATE INDEX "idx_evaluations_submission_id" ON "submission_evaluations"("submission_id");

-- AddForeignKey
ALTER TABLE "quizzes" ADD CONSTRAINT "quizzes_teacher_id_fkey" FOREIGN KEY ("teacher_id") REFERENCES "teachers"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "student_submissions" ADD CONSTRAINT "student_submissions_student_id_fkey" FOREIGN KEY ("student_id") REFERENCES "students"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "student_submissions" ADD CONSTRAINT "student_submissions_quiz_id_fkey" FOREIGN KEY ("quiz_id") REFERENCES "quizzes"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "submission_evaluations" ADD CONSTRAINT "submission_evaluations_submission_id_fkey" FOREIGN KEY ("submission_id") REFERENCES "student_submissions"("id") ON DELETE CASCADE ON UPDATE CASCADE;
