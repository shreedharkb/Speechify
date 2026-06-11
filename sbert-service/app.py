from flask import Flask, request, jsonify
from flask_cors import CORS
from sentence_transformers import SentenceTransformer, util
import torch
import logging
import os
import re
import math
import unicodedata

# Memory optimizations for Render free tier (512MB RAM)
os.environ["OMP_NUM_THREADS"] = "1"
os.environ["MKL_NUM_THREADS"] = "1"
torch.set_num_threads(1)
torch.set_grad_enabled(False)

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = Flask(__name__)
CORS(app)

# Global model — lazy loaded on first request
_model = None

def get_model():
    global _model
    if _model is None:
        logger.info("Loading SBERT model...")
        _model = SentenceTransformer('all-MiniLM-L6-v2')
        logger.info("SBERT model loaded.")
    return _model


# ──────────────────────────────────────────────────────────────────────────────
# PRE-PROCESSING HELPERS
# ──────────────────────────────────────────────────────────────────────────────

def normalize(text: str) -> str:
    """Lowercase, strip, collapse whitespace."""
    text = unicodedata.normalize("NFKD", text)
    return re.sub(r"\s+", " ", text.strip().lower())


def tokenize(text: str) -> list[str]:
    """Return meaningful word tokens (no punctuation, no single chars)."""
    tokens = re.findall(r"[a-z0-9]+", normalize(text))
    return [t for t in tokens if len(t) > 1 or t.isdigit()]


def is_gibberish(text: str) -> bool:
    """
    Detect keysmash / random character strings.
    A string is gibberish if:
      - It has no vowels at all, OR
      - Its ratio of vowels to total letters is below 5% AND it has > 4 characters, OR
      - It contains a run of 5+ consecutive consonants
    """
    letters = re.sub(r"[^a-z]", "", normalize(text))
    if not letters:
        return False  # purely numeric — handled elsewhere
    vowels = set("aeiou")
    n_vowels = sum(1 for c in letters if c in vowels)
    vowel_ratio = n_vowels / len(letters)

    # No vowels at all in a long string
    if n_vowels == 0 and len(letters) > 2:
        return True

    # Less than 5% vowels in a medium-length string
    if vowel_ratio < 0.05 and len(letters) > 4:
        return True

    # Long consonant run (e.g. "kjkjsf", "qwrtyp")
    if re.search(r"[^aeiou]{5,}", letters):
        return True

    return False


def extract_numbers(text: str) -> list[float]:
    """Extract all numbers (int or float) from text."""
    return [float(m) for m in re.findall(r"-?\d+(?:\.\d+)?", text)]


def is_numeric_answer(text: str) -> bool:
    """True if the stripped text is essentially just a number (or math expression)."""
    stripped = normalize(text)
    # Matches things like "4", "-3.5", "1/2", "1,000"
    return bool(re.fullmatch(r"[-+]?[\d,]+(?:[./]\d+)?", stripped.replace(" ", "")))


def jaccard_similarity(text1: str, text2: str) -> float:
    """Word-level Jaccard similarity."""
    set1 = set(tokenize(text1))
    set2 = set(tokenize(text2))
    if not set1 and not set2:
        return 1.0
    if not set1 or not set2:
        return 0.0
    intersection = set1 & set2
    union = set1 | set2
    return len(intersection) / len(union)


def token_f1(text1: str, text2: str) -> float:
    """Token-level F1 (SQuAD style) — handles partial overlaps better than Jaccard."""
    tokens1 = tokenize(text1)
    tokens2 = tokenize(text2)
    if not tokens1 and not tokens2:
        return 1.0
    if not tokens1 or not tokens2:
        return 0.0
    common = set(tokens1) & set(tokens2)
    if not common:
        return 0.0
    precision = len(common) / len(tokens2)
    recall = len(common) / len(tokens1)
    return 2 * precision * recall / (precision + recall)


