/**
 * QUICK REFERENCE: 5-Table JSON Schema
 * =====================================
 * 
 * DATABASE STRUCTURE
 * ==================
 * 
 * 1. students
 *    - id, name, email, password, roll_no, branch, semester
 *    - Relations: → student_submissions (1:N)
 * 
 * 2. teachers
 *    - id, name, email, password, branch
 *    - Relations: → quizzes (1:N)
 * 
 * 3. quizzes ⭐ WITH JSON QUESTIONS
 *    - id, teacher_id, title, subject, course_code
 *    - description, questions (JSON), correct_answers (JSON)
 *    - start_time, end_time
 *    - Relations: → student_submissions (1:N)
 * 
 * 4. student_submissions
 *    - id, student_id, quiz_id, question_id (logical)
 *    - audio_codec, audio_path, transcribed_answer
 *    - Relations: → submission_evaluations (1:1)
 * 
 * 5. submission_evaluations
 *    - id, submission_id (UNIQUE), actual_answer
 *    - similarity_score, marks_awarded
 * 
 * 
 * RELATIONSHIPS
 * =============
 * 
 * teachers.id → quizzes.teacher_id
 * students.id → student_submissions.student_id  
 * quizzes.id → student_submissions.quiz_id
 * student_submissions.id → submission_evaluations.submission_id (UNIQUE)
 * 
 * 
 * KEY DESIGN DECISIONS
 * ====================
 * 
 * ✅ Questions stored as JSON (NOT in separate table)
 * ✅ Images stored as URLs (NOT binary data)
 * ✅ Audio stored as file paths (NOT binary data)
 * ✅ One submission row = one question answered
 * ✅ One-to-one submission-evaluation relationship
 * ✅ No AI feedback text stored
 * 
 * 
 * EXAMPLE JSON STRUCTURES
 * =======================
 * 
 * quizzes.questions:
 * [
 *   {
 *     "id": 1,
 *     "text": "Explain the OSI Model",
 *     "image": {
 *       "type": "url",
 *       "value": "https://cdn.app.com/images/osi.png"
 *     }
 *   },
 *   {
 *     "id": 2,
 *     "text": "What is normalization?",
 *     "image": null
 *   }
 * ]
 * 
 * quizzes.correct_answers:
 * [
 *   {
 *     "questionId": 1,
 *     "answer": "The OSI Model is a 7-layer framework..."
 *   },
 *   {
 *     "questionId": 2,
 *     "answer": "Normalization is organizing data..."
 *   }
 * ]
 * 
 * 
 * COMMON QUERIES
 * ==============
 * 
 * // Get quiz with all questions
 * const quiz = await Quiz.findById(quizId);
 * // quiz.questions is the JSON array
 * 
 * // Student submits answer
 * await StudentSubmission.create({
 *   studentId, quizId, questionId: 1,
 *   audioPath: '/uploads/audio/file.opus',
 *   transcribedAnswer: 'The answer is...'
 * });
 * 
 * // Evaluate submission
 * await SubmissionEvaluation.create({
 *   submissionId,
 *   similarityScore: 0.8750,
 *   marksAwarded: 8.75
 * });
 * 
 * // Get student's total score
 * const score = await SubmissionEvaluation
 *   .getStudentQuizScore(studentId, quizId);
 * 
 */

module.exports = {
  SCHEMA_VERSION: '1.0',
  TABLES: 5,
  MIGRATION: '20260204192950_implement_5_table_json_schema',
  STATUS: 'IMPLEMENTED'
};
