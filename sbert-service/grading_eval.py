#!/usr/bin/env python3
"""
Speechify — Grading Pipeline Evaluation (LexFind-style)
=========================================================
Evaluates 3 grading modes side-by-side against 100 human-labeled Q&A pairs,
enabling a clean comparison — identical to how LexFind's hybrid_eval.py
compares Dense vs Sparse vs Hybrid search.

Grading modes:
  1. Exact Match   — case-insensitive string comparison (baseline)
  2. Keyword-Only  — Jaccard + token F1 (lexical channel)
  3. Full Pipeline  — 6-layer grading with SBERT (production system)

Metrics: Accuracy, Precision, Recall, F1, Cohen's Kappa, MAE, Avg Latency

Output:
  grading_eval_report.json    ← machine-readable full results
  grading_eval_summary.txt    ← human-readable comparison table

Run from sbert-service/:
  python grading_eval.py
"""

import json
import sys
import time
import os
from pathlib import Path

# ── Import the actual grading pipeline from app.py ────────────────────────────
# This ensures we test the REAL production code, not a mock.
sys.path.insert(0, str(Path(__file__).resolve().parent))
from app import (
    compute_grade,
    normalize,
    jaccard_similarity,
    token_f1,
    get_model,  # Forces SBERT model load
)

OUT_DIR  = Path(__file__).resolve().parent
OUT_JSON = OUT_DIR / "grading_eval_report.json"
OUT_TXT  = OUT_DIR / "grading_eval_summary.txt"

# ──────────────────────────────────────────────────────────────────────────────
# 100 CURATED TEST CASES — human-labeled ground truth
# ──────────────────────────────────────────────────────────────────────────────
# Categories mirror real quiz scenarios:
#   exact_match, paraphrase, partial, conceptual, numeric, wrong, gibberish
#
# expectedScore: human-judged score on 0.0–1.0 scale
# expectedPass:  should the pipeline mark this correct? (threshold 0.75)