# ──────────────────────────────────────────────────────────────────────────────
# NUMERIC GRADING
# ──────────────────────────────────────────────────────────────────────────────

def grade_numeric(student_answer: str, correct_answer: str) -> dict:
    """
    Strict numeric grading.
    - Exact numeric match → 1.0
    - Student wrote something non-numeric → 0.0
    - Close but not equal → partial score based on relative error
    """
    correct_nums = extract_numbers(correct_answer)
    student_nums = extract_numbers(student_answer)

    if not correct_nums:
        # Shouldn't happen since we call this only when correct is numeric
        return {"score": 0.0, "explanation": "No numeric value found in correct answer."}

    correct_val = correct_nums[0]

    if not student_nums:
        # Student wrote text when a number was expected
        return {
            "score": 0.0,
            "explanation": "Expected a numeric answer but got non-numeric text."
        }

    student_val = student_nums[0]

    # Exact match
    if math.isclose(student_val, correct_val, rel_tol=1e-6):
        return {"score": 1.0, "explanation": "Exact numeric match."}

    # Relative error penalty
    if correct_val != 0:
        rel_error = abs(student_val - correct_val) / abs(correct_val)
        if rel_error <= 0.01:   # within 1%
            score = 0.95
        elif rel_error <= 0.05: # within 5%
            score = 0.75
        elif rel_error <= 0.20: # within 20%
            score = 0.40
        else:
            score = 0.0
    else:
        score = 0.0 if student_val != 0 else 1.0

    explanation = f"Numeric answer differs from correct value ({correct_val}). Score penalized."
    return {"score": score, "explanation": explanation}


# ──────────────────────────────────────────────────────────────────────────────
# SBERT SIMILARITY
# ──────────────────────────────────────────────────────────────────────────────

def sbert_similarity(text1: str, text2: str) -> float:
    """Raw cosine similarity from SBERT."""
    m = get_model()
    emb1 = m.encode(text1, convert_to_tensor=True)
    emb2 = m.encode(text2, convert_to_tensor=True)
    score = float(util.pytorch_cos_sim(emb1, emb2)[0][0])
    return max(0.0, min(1.0, score))


# ──────────────────────────────────────────────────────────────────────────────
# MASTER GRADING FUNCTION
# ──────────────────────────────────────────────────────────────────────────────

