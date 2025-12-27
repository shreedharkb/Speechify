const axios = require('axios');

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

    // Call SBERT service for semantic similarity grading
    console.log(`📡 Calling SBERT service at ${SBERT_SERVICE_URL}/grade...`);
    
    const response = await axios.post(`${SBERT_SERVICE_URL}/grade`, {
      questionText: questionText,
      studentAnswer: studentAnswer,
      correctAnswer: correctAnswer,
      threshold: threshold
    }, {
      headers: {
        'Content-Type': 'application/json',
      },
      timeout: 10000 // 10 second timeout
    });

    const data = response.data;
    console.log('✅ SBERT response received:', data);
    
    const { isCorrect, similarityScore, explanation } = data;

    console.log(`Grading result: Score=${similarityScore}, Threshold=${threshold}, Correct=${isCorrect}`);

    return {
      isCorrect,
      similarityScore,
      explanation
    };

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