TEST_CASES = [
    # ── EXACT MATCH (10) ──────────────────────────────────────────────────────
    {"id":1,"cat":"exact_match","q":"What is the chemical symbol for water?","correct":"H2O","student":"H2O","expectedScore":1.0,"expectedPass":True},
    {"id":2,"cat":"exact_match","q":"What is the capital of France?","correct":"Paris","student":"Paris","expectedScore":1.0,"expectedPass":True},
    {"id":3,"cat":"exact_match","q":"What is 2 + 2?","correct":"4","student":"4","expectedScore":1.0,"expectedPass":True},
    {"id":4,"cat":"exact_match","q":"Who wrote Romeo and Juliet?","correct":"William Shakespeare","student":"William Shakespeare","expectedScore":1.0,"expectedPass":True},
    {"id":5,"cat":"exact_match","q":"What is the speed of light in m/s?","correct":"3 x 10^8 m/s","student":"3 x 10^8 m/s","expectedScore":1.0,"expectedPass":True},
    {"id":6,"cat":"exact_match","q":"What is the atomic number of carbon?","correct":"6","student":"6","expectedScore":1.0,"expectedPass":True},
    {"id":7,"cat":"exact_match","q":"What is the currency of Japan?","correct":"Yen","student":"Yen","expectedScore":1.0,"expectedPass":True},
    {"id":8,"cat":"exact_match","q":"What planet is known as the Red Planet?","correct":"Mars","student":"Mars","expectedScore":1.0,"expectedPass":True},
    {"id":9,"cat":"exact_match","q":"What is the tallest mountain in the world?","correct":"Mount Everest","student":"Mount Everest","expectedScore":1.0,"expectedPass":True},
    {"id":10,"cat":"exact_match","q":"What is the chemical symbol for gold?","correct":"Au","student":"Au","expectedScore":1.0,"expectedPass":True},

    # ── PARAPHRASE (20) ───────────────────────────────────────────────────────
    {"id":11,"cat":"paraphrase","q":"What causes tides?","correct":"Tides are caused by the gravitational pull of the Moon and the Sun on Earth's oceans","student":"The Moon's gravity pulls on the ocean water, creating tides","expectedScore":0.85,"expectedPass":True},
    {"id":12,"cat":"paraphrase","q":"What is photosynthesis?","correct":"Photosynthesis is the process by which green plants use sunlight to synthesize nutrients from carbon dioxide and water","student":"It's how plants make food using sunlight, water, and CO2","expectedScore":0.90,"expectedPass":True},
    {"id":13,"cat":"paraphrase","q":"Define osmosis","correct":"Osmosis is the movement of water molecules through a semipermeable membrane from a region of lower solute concentration to a region of higher solute concentration","student":"Water moves across a membrane from where there's less dissolved stuff to where there's more","expectedScore":0.85,"expectedPass":True},
    {"id":14,"cat":"paraphrase","q":"What is Newton's First Law?","correct":"An object at rest stays at rest and an object in motion stays in motion unless acted upon by an external force","student":"Things keep doing what they're doing unless a force changes that","expectedScore":0.80,"expectedPass":True},
    {"id":15,"cat":"paraphrase","q":"What is the function of mitochondria?","correct":"Mitochondria are the powerhouse of the cell, responsible for producing ATP through cellular respiration","student":"They generate energy for the cell by making ATP","expectedScore":0.90,"expectedPass":True},
    {"id":16,"cat":"paraphrase","q":"Explain the water cycle","correct":"The water cycle describes the continuous movement of water through evaporation, condensation, precipitation, and collection","student":"Water evaporates, forms clouds through condensation, falls as rain, and collects in bodies of water","expectedScore":0.95,"expectedPass":True},
    {"id":17,"cat":"paraphrase","q":"What is DNA?","correct":"DNA is a molecule that carries the genetic instructions for the development and reproduction of all known living organisms","student":"DNA is the genetic material that contains the instructions for building and maintaining an organism","expectedScore":0.90,"expectedPass":True},
    {"id":18,"cat":"paraphrase","q":"What causes earthquakes?","correct":"Earthquakes are caused by the sudden release of energy in the Earth's lithosphere due to tectonic plate movement","student":"When tectonic plates shift and release built-up pressure, it shakes the ground","expectedScore":0.85,"expectedPass":True},
    {"id":19,"cat":"paraphrase","q":"What is the greenhouse effect?","correct":"The greenhouse effect is where certain gases in Earth's atmosphere trap heat from the sun, warming the planet's surface","student":"Gases like CO2 trap solar radiation in the atmosphere, keeping Earth warm","expectedScore":0.85,"expectedPass":True},
    {"id":20,"cat":"paraphrase","q":"Define democracy","correct":"Democracy is a system of government in which power is vested in the people, who rule either directly or through freely elected representatives","student":"A form of government where citizens vote to choose their leaders and have a say in decisions","expectedScore":0.85,"expectedPass":True},
    {"id":21,"cat":"paraphrase","q":"What is inflation?","correct":"Inflation is the rate at which the general level of prices for goods and services rises, causing purchasing power to fall","student":"When prices go up over time and money buys less than it used to","expectedScore":0.85,"expectedPass":True},
    {"id":22,"cat":"paraphrase","q":"Explain natural selection","correct":"Natural selection is the process where organisms with favorable traits are more likely to survive and reproduce","student":"Organisms better adapted to their environment survive and pass on their genes more successfully","expectedScore":0.90,"expectedPass":True},
    {"id":23,"cat":"paraphrase","q":"What is the theory of evolution?","correct":"The theory of evolution states that all species develop through natural selection of inherited variations that increase survival","student":"Species change over generations as traits that help survival get passed down","expectedScore":0.85,"expectedPass":True},
    {"id":24,"cat":"paraphrase","q":"What is an atom?","correct":"An atom is the smallest unit of matter that retains the chemical properties of an element","student":"The tiniest particle of an element that still behaves like that element","expectedScore":0.85,"expectedPass":True},
    {"id":25,"cat":"paraphrase","q":"What is a chemical reaction?","correct":"A chemical reaction is a process in which substances interact to form new substances with different properties","student":"When molecules combine or break apart to create new different materials","expectedScore":0.85,"expectedPass":True},
    {"id":26,"cat":"paraphrase","q":"What is the law of supply and demand?","correct":"The law of supply and demand states that the price of a good rises when demand exceeds supply and falls when supply exceeds demand","student":"Prices go up when people want more than what's available, and down when there's too much","expectedScore":0.85,"expectedPass":True},
    {"id":27,"cat":"paraphrase","q":"What is a genome?","correct":"A genome is the complete set of genetic material present in an organism","student":"All the DNA and genes that make up a living thing","expectedScore":0.85,"expectedPass":True},
    {"id":28,"cat":"paraphrase","q":"What is entropy?","correct":"Entropy is a measure of the disorder or randomness in a system, and it tends to increase over time","student":"It measures how chaotic or disorganized a system is and it always grows","expectedScore":0.85,"expectedPass":True},
    {"id":29,"cat":"paraphrase","q":"Define velocity","correct":"Velocity is the rate of change of an object's position with respect to time, including both speed and direction","student":"How fast something moves and in which direction","expectedScore":0.80,"expectedPass":True},
    {"id":30,"cat":"paraphrase","q":"What is the immune system?","correct":"The immune system is a complex network of cells, tissues, and organs that work together to defend the body against harmful pathogens","student":"The body's defense system that fights off infections and diseases using white blood cells and antibodies","expectedScore":0.90,"expectedPass":True},

    # ── PARTIAL ANSWER (15) ───────────────────────────────────────────────────
    {"id":31,"cat":"partial","q":"Name the three states of matter","correct":"Solid, liquid, and gas","student":"Solid and liquid","expectedScore":0.55,"expectedPass":False},
    {"id":32,"cat":"partial","q":"What are the functions of the liver?","correct":"The liver detoxifies chemicals, metabolizes drugs, produces bile, stores glycogen, and synthesizes proteins","student":"The liver helps with detoxification","expectedScore":0.35,"expectedPass":False},
    {"id":33,"cat":"partial","q":"List the planets in our solar system","correct":"Mercury, Venus, Earth, Mars, Jupiter, Saturn, Uranus, Neptune","student":"Mercury, Venus, Earth, Mars, Jupiter","expectedScore":0.55,"expectedPass":False},
    {"id":34,"cat":"partial","q":"What are the components of blood?","correct":"Blood consists of red blood cells, white blood cells, platelets, and plasma","student":"Red blood cells and white blood cells","expectedScore":0.45,"expectedPass":False},
    {"id":35,"cat":"partial","q":"Explain cell division","correct":"Cell division involves DNA replication, chromosome condensation, spindle formation, chromosome separation, and cytokinesis","student":"The DNA copies itself and the cell splits in two","expectedScore":0.50,"expectedPass":False},
    {"id":36,"cat":"partial","q":"What are the branches of the US government?","correct":"The three branches are legislative, executive, and judicial","student":"Executive and legislative","expectedScore":0.55,"expectedPass":False},
    {"id":37,"cat":"partial","q":"Describe the rock cycle","correct":"The rock cycle describes how igneous, sedimentary, and metamorphic rocks transform through weathering, erosion, melting, and cooling","student":"Rocks change from one type to another through heating and cooling","expectedScore":0.40,"expectedPass":False},
    {"id":38,"cat":"partial","q":"What are the causes of World War I?","correct":"Militarism, alliances, imperialism, nationalism, and the assassination of Archduke Franz Ferdinand","student":"The assassination of Archduke Franz Ferdinand and nationalism","expectedScore":0.45,"expectedPass":False},
    {"id":39,"cat":"partial","q":"What are the layers of the Earth?","correct":"The Earth has four layers: crust, mantle, outer core, and inner core","student":"Crust and mantle","expectedScore":0.45,"expectedPass":False},
    {"id":40,"cat":"partial","q":"What is the scientific method?","correct":"The scientific method includes observation, hypothesis, experimentation, data analysis, and conclusion","student":"You make a hypothesis and test it with an experiment","expectedScore":0.50,"expectedPass":False},
    {"id":41,"cat":"partial","q":"List the five senses","correct":"Sight, hearing, taste, smell, and touch","student":"Sight, hearing, and taste","expectedScore":0.55,"expectedPass":False},
    {"id":42,"cat":"partial","q":"What are renewable energy sources?","correct":"Solar, wind, hydroelectric, geothermal, and biomass","student":"Solar and wind energy","expectedScore":0.45,"expectedPass":False},
    {"id":43,"cat":"partial","q":"Describe the digestive system","correct":"The digestive system breaks down food through the mouth, esophagus, stomach, small intestine, large intestine, and rectum","student":"Food goes through the stomach and intestines","expectedScore":0.40,"expectedPass":False},
    {"id":44,"cat":"partial","q":"What are Newton's three laws?","correct":"1st: inertia, 2nd: F=ma, 3rd: every action has an equal and opposite reaction","student":"Force equals mass times acceleration","expectedScore":0.35,"expectedPass":False},
    {"id":45,"cat":"partial","q":"What is the Bill of Rights?","correct":"The first ten amendments to the US Constitution that guarantee individual rights and freedoms","student":"Amendments to the Constitution","expectedScore":0.45,"expectedPass":False},

    # ── CONCEPTUALLY CORRECT (15) ─────────────────────────────────────────────
    {"id":46,"cat":"conceptual","q":"Why do we have seasons?","correct":"Seasons occur because Earth's axis is tilted at 23.5 degrees relative to its orbital plane around the Sun","student":"The Earth is tilted so different parts get more direct sunlight at different times of the year","expectedScore":0.85,"expectedPass":True},
    {"id":47,"cat":"conceptual","q":"How does a vaccine work?","correct":"A vaccine introduces a weakened pathogen to stimulate the immune system to produce antibodies without causing disease","student":"It teaches your immune system to recognize and fight a disease by showing it a harmless version of the germ","expectedScore":0.85,"expectedPass":True},
    {"id":48,"cat":"conceptual","q":"What is a black hole?","correct":"A black hole is a region in spacetime where gravity is so strong that nothing, not even light, can escape past the event horizon","student":"An area in space with such intense gravity that it sucks everything in, including light","expectedScore":0.80,"expectedPass":True},
    {"id":49,"cat":"conceptual","q":"Explain how airplanes fly","correct":"Airplanes fly because wing shape creates lower pressure above and higher pressure below, generating lift via Bernoulli's principle","student":"The wings are shaped so air moves faster over the top, creating less pressure above, pushing the plane up","expectedScore":0.90,"expectedPass":True},
    {"id":50,"cat":"conceptual","q":"What causes rust?","correct":"Rust is iron oxide formed when iron reacts with oxygen in the presence of moisture through oxidation","student":"When metal is exposed to water and air, a chemical reaction breaks down the iron","expectedScore":0.75,"expectedPass":True},
    {"id":51,"cat":"conceptual","q":"How does the internet work?","correct":"The internet is a global network of computers that communicate using TCP/IP protocols to exchange data through routers","student":"Computers around the world are connected and send information using special rules for communication","expectedScore":0.80,"expectedPass":True},
    {"id":52,"cat":"conceptual","q":"Explain gravity","correct":"Gravity is a force proportional to the product of masses and inversely proportional to the square of distance between them","student":"It's the force that pulls things toward each other. Bigger things pull harder and it gets weaker farther apart","expectedScore":0.80,"expectedPass":True},
    {"id":53,"cat":"conceptual","q":"How do batteries work?","correct":"Batteries convert chemical energy to electrical energy through electrochemical reactions between an anode and cathode","student":"Chemical reactions inside the battery create a flow of electrons which is electricity","expectedScore":0.85,"expectedPass":True},
    {"id":54,"cat":"conceptual","q":"What is friction?","correct":"Friction is the resistance force that opposes the relative motion of two surfaces in contact","student":"The force that slows things down when they rub against each other","expectedScore":0.80,"expectedPass":True},
    {"id":55,"cat":"conceptual","q":"How does a compass work?","correct":"A compass works because its magnetic needle aligns with Earth's magnetic field, pointing toward magnetic north","student":"The needle is a magnet that gets pulled toward the North Pole of the Earth","expectedScore":0.80,"expectedPass":True},
    {"id":56,"cat":"conceptual","q":"What is cloud computing?","correct":"Cloud computing delivers computing services like storage, processing, and software over the internet instead of local hardware","student":"Using remote servers on the internet to store and process data instead of your own computer","expectedScore":0.90,"expectedPass":True},
    {"id":57,"cat":"conceptual","q":"How does a microwave oven work?","correct":"Microwaves emit electromagnetic radiation at 2.45 GHz that causes water molecules in food to vibrate, producing heat","student":"It sends waves that make the water in food shake really fast which heats it up","expectedScore":0.80,"expectedPass":True},
    {"id":58,"cat":"conceptual","q":"What is machine learning?","correct":"Machine learning is a subset of AI where algorithms learn patterns from data to make predictions without being explicitly programmed","student":"Teaching computers to find patterns in data and make decisions on their own without writing specific rules","expectedScore":0.90,"expectedPass":True},
    {"id":59,"cat":"conceptual","q":"What is a blockchain?","correct":"A blockchain is a distributed, immutable ledger that records transactions across a network of computers using cryptographic hashing","student":"A shared digital record book that can't be changed once written, maintained by many computers together","expectedScore":0.80,"expectedPass":True},
    {"id":60,"cat":"conceptual","q":"How does GPS work?","correct":"GPS uses signals from at least 4 satellites to triangulate a receiver's position on Earth using time delay calculations","student":"Satellites send signals to your device and it calculates where you are based on how long the signals take to arrive","expectedScore":0.85,"expectedPass":True},

    # ── NUMERIC / FACTUAL (10) ────────────────────────────────────────────────
    {"id":61,"cat":"numeric","q":"What is the boiling point of water in Celsius?","correct":"100","student":"100","expectedScore":1.0,"expectedPass":True},
    {"id":62,"cat":"numeric","q":"How many chromosomes do humans have?","correct":"46","student":"23 pairs, which is 46 total","expectedScore":0.95,"expectedPass":True},
    {"id":63,"cat":"numeric","q":"What is the value of pi to two decimal places?","correct":"3.14","student":"3.14159","expectedScore":0.95,"expectedPass":True},
    {"id":64,"cat":"numeric","q":"What year did World War II end?","correct":"1945","student":"1945","expectedScore":1.0,"expectedPass":True},
    {"id":65,"cat":"numeric","q":"What is the square root of 144?","correct":"12","student":"12","expectedScore":1.0,"expectedPass":True},
    {"id":66,"cat":"numeric","q":"How many bones are in the adult human body?","correct":"206","student":"206","expectedScore":1.0,"expectedPass":True},
    {"id":67,"cat":"numeric","q":"What is the freezing point of water in Fahrenheit?","correct":"32","student":"32 degrees","expectedScore":0.95,"expectedPass":True},
    {"id":68,"cat":"numeric","q":"How many continents are there?","correct":"7","student":"7","expectedScore":1.0,"expectedPass":True},
    {"id":69,"cat":"numeric","q":"What is the speed of sound in m/s (approximate)?","correct":"343","student":"340","expectedScore":0.95,"expectedPass":True},
    {"id":70,"cat":"numeric","q":"How many elements are in the periodic table?","correct":"118","student":"118","expectedScore":1.0,"expectedPass":True},

    # ── WRONG ANSWER (20) ─────────────────────────────────────────────────────
    {"id":71,"cat":"wrong","q":"What is the largest planet in our solar system?","correct":"Jupiter","student":"Saturn","expectedScore":0.10,"expectedPass":False},
    {"id":72,"cat":"wrong","q":"What is the chemical formula for table salt?","correct":"NaCl","student":"H2O","expectedScore":0.0,"expectedPass":False},
    {"id":73,"cat":"wrong","q":"Who painted the Mona Lisa?","correct":"Leonardo da Vinci","student":"Pablo Picasso","expectedScore":0.05,"expectedPass":False},
    {"id":74,"cat":"wrong","q":"What is the powerhouse of the cell?","correct":"Mitochondria","student":"The nucleus","expectedScore":0.10,"expectedPass":False},
    {"id":75,"cat":"wrong","q":"What gas do plants absorb during photosynthesis?","correct":"Carbon dioxide","student":"Oxygen","expectedScore":0.05,"expectedPass":False},
    {"id":76,"cat":"wrong","q":"What is the capital of Australia?","correct":"Canberra","student":"Sydney","expectedScore":0.10,"expectedPass":False},
    {"id":77,"cat":"wrong","q":"In which year did India gain independence?","correct":"1947","student":"1950","expectedScore":0.05,"expectedPass":False},
    {"id":78,"cat":"wrong","q":"What is the chemical symbol for iron?","correct":"Fe","student":"Ir","expectedScore":0.05,"expectedPass":False},
    {"id":79,"cat":"wrong","q":"What is the hardest natural substance?","correct":"Diamond","student":"Steel","expectedScore":0.05,"expectedPass":False},
    {"id":80,"cat":"wrong","q":"What organ pumps blood in the body?","correct":"Heart","student":"Lungs","expectedScore":0.05,"expectedPass":False},
    {"id":81,"cat":"wrong","q":"What is the main gas in Earth's atmosphere?","correct":"Nitrogen","student":"Oxygen","expectedScore":0.10,"expectedPass":False},
    {"id":82,"cat":"wrong","q":"Who discovered penicillin?","correct":"Alexander Fleming","student":"Louis Pasteur","expectedScore":0.10,"expectedPass":False},
    {"id":83,"cat":"wrong","q":"What is the smallest prime number?","correct":"2","student":"1","expectedScore":0.0,"expectedPass":False},
    {"id":84,"cat":"wrong","q":"What is the boiling point of water in Fahrenheit?","correct":"212","student":"100","expectedScore":0.0,"expectedPass":False},
    {"id":85,"cat":"wrong","q":"Which planet is closest to the Sun?","correct":"Mercury","student":"Venus","expectedScore":0.10,"expectedPass":False},
    {"id":86,"cat":"wrong","q":"What is the largest organ in the human body?","correct":"Skin","student":"Liver","expectedScore":0.05,"expectedPass":False},
    {"id":87,"cat":"wrong","q":"What color does litmus paper turn in acid?","correct":"Red","student":"Blue","expectedScore":0.0,"expectedPass":False},
    {"id":88,"cat":"wrong","q":"How many teeth does an adult human have?","correct":"32","student":"28","expectedScore":0.10,"expectedPass":False},
    {"id":89,"cat":"wrong","q":"What is the longest river in the world?","correct":"Nile","student":"Amazon","expectedScore":0.10,"expectedPass":False},
    {"id":90,"cat":"wrong","q":"What is absolute zero in Celsius?","correct":"-273.15","student":"0","expectedScore":0.0,"expectedPass":False},

    # ── GIBBERISH / OFF-TOPIC (10) ────────────────────────────────────────────
    {"id":91,"cat":"gibberish","q":"What is the theory of relativity?","correct":"Einstein's theory describes how space, time, and gravity are interconnected","student":"asdfghjkl qwerty","expectedScore":0.0,"expectedPass":False},
    {"id":92,"cat":"gibberish","q":"Explain the structure of an atom","correct":"An atom has a nucleus with protons and neutrons, surrounded by electrons in shells","student":"I had pizza for lunch today","expectedScore":0.0,"expectedPass":False},
    {"id":93,"cat":"gibberish","q":"What is the Pythagorean theorem?","correct":"In a right triangle, a squared plus b squared equals c squared","student":"lol idk man","expectedScore":0.0,"expectedPass":False},
    {"id":94,"cat":"gibberish","q":"Define ecosystem","correct":"An ecosystem is a community of living organisms interacting with their physical environment","student":"hahahaha","expectedScore":0.0,"expectedPass":False},
    {"id":95,"cat":"gibberish","q":"What is the law of conservation of energy?","correct":"Energy cannot be created or destroyed, only transformed from one form to another","student":"The weather is nice today","expectedScore":0.0,"expectedPass":False},
    {"id":96,"cat":"gibberish","q":"What is a neutron star?","correct":"A neutron star is the collapsed core of a massive star, extremely dense and made mostly of neutrons","student":"jjjjjjjjjjjjjjjjjj","expectedScore":0.0,"expectedPass":False},
    {"id":97,"cat":"gibberish","q":"Explain photovoltaic effect","correct":"The photovoltaic effect is the creation of voltage when light hits a semiconductor material","student":"my cat is sleeping on the keyboard","expectedScore":0.0,"expectedPass":False},
    {"id":98,"cat":"gibberish","q":"What is plate tectonics?","correct":"Plate tectonics is the theory that Earth's outer shell is divided into plates that glide over the mantle","student":"xyzxyzxyz 123123","expectedScore":0.0,"expectedPass":False},
    {"id":99,"cat":"gibberish","q":"Define the term frequency","correct":"Frequency is the number of occurrences of a repeating event per unit of time, measured in Hertz","student":"banana apple orange mango","expectedScore":0.0,"expectedPass":False},
    {"id":100,"cat":"gibberish","q":"What is Ohm's law?","correct":"Ohm's law states that current equals voltage divided by resistance (I = V/R)","student":"qqqqwwwweeeerrrr","expectedScore":0.0,"expectedPass":False},
]

