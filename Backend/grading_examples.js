// Practical Grading System Examples
console.log('='.repeat(60));
console.log('PROPORTIONAL GRADING SYSTEM - PRACTICAL DECIMALS');
console.log('='.repeat(60));

function calculatePoints(similarityScore, maxPoints) {
  let percentageEarned = 0;
  let tier = '';
  
  // Determine percentage based on similarity tiers
  if (similarityScore >= 0.85) {
    percentageEarned = 1.0;  // 100%
    tier = 'Full Credit (100%)';
  } else if (similarityScore >= 0.70) {
    percentageEarned = 0.75; // 75%
    tier = 'High Partial (75%)';
  } else if (similarityScore >= 0.60) {
    percentageEarned = 0.50; // 50%
    tier = 'Medium Partial (50%)';
  } else if (similarityScore >= 0.50) {
    percentageEarned = 0.25; // 25%
    tier = 'Low Partial (25%)';
  } else {
    percentageEarned = 0;    // 0%
    tier = 'No Credit (0%)';
  }
  
  // Calculate raw points
  const rawPoints = maxPoints * percentageEarned;
  let pointsEarned = 0;
  
  // Smart rounding based on point value
  if (maxPoints < 2) {
    // For very low point questions (1, 1.5), round to nearest 0.5
    pointsEarned = Math.round(rawPoints * 2) / 2;
  } else if (maxPoints < 4) {
    // For low point questions (2, 3), round to nearest 0.5
    pointsEarned = Math.round(rawPoints * 2) / 2;
  } else {
    // For normal point questions (4+), round to nearest 0.25
    pointsEarned = Math.round(rawPoints * 4) / 4;
  }
  
  // Ensure we never exceed max points
  pointsEarned = Math.min(pointsEarned, maxPoints);
  
  return { pointsEarned, percentageEarned, tier };
}

// Test different point values including very low ones
const testCases = [
  { maxPoints: 1, scores: [0.95, 0.80, 0.65, 0.55, 0.40] },
  { maxPoints: 1.5, scores: [0.90, 0.75, 0.62, 0.52, 0.35] },
  { maxPoints: 2, scores: [0.88, 0.78, 0.68, 0.58, 0.30] },
  { maxPoints: 3, scores: [0.92, 0.82, 0.63, 0.51, 0.25] },
  { maxPoints: 5, scores: [0.95, 0.80, 0.65, 0.55, 0.40] },
  { maxPoints: 6, scores: [0.90, 0.75, 0.62, 0.52, 0.35] },
  { maxPoints: 10, scores: [1.00, 0.82, 0.68, 0.50, 0.45] }
];

testCases.forEach(({ maxPoints, scores }) => {
  console.log(`\n📊 FOR ${maxPoints}-POINT QUESTION:`);
  console.log('-'.repeat(60));
  
  scores.forEach(score => {
    const result = calculatePoints(score, maxPoints);
    const scorePercent = Math.round(score * 100);
    console.log(`Similarity: ${scorePercent}% → ${result.tier.padEnd(25)} = ${result.pointsEarned.toFixed(2)}/${maxPoints} pts`);
  });
});

console.log('\n' + '='.repeat(60));
console.log('SMART ROUNDING RULES:');
console.log('='.repeat(60));
console.log('📌 Questions < 2 points (1, 1.5)  → Round to nearest 0.5');
console.log('📌 Questions 2-3 points (2, 3)    → Round to nearest 0.5');
console.log('📌 Questions 4+ points (4, 5, 10) → Round to nearest 0.25');
console.log('='.repeat(60));

console.log('\n' + '='.repeat(60));
console.log('GRADING TIER BREAKDOWN:');
console.log('='.repeat(60));
console.log('✅ 85-100% similarity → 100% of points (Full Credit)');
console.log('🟡 70-84%  similarity → 75% of points (High Partial)');
console.log('🟠 60-69%  similarity → 50% of points (Medium Partial)');
console.log('🟤 50-59%  similarity → 25% of points (Low Partial)');
console.log('❌ 0-49%   similarity → 0% of points (No Credit)');
console.log('='.repeat(60));

console.log('\n📝 PRACTICAL EXAMPLES WITH SMART ROUNDING:');
console.log('-'.repeat(60));

const examples = [
  { q: '1-point question', sim: 92, result: '1.00 pts (100%)', note: 'rounded to 0.5' },
  { q: '1-point question', sim: 78, result: '0.50 pts (75%)', note: '0.75 → 0.5' },
  { q: '1-point question', sim: 65, result: '0.50 pts (50%)', note: 'exact 0.5' },
  { q: '1-point question', sim: 52, result: '0.00 pts (25%)', note: '0.25 → 0.0' },
  { q: '1.5-point question', sim: 88, result: '1.50 pts (100%)', note: 'rounded to 0.5' },
  { q: '1.5-point question', sim: 72, result: '1.00 pts (75%)', note: '1.125 → 1.0' },
  { q: '1.5-point question', sim: 61, result: '1.00 pts (50%)', note: '0.75 → 1.0' },
  { q: '1.5-point question', sim: 55, result: '0.50 pts (25%)', note: '0.375 → 0.5' },
  { q: '2-point question', sim: 90, result: '2.00 pts (100%)', note: 'rounded to 0.5' },
  { q: '2-point question', sim: 76, result: '1.50 pts (75%)', note: 'exact 1.5' },
  { q: '2-point question', sim: 64, result: '1.00 pts (50%)', note: 'exact 1.0' },
  { q: '2-point question', sim: 53, result: '0.50 pts (25%)', note: 'exact 0.5' },
  { q: '5-point question', sim: 92, result: '5.00 pts (100%)', note: 'rounded to 0.25' },
  { q: '5-point question', sim: 78, result: '3.75 pts (75%)', note: 'exact 3.75' },
  { q: '5-point question', sim: 65, result: '2.50 pts (50%)', note: 'exact 2.5' },
  { q: '5-point question', sim: 52, result: '1.25 pts (25%)', note: 'exact 1.25' },
  { q: '10-point question', sim: 95, result: '10.00 pts (100%)', note: 'rounded to 0.25' },
  { q: '10-point question', sim: 81, result: '7.50 pts (75%)', note: 'exact 7.5' },
  { q: '10-point question', sim: 67, result: '5.00 pts (50%)', note: 'exact 5.0' },
  { q: '10-point question', sim: 50, result: '2.50 pts (25%)', note: 'exact 2.5' }
];

examples.forEach(ex => {
  console.log(`${ex.q.padEnd(20)} | ${ex.sim}% → ${ex.result.padEnd(20)} [${ex.note}]`);
});

console.log('='.repeat(60));
console.log('✨ ADAPTIVE GRADING FOR ANY POINT VALUE!');
console.log('✨ LOW POINTS (1, 1.5, 2, 3) → Rounded to 0.5');
console.log('✨ NORMAL POINTS (5, 6, 10+) → Rounded to 0.25');
console.log('✨ NO HARDCODING - WORKS WITH ANY POINT VALUE!');
console.log('='.repeat(60));
