# SIMPLIFIED SUBMISSION_EVALUATIONS DESIGN

## Overview
This document describes the simplified `submission_evaluations` table design that stores **ONE evaluation per quiz per student** instead of one evaluation per question.

## Date Implemented
February 5, 2026

## Migration
`20260205013021_simplify_evaluations_one_per_quiz`

---

## PROBLEM SOLVED

### Previous Design Issues:
- ❌ One evaluation row per question per student
- ❌ Too many rows in database
- ❌ Hard to reason about evaluation state
- ❌ Complex queries and joins
- ❌ One-to-one relationship with `student_submissions`

### New Design Benefits:
- ✅ ONE evaluation row per quiz per student
- ✅ Minimal database rows
- ✅ Simple evaluation state management
- ✅ Direct student-quiz evaluation lookup
- ✅ Question-level details in JSON
- ✅ MVP-friendly architecture

---

## SCHEMA CHANGES

### submission_evaluations Table (NEW STRUCTURE)

```sql
CREATE TABLE submission_evaluations (
  id SERIAL PRIMARY KEY,
  student_id INTEGER NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  quiz_id INTEGER NOT NULL REFERENCES quizzes(id) ON DELETE CASCADE,
  question_results JSONB NOT NULL,
  total_similarity DECIMAL(5,4) NOT NULL,
  total_marks DECIMAL(5,2) NOT NULL,
  evaluated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  
  UNIQUE (student_id, quiz_id)
);
```

### Key Changes:
1. **Removed**: `submission_id` (FK to student_submissions)
2. **Removed**: `actual_answer`, `similarity_score`, `marks_awarded` (individual columns)
3. **Added**: `student_id` (FK to students)
4. **Added**: `quiz_id` (FK to quizzes)
5. **Added**: `question_results` (JSONB - aggregated question data)
6. **Added**: `total_similarity` (average/sum across all questions)
7. **Added**: `total_marks` (sum of marks across all questions)
8. **Added**: UNIQUE constraint on `(student_id, quiz_id)`

---

## question_results JSON STRUCTURE

This JSON array stores all question-level evaluation details:

```json
[
  {
    "question_id": 1,
    "actual_answer": "OSI model has 7 layers...",
    "similarity_score": 0.82,
    "marks_awarded": 8.2
  },
  {
    "question_id": 2,
    "actual_answer": "Normalization reduces redundancy...",
    "similarity_score": 0.91,
    "marks_awarded": 9.1
  }
]
```

### Field Descriptions:
- `question_id`: Logical ID from `quizzes.questions` JSON array
- `actual_answer`: Expected/correct answer or extracted answer
- `similarity_score`: SBERT similarity score (0.0 to 1.0)
- `marks_awarded`: Marks given for this question

---

## RELATIONSHIPS

### Before:
```
student_submissions (1) ←→ (1) submission_evaluations
```

### After:
```
students (1) → (many) submission_evaluations
quizzes (1) → (many) submission_evaluations

students + quizzes → (1) submission_evaluations [UNIQUE]
```

---

## USAGE EXAMPLES

### 1. Create Evaluation (Aggregated)

```javascript
const evaluation = await SubmissionEvaluation.create({
  studentId: 1,
  quizId: 5,
  questionResults: [
    {
      question_id: 1,
      actual_answer: "Process is an independent program...",
      similarity_score: 0.8750,
      marks_awarded: 8.75
    },
    {
      question_id: 2,
      actual_answer: "Round-Robin scheduling...",
      similarity_score: 0.7200,
      marks_awarded: 7.20
    }
  ],
  totalSimilarity: 0.7975, // (0.8750 + 0.7200) / 2
  totalMarks: 15.95         // 8.75 + 7.20
});
```

### 2. Get Student's Evaluation for a Quiz

```javascript
const evaluation = await SubmissionEvaluation.findByStudentAndQuiz(
  studentId: 1,
  quizId: 5
);

console.log(evaluation.totalMarks);           // 15.95
console.log(evaluation.questionResults[0]);   // First question result
```

