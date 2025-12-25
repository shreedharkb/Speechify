-- ============================================
-- PostgreSQL Database Schema for Quiz Application
-- Converted from MongoDB/Mongoose Models
-- ============================================

-- Create database (already done by Docker init)
-- CREATE DATABASE quiz_app;

-- ============================================
-- Table: users
-- Stores user information (students and teachers)
-- ============================================
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    role VARCHAR(20) NOT NULL DEFAULT 'student' CHECK (role IN ('student', 'teacher')),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);

-- ============================================
-- Table: quiz_events
-- Stores quiz event information created by teachers
-- ============================================
CREATE TABLE IF NOT EXISTS quiz_events (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    subject VARCHAR(255) NOT NULL,
    description TEXT,
    created_by INTEGER NOT NULL,
    start_time TIMESTAMP NOT NULL,
    end_time TIMESTAMP NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_quiz_events_created_by ON quiz_events(created_by);
CREATE INDEX IF NOT EXISTS idx_quiz_events_start_time ON quiz_events(start_time);
CREATE INDEX IF NOT EXISTS idx_quiz_events_end_time ON quiz_events(end_time);

-- ============================================
-- Table: questions
-- Stores individual questions for quiz events
-- ============================================
CREATE TABLE IF NOT EXISTS questions (
    id SERIAL PRIMARY KEY,
    quiz_event_id INTEGER NOT NULL,
    question_text TEXT NOT NULL,
    correct_answer_text TEXT NOT NULL,
    points INTEGER NOT NULL DEFAULT 10,
    question_order INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (quiz_event_id) REFERENCES quiz_events(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_questions_quiz_event_id ON questions(quiz_event_id);

-- ============================================
-- Table: quiz_attempts
-- Stores student attempts at quiz events
-- ============================================
CREATE TABLE IF NOT EXISTS quiz_attempts (
    id SERIAL PRIMARY KEY,
    quiz_event_id INTEGER NOT NULL,
    student_id INTEGER NOT NULL,
    score DECIMAL(5,2) NOT NULL DEFAULT 0.00,
    started_at TIMESTAMP,
    submitted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (quiz_event_id) REFERENCES quiz_events(id) ON DELETE CASCADE,
    FOREIGN KEY (student_id) REFERENCES users(id) ON DELETE CASCADE,
    UNIQUE (quiz_event_id, student_id)
);

CREATE INDEX IF NOT EXISTS idx_quiz_attempts_quiz_event_id ON quiz_attempts(quiz_event_id);
CREATE INDEX IF NOT EXISTS idx_quiz_attempts_student_id ON quiz_attempts(student_id);

-- ============================================
-- Table: attempt_answers
-- Stores individual answers for each quiz attempt
-- ============================================
CREATE TABLE IF NOT EXISTS attempt_answers (
    id SERIAL PRIMARY KEY,
    attempt_id INTEGER NOT NULL,
    question_id INTEGER NOT NULL,
    question_text TEXT NOT NULL,
    student_answer TEXT NOT NULL,
    correct_answer TEXT,
    is_correct BOOLEAN NOT NULL DEFAULT FALSE,
    points_earned DECIMAL(5,2) NOT NULL DEFAULT 0.00,
    max_points DECIMAL(5,2) NOT NULL DEFAULT 10.00,
    similarity_score DECIMAL(5,4),
    explanation TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (attempt_id) REFERENCES quiz_attempts(id) ON DELETE CASCADE,
    FOREIGN KEY (question_id) REFERENCES questions(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_attempt_answers_attempt_id ON attempt_answers(attempt_id);
CREATE INDEX IF NOT EXISTS idx_attempt_answers_question_id ON attempt_answers(question_id);

-- ============================================
-- Legacy Table: quizzes (deprecated, kept for migration)
-- Original Quiz model - to be migrated to quiz_events
-- ============================================
CREATE TABLE IF NOT EXISTS quizzes (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    subject VARCHAR(255) NOT NULL,
    start_time TIMESTAMP NOT NULL,
    end_time TIMESTAMP NOT NULL,
    created_by INTEGER NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_quizzes_created_by ON quizzes(created_by);

-- ============================================
-- Legacy Table: quiz_questions (deprecated)
-- Questions for legacy quizzes table
-- ============================================
CREATE TABLE IF NOT EXISTS quiz_questions (
    id SERIAL PRIMARY KEY,
    quiz_id INTEGER NOT NULL,
    question_text TEXT NOT NULL,
    correct_answer TEXT NOT NULL,
    points INTEGER NOT NULL DEFAULT 1,
    question_order INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (quiz_id) REFERENCES quizzes(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_quiz_questions_quiz_id ON quiz_questions(quiz_id);

-- ============================================
-- Function to update updated_at timestamp
-- ============================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_quiz_events_updated_at BEFORE UPDATE ON quiz_events
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- Views for Common Queries
-- ============================================

-- View: Active Quiz Events
CREATE OR REPLACE VIEW active_quiz_events AS
SELECT 
    qe.*,
    u.name AS teacher_name,
    u.email AS teacher_email,
    COUNT(DISTINCT q.id) AS question_count,
    COUNT(DISTINCT qa.id) AS attempt_count
FROM quiz_events qe
JOIN users u ON qe.created_by = u.id
LEFT JOIN questions q ON qe.id = q.quiz_event_id
LEFT JOIN quiz_attempts qa ON qe.id = qa.quiz_event_id
WHERE qe.end_time > NOW()
GROUP BY qe.id, u.id, u.name, u.email;

-- View: Student Quiz Results
CREATE OR REPLACE VIEW student_quiz_results AS
SELECT 
    qa.id AS attempt_id,
    qa.quiz_event_id,
    qe.title AS quiz_title,
    qe.subject,
    u.id AS student_id,
    u.name AS student_name,
    u.email AS student_email,
    qa.score,
    qa.started_at,
    qa.submitted_at,
    COUNT(aa.id) AS total_questions,
    SUM(CASE WHEN aa.is_correct THEN 1 ELSE 0 END) AS correct_answers,
    SUM(aa.points_earned) AS total_points_earned,
    SUM(aa.max_points) AS total_max_points
FROM quiz_attempts qa
JOIN quiz_events qe ON qa.quiz_event_id = qe.id
JOIN users u ON qa.student_id = u.id
LEFT JOIN attempt_answers aa ON qa.id = aa.attempt_id
GROUP BY qa.id, qe.id, qe.title, qe.subject, u.id, u.name, u.email, qa.score, qa.started_at, qa.submitted_at;

-- View: Teacher Quiz Statistics
CREATE OR REPLACE VIEW teacher_quiz_statistics AS
SELECT 
    u.id AS teacher_id,
    u.name AS teacher_name,
    qe.id AS quiz_event_id,
    qe.title AS quiz_title,
    qe.subject,
    qe.start_time,
    qe.end_time,
    COUNT(DISTINCT q.id) AS question_count,
    COUNT(DISTINCT qa.id) AS attempt_count,
    AVG(qa.score) AS average_score,
    MAX(qa.score) AS highest_score,
    MIN(qa.score) AS lowest_score
FROM users u
JOIN quiz_events qe ON u.id = qe.created_by
LEFT JOIN questions q ON qe.id = q.quiz_event_id
LEFT JOIN quiz_attempts qa ON qe.id = qa.quiz_event_id
WHERE u.role = 'teacher'
GROUP BY u.id, u.name, qe.id, qe.title, qe.subject, qe.start_time, qe.end_time;

-- ============================================
-- Sample Data (Optional - for testing)
-- ============================================

-- Insert sample teacher
INSERT INTO users (name, email, password, role) 
VALUES ('Test Teacher', 'teacher@test.com', '$2b$10$samplehashedpassword', 'teacher')
ON CONFLICT (email) DO NOTHING;

-- Insert sample student
INSERT INTO users (name, email, password, role) 
VALUES ('Test Student', 'student@test.com', '$2b$10$samplehashedpassword', 'student')
ON CONFLICT (email) DO NOTHING;

-- ============================================
-- Database initialized successfully
-- ============================================
