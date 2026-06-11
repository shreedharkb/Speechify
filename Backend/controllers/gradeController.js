const axios = require('axios');
const { cache } = require('../config/redis');

// SBERT service URL
const SBERT_SERVICE_URL = process.env.SBERT_SERVICE_URL || 'http://localhost:5002';

/**
 * Returns the base URL for the SBERT service (no trailing slash).
 */
function sbertBase() {
  return SBERT_SERVICE_URL.endsWith('/')
    ? SBERT_SERVICE_URL.slice(0, -1)
    : SBERT_SERVICE_URL;
}

/**
 * Call the SBERT service with retry + exponential backoff.
 * Handles Render cold-start 502/504 errors gracefully.
 *
 * @param {string} endpoint  - e.g. '/grade' or '/batch-grade'
 * @param {object} body      - JSON body to POST
 * @param {number} maxRetries
 * @returns {Promise<object>} - Parsed response data
 */
async function callSbert(endpoint, body, maxRetries = 3) {
  const url = `${sbertBase()}${endpoint}`;
  let delay = 2000;

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      console.log(`📡 SBERT ${endpoint} — attempt ${attempt}/${maxRetries}`);
      const response = await axios.post(url, body, {
        headers: { 'Content-Type': 'application/json' },
        timeout: 120000, // 2 min — allows HuggingFace model download on cold start
      });
      return response.data;
    } catch (err) {
      const isLastAttempt = attempt === maxRetries;
      const isRetryable = !err.response || [502, 503, 504].includes(err.response?.status);

      if (isLastAttempt || !isRetryable) {
        console.error(`❌ SBERT call failed after ${attempt} attempt(s): ${err.message}`);
        throw err;
      }

      console.warn(`⚠️ SBERT unavailable (attempt ${attempt}). Retrying in ${delay / 1000}s...`);
      await new Promise(r => setTimeout(r, delay));
      delay *= 2; // exponential backoff: 2s → 4s → 8s
    }
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// PUBLIC API
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Grade a single student answer using the SBERT service.
 *
 * @param {string} questionText   - The quiz question
 * @param {string} studentAnswer  - The student's answer
 * @param {string} correctAnswer  - The teacher's correct answer
 * @param {number} [threshold=0.75] - Similarity threshold for pass/fail
 * @returns {Promise<{ isCorrect: boolean, similarityScore: number, explanation: string }>}
 */
async function gradeAnswerWithAI(questionText, studentAnswer, correctAnswer, threshold = 0.75) {
  console.log('\n🤖 Grading started');
  console.log('  Question :', questionText);
  console.log('  Student  :', studentAnswer);
  console.log('  Correct  :', correctAnswer);
  console.log('  Threshold:', threshold);

  // ── Fast-path: empty inputs ──────────────────────────────────────────────
  if (!studentAnswer?.trim()) {
    return { isCorrect: false, similarityScore: 0, explanation: 'No answer provided.' };
  }
  if (!correctAnswer?.trim()) {
    return { isCorrect: false, similarityScore: 0, explanation: 'No correct answer available.' };
  }

  // ── Cache lookup ─────────────────────────────────────────────────────────
  const cacheKey = cache.gradingKey(
    `${questionText}:${correctAnswer}`,
    studentAnswer
  );
  const cached = await cache.get(cacheKey);
  if (cached) {
    console.log('✅ Cache hit');
    return cached;
  }

  // ── Delegate ALL grading logic to the Python service ────────────────────
  const data = await callSbert('/grade', {
    questionText,
    studentAnswer,
    correctAnswer,
    threshold,
  });

  if (data.error) {
    throw new Error(`SBERT service error: ${data.error}`);
  }

  const result = {
    isCorrect:       data.isCorrect,
    similarityScore: data.similarityScore,
    explanation:     data.explanation,
  };

  console.log(`✅ Grade result: score=${result.similarityScore}  correct=${result.isCorrect}`);

  // Cache for 10 minutes
  await cache.set(cacheKey, result, 600);
  return result;
}

/**
 * Grade multiple answers sequentially.
 *
 * @param {Array<{ questionText, studentAnswer, correctAnswer }>} answers
 * @param {number} [threshold=0.75]
 * @returns {Promise<Array<{ isCorrect, similarityScore, explanation }>>}
 */
async function gradeMultipleAnswers(answers, threshold = 0.75) {
  const results = [];
  for (const { questionText, studentAnswer, correctAnswer } of answers) {
    const result = await gradeAnswerWithAI(questionText, studentAnswer, correctAnswer, threshold);
    results.push(result);
    // Small delay to avoid hammering the SBERT service
    await new Promise(r => setTimeout(r, 100));
  }
  return results;
}

/**
 * Warm up the SBERT service (fire-and-forget).
 * Call this on backend startup to reduce first-request cold-start latency.
 */
async function warmupSbert() {
  try {
    console.log(`🔥 Warming up SBERT service at ${sbertBase()}/health ...`);
    await axios.get(`${sbertBase()}/health`, { timeout: 15000 });
    console.log('✅ SBERT service is warm.');
  } catch (err) {
    console.log(`⚠️ SBERT warmup ping failed (normal if asleep): ${err.message}`);
  }
}

module.exports = {
  gradeAnswerWithAI,
  gradeMultipleAnswers,
  warmupSbert,
};
