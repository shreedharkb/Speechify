-- ============================================
-- Relational Database Schema for Quiz Application
-- Converted from MongoDB/Mongoose Models
-- ============================================

-- ============================================
-- Table: users
-- Stores user information (students and teachers)
-- ============================================
CREATE TABLE users (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    role ENUM('student', 'teacher') NOT NULL DEFAULT 'student',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_email (email),
    INDEX idx_role (role)
);

-- ============================================
-- Table: quiz_events
-- Stores quiz event information created by teachers
-- ============================================
CREATE TABLE quiz_events (
    id INT PRIMARY KEY AUTO_INCREMENT,
    title VARCHAR(255) NOT NULL,
    subject VARCHAR(255) NOT NULL,
    description TEXT,
    created_by INT NOT NULL,
    start_time DATETIME NOT NULL,
    end_time DATETIME NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_created_by (created_by),
    INDEX idx_start_time (start_time),
    INDEX idx_end_time (end_time)
);

-- ============================================
-- Table: questions
-- Stores individual questions for quiz events
-- ============================================
CREATE TABLE questions (
    id INT PRIMARY KEY AUTO_INCREMENT,
    quiz_event_id INT NOT NULL,
    question_text TEXT NOT NULL,
    correct_answer_text TEXT NOT NULL,
    points INT NOT NULL DEFAULT 10,
    question_order INT NOT NULL DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (quiz_event_id) REFERENCES quiz_events(id) ON DELETE CASCADE,
    INDEX idx_quiz_event_id (quiz_event_id)
);

-- ============================================
-- Table: quiz_attempts
-- Stores student attempts at quiz events
-- ============================================
CREATE TABLE quiz_attempts (
    id INT PRIMARY KEY AUTO_INCREMENT,
    quiz_event_id INT NOT NULL,
    student_id INT NOT NULL,
    score DECIMAL(5,2) NOT NULL DEFAULT 0.00,
    started_at DATETIME,
    submitted_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (quiz_event_id) REFERENCES quiz_events(id) ON DELETE CASCADE,
    FOREIGN KEY (student_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_quiz_event_id (quiz_event_id),
    INDEX idx_student_id (student_id),
    UNIQUE KEY unique_student_quiz (quiz_event_id, student_id)
);

-- ============================================
-- Table: attempt_answers
-- Stores individual answers for each quiz attempt
-- ============================================
CREATE TABLE attempt_answers (
    id INT PRIMARY KEY AUTO_INCREMENT,
    attempt_id INT NOT NULL,
    question_id INT NOT NULL,
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
    FOREIGN KEY (question_id) REFERENCES questions(id) ON DELETE CASCADE,
    INDEX idx_attempt_id (attempt_id),
    INDEX idx_question_id (question_id)
);

-- ============================================
-- Legacy Table: quizzes (deprecated, kept for migration)
-- Original Quiz model - to be migrated to quiz_events
-- ============================================
CREATE TABLE quizzes (
    id INT PRIMARY KEY AUTO_INCREMENT,
    title VARCHAR(255) NOT NULL,
    subject VARCHAR(255) NOT NULL,
    start_time DATETIME NOT NULL,
    end_time DATETIME NOT NULL,
    created_by INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_created_by (created_by)
);

-- ============================================
-- Legacy Table: quiz_questions (deprecated)
-- Questions for legacy quizzes table
-- ============================================
CREATE TABLE quiz_questions (
    id INT PRIMARY KEY AUTO_INCREMENT,
    quiz_id INT NOT NULL,
    question_text TEXT NOT NULL,
    correct_answer TEXT NOT NULL,
    points INT NOT NULL DEFAULT 1,
    question_order INT NOT NULL DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (quiz_id) REFERENCES quizzes(id) ON DELETE CASCADE,
    INDEX idx_quiz_id (quiz_id)
);

-- ============================================
-- Views for Common Queries
-- ============================================

-- View: Active Quiz Events
CREATE VIEW active_quiz_events AS
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
GROUP BY qe.id;

-- View: Student Quiz Results
CREATE VIEW student_quiz_results AS
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
GROUP BY qa.id;

-- View: Teacher Quiz Statistics
CREATE VIEW teacher_quiz_statistics AS
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
GROUP BY u.id, qe.id;

-- ============================================
-- Sample Queries
-- ============================================

-- Get all active quizzes with question count
-- SELECT * FROM active_quiz_events;

-- Get all attempts for a specific student
-- SELECT * FROM student_quiz_results WHERE student_id = ?;

-- Get all quizzes created by a specific teacher
-- SELECT * FROM teacher_quiz_statistics WHERE teacher_id = ?;

-- Get detailed answers for a specific attempt
-- SELECT aa.*, q.correct_answer_text 
-- FROM attempt_answers aa
-- JOIN questions q ON aa.question_id = q.id
-- WHERE aa.attempt_id = ?;

-- Get leaderboard for a specific quiz event
-- SELECT 
--     u.name, 
--     qa.score, 
--     qa.submitted_at
-- FROM quiz_attempts qa
-- JOIN users u ON qa.student_id = u.id
-- WHERE qa.quiz_event_id = ?
-- ORDER BY qa.score DESC, qa.submitted_at ASC
-- LIMIT 10;