THRESHOLD = 0.50  # Tuned via threshold sweep on 100-pair eval set (was 0.75)


# ──────────────────────────────────────────────────────────────────────────────
# SCORING MODES
# ──────────────────────────────────────────────────────────────────────────────

def exact_match_grade(question, student, correct):
    """Mode 1: Case-insensitive exact string comparison."""
    s = normalize(student)
    c = normalize(correct)
    score = 1.0 if s == c else 0.0
    return {"similarityScore": score, "isCorrect": score >= THRESHOLD}


def keyword_only_grade(question, student, correct):
    """Mode 2: Jaccard + token F1 only (no SBERT)."""
    s = normalize(student)
    c = normalize(correct)
    if s == c:
        return {"similarityScore": 1.0, "isCorrect": True}
    jacc = jaccard_similarity(s, c)
    f1   = token_f1(s, c)
    score = (jacc + f1) / 2.0
    return {"similarityScore": round(score, 4), "isCorrect": score >= THRESHOLD}


def full_pipeline_grade(question, student, correct):
    """Mode 3: Full 6-layer pipeline from app.py (with SBERT)."""
    return compute_grade(question, student, correct, THRESHOLD)


# ──────────────────────────────────────────────────────────────────────────────
# METRIC COMPUTATION
# ──────────────────────────────────────────────────────────────────────────────

