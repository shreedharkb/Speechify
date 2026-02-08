# Adding Points Field to Quiz Questions

**Date:** February 7, 2026  
**Type:** JSON Schema Enhancement  
**Status:** ✅ Implemented

---

## Overview

Added a `points` field to each question object in the `quizzes.questions` JSONB column to track the marks/points allocated to each question.

---

## Changes Made

### 1. Updated Question JSON Structure

**Before:**
```json
{
  "id": 1,
  "text": "What is the OSI Model?",
  "image": null
}
```

**After:**
```json
{
  "id": 1,
  "text": "What is the OSI Model?",
  "points": 10,
  "image": null
}
```

### 2. Updated Files

- ✅ [Backend/verify-json-schema.js](Backend/verify-json-schema.js) - Added `points` field to example questions
- ✅ [Backend/JSON_SCHEMA_IMPLEMENTATION.md](Backend/JSON_SCHEMA_IMPLEMENTATION.md) - Updated documentation
- ✅ [Backend/scripts/add-points-to-questions.js](Backend/scripts/add-points-to-questions.js) - Migration script created

### 3. Migration Script

Created a data migration script to add default points (10) to existing questions in the database:

```bash
node Backend/scripts/add-points-to-questions.js
```

This script:
- Fetches all existing quizzes
- Checks if questions have the `points` field
- Adds `points: 10` to questions that don't have it
- Reports the number of quizzes updated

---

## Schema Details

### Question Object Structure

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `id` | Integer | Yes | Unique question identifier within the quiz |
| `text` | String | Yes | The question text |
| `points` | Integer | Yes | Marks/points allocated to this question |
| `image` | Object/null | No | Optional image reference `{type: "url", value: "..."}` |

### Example Quiz with Points

```javascript
const quizData = {
  teacherId: 1,
  title: "Operating Systems Quiz",
  subject: "Computer Science",
  courseCode: "CS458",
  description: "Quiz on OS concepts",
  questions: [
    {
      id: 1,
      text: "Explain process vs thread",
      points: 10,
      image: null
    },
    {
      id: 2,
      text: "Describe Round-Robin scheduling",
      points: 15,
      image: {
        type: "url",
        value: "https://cdn.example.com/diagram.png"
      }
    },
    {
      id: 3,
      text: "What is a deadlock?",
      points: 10,
      image: null
    }
  ],
  correctAnswers: [
    {
      questionId: 1,
      answer: "A process is independent with its own memory..."
    },
    {
      questionId: 2,
      answer: "Round-Robin assigns fixed time quantum..."
    },
    {
      questionId: 3,
      answer: "Deadlock occurs when processes wait circularly..."
    }
  ],
  startTime: new Date('2026-02-10T10:00:00Z'),
  endTime: new Date('2026-02-10T12:00:00Z')
};

const quiz = await Quiz.create(quizData);
```

---

## Calculating Total Points

To calculate the total points for a quiz:

```javascript
// In controller or service
const totalPoints = quiz.questions.reduce((sum, q) => sum + (q.points || 0), 0);
console.log(`Total Points: ${totalPoints}`);
```

---

## Frontend Integration

When creating a quiz in the frontend, ensure the form includes a points input for each question:

```jsx
// Example React component snippet
{questions.map((q, index) => (
  <div key={index}>
    <input 
      type="text"
      value={q.text}
      onChange={(e) => updateQuestion(index, 'text', e.target.value)}
      placeholder="Question text"
    />
    <input 
      type="number"
      value={q.points || 10}
      onChange={(e) => updateQuestion(index, 'points', parseInt(e.target.value))}
      placeholder="Points"
      min="1"
    />
  </div>
))}
```

---

## Backward Compatibility

- ✅ Existing code will continue to work
- ✅ The migration script adds default points (10) to old questions
- ✅ New questions should always include the `points` field
- ⚠️ Controllers should use fallback: `q.points || 10` for safety

---

## Testing

Run the verification script to test the updated schema:

```bash
node Backend/verify-json-schema.js
```

Expected output should show questions with the points field included.

---

## Notes

- **Default Points:** If not specified, use 10 points as default
- **Validation:** Consider adding validation to ensure points > 0
- **Total Calculation:** Always calculate total points dynamically from questions array
- **Grade Calculation:** Use points for percentage calculation: `(score / totalPoints) * 100`

---

## Related Files

- [Backend/prisma/schema.prisma](Backend/prisma/schema.prisma) - Quiz model definition
- [Backend/models/Quiz.prisma.js](Backend/models/Quiz.prisma.js) - Quiz operations
- [Backend/controllers/quizController.js](Backend/controllers/quizController.js) - Quiz endpoints (legacy QuizEvent)
- [Backend/verify-json-schema.js](Backend/verify-json-schema.js) - Schema verification script
