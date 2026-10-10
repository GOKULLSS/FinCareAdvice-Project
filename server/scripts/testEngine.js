const assert = require('assert');
const {
  HEALTH_COVER_BENCHMARKS,
  calculateTotalConsumption,
  calculateTotalCommitments,
  calculateTotalIncome,
  evaluateEmergencyFund,
  evaluateInsurance,
} = require('../services/rulesEngine');

const {
  BASELINE_ALLOCATION_MATRIX,
  getTimeHorizonTier,
  getBaselineAllocation,
  applyAiDynamicTilt,
  calculateInvestmentProjections,
} = require('../services/portfolioEngine');

console.log('=' .repeat(60));
console.log('RUNNING FINCAREADVICE RULES & PORTFOLIO ENGINE TEST SUITE');
console.log('=' .repeat(60));

// Test 1: Baseline Allocation Matrix
console.log('\n[Test 1] Baseline Allocation Matrix Verification');
assert.deepStrictEqual(BASELINE_ALLOCATION_MATRIX.short.Conservative, { debt: 90, gold: 5, equity: 5 });
assert.deepStrictEqual(BASELINE_ALLOCATION_MATRIX.short.Moderate, { debt: 75, gold: 10, equity: 15 });
assert.deepStrictEqual(BASELINE_ALLOCATION_MATRIX.short.Aggressive, { debt: 70, gold: 10, equity: 20 });

assert.deepStrictEqual(BASELINE_ALLOCATION_MATRIX.medium.Conservative, { debt: 65, gold: 10, equity: 25 });
assert.deepStrictEqual(BASELINE_ALLOCATION_MATRIX.medium.Moderate, { debt: 45, gold: 15, equity: 40 });
assert.deepStrictEqual(BASELINE_ALLOCATION_MATRIX.medium.Aggressive, { debt: 30, gold: 10, equity: 60 });

assert.deepStrictEqual(BASELINE_ALLOCATION_MATRIX.long.Conservative, { debt: 30, gold: 10, equity: 60 });
assert.deepStrictEqual(BASELINE_ALLOCATION_MATRIX.long.Moderate, { debt: 15, gold: 10, equity: 75 });
assert.deepStrictEqual(BASELINE_ALLOCATION_MATRIX.long.Aggressive, { debt: 5, gold: 10, equity: 85 });
console.log('✓ All 9 baseline matrix allocations verified successfully.');

// Test 2: Emergency Fund Rules
console.log('\n[Test 2] Emergency Fund Rules Verification');
// 3x Rule
const ef3x = evaluateEmergencyFund({
  essentialExpenses: 50000,
  currentEmergencyFund: 100000,
  hasStableJob: true,
  hasStableIncome: true,
  dependents: 0,
  hasFamily: false,
});
assert.strictEqual(ef3x.targetMultiplier, 3);
assert.strictEqual(ef3x.targetFund, 150000);
assert.strictEqual(ef3x.fundingGap, 50000);
console.log('✓ 3x Emergency Buffer for stable job + stable income (no dependents) verified.');

// 6x Rule
const ef6x = evaluateEmergencyFund({
  essentialExpenses: 50000,
  currentEmergencyFund: 200000,
  hasStableJob: true,
  hasStableIncome: true,
  dependents: 2,
  hasFamily: true,
});
assert.strictEqual(ef6x.targetMultiplier, 6);
assert.strictEqual(ef6x.targetFund, 300000);
assert.strictEqual(ef6x.fundingGap, 100000);
console.log('✓ 6x Emergency Buffer for stable job with dependents verified.');

// 12x Rule
const ef12x = evaluateEmergencyFund({
  essentialExpenses: 50000,
  currentEmergencyFund: 150000,
  hasStableJob: false, // Variable / unstable
  hasStableIncome: false,
  dependents: 1,
  hasFamily: true,
});
assert.strictEqual(ef12x.targetMultiplier, 12);
assert.strictEqual(ef12x.targetFund, 600000);
assert.strictEqual(ef12x.fundingGap, 450000);
console.log('✓ 12x Emergency Buffer for variable income / unstable job with dependents verified.');

