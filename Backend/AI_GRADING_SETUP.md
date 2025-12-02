# AI-Powered Semantic Grading Setup

This document explains how the AI-powered semantic grading system works and how to set it up.

## Overview

Instead of simple text matching, the system now uses **Google's Gemini AI** to perform semantic similarity checks between student answers and correct answers. This means:

- ✅ "H2O" and "water" are recognized as the same answer
- ✅ "photosynthesis" and "the process plants use to make food" are marked correct
- ✅ "mitochondria" and "powerhouse of the cell" are considered equivalent
- ✅ Minor spelling errors and different wording are handled intelligently

## Setup Instructions

### Step 1: Get Your Gemini API Key

1. Visit [Google AI for Developers](https://ai.google.dev/)
2. Click "Get API Key" or "Get Started"
3. Sign in with your Google account
4. Create a new project (or select an existing one)
5. Navigate to API Keys section
6. Click "Create API Key"
7. Copy the generated API key

### Step 2: Add API Key to Environment

Open `Backend/.env` and replace `YOUR_GEMINI_API_KEY_HERE` with your actual API key:

```env
GEMINI_API_KEY=AIzaSyC_your_actual_api_key_here
```

### Step 3: Install Dependencies

Run this command in the Backend folder:

```bash
cd Backend
npm install @google/generative-ai
```

### Step 4: Restart Backend Server

```bash
npm run start
```

## How It Works

### Grading Flow

1. **Student submits quiz** → Answers sent to backend
2. **For each answer** → `gradeAnswerWithAI()` is called
3. **Gemini AI analyzes** → Compares student answer with correct answer
4. **Returns similarity score** → Number between 0.0 (no match) and 1.0 (perfect match)
5. **Apply threshold** → If score ≥ 0.85 (85%), answer is marked correct
6. **Save results** → Store score, explanation, and grading metadata

### Key Files

- **`controllers/gradeController.js`** - AI grading logic
- **`controllers/quizAttemptController.js`** - Quiz submission with AI grading
- **`models/QuizAttempt.js`** - Stores similarity scores and explanations

### Adjusting the Threshold

The default threshold is **85% (0.85)**. You can adjust it in `quizAttemptController.js`:

```javascript
const gradeResult = await gradeAnswerWithAI(
  answerObj.studentAnswer,
  question.correctAnswerText,
  0.85 // Change this value: 0.0 to 1.0
);
```

**Threshold Guidelines:**
- `0.95` - Very strict (only near-perfect matches)
- `0.85` - **Recommended** (allows reasonable paraphrasing)
- `0.75` - Lenient (accepts broader interpretations)
- `0.60` - Very lenient (may accept partially correct answers)

## Features

### Semantic Understanding

The AI understands:
- **Synonyms**: "big" ↔ "large"
- **Paraphrasing**: "capital of France" ↔ "Paris"
- **Abbreviations**: "USA" ↔ "United States of America"
- **Scientific terms**: "NaCl" ↔ "sodium chloride" ↔ "table salt"

### Fallback Mechanism

If the AI API fails or is unavailable, the system automatically falls back to simple text matching to ensure grading still works.

### Response Format

Each graded answer includes:

```javascript
{
  "question": "What is H2O?",
  "studentAnswer": "water",
  "correctAnswer": "H2O",
  "isCorrect": true,
  "pointsEarned": 10,
  "maxPoints": 10,
  "similarityScore": 1.0,
  "explanation": "Student's answer 'water' is semantically equivalent to 'H2O'"
}
```

## Testing

### Test Cases

Create a quiz with these questions to test AI grading:

| Teacher's Answer | Student Answer | Expected Result |
|-----------------|----------------|-----------------|
| "H2O" | "water" | ✅ Correct (100% match) |
| "photosynthesis" | "process where plants make food using sunlight" | ✅ Correct (~95% match) |
| "Paris" | "capital of France" | ✅ Correct (~90% match) |
| "mitochondria" | "powerhouse of the cell" | ✅ Correct (100% match) |
| "Tokyo" | "Beijing" | ❌ Incorrect (~30% match) |

### Debugging

Check the backend terminal for detailed logs:

```
Question 1: CORRECT (Score: 1.0)
Gemini API raw response: {"similarityScore": 1.0, "explanation": "..."}
Grading result: Score=1.0, Threshold=0.85, Correct=true
```

## API Rate Limits

The free tier of Gemini API has limits:
- **60 requests per minute**
- **1,500 requests per day**

The system includes a 100ms delay between grading each answer to avoid rate limiting.

## Troubleshooting

### Error: "API key not valid"
- Verify your API key in `.env` file
- Ensure no extra spaces or quotes
- Check if the API key is activated in Google AI Studio

### Error: "Failed to parse Gemini response"
- The system will automatically fall back to simple text matching
- Check the raw response in console logs

### Error: "Module not found: @google/generative-ai"
- Run: `npm install @google/generative-ai` in Backend folder

## Cost Considerations

**Gemini API Pricing (as of 2024):**
- **Free tier**: 60 requests/minute, no cost
- **Paid tier**: $0.00025 per request (very affordable)

**Example Cost Calculation:**
- 100 students × 10 questions = 1,000 API calls
- Cost: 1,000 × $0.00025 = **$0.25** (25 cents)

For most educational use cases, the free tier is sufficient!

## Future Enhancements

- [ ] Batch grading to reduce API calls
- [ ] Cache common answer pairs
- [ ] Support for multiple languages
- [ ] Partial credit based on similarity scores
- [ ] Teacher review interface for borderline cases
