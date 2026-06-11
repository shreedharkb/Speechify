const axios = require('axios');
const { cache } = require('../config/redis');

// SBERT service URL - can be configured via environment variable
const SBERT_SERVICE_URL = process.env.SBERT_SERVICE_URL || 'http://localhost:5002';

/**
 * Grade student answer using SBERT semantic similarity
 * @param {string} questionText - The question being asked
 * @param {string} studentAnswer - The answer provided by the student
 * @param {string} correctAnswer - The correct answer from the teacher
 * @param {number} threshold - Similarity threshold (default: 0.85 for 85%)
 * @returns {Promise<{isCorrect: boolean, similarityScore: number, explanation: string}>}
 */
async function gradeAnswerWithAI(questionText, studentAnswer, correctAnswer, threshold = 0.85) {
  try {
    console.log('\n🤖 SBERT Grading Starting...');
    console.log('Question:', questionText);
    console.log('Student Answer:', studentAnswer);
    console.log('Correct Answer:', correctAnswer);
    console.log('Threshold:', threshold);
    
    // Handle empty answers
    if (!studentAnswer || !studentAnswer.trim()) {
      console.log('❌ Empty student answer');
      return {
        isCorrect: false,
        similarityScore: 0,
        explanation: 'No answer provided'
      };
    }

    if (!correctAnswer || !correctAnswer.trim()) {
      console.warn('❌ No correct answer provided for comparison');
      return {
        isCorrect: false,
        similarityScore: 0,
        explanation: 'No correct answer available'
      };
    }

    // Fast path 1: Exact match (case-insensitive)
    const normalizedStudent = studentAnswer.trim().toLowerCase();
    const normalizedCorrect = correctAnswer.trim().toLowerCase();
    if (normalizedStudent === normalizedCorrect) {
      console.log('✅ Exact match detected (bypassing SBERT)');
      return {
        isCorrect: true,
        similarityScore: 1.0,
        explanation: 'Exact match with the correct answer.'
      };
    }

    // Fast path 2: Substring match (Strictly student containing correct)
    const cleanStudent = normalizedStudent.replace(/[.,\/#!$%\^&\*;:{}=\-_`~()]/g, "");
    const cleanCorrect = normalizedCorrect.replace(/[.,\/#!$%\^&\*;:{}=\-_`~()]/g, "");
    
    // Only apply substring matching if the CORRECT answer is meaningful (> 3 chars)
    // and the student's answer CONTAINS the ENTIRE correct answer.
    // Do NOT check if the correct answer contains the student's answer, as that gives false positives.
    if (cleanCorrect.length > 3 && cleanStudent.includes(cleanCorrect)) {
      console.log('✅ Substring match: Student answer contains the correct answer');
      return {
        isCorrect: true,
        similarityScore: 1.0,
        explanation: 'Answer contains the correct keyword/phrase.'
      };
    }

    // Negation Check Heuristic
    const negationWords = ["not", "never", "no", "none", "nothing", "nowhere", "hardly", "barely", "isn't", "aren't", "don't", "doesn't", "won't", "can't", "couldn't", "wouldn't", "shouldn't"];
    const studentWords = cleanStudent.split(/\s+/);
    const correctWords = cleanCorrect.split(/\s+/);
    
    const studentHasNegation = negationWords.some(w => studentWords.includes(w));
    const correctHasNegation = negationWords.some(w => correctWords.includes(w));
    
    let negationMismatchPenalty = 0;
    if (studentHasNegation !== correctHasNegation) {
      console.log('⚠️ Negation mismatch detected! Will penalize the SBERT score.');
      negationMismatchPenalty = 0.3; // Reduce score by 0.3 if there's a mismatch
    }

    // Check cache first
    const cacheKey = cache.gradingKey(
      `${questionText}:${correctAnswer}`,
      studentAnswer
    );
    const cachedResult = await cache.get(cacheKey);
    if (cachedResult) {
      console.log('✅ Cache hit for grading');
      return cachedResult;
    }

    // Call SBERT service for semantic similarity grading
    // Ensure no double slashes if the environment variable has a trailing slash
    const baseUrl = SBERT_SERVICE_URL.endsWith('/') ? SBERT_SERVICE_URL.slice(0, -1) : SBERT_SERVICE_URL;
    console.log(`📡 Calling SBERT service at ${baseUrl}/grade...`);
    
    const response = await axios.post(`${baseUrl}/grade`, {
      questionText: questionText,
      studentAnswer: studentAnswer,
      correctAnswer: correctAnswer,
      threshold: threshold
    }, {
      headers: {
        'Content-Type': 'application/json',
      },
      timeout: 120000 // 120 second timeout (crucial for downloading HuggingFace models on free tier)
    });

    const data = response.data;
    console.log('✅ SBERT response received:', data);
    
    let { isCorrect, similarityScore, explanation } = data;

    // Apply negation penalty if applicable
    if (negationMismatchPenalty > 0) {
      similarityScore = Math.max(0, similarityScore - negationMismatchPenalty);
      if (similarityScore < threshold) {
        isCorrect = false;
        explanation += " (Score reduced due to negation mismatch)";
      }
    }

    // Length mismatch penalty (prevents 1-word answers like "The" from scoring high on long answers)
    if (studentWords.length <= 2 && correctWords.length >= 4 && similarityScore > 0.8) {
      console.log('⚠️ Answer length heavily mismatched. Penalizing SBERT anomaly.');
      similarityScore = Math.max(0, similarityScore - 0.4);
      if (similarityScore < threshold) {
        isCorrect = false;
        explanation += " (Score reduced: answer lacks sufficient detail)";
      }
    }

    console.log(`Grading result: Score=${similarityScore}, Threshold=${threshold}, Correct=${isCorrect}`);

    // Cache the result for 10 minutes
    const result = {
      isCorrect,
      similarityScore,
      explanation
    };
    await cache.set(cacheKey, result, 600);

    return result;

  } catch (error) {
    console.error('❌ ERROR in SBERT grading:', error.message);
    
    // Log more details about the error
    if (error.response) {
      console.error('SBERT Service Error:');
      console.error('Status:', error.response.status);
      console.error('Data:', JSON.stringify(error.response.data, null, 2));
    } else if (error.request) {
      console.error('No response received from SBERT service');
      console.error('Make sure SBERT service is running at:', SBERT_SERVICE_URL);
    } else {
      console.error('Error setting up request:', error.message);
    }
    
    // SBERT service is required - no fallback
    console.error('⚠️ SBERT service is required but unavailable. Grading failed.');
    throw new Error(`SBERT service unavailable at ${SBERT_SERVICE_URL}. Please ensure the service is running.`);
  }
}

/**
 * Grade multiple answers in batch
 * @param {Array<{questionText: string, studentAnswer: string, correctAnswer: string}>} answers
 * @param {number} threshold
 * @returns {Promise<Array<{isCorrect: boolean, similarityScore: number, explanation: string}>>}
 */
async function gradeMultipleAnswers(answers, threshold = 0.85) {
  const results = [];
  
  // Grade answers sequentially to avoid rate limiting
  for (const { questionText, studentAnswer, correctAnswer } of answers) {
    const result = await gradeAnswerWithAI(questionText, studentAnswer, correctAnswer, threshold);
    results.push(result);
    
    // Small delay to avoid hitting API rate limits
    await new Promise(resolve => setTimeout(resolve, 100));
  }
  
  return results;
}

module.exports = {
  gradeAnswerWithAI,
  gradeMultipleAnswers
};
