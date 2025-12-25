const { query } = require('../config/db');

const User = {
  // Create a new user
  create: async (userData) => {
    const { name, email, password, role = 'student' } = userData;
    const result = await query(
      'INSERT INTO users (name, email, password, role) VALUES ($1, $2, $3, $4) RETURNING *',
      [name, email, password, role]
    );
    return result.rows[0];
  },

  // Find user by email
  findByEmail: async (email) => {
    const result = await query(
      'SELECT * FROM users WHERE email = $1',
      [email]
    );
    return result.rows[0];
  },

  // Find user by ID
  findById: async (id) => {
    const result = await query(
      'SELECT id, name, email, role, created_at FROM users WHERE id = $1',
      [id]
    );
    return result.rows[0];
  },

  // Find all users
  findAll: async () => {
    const result = await query('SELECT id, name, email, role, created_at FROM users');
    return result.rows;
  },

  // Find users by role
  findByRole: async (role) => {
    const result = await query(
      'SELECT id, name, email, role, created_at FROM users WHERE role = $1',
      [role]
    );
    return result.rows;
  },

  // Update user
  update: async (id, userData) => {
    const fields = [];
    const values = [];
    let paramCount = 1;

    if (userData.name) {
      fields.push(`name = $${paramCount++}`);
      values.push(userData.name);
    }
    if (userData.email) {
      fields.push(`email = $${paramCount++}`);
      values.push(userData.email);
    }
    if (userData.password) {
      fields.push(`password = $${paramCount++}`);
      values.push(userData.password);
    }
    if (userData.role) {
      fields.push(`role = $${paramCount++}`);
      values.push(userData.role);
    }

    values.push(id);
    const result = await query(
      `UPDATE users SET ${fields.join(', ')}, updated_at = CURRENT_TIMESTAMP WHERE id = $${paramCount} RETURNING *`,
      values
    );
    return result.rows[0];
  },

  // Delete user
  delete: async (id) => {
    const result = await query('DELETE FROM users WHERE id = $1 RETURNING *', [id]);
    return result.rows[0];
  },

  // Get quizzes created by teacher
  getQuizzesCreated: async (teacherId) => {
    const result = await query(
      `SELECT qe.*, COUNT(DISTINCT q.id) as question_count, COUNT(DISTINCT qa.id) as attempt_count
       FROM quiz_events qe
       LEFT JOIN questions q ON qe.id = q.quiz_event_id
       LEFT JOIN quiz_attempts qa ON qe.id = qa.quiz_event_id
       WHERE qe.created_by = $1
       GROUP BY qe.id
       ORDER BY qe.created_at DESC`,
      [teacherId]
    );
    return result.rows;
  },

  // Get quizzes attended by student
  getQuizzesAttended: async (studentId) => {
    const result = await query(
      `SELECT qa.*, qe.title, qe.subject, qe.start_time, qe.end_time
       FROM quiz_attempts qa
       JOIN quiz_events qe ON qa.quiz_event_id = qe.id
       WHERE qa.student_id = $1
       ORDER BY qa.submitted_at DESC`,
      [studentId]
    );
    return result.rows;
  }
};

module.exports = User;

