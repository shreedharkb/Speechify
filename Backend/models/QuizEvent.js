const { query, getClient } = require('../config/db');

const QuizEvent = {
  // Create a new quiz event with questions
  create: async (quizData) => {
    const { title, subject, description, createdBy, startTime, endTime, questions } = quizData;
    
    const client = await getClient();
    try {
      await client.query('BEGIN');

      // Insert quiz event
      const quizResult = await client.query(
        `INSERT INTO quiz_events (title, subject, description, created_by, start_time, end_time)
         VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
        [title, subject, description, createdBy, startTime, endTime]
      );
      const quizEvent = quizResult.rows[0];

      // Insert questions
      if (questions && questions.length > 0) {
        for (let i = 0; i < questions.length; i++) {
          const q = questions[i];
          await client.query(
            `INSERT INTO questions (quiz_event_id, question_text, correct_answer_text, points, question_order)
             VALUES ($1, $2, $3, $4, $5)`,
            [quizEvent.id, q.questionText, q.correctAnswerText, q.points || 10, i]
          );
        }
      }

      await client.query('COMMIT');

      // Return quiz event with questions
      return await QuizEvent.findById(quizEvent.id);
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  },

  // Find quiz event by ID with questions
  findById: async (id) => {
    const quizResult = await query('SELECT * FROM quiz_events WHERE id = $1', [id]);
    if (quizResult.rows.length === 0) return null;

    const quiz = quizResult.rows[0];
    const questionsResult = await query(
      'SELECT * FROM questions WHERE quiz_event_id = $1 ORDER BY question_order',
      [id]
    );
    
    return {
      id: quiz.id,
      title: quiz.title,
      subject: quiz.subject,
      description: quiz.description,
      createdBy: quiz.created_by,
      startTime: quiz.start_time,
      endTime: quiz.end_time,
      createdAt: quiz.created_at,
      updatedAt: quiz.updated_at,
      questions: questionsResult.rows.map(q => ({
        id: q.id,
        questionText: q.question_text,
        correctAnswerText: q.correct_answer_text,
        points: q.points,
        questionOrder: q.question_order
      }))
    };
  },

  // Find all quiz events
  findAll: async () => {
    const result = await query(
      `SELECT qe.*, u.name as creator_name, COUNT(DISTINCT q.id) as question_count
       FROM quiz_events qe
       LEFT JOIN users u ON qe.created_by = u.id
       LEFT JOIN questions q ON qe.id = q.quiz_event_id
       GROUP BY qe.id, u.name
       ORDER BY qe.created_at DESC`
    );
    
    // Get questions for each quiz event and convert to camelCase
    const quizEvents = await Promise.all(result.rows.map(async (quiz) => {
      const questionsResult = await query(
        'SELECT * FROM questions WHERE quiz_event_id = $1 ORDER BY question_order',
        [quiz.id]
      );
      
      return {
        id: quiz.id,
        title: quiz.title,
        subject: quiz.subject,
        description: quiz.description,
        createdBy: quiz.created_by,
        creatorName: quiz.creator_name,
        startTime: quiz.start_time,
        endTime: quiz.end_time,
        createdAt: quiz.created_at,
        updatedAt: quiz.updated_at,
        questionCount: parseInt(quiz.question_count) || 0,
        questions: questionsResult.rows.map(q => ({
          id: q.id,
          questionText: q.question_text,
          correctAnswerText: q.correct_answer_text,
          points: q.points,
          questionOrder: q.question_order
        }))
      };
    }));
    
    return quizEvents;
  },

  // Find quiz events by creator
  findByCreator: async (creatorId) => {
    const result = await query(
      `SELECT qe.*, COUNT(DISTINCT q.id) as question_count, COUNT(DISTINCT qa.id) as attempt_count
       FROM quiz_events qe
       LEFT JOIN questions q ON qe.id = q.quiz_event_id
       LEFT JOIN quiz_attempts qa ON qe.id = qa.quiz_event_id
       WHERE qe.created_by = $1
       GROUP BY qe.id
       ORDER BY qe.created_at DESC`,
      [creatorId]
    );
    return result.rows;
  },

  // Find active quiz events
  findActive: async () => {
    const result = await query(
      `SELECT * FROM active_quiz_events ORDER BY start_time ASC`
    );
    return result.rows;
  },

  // Update quiz event
  update: async (id, quizData) => {
    const { title, subject, description, startTime, endTime } = quizData;
    const result = await query(
      `UPDATE quiz_events 
       SET title = $1, subject = $2, description = $3, start_time = $4, end_time = $5
       WHERE id = $6 RETURNING *`,
      [title, subject, description, startTime, endTime, id]
    );
    return result.rows[0];
  },

  // Delete quiz event (cascades to questions and attempts)
  delete: async (id) => {
    const result = await query('DELETE FROM quiz_events WHERE id = $1 RETURNING *', [id]);
    return result.rows[0];
  },

  // Get quiz statistics
  getStatistics: async (id) => {
    const result = await query(
      `SELECT * FROM teacher_quiz_statistics WHERE quiz_event_id = $1`,
      [id]
    );
    return result.rows[0];
  }
};

module.exports = QuizEvent;