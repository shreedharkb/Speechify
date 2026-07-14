#!/usr/bin/env python3
"""
Speechify SBERT Grading Pipeline — Real Evaluation Script
============================================================
Tests your ACTUAL /grade and /batch-grade endpoints (sbert-service/app.py)
against a hand-labeled test set, and compares against a naive exact-match
baseline computed locally.

HOW TO RUN
----------
1. Start your SBERT service locally:
     cd sbert-service
     pip install -r requirements.txt
     python app.py
   (it will listen on http://localhost:5002 per your Dockerfile/render.yaml)

2. In another terminal:
     pip install requests
     python eval_speechify.py

3. It prints a report to your terminal AND writes speechify_eval_report.json
   with every raw prediction, so results are auditable (not just a % you
   have to trust).

WHAT THIS MEASURES
-------------------
- Baseline: naive case-insensitive exact-string-match grading.
- Your pipeline: live calls to POST /batch-grade on your actual Flask service.
- Both are scored against a gold label I assigned per test case (my best
  judgment as an evaluator — see NOTES at the bottom of the report on why
  this matters before you cite a number).

SCOPE / HONESTY NOTE
---------------------
This tests the SBERT grading layer in isolation. It does NOT test Whisper
transcription accuracy, the Bull/Redis queue, or end-to-end latency through
the Express gateway. If you want those too, say so and we'll build a
separate script for each layer.
"""

import json
import re
import time
import sys
import statistics
from urllib.request import urlopen, Request
from urllib.error import URLError

SBERT_URL = "http://localhost:5002"
THRESHOLD = 0.75  # matches the service's own default

