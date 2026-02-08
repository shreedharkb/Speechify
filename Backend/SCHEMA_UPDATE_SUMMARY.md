# SCHEMA EVOLUTION: Simplified Evaluations

## Summary of Changes (Feb 5, 2026)

### What Changed?
Transformed `submission_evaluations` from **per-question** to **per-quiz** design.

### Before:
- ❌ One evaluation row per question per student
- ❌ Relationship: `student_submissions (1) ←→ (1) submission_evaluations`

### After:
- ✅ ONE evaluation row per quiz per student
- ✅ Direct relationship: `students → evaluations ← quizzes`
- ✅ Question-level data in JSON

---

## Quick Reference

### Table Structure:
```sql
submission_evaluations (
  id,
  student_id → students.id,
  quiz_id → quizzes.id,
  question_results JSONB,  -- Array of question evaluations
  total_similarity,
  total_marks,
  evaluated_at,
  created_at,
  UNIQUE(student_id, quiz_id)
)
```

### Example question_results JSON:
```json
[
  {
    "question_id": 1,
    "actual_answer": "...",
    "similarity_score": 0.875,
    "marks_awarded": 8.75
  }
]
```

---

## Usage

### Create Evaluation:
```javascript
await SubmissionEvaluation.create({
  studentId: 1,
  quizId: 5,
  questionResults: [...],
  totalSimilarity: 0.82,
  totalMarks: 16.5
});
```

### Get Evaluation:
```javascript
await SubmissionEvaluation.findByStudentAndQuiz(studentId, quizId);
```

### Quiz Statistics:
```javascript
await SubmissionEvaluation.getQuizStats(quizId);
```

---

## Files Changed
- [prisma/schema.prisma](prisma/schema.prisma)
- [models/SubmissionEvaluation.prisma.js](models/SubmissionEvaluation.prisma.js)
- [models/StudentSubmission.prisma.js](models/StudentSubmission.prisma.js)
- [verify-json-schema.js](verify-json-schema.js)

## Migration
`20260205013021_simplify_evaluations_one_per_quiz`

## Documentation
See [SIMPLIFIED_EVALUATIONS_DESIGN.md](SIMPLIFIED_EVALUATIONS_DESIGN.md) for full details.

---

**Status**: ✅ Complete - All tests passing
