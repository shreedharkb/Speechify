const { GoogleGenerativeAI } = require('@google/generative-ai');
const axios = require('axios');

// Initialize Gemini AI with API key from environment
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

/**
 * Grade student answer using AI semantic similarity
 * @param {string} questionText - The question being asked
 * @param {string} studentAnswer - The answer provided by the student
 * @param {string} correctAnswer - The correct answer from the teacher
 * @param {number} threshold - Similarity threshold (default: 0.85 for 85%)
 * @returns {Promise<{isCorrect: boolean, similarityScore: number, explanation: string}>}
 */
async function gradeAnswerWithAI(questionText, studentAnswer, correctAnswer, threshold = 0.85) {
  try {
    console.log('\n🤖 AI Grading Starting...');
    console.log('Question:', questionText);
    console.log('Student Answer:', studentAnswer);
    console.log('Correct Answer:', correctAnswer);
    console.log('Threshold:', threshold);
    console.log('API Key exists:', !!process.env.GEMINI_API_KEY);
    
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

    // Use REST API directly instead of SDK to avoid version issues
    console.log('📡 Calling Gemini API via REST...');
    const apiKey = process.env.GEMINI_API_KEY;

    // Craft a detailed prompt for semantic similarity with VERY lenient scoring
    const prompt = `You are an expert grading assistant with a focus on semantic understanding and giving students credit for correct concepts. You will be given a question, the teacher's correct answer, and a student's answer. Your task is to determine if the student's answer is semantically correct.

QUESTION/CONTEXT: "${questionText}"

TEACHER'S CORRECT ANSWER: "${correctAnswer}"

STUDENT'S ANSWER: "${studentAnswer}"

CRITICAL INSTRUCTIONS - BE VERY GENEROUS:
1. Read the ENTIRE question/context carefully - it may contain a scenario or story.
2. Understand what the question is ACTUALLY asking based on the full context.
3. The student's answer is CORRECT if it conveys the same core meaning/concept, even if:
   - Worded COMPLETELY differently
   - Using synonyms, abbreviations, or paraphrasing
   - Shorter, longer, or more detailed explanation
   - Different perspective but same conclusion
   - Contains the key concept even with extra information
   - Uses common knowledge equivalents (e.g., "heart signal" = "ECG/EKG")
4. Focus ONLY on SEMANTIC MEANING, NEVER on exact word matching.
5. Give FULL CREDIT (0.9-1.0) if the core concept is correct, even if wording differs significantly.
6. For medical/scientific terms, accept common descriptions (e.g., "electrical signal from heart" = "electrocardiogram").

SCORING GUIDE - BE GENEROUS:
- 1.0 = Same core concept/meaning (even if words completely different)
- 0.95 = Same concept with minor detail difference
- 0.90 = Same concept, different way of explaining
- 0.85 = Correct concept but less complete
- 0.80 = Partially correct or related concept
- 0.70-0.79 = Somewhat related but missing key point
- Below 0.70 = Different meaning or incorrect

REAL EXAMPLES FROM YOUR DATA:
Q: "What is ECG?" | Teacher: "electro cardio gram" | Student: "electrical signal generated from the heart" → {"similarityScore": 0.95, "explanation": "Student correctly describes what ECG measures - the electrical signal from the heart. This is the correct concept."}

Q: "What is EEG?" | Teacher: "electro encephalo gram" | Student: "electrical signal produced by brain" → {"similarityScore": 0.95, "explanation": "Student correctly describes what EEG measures - the electrical signal from the brain. This is the correct concept."}

Q: "What is photosynthesis?" | Teacher: "process by which plants make food" | Student: "plants convert sunlight to energy" → {"similarityScore": 1.0, "explanation": "Same concept, different wording"}

Q: "Capital of France?" | Teacher: "Paris" | Student: "paris" → {"similarityScore": 1.0, "explanation": "Exact match, case doesn't matter"}

Return ONLY a JSON object with this exact format (no markdown, no extra text):

{
  "similarityScore": <number between 0.0 and 1.0>,
  "explanation": "<brief explanation of why the answers match or don't match>"
}

Return the JSON now:`;

    // Use axios to call the REST API directly - using gemini-1.5-flash (latest stable model)
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;
    
    console.log('🔄 Sending request to:', url.replace(apiKey, 'API_KEY_HIDDEN'));
    
    const response = await axios.post(url, {
      contents: [{
        parts: [{
          text: prompt
        }]
      }],
      generationConfig: {
        temperature: 0.1,
        maxOutputTokens: 512,
      }
    }, {
      headers: {
        'Content-Type': 'application/json',
      },
      timeout: 30000 // 30 second timeout
    });

    const data = response.data;
    console.log('✅ Gemini API response received');
    console.log('Full API response:', JSON.stringify(data, null, 2));
    
    // Extract text from response
    const text = data.candidates[0]?.content?.parts[0]?.text || '';
    console.log('✅ Gemini API raw response:', text);

    // Parse the JSON response
    let parsedResponse;
    try {
      // Try to extract JSON from the response (in case there's extra text)
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        console.log('Extracted JSON:', jsonMatch[0]);
        parsedResponse = JSON.parse(jsonMatch[0]);
      } else {
        console.log('Parsing full text as JSON');
        parsedResponse = JSON.parse(text);
      }
      console.log('Parsed response:', parsedResponse);
    } catch (parseError) {
      console.error('❌ Failed to parse Gemini response:', text);
      console.error('Parse error:', parseError.message);
      // Fallback to simple text matching if AI fails
      const normalizedStudent = studentAnswer.toLowerCase().trim();
      const normalizedCorrect = correctAnswer.toLowerCase().trim();
      const simpleMatch = normalizedStudent === normalizedCorrect ? 1.0 : 0.0;
      
      return {
        isCorrect: simpleMatch >= threshold,
        similarityScore: simpleMatch,
        explanation: 'AI parsing failed, used exact match fallback'
      };
    }

    const similarityScore = parseFloat(parsedResponse.similarityScore) || 0;
    const explanation = parsedResponse.explanation || 'No explanation provided';

    // Determine if answer is correct based on threshold
    const isCorrect = similarityScore >= threshold;

    console.log(`Grading result: Score=${similarityScore}, Threshold=${threshold}, Correct=${isCorrect}`);

    return {
      isCorrect,
      similarityScore,
      explanation
    };

  } catch (error) {
    console.error('❌ ERROR in AI grading:', error.message);
    
    // Log more details about the error
    if (error.response) {
      console.error('API Response Error:');
      console.error('Status:', error.response.status);
      console.error('Data:', JSON.stringify(error.response.data, null, 2));
    } else if (error.request) {
      console.error('No response received from API');
      console.error('Request was made but no response');
    } else {
      console.error('Error setting up request:', error.message);
    }
    console.error('Full error:', error);
    
    // SMART FALLBACK: Use intelligent matching when API fails
    console.log('⚠️ FALLBACK: Using smart semantic matching');
    
    const normalizedStudent = (studentAnswer || '').toLowerCase().trim();
    const normalizedCorrect = (correctAnswer || '').toLowerCase().trim();
    
    // 1. Exact match
    if (normalizedStudent === normalizedCorrect) {
      console.log('✅ Exact match found');
      return {
        isCorrect: true,
        similarityScore: 1.0,
        explanation: 'Exact match (AI unavailable, used fallback)'
      };
    }
    
    // 2. One contains the other (e.g., "Shakespeare" matches "William Shakespeare")
    // OR check for key word matches (more lenient for contextual answers)
    const studentWords = normalizedStudent.split(/\s+/).filter(w => w.length > 2);
    const correctWords = normalizedCorrect.split(/\s+/).filter(w => w.length > 2);
    
    // Check if one contains the other
    if (normalizedStudent.includes(normalizedCorrect) || normalizedCorrect.includes(normalizedStudent)) {
      console.log('✅ Partial match found (one contains other)');
      return {
        isCorrect: true,
        similarityScore: 0.95,
        explanation: 'Partial match - answer contains correct answer (AI unavailable, used fallback)'
      };
    }
    
    // Check if ANY word from student matches ANY word from correct
    const hasCommonWord = studentWords.some(sw => 
      correctWords.some(cw => sw === cw || sw.includes(cw) || cw.includes(sw))
    );
    
    if (hasCommonWord && (studentWords.length > 0 || correctWords.length > 0)) {
      const matchingWords = studentWords.filter(sw =>
        correctWords.some(cw => sw === cw || sw.includes(cw) || cw.includes(sw))
      );
      console.log(`✅ Found ${matchingWords.length} matching words:`, matchingWords);
      
      // If at least 30% of words match, consider it potentially correct
      const matchRatio = matchingWords.length / Math.max(studentWords.length, correctWords.length, 1);
      if (matchRatio >= 0.3) {
        return {
          isCorrect: true,
          similarityScore: 0.85 + (matchRatio * 0.1),
          explanation: `Word match detected (${Math.round(matchRatio * 100)}% match). AI unavailable, used smart fallback.`
        };
      }
    }
    
    // 3. Common equivalents with ENHANCED medical/scientific terms
    const equivalents = {
      // Medical abbreviations - EXPANDED
      'ecg': ['electrocardiogram', 'electro cardio gram', 'electrical signal heart', 'heart rhythm', 'electrical signal generated from the heart', 'electrical signal from heart', 'heart electrical signal', 'cardiac electrical signal'],
      'electrocardiogram': ['ecg', 'ekg', 'electrical signal heart', 'heart electrical activity', 'electrical signal from heart', 'electrical signal generated from the heart'],
      'electro cardio gram': ['ecg', 'ekg', 'electrical signal heart', 'electrical signal from heart', 'electrical signal generated from the heart', 'electrocardiogram'],
      'eeg': ['electroencephalogram', 'electro encephalo gram', 'brain rhythm', 'electrical signal brain', 'electrical signal produced by brain', 'electrical signal from brain', 'brain electrical signal'],
      'electroencephalogram': ['eeg', 'brain electrical activity', 'brain rhythm', 'electrical signal from brain', 'electrical signal produced by brain'],
      'electro encephalo gram': ['eeg', 'electrical signal brain', 'electrical signal from brain', 'electrical signal produced by brain', 'electroencephalogram'],
      
      // Medical terms described functionally
      'electrical signal generated from the heart': ['ecg', 'ekg', 'electrocardiogram', 'electro cardio gram', 'heart electrical signal'],
      'electrical signal from the heart': ['ecg', 'ekg', 'electrocardiogram', 'electro cardio gram'],
      'electrical signal from heart': ['ecg', 'ekg', 'electrocardiogram', 'electro cardio gram'],
      'electrical signal produced by brain': ['eeg', 'electroencephalogram', 'electro encephalo gram', 'brain electrical signal'],
      'electrical signal from brain': ['eeg', 'electroencephalogram', 'electro encephalo gram'],
      
      // Chemical formulas
      'h2o': ['water', 'dihydrogen monoxide'],
      'water': ['h2o', 'dihydrogen monoxide'],
      'o2': ['oxygen', 'oxygen gas', 'dioxygen'],
      'oxygen': ['o2', 'oxygen gas'],
      'co2': ['carbon dioxide', 'carbondioxide'],
      'carbon dioxide': ['co2'],
      'nacl': ['sodium chloride', 'table salt', 'salt'],
      'sodium chloride': ['nacl', 'table salt'],
      
      // Common abbreviations
      'usa': ['united states', 'united states of america', 'us', 'america'],
      'united states': ['usa', 'us', 'america'],
      'uk': ['united kingdom', 'great britain', 'britain'],
      'united kingdom': ['uk', 'great britain'],
      
      // Numbers
      '3.14': ['pi', 'π'],
      'pi': ['3.14', '3.14159', '22/7', 'π'],
      '0.25': ['1/4', 'one quarter', 'quarter'],
      'one quarter': ['0.25', '1/4', '25%'],
      
      // Common terms
      'mitochondria': ['powerhouse of the cell', 'powerhouse of cell', 'cell powerhouse', 'energy producer'],
      'photosynthesis': ['process plants make food', 'plants making food', 'plants use sunlight'],
      'dna': ['deoxyribonucleic acid', 'genetic material'],
      'deoxyribonucleic acid': ['dna', 'genetic material'],
      
      // Emotional/behavioral terms (for context questions)
      'positive': ['cheerful', 'happy', 'optimistic', 'upbeat', 'brave', 'hopeful', 'good'],
      'cheerful': ['positive', 'happy', 'joyful', 'upbeat', 'glad'],
      'happy': ['cheerful', 'positive', 'joyful', 'glad', 'content'],
      'helpful': ['nice', 'kind', 'supportive', 'useful', 'caring', 'considerate'],
      'kind': ['helpful', 'nice', 'caring', 'considerate', 'compassionate'],
      'caring': ['kind', 'helpful', 'considerate', 'compassionate', 'thoughtful'],
      'family': ['mom', 'mother', 'parents', 'relatives', 'dad', 'father'],
      'together': ['closeness', 'unity', 'bond', 'united'],
    };
    
    // Check if answers are equivalent
    const studentEquivalents = equivalents[normalizedStudent] || [];
    const correctEquivalents = equivalents[normalizedCorrect] || [];
    
    if (studentEquivalents.includes(normalizedCorrect) || correctEquivalents.includes(normalizedStudent)) {
      console.log('✅ Semantic equivalent found in dictionary');
      return {
        isCorrect: true,
        similarityScore: 0.95,
        explanation: 'Semantically equivalent answer (AI unavailable, used enhanced fallback dictionary)'
      };
    }
    
    // 4. Check if student answer contains any equivalent phrase OR vice versa
    for (const equiv of correctEquivalents) {
      if (normalizedStudent.includes(equiv) || equiv.includes(normalizedStudent)) {
        console.log(`✅ Student answer contains equivalent: "${equiv}"`);
        return {
          isCorrect: true,
          similarityScore: 0.92,
          explanation: `Contains equivalent concept: "${equiv}"`
        };
      }
    }
    
    for (const equiv of studentEquivalents) {
      if (normalizedCorrect.includes(equiv) || equiv.includes(normalizedCorrect)) {
        console.log(`✅ Correct answer matches student equivalent: "${equiv}"`);
        return {
          isCorrect: true,
          similarityScore: 0.92,
          explanation: `Student answer is equivalent to: "${equiv}"`
        };
      }
    }
    
    // 5. Advanced: Check if student's answer describes the correct answer
    // For example: "electrical signal from heart" should match "ECG"
    const descriptionPatterns = [
      { pattern: /electrical.*signal.*(heart|cardiac)/i, matches: ['ecg', 'ekg', 'electrocardiogram', 'electro cardio gram'] },
      { pattern: /electrical.*signal.*(brain|encephal)/i, matches: ['eeg', 'electroencephalogram', 'electro encephalo gram'] },
      { pattern: /(heart|cardiac).*electrical/i, matches: ['ecg', 'ekg', 'electrocardiogram'] },
      { pattern: /(brain|encephal).*electrical/i, matches: ['eeg', 'electroencephalogram'] },
    ];
    
    for (const { pattern, matches } of descriptionPatterns) {
      if (pattern.test(studentAnswer) && matches.some(m => normalizedCorrect.includes(m))) {
        console.log(`✅ Student answer describes the concept correctly via pattern: ${pattern}`);
        return {
          isCorrect: true,
          similarityScore: 0.93,
          explanation: 'Student correctly described the concept in their own words'
        };
      }
      if (pattern.test(correctAnswer) && matches.some(m => normalizedStudent.includes(m))) {
        console.log(`✅ Correct answer described, student gave abbreviated form`);
        return {
          isCorrect: true,
          similarityScore: 0.93,
          explanation: 'Student gave abbreviated/technical form of the described concept'
        };
      }
    }
    
    // 6. Cross-check: check if student answer contains equivalents of correct answer key concepts
    for (const correctWord of correctWords) {
      const wordEquivs = equivalents[correctWord] || [];
      for (const equivPhrase of wordEquivs) {
        // Check if the equivalent phrase appears in student's answer
        if (normalizedStudent.includes(equivPhrase)) {
          console.log(`✅ Conceptual match: correct answer "${correctWord}" → student has "${equivPhrase}"`);
          return {
            isCorrect: true,
            similarityScore: 0.90,
            explanation: `Conceptual match found: "${equivPhrase}"`
          };
        }
        
        // Check if key words from the equivalent are present (for phrases like "electrical signal heart")
        const equivWords = equivPhrase.split(/\s+/);
        const matchedEquivWords = equivWords.filter(ew => normalizedStudent.includes(ew));
        const equivMatchRatio = matchedEquivWords.length / equivWords.length;
        
        if (equivMatchRatio >= 0.75 && matchedEquivWords.length >= 2) {
          console.log(`✅ Partial conceptual match: "${matchedEquivWords.join(' ')}" from "${equivPhrase}"`);
          return {
            isCorrect: true,
            similarityScore: 0.95,
            explanation: `Strong conceptual match (${Math.round(equivMatchRatio * 100)}% match to "${equivPhrase}")`
          };
        }
      }
    }
    
    // 5. Check individual words for synonym matching
    for (const studentWord of studentWords) {
      const wordEquivs = equivalents[studentWord] || [];
      for (const correctWord of correctWords) {
        if (wordEquivs.includes(correctWord) || (equivalents[correctWord] || []).includes(studentWord)) {
          console.log(`✅ Synonym match: "${studentWord}" ≈ "${correctWord}"`);
          return {
            isCorrect: true,
            similarityScore: 0.9,
            explanation: `Synonym detected: "${studentWord}" matches "${correctWord}" (AI unavailable, used fallback)`
          };
        }
      }
    }
    
    // 6. No match found - use existing studentWords/correctWords from step 2
    console.log('❌ No direct match found');
    
    // 7. LAST RESORT: Check for significant word overlap (for contextual answers)
    // Re-filter for longer words (> 3 chars) for better semantic matching
    const longStudentWords = studentWords.filter(w => w.length > 3);
    const longCorrectWords = correctWords.filter(w => w.length > 3);
    
    if (longStudentWords.length > 0 && longCorrectWords.length > 0) {
      // Count common words
      const commonWords = longStudentWords.filter(word => 
        longCorrectWords.some(cw => cw.includes(word) || word.includes(cw))
      );
      
      const overlapRatio = commonWords.length / Math.max(longStudentWords.length, longCorrectWords.length);
      
      console.log(`Word overlap: ${commonWords.length} common words, ratio: ${overlapRatio.toFixed(2)}`);
      console.log(`Common words:`, commonWords);
      
      // If more than 40% word overlap, consider it potentially correct
      if (overlapRatio >= 0.4) {
        console.log('✅ Significant word overlap detected - marking as correct');
        return {
          isCorrect: true,
          similarityScore: 0.85 + (overlapRatio * 0.1), // 0.85 to 0.95 based on overlap
          explanation: `Significant word overlap detected (${Math.round(overlapRatio * 100)}% match). AI unavailable, used smart fallback.`
        };
      }
    }
    
    return {
      isCorrect: false,
      similarityScore: 0.0,
      explanation: `No semantic match found (AI unavailable, used fallback). AI error: ${error.message}`
    };
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
