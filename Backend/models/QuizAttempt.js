const { query, getClient } = require('../config/db');

const QuizAttempt = {
  // Create a new quiz attempt with answers
  create: async (attemptData) => {
    const { quizEventId, studentId, answers, score, startedAt, submittedAt } = attemptData;
    
    const client = await getClient();
    try {
      await client.query('BEGIN');

      // Insert quiz attempt
      const attemptResult = await client.query(
        `INSERT INTO quiz_attempts (quiz_event_id, student_id, score, started_at, submitted_at)
         VALUES ($1, $2, $3, $4, $5) RETURNING *`,
        [quizEventId, studentId, score, startedAt, submittedAt || new Date()]
      );
      const attempt = attemptResult.rows[0];

      // Insert answers
      if (answers && answers.length > 0) {
        for (const answer of answers) {
          await client.query(
            `INSERT INTO attempt_answers 
             (attempt_id, question_id, question_text, student_answer, correct_answer, 
              is_correct, points_earned, max_points, similarity_score, explanation)
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)`,
            [
              attempt.id,
              answer.questionId || null,
              answer.question,
              answer.studentAnswer,
              answer.correctAnswer,
              answer.isCorrect,
              answer.pointsEarned || 0,
              answer.maxPoints || 10,
              answer.similarityScore || null,
              answer.explanation || null
            ]
          );
        }
      }

      await client.query('COMMIT');

      // Return attempt with answers
      return await QuizAttempt.findById(attempt.id);
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  },

  // Find quiz attempt by ID with answers
  findById: async (id) => {
    const attemptResult = await query(
      `SELECT qa.*, qe.title as quiz_title, qe.subject, u.name as student_name, u.email as student_email
       FROM quiz_attempts qa
       JOIN quiz_events qe ON qa.quiz_event_id = qe.id
       JOIN users u ON qa.student_id = u.id
       WHERE qa.id = $1`,
      [id]
    );
    if (attemptResult.rows.length === 0) return null;

    const attempt = attemptResult.rows[0];
    const answersResult = await query(
      'SELECT * FROM attempt_answers WHERE attempt_id = $1 ORDER BY id',
      [id]
    );
    attempt.answers = answersResult.rows;
    return attempt;
  },

  // Find attempt by student and quiz event
  findByStudentAndQuiz: async (studentId, quizEventId) => {
    const result = await query(
      'SELECT * FROM quiz_attempts WHERE student_id = $1 AND quiz_event_id = $2',
      [studentId, quizEventId]
    );
    if (result.rows.length === 0) return null;
    return await QuizAttempt.findById(result.rows[0].id);
  },

  // Find all attempts for a quiz event
  findByQuizEvent: async (quizEventId) => {
    const result = await query(
      `SELECT qa.*, u.name as student_name, u.email as student_email
       FROM quiz_attempts qa
       JOIN users u ON qa.student_id = u.id
       WHERE qa.quiz_event_id = $1
       ORDER BY qa.score DESC, qa.submitted_at ASC`,
      [quizEventId]
    );
    return result.rows;
  },

  // Find all attempts by a student
  findByStudent: async (studentId) => {
    const result = await query(
      `SELECT qa.*, qe.title as quiz_title, qe.subject
       FROM quiz_attempts qa
       JOIN quiz_events qe ON qa.quiz_event_id = qe.id
       WHERE qa.student_id = $1
       ORDER BY qa.submitted_at DESC`,
      [studentId]
    );
    return result.rows;
  },

  // Get student quiz results (using view)
  getStudentResults: async (studentId) => {
    const result = await query(
      'SELECT * FROM student_quiz_results WHERE student_id = $1 ORDER BY submitted_at DESC',
      [studentId]
    );
    return result.rows;
  },

  // Update quiz attempt
  update: async (id, updateData) => {
    const { score, submittedAt } = updateData;
    const result = await query(
      `UPDATE quiz_attempts SET score = $1, submitted_at = $2 WHERE id = $3 RETURNING *`,
      [score, submittedAt, id]
    );
    return result.rows[0];
  },

  // Delete quiz attempt
  delete: async (id) => {
    const result = await query('DELETE FROM quiz_attempts WHERE id = $1 RETURNING *', [id]);
    return result.rows[0];
  },

  // Get leaderboard for a quiz
  getLeaderboard: async (quizEventId, limit = 10) => {
    const result = await query(
      `SELECT u.name, u.email, qa.score, qa.submitted_at
       FROM quiz_attempts qa
       JOIN users u ON qa.student_id = u.id
       WHERE qa.quiz_event_id = $1
       ORDER BY qa.score DESC, qa.submitted_at ASC
       LIMIT $2`,
      [quizEventId, limit]
    );
    return result.rows;
  }
};

module.exports = QuizAttempt;