# ---------------------------------------------------------------------------
# TEST SET — 60 cases, gold-labeled by hand, spanning the failure modes your
# pipeline is explicitly designed to handle (per app.py's 6-layer comments).
# Each case: (question, correct_answer, student_answer, gold_is_correct, category)
# ---------------------------------------------------------------------------
TEST_CASES = [
    # --- Exact matches (both baseline and pipeline should get these) ---
    ("What is the capital of France?", "Paris", "Paris", True, "exact"),
    ("What gas do plants absorb?", "Carbon dioxide", "Carbon dioxide", True, "exact"),
    ("Who wrote Romeo and Juliet?", "William Shakespeare", "William Shakespeare", True, "exact"),
    ("What is the boiling point of water in Celsius?", "100", "100", True, "exact"),
    ("What is the chemical symbol for gold?", "Au", "Au", True, "exact"),

    # --- Paraphrases (baseline should FAIL, pipeline should PASS) ---
    ("What is the capital of France?", "Paris", "The capital city is Paris", True, "paraphrase"),
    ("What causes rain?", "Water vapor condenses into droplets", "when water vapor cools down and turns into droplets it forms rain", True, "paraphrase"),
    ("Why do we have seasons?", "The Earth's axis is tilted", "Because the earth is tilted on its axis", True, "paraphrase"),
    ("What is photosynthesis?", "Plants convert sunlight into energy", "It's the process where plants use sunlight to make energy", True, "paraphrase"),
    ("What is the function of the heart?", "It pumps blood through the body", "The heart's job is to circulate blood around the body", True, "paraphrase"),
    ("What is inflation?", "A general rise in prices over time", "when prices go up across the economy over time", True, "paraphrase"),
    ("What does DNA stand for?", "Deoxyribonucleic acid", "deoxyribonucleic acid", True, "paraphrase"),
    ("What is an ecosystem?", "A community of living organisms and their environment", "a group of living things interacting with their surroundings", True, "paraphrase"),

    # --- Synonym-level (single word swap) ---
    ("What is a synonym for happy?", "Joyful", "Glad", True, "synonym"),
    ("What is the opposite of hot?", "Cold", "Cool", True, "synonym"),
    ("Name a mammal.", "Dog", "Cat", True, "synonym"),

    # --- Genuinely wrong answers (both should fail these) ---
    ("What is the capital of France?", "Paris", "Berlin", False, "wrong"),
    ("What causes rain?", "Water vapor condenses into droplets", "Rain is caused by ocean currents", False, "wrong"),
    ("Who wrote Romeo and Juliet?", "William Shakespeare", "Charles Dickens", False, "wrong"),
    ("What is photosynthesis?", "Plants convert sunlight into energy", "It's how animals digest food", False, "wrong"),
    ("What is the chemical symbol for gold?", "Au", "Ag", False, "wrong"),
    ("What is an ecosystem?", "A community of living organisms and their environment", "A type of rock formation", False, "wrong"),

    # --- Numeric: exact ---
    ("What is 5 + 7?", "12", "12", True, "numeric_exact"),
    ("What is the boiling point of water in Celsius?", "100", "100.0", True, "numeric_exact"),
    ("How many continents are there?", "7", "7", True, "numeric_exact"),

    # --- Numeric: close but not exact (partial credit territory) ---
    ("What is the approximate value of pi to 2 decimal places?", "3.14", "3.15", False, "numeric_close"),
    ("What is 15% of 200?", "30", "31", False, "numeric_close"),

    # --- Numeric: wrong ---
    ("What is 5 + 7?", "12", "15", False, "numeric_wrong"),
    ("How many continents are there?", "7", "5", False, "numeric_wrong"),
    ("What is 5 + 7?", "12", "twelve is wrong here", False, "numeric_wrong"),

    # --- Gibberish (should hard-fail) ---
    ("What is the capital of France?", "Paris", "asdkfj qwrpoi", False, "gibberish"),
    ("What causes rain?", "Water vapor condenses into droplets", "xkcd zzzqqw bbbnnm", False, "gibberish"),
    ("What is photosynthesis?", "Plants convert sunlight into energy", "kjkjsfkjs", False, "gibberish"),

    # --- Negation flips (correct concept, opposite meaning) ---
    ("Does the Earth orbit the Sun?", "Yes, the Earth orbits the Sun", "No, the Earth does not orbit the Sun", False, "negation"),
    ("Is water a compound?", "Yes, water is a compound", "No, water is not a compound", False, "negation"),
    ("Can plants survive without sunlight?", "No, plants cannot survive without sunlight", "Yes, plants can survive without sunlight", False, "negation"),

    # --- Partial / incomplete answers ---
    ("What is photosynthesis?", "Plants convert sunlight into energy through chlorophyll", "plants use sunlight", True, "partial"),
    ("What is an ecosystem?", "A community of living organisms and their environment interacting together", "living things and environment", True, "partial"),
    ("Explain the water cycle.", "Water evaporates, condenses into clouds, then falls as precipitation", "water evaporates", False, "partial_insufficient"),

    # --- Short answer vs long mismatch (length-mismatch guard should catch) ---
    ("Explain the process of cellular respiration in detail.", "Cellular respiration converts glucose and oxygen into energy, carbon dioxide and water through glycolysis, the Krebs cycle, and the electron transport chain", "energy", False, "length_mismatch"),
    ("Describe the causes of World War 1 in detail.", "Complex alliances, militarism, nationalism, and the assassination of Archduke Franz Ferdinand combined to trigger the war", "war happened", False, "length_mismatch"),

    # --- Empty / no answer ---
    ("What is the capital of France?", "Paris", "", False, "empty"),
    ("What causes rain?", "Water vapor condenses into droplets", "   ", False, "empty"),

    # --- Zero lexical overlap but semantically related (tricky) ---
    ("What is a car powered by?", "Gasoline or electricity", "petrol or battery power", True, "zero_overlap_correct"),
    ("What do bees produce?", "Honey", "the sweet substance made in a hive", True, "zero_overlap_correct"),

    # --- Homophone / near-miss numeric text ---
    ("How many continents are there?", "7", "seven", True, "numeric_as_word"),
    ("What is 5 + 7?", "12", "twelve", True, "numeric_as_word"),

    # --- Substring containment ---
    ("Who wrote Romeo and Juliet?", "William Shakespeare", "I believe it was William Shakespeare who wrote it", True, "substring"),
    ("What is the chemical symbol for gold?", "Au", "the symbol is Au", True, "substring"),

    # --- Additional wrong-but-related (distractor concepts) ---
    ("What is the powerhouse of the cell?", "Mitochondria", "Nucleus", False, "distractor"),
    ("What planet is known as the Red Planet?", "Mars", "Venus", False, "distractor"),
    ("Who developed the theory of relativity?", "Albert Einstein", "Isaac Newton", False, "distractor"),

    # --- Additional paraphrases for volume/statistical stability ---
    ("What planet is known as the Red Planet?", "Mars", "the red-colored planet, Mars", True, "paraphrase"),
    ("What is the powerhouse of the cell?", "Mitochondria", "mitochondria are the cell's powerhouse", True, "paraphrase"),
    ("Who developed the theory of relativity?", "Albert Einstein", "Einstein came up with relativity theory", True, "paraphrase"),
    ("What do bees produce?", "Honey", "honey", True, "exact"),
    ("What is a car powered by?", "Gasoline or electricity", "wind power", False, "wrong"),
    ("Does the Earth orbit the Sun?", "Yes, the Earth orbits the Sun", "Yes it does", True, "negation_match"),
    ("Is water a compound?", "Yes, water is a compound", "yes", True, "negation_match"),
]

