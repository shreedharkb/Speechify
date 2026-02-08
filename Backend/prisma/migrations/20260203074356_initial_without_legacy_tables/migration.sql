-- CreateTable
CREATE TABLE "users" (
    "id" SERIAL NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "email" VARCHAR(255) NOT NULL,
    "password" VARCHAR(255) NOT NULL,
    "role" VARCHAR(20) NOT NULL DEFAULT 'student',
    "created_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "quiz_events" (
    "id" SERIAL NOT NULL,
    "title" VARCHAR(255) NOT NULL,
    "subject" VARCHAR(255) NOT NULL,
    "description" TEXT,
    "created_by" INTEGER NOT NULL,
    "start_time" TIMESTAMP(6) NOT NULL,
    "end_time" TIMESTAMP(6) NOT NULL,
    "created_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "quiz_events_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "questions" (
    "id" SERIAL NOT NULL,
    "quiz_event_id" INTEGER NOT NULL,
    "question_text" TEXT NOT NULL,
    "correct_answer_text" TEXT NOT NULL,
    "points" INTEGER NOT NULL DEFAULT 10,
    "question_order" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "questions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "quiz_attempts" (
    "id" SERIAL NOT NULL,
    "quiz_event_id" INTEGER NOT NULL,
    "student_id" INTEGER NOT NULL,
    "score" DECIMAL(5,2) NOT NULL DEFAULT 0.00,
    "started_at" TIMESTAMP(6),
    "submitted_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,
    "created_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "quiz_attempts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "attempt_answers" (
    "id" SERIAL NOT NULL,
    "attempt_id" INTEGER NOT NULL,
    "question_id" INTEGER NOT NULL,
    "question_text" TEXT NOT NULL,
    "student_answer" TEXT NOT NULL,
    "correct_answer" TEXT,
    "is_correct" BOOLEAN NOT NULL DEFAULT false,
    "points_earned" DECIMAL(5,2) NOT NULL DEFAULT 0.00,
    "max_points" DECIMAL(5,2) NOT NULL DEFAULT 10.00,
    "similarity_score" DECIMAL(5,4),
    "explanation" TEXT,
    "created_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,
    "audio_path" VARCHAR(255),
    "audio" BYTEA,

    CONSTRAINT "attempt_answers_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE INDEX "idx_users_email" ON "users"("email");

-- CreateIndex
CREATE INDEX "idx_users_role" ON "users"("role");

-- CreateIndex
CREATE INDEX "idx_quiz_events_created_by" ON "quiz_events"("created_by");

-- CreateIndex
CREATE INDEX "idx_quiz_events_end_time" ON "quiz_events"("end_time");

-- CreateIndex
CREATE INDEX "idx_quiz_events_start_time" ON "quiz_events"("start_time");

-- CreateIndex
CREATE INDEX "idx_questions_quiz_event_id" ON "questions"("quiz_event_id");

-- CreateIndex
CREATE INDEX "idx_quiz_attempts_quiz_event_id" ON "quiz_attempts"("quiz_event_id");

-- CreateIndex
CREATE INDEX "idx_quiz_attempts_student_id" ON "quiz_attempts"("student_id");

-- CreateIndex
CREATE UNIQUE INDEX "quiz_attempts_quiz_event_id_student_id_key" ON "quiz_attempts"("quiz_event_id", "student_id");

-- CreateIndex
CREATE INDEX "idx_attempt_answers_attempt_id" ON "attempt_answers"("attempt_id");

-- CreateIndex
CREATE INDEX "idx_attempt_answers_question_id" ON "attempt_answers"("question_id");

-- AddForeignKey
ALTER TABLE "quiz_events" ADD CONSTRAINT "quiz_events_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "questions" ADD CONSTRAINT "questions_quiz_event_id_fkey" FOREIGN KEY ("quiz_event_id") REFERENCES "quiz_events"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "quiz_attempts" ADD CONSTRAINT "quiz_attempts_quiz_event_id_fkey" FOREIGN KEY ("quiz_event_id") REFERENCES "quiz_events"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "quiz_attempts" ADD CONSTRAINT "quiz_attempts_student_id_fkey" FOREIGN KEY ("student_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "attempt_answers" ADD CONSTRAINT "attempt_answers_attempt_id_fkey" FOREIGN KEY ("attempt_id") REFERENCES "quiz_attempts"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "attempt_answers" ADD CONSTRAINT "attempt_answers_question_id_fkey" FOREIGN KEY ("question_id") REFERENCES "questions"("id") ON DELETE CASCADE ON UPDATE NO ACTION;
