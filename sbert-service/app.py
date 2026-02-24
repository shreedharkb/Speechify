from flask import Flask, request, jsonify
from flask_cors import CORS
from sentence_transformers import SentenceTransformer, util
import torch
import logging

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = Flask(__name__)
CORS(app)

# Initialize the SBERT model (using a lightweight but accurate model)
# 'all-MiniLM-L6-v2' is a good balance of speed and accuracy
logger.info("Loading SBERT model...")
model = SentenceTransformer('all-MiniLM-L6-v2')
logger.info("SBERT model loaded successfully!")

def normalize_text(text):
    """Normalize text for better comparison"""
    if not text:
        return ""
    return text.strip().lower()

def calculate_semantic_similarity(text1, text2):
    """
    Calculate semantic similarity between two texts using SBERT
    Returns a score between 0 and 1
    """
    # Encode both texts
    embedding1 = model.encode(text1, convert_to_tensor=True)
    embedding2 = model.encode(text2, convert_to_tensor=True)
    
    # Calculate cosine similarity
    similarity = util.pytorch_cos_sim(embedding1, embedding2)
    
    # Convert to float and ensure it's between 0 and 1
    score = float(similarity[0][0])
    return max(0.0, min(1.0, score))

def generate_explanation(similarity_score, threshold=0.85):
    """
    Generate a human-readable explanation based on similarity score
    """
    if similarity_score >= 0.95:
        return "Excellent match - answers are semantically equivalent"
    elif similarity_score >= 0.90:
        return "Very strong match - core concepts are the same"
    elif similarity_score >= threshold:
        return "Good match - answer conveys the correct meaning"
    elif similarity_score >= 0.70:
        return "Partial match - some correct concepts but incomplete or missing key details"
    elif similarity_score >= 0.50:
        return "Weak match - some related concepts but significantly different meaning"
    else:
        return "No significant match - answers have different meanings"

@app.route('/health', methods=['GET'])
def health():
    """Health check endpoint"""
    return jsonify({
        'status': 'healthy',
        'model': 'all-MiniLM-L6-v2',
        'service': 'sbert-grading'
    })

@app.route('/grade', methods=['POST'])
def grade_answer():
    """
    Grade a student answer against a correct answer using semantic similarity
    
    Expected JSON body:
    {
        "questionText": "What is photosynthesis?",
        "studentAnswer": "Process where plants make food from sunlight",
        "correctAnswer": "Process by which plants convert light energy into chemical energy",
        "threshold": 0.85  // optional, defaults to 0.85
    }
    
    Returns:
    {
        "isCorrect": true/false,
        "similarityScore": 0.0-1.0,
        "explanation": "explanation text"
    }
    """
    try:
        data = request.get_json()
        
        # Validate required fields
        if not data:
            return jsonify({'error': 'No JSON data provided'}), 400
        
        question_text = data.get('questionText', '')
        student_answer = data.get('studentAnswer', '')
        correct_answer = data.get('correctAnswer', '')
        threshold = float(data.get('threshold', 0.85))
        
        logger.info(f"Grading request received:")
        logger.info(f"  Question: {question_text}")
        logger.info(f"  Student: {student_answer}")
        logger.info(f"  Correct: {correct_answer}")
        logger.info(f"  Threshold: {threshold}")
        
        # Handle empty answers
        if not student_answer or not student_answer.strip():
            return jsonify({
                'isCorrect': False,
                'similarityScore': 0.0,
                'explanation': 'No answer provided'
            })
        
        if not correct_answer or not correct_answer.strip():
            return jsonify({
                'isCorrect': False,
                'similarityScore': 0.0,
                'explanation': 'No correct answer available for comparison'
            })
        
        # Normalize texts
        student_normalized = normalize_text(student_answer)
        correct_normalized = normalize_text(correct_answer)
        
        # Check for exact match first (optimization)
        if student_normalized == correct_normalized:
            logger.info("  Result: Exact match!")
            return jsonify({
                'isCorrect': True,
                'similarityScore': 1.0,
                'explanation': 'Exact match'
            })
        
        # Calculate semantic similarity using SBERT
        # Combine question with answer for better context
        student_text = f"{question_text} {student_answer}"
        correct_text = f"{question_text} {correct_answer}"
        
        similarity_score = calculate_semantic_similarity(student_text, correct_text)
        
        # Also calculate direct answer similarity (without question context)
        direct_similarity = calculate_semantic_similarity(student_answer, correct_answer)
        
        # Use the higher of the two scores (more lenient)
        final_score = max(similarity_score, direct_similarity)
        
        # Determine if correct based on threshold
        is_correct = final_score >= threshold
        
        # Generate explanation
        explanation = generate_explanation(final_score, threshold)
        
        logger.info(f"  Similarity (with context): {similarity_score:.4f}")
        logger.info(f"  Similarity (direct): {direct_similarity:.4f}")
        logger.info(f"  Final score: {final_score:.4f}")
        logger.info(f"  Result: {'CORRECT' if is_correct else 'INCORRECT'}")
        
        return jsonify({
            'isCorrect': is_correct,
            'similarityScore': round(final_score, 4),
            'explanation': explanation
        })
        
    except Exception as e:
        logger.error(f"Error grading answer: {str(e)}", exc_info=True)
        return jsonify({
            'error': 'Internal server error',
            'message': str(e)
        }), 500