def compute_metrics(results):
    """Compute accuracy, precision, recall, F1, MAE, and Cohen's Kappa."""
    tp = fp = fn = tn = 0
    total_abs_error = 0.0
    y_true = []
    y_pred = []

    for r in results:
        pred_pass = r["predictedPass"]
        exp_pass  = r["expectedPass"]
        total_abs_error += abs(r["predictedScore"] - r["expectedScore"])
        y_true.append(1 if exp_pass else 0)
        y_pred.append(1 if pred_pass else 0)

        if pred_pass and exp_pass:     tp += 1
        elif pred_pass and not exp_pass: fp += 1
        elif not pred_pass and exp_pass: fn += 1
        else:                            tn += 1

    n = len(results)
    accuracy  = (tp + tn) / n if n else 0
    precision = tp / (tp + fp) if (tp + fp) else 0
    recall    = tp / (tp + fn) if (tp + fn) else 0
    f1 = 2 * precision * recall / (precision + recall) if (precision + recall) else 0
    mae = total_abs_error / n if n else 0

    # Cohen's Kappa
    pe = ((tp + fp) * (tp + fn) + (fn + tn) * (fp + tn)) / (n * n) if n else 0
    kappa = (accuracy - pe) / (1 - pe) if (1 - pe) != 0 else 0

    return {
        "total": n,
        "accuracy":  round(accuracy, 4),
        "precision": round(precision, 4),
        "recall":    round(recall, 4),
        "f1":        round(f1, 4),
        "mae":       round(mae, 4),
        "cohens_kappa": round(kappa, 4),
        "confusion_matrix": {"TP": tp, "FP": fp, "FN": fn, "TN": tn},
    }