print(f"Loaded {len(TEST_CASES)} labeled test cases.\n")

# ---------------------------------------------------------------------------
# BASELINE 1: naive exact-match (case-insensitive, whitespace-normalized)
# ---------------------------------------------------------------------------
def baseline_exact_match(student, correct):
    norm = lambda t: re.sub(r"\s+", " ", t.strip().lower())
    return norm(student) == norm(correct)


# ---------------------------------------------------------------------------
# BASELINE 2: lexical-only (Jaccard + token-F1 blend) — reimplements the
# EXACT normalize/tokenize/jaccard/token_f1 functions from your own
# sbert-service/app.py, run locally (no SBERT model, no HTTP call). This
# isolates "how far do you get with keyword overlap alone, before SBERT
# semantic similarity is added" — mirrors your pipeline's own Layer 4.
# ---------------------------------------------------------------------------
import unicodedata as _ud

def _normalize(text):
    text = _ud.normalize("NFKD", text)
    return re.sub(r"\s+", " ", text.strip().lower())

def _tokenize(text):
    tokens = re.findall(r"[a-z0-9]+", _normalize(text))
    return [t for t in tokens if len(t) > 1 or t.isdigit()]

def _jaccard(t1, t2):
    s1, s2 = set(_tokenize(t1)), set(_tokenize(t2))
    if not s1 and not s2:
        return 1.0
    if not s1 or not s2:
        return 0.0
    return len(s1 & s2) / len(s1 | s2)

def _token_f1(t1, t2):
    tok1, tok2 = _tokenize(t1), _tokenize(t2)
    if not tok1 and not tok2:
        return 1.0
    if not tok1 or not tok2:
        return 0.0
    common = set(tok1) & set(tok2)
    if not common:
        return 0.0
    precision = len(common) / len(tok2)
    recall = len(common) / len(tok1)
    return 2 * precision * recall / (precision + recall)

LEXICAL_THRESHOLD = 0.5  # separate, sensible threshold for a lexical-only score

def baseline_lexical_only(student, correct):
    score = (_jaccard(student, correct) + _token_f1(student, correct)) / 2.0
    return score >= LEXICAL_THRESHOLD, score


# ---------------------------------------------------------------------------
# CALL YOUR REAL SBERT SERVICE
# ---------------------------------------------------------------------------
def check_service_alive():
    try:
        with urlopen(f"{SBERT_URL}/health", timeout=5) as r:
            data = json.loads(r.read())
            print(f"✓ SBERT service is alive: {data}\n")
            return True
    except URLError as e:
        print(f"✗ Could not reach {SBERT_URL}/health — is the service running?")
        print(f"  Error: {e}")
        print(f"  Run: cd sbert-service && python app.py")
        return False


def call_batch_grade(items):
    """items: list of dicts with questionText, studentAnswer, correctAnswer"""
    payload = json.dumps({"threshold": THRESHOLD, "answers": items}).encode()
    req = Request(f"{SBERT_URL}/batch-grade", data=payload,
                   headers={"Content-Type": "application/json"}, method="POST")
    t0 = time.time()
    with urlopen(req, timeout=120) as r:
        result = json.loads(r.read())
    elapsed = time.time() - t0
    return result["results"], elapsed


