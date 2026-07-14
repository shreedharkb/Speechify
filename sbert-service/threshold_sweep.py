import json

r = json.load(open("grading_eval_report.json"))
cases = r["modes"]["full_pipeline"]["per_case"]

thresholds = [0.35, 0.40, 0.45, 0.50, 0.55, 0.60, 0.65, 0.70, 0.75]

print(f"{'Thresh':>8} {'Accuracy':>10} {'Precision':>10} {'Recall':>10} {'F1':>10} {'FP':>5} {'FN':>5}")
print("-" * 62)

best_f1 = 0
best_t = 0

for t in thresholds:
    tp = sum(1 for c in cases if c["predictedScore"] >= t and c["expectedPass"])
    fp = sum(1 for c in cases if c["predictedScore"] >= t and not c["expectedPass"])
    fn = sum(1 for c in cases if c["predictedScore"] < t and c["expectedPass"])
    tn = sum(1 for c in cases if c["predictedScore"] < t and not c["expectedPass"])

    n = len(cases)
    acc = (tp + tn) / n
    prec = tp / (tp + fp) if (tp + fp) else 0
    rec = tp / (tp + fn) if (tp + fn) else 0
    f1 = 2 * prec * rec / (prec + rec) if (prec + rec) else 0

    marker = ""
    if f1 > best_f1:
        best_f1 = f1
        best_t = t
        marker = " <-- best F1"

    print(f"{t:>8.2f} {acc:>10.1%} {prec:>10.1%} {rec:>10.1%} {f1:>10.1%} {fp:>5d} {fn:>5d}{marker}")

print(f"\nOptimal threshold: {best_t} (F1 = {best_f1:.1%})")