def compute_grade(question_text: str, student_answer: str, correct_answer: str, threshold: float) -> dict:
    """
    Multi-layer grading pipeline:

    Layer 0 — Empty / trivial checks
    Layer 1 — Gibberish detection         → hard 0
    Layer 2 — Numeric answer detection    → strict numeric grading
    Layer 3 — Exact / substring match     → score 1.0
    Layer 4 — Token overlap gate          → if zero overlap, cap SBERT heavily
    Layer 5 — SBERT semantic similarity   → weighted (NOT max)
    Layer 6 — Final decision
    """
    s_norm = normalize(student_answer)
    c_norm = normalize(correct_answer)

    # ── Layer 0: Empty answers ───────────────────────────────────────────────
    if not s_norm:
        return {"isCorrect": False, "similarityScore": 0.0, "explanation": "No answer provided."}
    if not c_norm:
        return {"isCorrect": False, "similarityScore": 0.0, "explanation": "No reference answer available."}

    logger.info(f"  Student  : {s_norm}")
    logger.info(f"  Correct  : {c_norm}")
    logger.info(f"  Threshold: {threshold}")

    # ── Layer 1: Gibberish detection ─────────────────────────────────────────
    if is_gibberish(s_norm):
        logger.info("  ❌ Gibberish detected → score 0.0")
        return {
            "isCorrect": False,
            "similarityScore": 0.0,
            "explanation": "Answer appears to be random/gibberish text with no recognizable words."
        }

    # ── Layer 2: Numeric answer ──────────────────────────────────────────────
    if is_numeric_answer(c_norm):
        result = grade_numeric(s_norm, c_norm)
        final_score = result["score"]
        is_correct = final_score >= threshold
        logger.info(f"  Numeric grade → score={final_score:.4f}")
        return {
            "isCorrect": is_correct,
            "similarityScore": round(final_score, 4),
            "explanation": result["explanation"]
        }

    # ── Layer 3: Exact / Near-exact match ────────────────────────────────────
    if s_norm == c_norm:
        logger.info("  ✅ Exact match")
        return {"isCorrect": True, "similarityScore": 1.0, "explanation": "Exact match."}

    # Substring containment (only when correct is meaningful & student has it)
    if len(c_norm) > 3 and c_norm in s_norm:
        logger.info("  ✅ Correct answer contained in student answer")
        return {
            "isCorrect": True,
            "similarityScore": 1.0,
            "explanation": "Answer contains the complete correct answer."
        }

    # ── Layer 4: Token overlap gate ──────────────────────────────────────────
    jaccard = jaccard_similarity(s_norm, c_norm)
    f1 = token_f1(s_norm, c_norm)
    lexical_score = (jaccard + f1) / 2.0
    logger.info(f"  Jaccard={jaccard:.4f}  F1={f1:.4f}  Lexical={lexical_score:.4f}")

    # Detect short correct answers (≤ 3 words) — SBERT is unreliable for very short texts
    correct_words = tokenize(c_norm)
    student_words = tokenize(s_norm)
    is_short_correct = len(correct_words) <= 3

    # ── Layer 5: SBERT Semantic Similarity ───────────────────────────────────
    # Use SBERT on answers only (direct), and optionally context-aware.
    # We do NOT use max() — we use a weighted combination.

    direct_sbert = sbert_similarity(student_answer, correct_answer)

    # Context-aware score (helps for subject-matter questions)
    ctx_student = f"Question: {question_text} Answer: {student_answer}"
    ctx_correct = f"Question: {question_text} Answer: {correct_answer}"
    ctx_sbert = sbert_similarity(ctx_student, ctx_correct)

    # Weighted average: 60% direct, 40% context-aware
    raw_sbert = 0.6 * direct_sbert + 0.4 * ctx_sbert
    logger.info(f"  SBERT direct={direct_sbert:.4f}  ctx={ctx_sbert:.4f}  weighted={raw_sbert:.4f}")

    # ── Layer 6: Combine scores and apply guards ──────────────────────────────

    # Guard A: Zero token overlap with short/numeric-looking correct answers → hard cap
    if lexical_score == 0.0 and is_short_correct:
        final_score = min(raw_sbert, 0.25)
        logger.info(f"  ⚠️ Zero lexical overlap on short answer → capped at 0.25 → {final_score:.4f}")

    # Guard B: Zero token overlap on longer answers → significant discount
    elif lexical_score == 0.0:
        final_score = raw_sbert * 0.4
        logger.info(f"  ⚠️ Zero lexical overlap → 40% discount → {final_score:.4f}")

    # Guard C: Very low lexical overlap (< 10%) → partial discount
    elif lexical_score < 0.10:
        blend = 0.3 * lexical_score + 0.7 * raw_sbert
        final_score = blend * 0.75
        logger.info(f"  ⚠️ Low lexical overlap → blended+discounted → {final_score:.4f}")

    # Normal: meaningful lexical overlap — trust SBERT more, blend with lexical
    else:
        # 70% SBERT, 30% lexical for well-overlapping answers
        final_score = 0.70 * raw_sbert + 0.30 * lexical_score
        logger.info(f"  ✅ Normal blend → {final_score:.4f}")

    # Guard D: Negation mismatch — one has "not/never/no" and other doesn't
    neg_words = {"not", "never", "no", "none", "nothing", "isn't", "aren't",
                 "don't", "doesn't", "won't", "can't", "couldn't", "wouldn't", "shouldn't"}
    s_has_neg = bool(set(student_words) & neg_words)
    c_has_neg = bool(set(correct_words) & neg_words)
    if s_has_neg != c_has_neg:
        final_score = max(0.0, final_score - 0.30)
        logger.info(f"  ⚠️ Negation mismatch penalty → {final_score:.4f}")

    # Guard E: Length mismatch penalty (1-word vs long answer)
    if len(student_words) <= 2 and len(correct_words) >= 5 and final_score > 0.5:
        final_score = max(0.0, final_score - 0.30)
        logger.info(f"  ⚠️ Length mismatch penalty → {final_score:.4f}")

    final_score = round(max(0.0, min(1.0, final_score)), 4)
    is_correct = final_score >= threshold
    explanation = generate_explanation(final_score, threshold)

    logger.info(f"  Final score={final_score}  Correct={is_correct}")
    return {
        "isCorrect": is_correct,
        "similarityScore": final_score,
        "explanation": explanation
    }