# ---------------------------------------------------------------------------
# METRICS
# ---------------------------------------------------------------------------
def compute_metrics(predictions, golds):
    tp = sum(1 for p, g in zip(predictions, golds) if p and g)
    tn = sum(1 for p, g in zip(predictions, golds) if not p and not g)
    fp = sum(1 for p, g in zip(predictions, golds) if p and not g)
    fn = sum(1 for p, g in zip(predictions, golds) if not p and g)
    n = len(golds)
    accuracy = (tp + tn) / n if n else 0
    precision = tp / (tp + fp) if (tp + fp) else 0
    recall = tp / (tp + fn) if (tp + fn) else 0
    f1 = 2 * precision * recall / (precision + recall) if (precision + recall) else 0
    return {
        "accuracy": accuracy, "precision": precision, "recall": recall, "f1": f1,
        "tp": tp, "tn": tn, "fp": fp, "fn": fn, "n": n
    }


def write_markdown_report(report):
    """Generates a docs/grading_metrics.md styled after LexFind's rag_metrics.md —
    baseline -> improved -> production, tables + limitations + conclusion."""
    b = report["stage_1_exact_match_baseline"]
    l = report["stage_2_lexical_only_baseline"]
    p = report["stage_3_full_sbert_pipeline"]
    lat = report["latency"]
    n = report["n_test_cases"]

    def pct(x):
        return f"{x*100:.1f}%"

    delta_vs_exact = (p['accuracy'] - b['accuracy']) * 100
    delta_vs_lexical = (p['accuracy'] - l['accuracy']) * 100
    direction_exact = "improved" if delta_vs_exact >= 0 else "changed"
    direction_lexical = "improved" if delta_vs_lexical >= 0 else "changed"

    md = f"""# Semantic Grading Pipeline — Evaluation Metrics

We benchmarked three grading strategies against a hand-labeled evaluation set of
**{n} student-answer test cases** spanning exact matches, paraphrases, synonyms,
numeric answers, gibberish, negation flips, partial answers, and length-mismatch
edge cases — the specific failure modes the grading pipeline is designed to handle.

Each strategy was scored against gold-standard correctness labels using accuracy,
precision, recall, and F1. Latency was measured against the live local service,
not vendor-published figures.

---

## 1. Baseline: Exact-String Match

A naive baseline: student answer is graded correct only if it matches the
reference answer exactly (case/whitespace-insensitive). This is what many
simple quiz systems fall back to.

| Metric | Score |
|---|---|
| Accuracy | {pct(b['accuracy'])} |
| Precision | {pct(b['precision'])} |
| Recall | {pct(b['recall'])} |
| F1 | {pct(b['f1'])} |

**Limitation found:** any paraphrase, synonym, or reordering — even when
semantically identical to the reference answer — is marked wrong. Recall on
correct-but-differently-worded answers is near zero.

---

## 2. Lexical-Only: Jaccard + Token-F1 Overlap

Before adding semantic embeddings, we evaluated a pure keyword-overlap scorer
(Jaccard similarity blended with token-level F1, threshold {report['lexical_threshold_used']}) —
the same lexical layer used internally as a gating signal in the production
pipeline, tested here in isolation.

| Metric | Score |
|---|---|
| Accuracy | {pct(l['accuracy'])} |
| Precision | {pct(l['precision'])} |
| Recall | {pct(l['recall'])} |
| F1 | {pct(l['f1'])} |

**Limitation found:** keyword overlap improves on exact-match but still fails
on synonym-only answers with zero shared tokens (e.g. "joyful" vs. "glad"),
and can be fooled by answers that share words but invert meaning via negation.

---

## 3. Production: 6-Layer SBERT Semantic Pipeline

The production system layers gibberish detection, numeric validation,
exact/substring shortcuts, lexical-overlap gating, and Sentence-BERT
(`all-MiniLM-L6-v2`) cosine similarity — blended (not max'd) with the lexical
score, plus guards for negation mismatches and answer-length mismatches.

| Metric | Score |
|---|---|
| **Accuracy** | **{pct(p['accuracy'])}** |
| Precision | {pct(p['precision'])} |
| Recall | {pct(p['recall'])} |
| F1 | {pct(p['f1'])} |

**Latency (measured against the live local service):**

| Metric | Value |
|---|---|
| Single request, avg | {lat['single_request_avg_ms']} ms |
| Single request, p95 | {lat['single_request_p95_ms']} ms |
| Batch of {n}, total | {lat['batch_total_seconds']} s |
| Batch, avg/item | {lat['batch_avg_per_item_ms']} ms |

### Conclusion

Moving from exact-match to the full semantic pipeline {direction_exact} accuracy from
**{pct(b['accuracy'])} to {pct(p['accuracy'])}** ({delta_vs_exact:+.1f} points).
Compared to the lexical-only baseline ({pct(l['accuracy'])}), accuracy
{direction_lexical} by {delta_vs_lexical:+.1f} points. See the per-category
breakdown in `speechify_eval_report.json` for which answer types (paraphrase,
synonym, negation, numeric, etc.) actually drove the difference in this run.

### Current Limitations

- **Numeric near-misses:** answers within a small margin of the correct number
  (e.g. rounding differences) are graded strictly and not given partial credit
  in this test set's scoring — see `numeric_close` category above.
- **Short reference answers:** SBERT cosine similarity is noisier on very
  short correct answers (≤3 tokens), which is why the pipeline caps scores
  more aggressively when lexical overlap is zero on short answers.
- **Evaluation set size:** {n} cases gives a directional signal, not a
  statistically tight confidence interval. Treat percentages as indicative;
  expand the test set for a tighter number before using in a formal report.

*(See per-category breakdown and full mismatch list in `speechify_eval_report.json`.)*
"""
    with open("grading_metrics.md", "w") as f:
        f.write(md)
    print("\nMarkdown report written to grading_metrics.md — copy into your docs/ or link from README.")