### 3. Get Quiz Statistics

```javascript
const stats = await SubmissionEvaluation.getQuizStats(quizId);

console.log(stats.totalEvaluations);    // 25 students evaluated
console.log(stats.averageScore);        // 16.5
console.log(stats.averageSimilarity);   // 0.8234
console.log(stats.highestScore);        // 19.8
console.log(stats.lowestScore);         // 10.2
```

### 4. Get All Evaluations for a Student

```javascript
const evaluations = await SubmissionEvaluation.findByStudent(studentId);
// Returns array of all quiz evaluations for this student
```

---

## DESIGN CONSTRAINTS (INTENTIONAL)

1. **Exactly ONE evaluation per (student, quiz)** - Enforced by UNIQUE constraint
2. **No per-question evaluation rows** - Question details in JSON only
3. **No additional tables** - Simple 5-table architecture maintained
4. **JSON over normalization** - Intentional for simplicity
5. **No direct link to student_submissions** - Independent evaluation storage

---

## MIGRATION DETAILS

### Changes Applied:
1. Dropped FK: `submission_evaluations.submission_id → student_submissions.id`
2. Dropped columns: `submission_id`, `actual_answer`, `similarity_score`, `marks_awarded`
3. Added columns: `student_id`, `quiz_id`, `question_results`, `total_similarity`, `total_marks`
4. Added FK: `submission_evaluations.student_id → students.id`
5. Added FK: `submission_evaluations.quiz_id → quizzes.id`
6. Added UNIQUE constraint: `(student_id, quiz_id)`
7. Added indexes: `idx_evaluations_student_id`, `idx_evaluations_quiz_id`

---

## PRISMA MODEL

```prisma
model SubmissionEvaluation {
  id              Int      @id @default(autoincrement())
  studentId       Int      @map("student_id")
  quizId          Int      @map("quiz_id")
  questionResults Json     @map("question_results")
  totalSimilarity Decimal  @map("total_similarity") @db.Decimal(5, 4)
  totalMarks      Decimal  @map("total_marks") @db.Decimal(5, 2)
  evaluatedAt     DateTime @default(now()) @map("evaluated_at") @db.Timestamp(6)
  createdAt       DateTime @default(now()) @map("created_at") @db.Timestamp(6)
  student         Student  @relation(fields: [studentId], references: [id], onDelete: Cascade)
  quiz            Quiz     @relation(fields: [quizId], references: [id], onDelete: Cascade)

  @@unique([studentId, quizId], map: "unique_student_quiz_evaluation")
  @@index([studentId], map: "idx_evaluations_student_id")
  @@index([quizId], map: "idx_evaluations_quiz_id")
  @@map("submission_evaluations")
}
```

---

## VERIFICATION RESULTS

All tests passed successfully:

✅ Created evaluations with question-level JSON data  
✅ Retrieved evaluation by (student_id, quiz_id)  
✅ Calculated quiz statistics from aggregated data  
✅ Verified UNIQUE constraint works  
✅ Verified relationships (student, quiz)  
✅ Verified JSON structure for question_results  

---

## NOTES

- This design is **final and authoritative**
- Do NOT reintroduce per-question evaluation rows
- Do NOT normalize question_results into another table
- Question-level evaluations remain in JSON for simplicity
- Student submissions table is unchanged (still per-question)
- Only the evaluation aggregation changed

---

## FILES MODIFIED

1. `prisma/schema.prisma` - Updated SubmissionEvaluation model
2. `models/SubmissionEvaluation.prisma.js` - New aggregated methods
3. `models/StudentSubmission.prisma.js` - Removed evaluation include
4. `verify-json-schema.js` - Updated tests for new design
5. `prisma/migrations/20260205013021_simplify_evaluations_one_per_quiz/` - Migration

---

## CONCLUSION

The simplified `submission_evaluations` design successfully reduces complexity while maintaining all necessary evaluation data. The one-evaluation-per-quiz-per-student approach is more maintainable, performant, and easier to reason about than the previous per-question design.