def generate_explanation(score: float, threshold: float) -> str:
    if score >= 0.95:
        return "Excellent — answer is semantically equivalent to the correct answer."
    elif score >= 0.90:
        return "Very strong — core concepts match well."
    elif score >= threshold:
        return "Good match — answer conveys the correct meaning."
    elif score >= 0.60:
        return "Partial match — some correct concepts but missing key details."
    elif score >= 0.35:
        return "Weak match — loosely related but significantly different meaning."
    else:
        return "Incorrect — answer does not match the correct answer."


# ──────────────────────────────────────────────────────────────────────────────
# FLASK ROUTES
# ──────────────────────────────────────────────────────────────────────────────

@app.route('/health', methods=['GET'])
def health():
    return jsonify({'status': 'healthy', 'model': 'all-MiniLM-L6-v2', 'service': 'sbert-grading'})


@app.route('/grade', methods=['POST'])
def grade_answer():
    """
    POST /grade
    Body: { questionText, studentAnswer, correctAnswer, threshold? }
    Returns: { isCorrect, similarityScore, explanation }
    """
    try:
        data = request.get_json()
        if not data:
            return jsonify({'error': 'No JSON data provided'}), 400

        question_text  = data.get('questionText', '')
        student_answer = data.get('studentAnswer', '')
        correct_answer = data.get('correctAnswer', '')
        threshold      = float(data.get('threshold', 0.75))

        logger.info("── Grade request ──────────────────────────")

        result = compute_grade(question_text, student_answer, correct_answer, threshold)
        return jsonify(result)

    except Exception as e:
        logger.error(f"Error in /grade: {e}", exc_info=True)
        return jsonify({'error': 'Internal server error', 'message': str(e)}), 500


@app.route('/batch-grade', methods=['POST'])
def batch_grade():
    """
    POST /batch-grade
    Body: { threshold?, answers: [{ questionText, studentAnswer, correctAnswer }] }
    Returns: { results: [...] }
    """
    try:
        data = request.get_json()
        if not data or 'answers' not in data:
            return jsonify({'error': 'No answers provided'}), 400

        answers   = data['answers']
        threshold = float(data.get('threshold', 0.75))
        results   = []

        for idx, item in enumerate(answers):
            try:
                result = compute_grade(
                    item.get('questionText', ''),
                    item.get('studentAnswer', ''),
                    item.get('correctAnswer', ''),
                    threshold
                )
                results.append({'index': idx, **result})
            except Exception as e:
                logger.error(f"Error grading item {idx}: {e}")
                results.append({
                    'index': idx,
                    'isCorrect': False,
                    'similarityScore': 0.0,
                    'explanation': f'Grading error: {str(e)}'
                })

        return jsonify({'results': results})

    except Exception as e:
        logger.error(f"Error in /batch-grade: {e}", exc_info=True)
        return jsonify({'error': 'Internal server error', 'message': str(e)}), 500


if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5002, debug=False)