// Test 3: Insurance Benchmarks
console.log('\n[Test 3] Insurance Benchmarks Verification');
const insMetro = evaluateInsurance({
  netIncome: 100000,
  annualIncome: 1200000,
  activePremiums: 6000,
  cityTier: 'metro',
  hasFamily: false,
  dependents: 0,
});
assert.strictEqual(insMetro.healthCoverRange.min, 1500000);
assert.strictEqual(insMetro.healthCoverRange.max, 5000000);
assert.strictEqual(insMetro.premiumBudget.min, 5000); // 5%
assert.strictEqual(insMetro.premiumBudget.max, 8000); // 8%
assert.strictEqual(insMetro.budgetStatus, 'optimal');

// Family multiplier (2x)
const insFamilyTier2 = evaluateInsurance({
  netIncome: 100000,
  annualIncome: 1200000,
  activePremiums: 6000,
  cityTier: 'tier2',
  hasFamily: true,
  dependents: 1,
});
assert.strictEqual(insFamilyTier2.healthCoverRange.min, 2000000); // 10L * 2
assert.strictEqual(insFamilyTier2.healthCoverRange.max, 5000000); // 25L * 2
console.log('✓ Metro & Tier 2 health cover benchmarks with 2x family floater verified.');

// Test 4: AI Dynamic Tilt Safeguards
console.log('\n[Test 4] AI Dynamic Tilt & Safeguard Bounding Verification');
const baseline5YMod = { debt: 45, gold: 15, equity: 40 };

// Case A: High positive sentiment on equities (+0.95), negative debt (-0.80), neutral gold (0.0)
const tiltA = applyAiDynamicTilt({
  baselineAllocation: baseline5YMod,
  sentimentScores: { equities: 0.95, debt: -0.80, gold: 0.0 },
  maxTiltPercentage: 5.0,
});

assert.strictEqual(tiltA.status, 'AI_TILTED_SUCCESS');
assert.strictEqual(tiltA.isGuardrailed, true);
assert.strictEqual(tiltA.allocationSum, 100.0);

// Verify each asset is within [baseline - maxTilt, baseline + maxTilt]
const assets = ['debt', 'gold', 'equity'];
assets.forEach((a) => {
  const diff = Math.abs(tiltA.finalAllocation[a] - baseline5YMod[a]);
  assert(diff <= 5.01, `Asset ${a} diff ${diff} exceeded 5.0% max tilt!`);
  assert(tiltA.finalAllocation[a] >= 0, `Asset ${a} was negative!`);
});

const sumA = Math.round((tiltA.finalAllocation.debt + tiltA.finalAllocation.gold + tiltA.finalAllocation.equity) * 100) / 100;
assert.strictEqual(sumA, 100.0, `Sum ${sumA} did not equal 100.0%!`);
console.log('✓ Positive equity tilt bounded within ±5% and sum = 100.00% verified.');

// Case B: Fallback verification if sentiment is null
const tiltFallback = applyAiDynamicTilt({
  baselineAllocation: baseline5YMod,
  sentimentScores: null,
});
assert.strictEqual(tiltFallback.status, 'FALLBACK_BASELINE');
assert.deepStrictEqual(tiltFallback.finalAllocation, baseline5YMod);
console.log('✓ Fallback strictly to deterministic baseline when sentiment is null verified.');

// Test 5: Investment Calculator Projections
console.log('\n[Test 5] Investment Calculator Math Verification');
const sipResult = calculateInvestmentProjections({
  monthlySip: 10000,
  lumpsum: 0,
  durationYears: 10,
  expectedReturnRate: 12.0,
  inflationRate: 6.0,
});
assert.strictEqual(sipResult.summary.totalInvested, 1200000);
assert(sipResult.summary.maturityValue > 2200000, 'SIP compounding failed');
assert.strictEqual(sipResult.schedule.length, 10);
console.log(`✓ 10-Year SIP Invested: ₹${sipResult.summary.totalInvested.toLocaleString()} -> Maturity: ₹${sipResult.summary.maturityValue.toLocaleString()} verified.`);

console.log('\n' + '='.repeat(60));
console.log('ALL RULES & PORTFOLIO ENGINE ASSERTIONS PASSED WITH 100% SUCCESS!');
console.log('='.repeat(60));