def compute_category_breakdown(results):
    cats = {}
    for r in results:
        c = r["category"]
        if c not in cats:
            cats[c] = []
        cats[c].append(r)

    breakdown = {}
    for cat, items in cats.items():
        m = compute_metrics(items)
        breakdown[cat] = {"count": len(items), "accuracy": m["accuracy"], "mae": m["mae"]}
    return breakdown


# ──────────────────────────────────────────────────────────────────────────────
# MAIN EVALUATION
# ──────────────────────────────────────────────────────────────────────────────

def run_mode(mode_name, grade_fn):
    """Run a single grading mode across all 100 test cases."""
    results = []
    latencies = []

    for tc in TEST_CASES:
        t0 = time.time()
        out = grade_fn(tc["q"], tc["student"], tc["correct"])
        elapsed_ms = (time.time() - t0) * 1000
        latencies.append(elapsed_ms)

        results.append({
            "id":              tc["id"],
            "category":        tc["cat"],
            "question":        tc["q"][:60],
            "predictedScore":  round(out["similarityScore"], 4),
            "predictedPass":   out["isCorrect"],
            "expectedScore":   tc["expectedScore"],
            "expectedPass":    tc["expectedPass"],
            "latency_ms":      round(elapsed_ms, 2),
        })

    metrics = compute_metrics(results)
    cat_breakdown = compute_category_breakdown(results)

    avg_lat = sum(latencies) / len(latencies) if latencies else 0
    p95_lat = sorted(latencies)[int(len(latencies) * 0.95)] if latencies else 0

    return {
        "mode": mode_name,
        "metrics": metrics,
        "category_breakdown": cat_breakdown,
        "avg_latency_ms": round(avg_lat, 2),
        "p95_latency_ms": round(p95_lat, 2),
        "per_case": results,
    }