@app.route('/batch-grade', methods=['POST'])
def batch_grade():
    """
    Grade multiple student answers at once
    
    Expected JSON body:
    {
        "threshold": 0.85,  // optional
        "answers": [
            {
                "questionText": "...",
                "studentAnswer": "...",
                "correctAnswer": "..."
            },
            ...
        ]
    }
    """
    try:
        data = request.get_json()
        
        if not data or 'answers' not in data:
            return jsonify({'error': 'No answers provided'}), 400
        
        answers = data['answers']
        threshold = float(data.get('threshold', 0.85))
        
        results = []
        
        for idx, answer_data in enumerate(answers):
            try:
                question_text = answer_data.get('questionText', '')
                student_answer = answer_data.get('studentAnswer', '')
                correct_answer = answer_data.get('correctAnswer', '')
                
                # Handle empty answers
                if not student_answer or not student_answer.strip():
                    results.append({
                        'index': idx,
                        'isCorrect': False,
                        'similarityScore': 0.0,
                        'explanation': 'No answer provided'
                    })
                    continue
                
                if not correct_answer or not correct_answer.strip():
                    results.append({
                        'index': idx,
                        'isCorrect': False,
                        'similarityScore': 0.0,
                        'explanation': 'No correct answer available'
                    })
                    continue
                
                # Calculate similarity
                student_text = f"{question_text} {student_answer}"
                correct_text = f"{question_text} {correct_answer}"
                
                similarity_score = calculate_semantic_similarity(student_text, correct_text)
                direct_similarity = calculate_semantic_similarity(student_answer, correct_answer)
                final_score = max(similarity_score, direct_similarity)
                
                is_correct = final_score >= threshold
                explanation = generate_explanation(final_score, threshold)
                
                results.append({
                    'index': idx,
                    'isCorrect': is_correct,
                    'similarityScore': round(final_score, 4),
                    'explanation': explanation
                })
                
            except Exception as e:
                logger.error(f"Error grading answer {idx}: {str(e)}")
                results.append({
                    'index': idx,
                    'error': str(e),
                    'isCorrect': False,
                    'similarityScore': 0.0
                })
        
        return jsonify({'results': results})
        
    except Exception as e:
        logger.error(f"Error in batch grading: {str(e)}", exc_info=True)
        return jsonify({
            'error': 'Internal server error',
            'message': str(e)
        }), 500

if __name__ == '__main__':
    # For development only - production uses gunicorn
    app.run(host='0.0.0.0', port=5002, debug=False)
