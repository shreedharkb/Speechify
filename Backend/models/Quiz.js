const { query, getClient } = require('../config/db');

// Legacy Quiz model for backward compatibility
const Quiz = {
  // Create a new quiz (legacy)
  create: async (quizData) => {
    const { title, subject, startTime, endTime, createdBy, questions } = quizData;
    
    const client = await getClient();
    try {
      await client.query('BEGIN');

      // Insert quiz
      const quizResult = await client.query(
        `INSERT INTO quizzes (title, subject, start_time, end_time, created_by)
         VALUES ($1, $2, $3, $4, $5) RETURNING *`,
        [title, subject, startTime, endTime, createdBy]
      );
      const quiz = quizResult.rows[0];

      // Insert questions
      if (questions && questions.length > 0) {
        for (let i = 0; i < questions.length; i++) {
          const q = questions[i];
          await client.query(
            `INSERT INTO quiz_questions (quiz_id, question_text, correct_answer, points, question_order)
             VALUES ($1, $2, $3, $4, $5)`,
            [quiz.id, q.questionText, q.correctAnswer, q.points || 1, i]
          );
        }
      }

      await client.query('COMMIT');

      // Return quiz with questions
      return await Quiz.findById(quiz.id);
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  },

  // Find quiz by ID
  findById: async (id) => {
    const quizResult = await query('SELECT * FROM quizzes WHERE id = $1', [id]);
    if (quizResult.rows.length === 0) return null;

    const quiz = quizResult.rows[0];
    const questionsResult = await query(
      'SELECT * FROM quiz_questions WHERE quiz_id = $1 ORDER BY question_order',
      [id]
    );
    quiz.questions = questionsResult.rows;
    return quiz;
  },

  // Find all quizzes
  findAll: async () => {
    const result = await query(
      `SELECT q.*, u.name as creator_name FROM quizzes q
       LEFT JOIN users u ON q.created_by = u.id
       ORDER BY q.created_at DESC`
    );
    return result.rows;
  },

  // Find by creator
  findByCreator: async (creatorId) => {
    const result = await query(
      'SELECT * FROM quizzes WHERE created_by = $1 ORDER BY created_at DESC',
      [creatorId]
    );
    return result.rows;
  },

  // Delete quiz
  delete: async (id) => {
    const result = await query('DELETE FROM quizzes WHERE id = $1 RETURNING *', [id]);
    return result.rows[0];
  }
};

module.exports = Quiz;