def main():
    if not check_service_alive():
        sys.exit(1)

    golds = [c[3] for c in TEST_CASES]
    categories = [c[4] for c in TEST_CASES]

    # ---- Baseline 1: exact match ----
    baseline_preds = [baseline_exact_match(c[2], c[1]) for c in TEST_CASES]
    baseline_metrics = compute_metrics(baseline_preds, golds)

    # ---- Baseline 2: lexical-only (Jaccard+F1), computed locally ----
    lexical_results = [baseline_lexical_only(c[2], c[1]) for c in TEST_CASES]
    lexical_preds = [r[0] for r in lexical_results]
    lexical_metrics = compute_metrics(lexical_preds, golds)

    # ---- Your real pipeline (live HTTP calls, single latency-representative batch) ----
    items = [{"questionText": q, "studentAnswer": s, "correctAnswer": c}
              for (q, c, s, g, cat) in TEST_CASES]

    # Also measure single-request latency on a subset (batch hides per-call latency)
    single_latencies = []
    for it in items[:10]:
        t0 = time.time()
        req = Request(f"{SBERT_URL}/grade", data=json.dumps({**it, "threshold": THRESHOLD}).encode(),
                       headers={"Content-Type": "application/json"}, method="POST")
        with urlopen(req, timeout=30) as r:
            json.loads(r.read())
        single_latencies.append(time.time() - t0)

    results, batch_elapsed = call_batch_grade(items)
    pipeline_preds = [r["isCorrect"] for r in results]
    pipeline_metrics = compute_metrics(pipeline_preds, golds)

    # ---- Per-category breakdown for all three stages ----
    def per_category(preds):
        out = {}
        for cat in set(categories):
            idxs = [i for i, c in enumerate(categories) if c == cat]
            correct = sum(1 for i in idxs if preds[i] == golds[i])
            out[cat] = {"n": len(idxs), "correct": correct, "accuracy": correct / len(idxs)}
        return out

    cat_breakdown = per_category(pipeline_preds)
    cat_breakdown_baseline = per_category(baseline_preds)
    cat_breakdown_lexical = per_category(lexical_preds)

    # ---- Mismatches worth eyeballing ----
    mismatches = [
        {
            "question": TEST_CASES[i][0], "correct_answer": TEST_CASES[i][1],
            "student_answer": TEST_CASES[i][2], "gold": golds[i],
            "pipeline_said_correct": pipeline_preds[i],
            "similarity_score": results[i].get("similarityScore"),
            "explanation": results[i].get("explanation"),
            "category": categories[i]
        }
        for i in range(len(TEST_CASES)) if pipeline_preds[i] != golds[i]
    ]

    report = {
        "n_test_cases": len(TEST_CASES),
        "threshold_used": THRESHOLD,
        "lexical_threshold_used": LEXICAL_THRESHOLD,
        "stage_1_exact_match_baseline": baseline_metrics,
        "stage_2_lexical_only_baseline": lexical_metrics,
        "stage_3_full_sbert_pipeline": pipeline_metrics,
        "per_category_accuracy": {
            "stage_1_exact_match": cat_breakdown_baseline,
            "stage_2_lexical_only": cat_breakdown_lexical,
            "stage_3_full_pipeline": cat_breakdown,
        },
        "latency": {
            "single_request_avg_ms": round(statistics.mean(single_latencies) * 1000, 1),
            "single_request_p95_ms": round(sorted(single_latencies)[int(len(single_latencies) * 0.95) - 1] * 1000, 1),
            "batch_total_seconds": round(batch_elapsed, 2),
            "batch_avg_per_item_ms": round((batch_elapsed / len(items)) * 1000, 1),
        },
        "mismatches": mismatches,
    }

    with open("speechify_eval_report.json", "w") as f:
        json.dump(report, f, indent=2)

    write_markdown_report(report)

    # ---- Print human-readable summary ----
    print("=" * 70)
    print("RESULTS")
    print("=" * 70)
    print(f"\nStage 1 — Baseline (naive exact-match):")
    print(f"  Accuracy: {baseline_metrics['accuracy']*100:.1f}%  "
          f"(Precision: {baseline_metrics['precision']*100:.1f}%  "
          f"Recall: {baseline_metrics['recall']*100:.1f}%  F1: {baseline_metrics['f1']*100:.1f}%)")

    print(f"\nStage 2 — Lexical-only (Jaccard + token-F1, local reimplementation):")
    print(f"  Accuracy: {lexical_metrics['accuracy']*100:.1f}%  "
          f"(Precision: {lexical_metrics['precision']*100:.1f}%  "
          f"Recall: {lexical_metrics['recall']*100:.1f}%  F1: {lexical_metrics['f1']*100:.1f}%)")

    print(f"\nStage 3 — Your SBERT 6-layer pipeline (live, real endpoint):")
    print(f"  Accuracy: {pipeline_metrics['accuracy']*100:.1f}%  "
          f"(Precision: {pipeline_metrics['precision']*100:.1f}%  "
          f"Recall: {pipeline_metrics['recall']*100:.1f}%  F1: {pipeline_metrics['f1']*100:.1f}%)")

    improvement = pipeline_metrics['accuracy'] - baseline_metrics['accuracy']
    print(f"\n  → Full pipeline vs exact-match baseline: {improvement*100:+.1f} percentage points")
    improvement_lex = pipeline_metrics['accuracy'] - lexical_metrics['accuracy']
    print(f"  → Full pipeline vs lexical-only baseline: {improvement_lex*100:+.1f} percentage points")

    print(f"\nPer-category accuracy (your pipeline):")
    for cat, d in sorted(cat_breakdown.items()):
        print(f"  {cat:25s} {d['correct']}/{d['n']}  ({d['accuracy']*100:.0f}%)")

    print(f"\nLatency (real measured calls to your service):")
    print(f"  Single request avg: {report['latency']['single_request_avg_ms']} ms")
    print(f"  Single request p95: {report['latency']['single_request_p95_ms']} ms")
    print(f"  Batch of {len(items)}: {report['latency']['batch_total_seconds']}s total "
          f"({report['latency']['batch_avg_per_item_ms']} ms/item)")

    print(f"\n{len(mismatches)} mismatches written to speechify_eval_report.json for review.")
    print("\nFull raw report: speechify_eval_report.json")
    print("=" * 70)


if __name__ == "__main__":
    main()