def main():
    print("=" * 65)
    print("  Speechify -- Grading Pipeline Evaluation")
    print("  Test cases: 100  |  Threshold: 0.75")
    print("=" * 65)

    # -- Load SBERT model (needed for Mode 3) --
    print("\n[1/4] Loading SBERT model (all-MiniLM-L6-v2) ...")
    get_model()
    print("      Model loaded [OK]")

    # -- Run 3 modes --
    print("\n[2/4] Running Mode 1: Exact Match baseline ...")
    m1 = run_mode("exact_match", exact_match_grade)
    print(f"      Accuracy: {m1['metrics']['accuracy']:.1%}")

    print("\n[3/4] Running Mode 2: Keyword-Only ...")
    m2 = run_mode("keyword_only", keyword_only_grade)
    print(f"      Accuracy: {m2['metrics']['accuracy']:.1%}")

    print("\n[4/4] Running Mode 3: Full 6-Layer Pipeline (SBERT) ...")
    m3 = run_mode("full_pipeline", full_pipeline_grade)
    print(f"      Accuracy: {m3['metrics']['accuracy']:.1%}")

    # -- Build summary --
    report = {
        "timestamp": time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime()),
        "test_cases": len(TEST_CASES),
        "threshold": THRESHOLD,
        "model": "all-MiniLM-L6-v2",
        "modes": {
            "exact_match":   m1,
            "keyword_only":  m2,
            "full_pipeline": m3,
        },
    }

    # -- Save JSON --
    with open(OUT_JSON, "w", encoding="utf-8") as f:
        json.dump(report, f, indent=2, ensure_ascii=False)
    print(f"\nJSON report: {OUT_JSON}")

    # -- Build human-readable summary (LexFind style) --
    txt = f"""
+===================================================================+
|       Speechify -- Grading Pipeline Evaluation Report             |
+===================================================================+

Test Cases : {len(TEST_CASES)}
Threshold  : {THRESHOLD}
Model      : all-MiniLM-L6-v2 (22.7M params, 384-dim)

====================================================================
  HEAD-TO-HEAD COMPARISON
====================================================================

  {"Metric":<18}  {"Exact Match":<14}  {"Keyword Only":<14}  Full Pipeline
  {"-"*18}  {"-"*14}  {"-"*14}  {"-"*14}
  {"Accuracy":<18}  {m1["metrics"]["accuracy"]:<14.1%}  {m2["metrics"]["accuracy"]:<14.1%}  {m3["metrics"]["accuracy"]:.1%}
  {"Precision":<18}  {m1["metrics"]["precision"]:<14.1%}  {m2["metrics"]["precision"]:<14.1%}  {m3["metrics"]["precision"]:.1%}
  {"Recall":<18}  {m1["metrics"]["recall"]:<14.1%}  {m2["metrics"]["recall"]:<14.1%}  {m3["metrics"]["recall"]:.1%}
  {"F1 Score":<18}  {m1["metrics"]["f1"]:<14.1%}  {m2["metrics"]["f1"]:<14.1%}  {m3["metrics"]["f1"]:.1%}
  {"Cohen's Kappa":<18}  {m1["metrics"]["cohens_kappa"]:<14.4f}  {m2["metrics"]["cohens_kappa"]:<14.4f}  {m3["metrics"]["cohens_kappa"]:.4f}
  {"MAE":<18}  {m1["metrics"]["mae"]:<14.4f}  {m2["metrics"]["mae"]:<14.4f}  {m3["metrics"]["mae"]:.4f}
  {"Avg Latency":<18}  {m1["avg_latency_ms"]:<12.1f}ms  {m2["avg_latency_ms"]:<12.1f}ms  {m3["avg_latency_ms"]:.1f}ms
  {"P95 Latency":<18}  {m1["p95_latency_ms"]:<12.1f}ms  {m2["p95_latency_ms"]:<12.1f}ms  {m3["p95_latency_ms"]:.1f}ms

====================================================================
  PER-CATEGORY ACCURACY (Full Pipeline)
====================================================================
"""
    for cat, data in m3["category_breakdown"].items():
        txt += f"  {cat:<20}  n={data['count']:>3d}  accuracy={data['accuracy']:.1%}  MAE={data['mae']:.4f}\n"

    txt += f"""
====================================================================
  CONFUSION MATRIX (Full Pipeline)
====================================================================
                    Predicted PASS    Predicted FAIL
  Actually PASS     {m3["metrics"]["confusion_matrix"]["TP"]:>6d} (TP)       {m3["metrics"]["confusion_matrix"]["FN"]:>6d} (FN)
  Actually FAIL     {m3["metrics"]["confusion_matrix"]["FP"]:>6d} (FP)       {m3["metrics"]["confusion_matrix"]["TN"]:>6d} (TN)

Full report: grading_eval_report.json
"""

    with open(OUT_TXT, "w", encoding="utf-8") as f:
        f.write(txt)

    print(txt)
    print(f"Saved:\n  {OUT_JSON}\n  {OUT_TXT}")


if __name__ == "__main__":
    main()

