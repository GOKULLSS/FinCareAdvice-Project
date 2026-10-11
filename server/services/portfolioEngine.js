/**
 * Portfolio Engine: Deterministic Baseline + AI Dynamic Tilt (Safeguard Architecture)
 *
 * Implements:
 * 1. Time Horizon & Risk Profile Allocation Matrix
 * 2. Guardrailed AI dynamic tilt (strictly clamped between ±5.0% and ±10.0% max)
 * 3. Exact 100.00% invariant preservation
 * 4. Resilient fallback to deterministic baseline
 */

// Step 1: Deterministic Baseline Allocation Matrix
const BASELINE_ALLOCATION_MATRIX = {
  short: {
    // < 3 years
    Conservative: { debt: 90, gold: 5, equity: 5 },
    Moderate: { debt: 75, gold: 10, equity: 15 },
    Aggressive: { debt: 70, gold: 10, equity: 20 },
  },
  medium: {
    // 3 - 7 years
    Conservative: { debt: 65, gold: 10, equity: 25 },
    Moderate: { debt: 45, gold: 15, equity: 40 },
    Aggressive: { debt: 30, gold: 10, equity: 60 },
  },
  long: {
    // > 7 years
    Conservative: { debt: 30, gold: 10, equity: 60 },
    Moderate: { debt: 15, gold: 10, equity: 75 },
    Aggressive: { debt: 5, gold: 10, equity: 85 },
  },
};

/**
 * Maps horizon in years to matrix tier
 */
const getTimeHorizonTier = (years) => {
  const y = Number(years) || 5;
  if (y < 3) return 'short';
  if (y <= 7) return 'medium';
  return 'long';
};

/**
 * Gets the deterministic baseline allocation
 */
const getBaselineAllocation = (timeHorizonYears, riskProfile = 'Moderate') => {
  const horizonTier = getTimeHorizonTier(timeHorizonYears);
  const normalizedRisk =
    riskProfile && BASELINE_ALLOCATION_MATRIX[horizonTier][riskProfile]
      ? riskProfile
      : 'Moderate';

  const baseline = BASELINE_ALLOCATION_MATRIX[horizonTier][normalizedRisk];
  return {
    horizonTier,
    riskProfile: normalizedRisk,
    allocation: { ...baseline },
  };
};

/**
 * Clamps a number between min and max
 */
const clamp = (val, min, max) => Math.min(Math.max(val, min), max);

/**
 * Applies AI Dynamic Tilt with strict safeguards:
 * - Max tilt per asset class: maxTiltPercentage (default 5%, max allowed 10%)
 * - Absolute sum must equal 100.00%
 * - No negative allocations
 * - Each asset stays within [baseline - maxTilt, baseline + maxTilt]
 */
const applyAiDynamicTilt = ({
  baselineAllocation,
  sentimentScores = null,
  maxTiltPercentage = 5.0, // ±5% safeguard bounding
}) => {
  const maxTilt = Math.min(Math.max(Number(maxTiltPercentage) || 5.0, 1.0), 10.0);

  // Fallback check: If no sentiment data provided or empty
  if (!sentimentScores || typeof sentimentScores !== 'object') {
    return {
      status: 'FALLBACK_BASELINE',
      reason: 'No sentiment scores provided. Falling back strictly to deterministic baseline.',
      baseline: { ...baselineAllocation },
      sentimentApplied: null,
      maxTiltAllowed: maxTilt,
      tilts: { debt: 0, gold: 0, equity: 0 },
      finalAllocation: { ...baselineAllocation },
      isGuardrailed: true,
      allocationSum: 100.0,
      timestamp: new Date().toISOString(),
    };
  }

  // Normalize sentiments into [-1.0, +1.0]
  const sentiment = {
    equity: clamp(Number(sentimentScores.equities ?? sentimentScores.equity ?? 0), -1.0, 1.0),
    debt: clamp(Number(sentimentScores.debt ?? 0), -1.0, 1.0),
    gold: clamp(Number(sentimentScores.gold ?? 0), -1.0, 1.0),
  };

  const assets = ['debt', 'gold', 'equity'];

  // Calculate lower and upper bounds for each asset
  const bounds = {};
  assets.forEach((asset) => {
    const base = baselineAllocation[asset] || 0;
    bounds[asset] = {
      base,
      min: Math.max(0, base - maxTilt),
      max: Math.min(100, base + maxTilt),
    };
  });

  // Step A: Calculate raw unconstrained tilt: sentiment * maxTilt
  const rawTilt = {
    debt: sentiment.debt * maxTilt,
    gold: sentiment.gold * maxTilt,
    equity: sentiment.equity * maxTilt,
  };

  // Step B: Calculate initial clamped targets
  let target = {};
  assets.forEach((asset) => {
    target[asset] = clamp(bounds[asset].base + rawTilt[asset], bounds[asset].min, bounds[asset].max);
  });

  // Step C: Constrained projection to ensure sum is exactly 100.00%
  // Iteratively redistribute discrepancies so we never breach [min, max]
  for (let iteration = 0; iteration < 10; iteration++) {
    const currentSum = assets.reduce((acc, a) => acc + target[a], 0);
    const diff = 100.0 - currentSum;

    if (Math.abs(diff) < 0.001) break;

    if (diff > 0) {
      // Need to add: find assets with upward capacity
      const capacities = {};
      let totalCapacity = 0;
      assets.forEach((a) => {
        const cap = Math.max(0, bounds[a].max - target[a]);
        capacities[a] = cap;
        totalCapacity += cap;
      });

      if (totalCapacity <= 0.0001) break;

      assets.forEach((a) => {
        const share = (capacities[a] / totalCapacity) * diff;
        target[a] += share;
      });
    } else {
      // Need to subtract: find assets with downward capacity
      const capacities = {};
      let totalCapacity = 0;
      assets.forEach((a) => {
        const cap = Math.max(0, target[a] - bounds[a].min);
        capacities[a] = cap;
        totalCapacity += cap;
      });

      if (totalCapacity <= 0.0001) break;

      assets.forEach((a) => {
        const share = (capacities[a] / totalCapacity) * Math.abs(diff);
        target[a] -= share;
      });
    }
  }

  // Step D: Rounding to 2 decimal places and exact integer/cents reconciliation
  const rounded = {};
  assets.forEach((a) => {
    rounded[a] = Math.round(target[a] * 100) / 100;
  });

  // Reconcile minor round-off cents on the asset with highest baseline
  const roundedSum = Math.round((rounded.debt + rounded.gold + rounded.equity) * 100) / 100;
  const roundDiscrepancy = Math.round((100.0 - roundedSum) * 100) / 100;

  if (roundDiscrepancy !== 0) {
    // Pick the most flexible asset that won't violate bounds
    const flexibleAsset = assets.find(
      (a) =>
        rounded[a] + roundDiscrepancy >= bounds[a].min &&
        rounded[a] + roundDiscrepancy <= bounds[a].max
    ) || 'equity';
    rounded[flexibleAsset] = Math.round((rounded[flexibleAsset] + roundDiscrepancy) * 100) / 100;
  }

  // Calculate actual realized tilts
  const realizedTilts = {};
  assets.forEach((a) => {
    realizedTilts[a] = Math.round((rounded[a] - baselineAllocation[a]) * 100) / 100;
  });

  const finalSum = Math.round((rounded.debt + rounded.gold + rounded.equity) * 100) / 100;

  return {
    status: 'AI_TILTED_SUCCESS',
    reason: `Dynamic tilt calibrated successfully. All assets bounded within ±${maxTilt}% safety guardrails.`,
    baseline: { ...baselineAllocation },
    sentimentApplied: sentiment,
    maxTiltAllowed: maxTilt,
    tilts: realizedTilts,
    finalAllocation: rounded,
    isGuardrailed: true,
    allocationSum: finalSum,
    timestamp: new Date().toISOString(),
  };
};

/**
 * SIP & Lumpsum Compound Growth Calculator
 */
const calculateInvestmentProjections = ({
  monthlySip = 0,
  lumpsum = 0,
  durationYears = 10,
  expectedReturnRate = 12.0, // Annual percentage (e.g. 12%)
  inflationRate = 6.0,       // Optional inflation discount
}) => {
  const monthlyRate = expectedReturnRate / 100 / 12;
  const totalMonths = Math.max(1, Math.round(durationYears * 12));
  const pSip = Math.max(0, Number(monthlySip) || 0);
  const pLumpsum = Math.max(0, Number(lumpsum) || 0);

  // Month-by-month compounding timeline for charts
  const schedule = [];
  let investedCapital = pLumpsum;
  let totalWealth = pLumpsum;

  for (let month = 1; month <= totalMonths; month++) {
    investedCapital += pSip;
    totalWealth = (totalWealth + pSip) * (1 + monthlyRate);

    // Save yearly snapshots or milestone intervals
    if (month % 12 === 0 || month === totalMonths) {
      const year = Math.ceil(month / 12);
      const returnsGained = Math.max(0, totalWealth - investedCapital);
      const inflationFactor = Math.pow(1 + inflationRate / 100, year);
      const inflationAdjustedWealth = totalWealth / inflationFactor;

      schedule.push({
        year,
        investedCapital: Math.round(investedCapital),
        returnsGained: Math.round(returnsGained),
        totalWealth: Math.round(totalWealth),
        inflationAdjustedWealth: Math.round(inflationAdjustedWealth),
      });
    }
  }

  const finalInvested = Math.round(investedCapital);
  const finalMaturity = Math.round(totalWealth);
  const finalEstimatedReturns = Math.round(finalMaturity - finalInvested);
  const wealthMultiplier = finalInvested > 0 ? (finalMaturity / finalInvested).toFixed(2) : 0;

  return {
    inputs: {
      monthlySip: pSip,
      lumpsum: pLumpsum,
      durationYears: Number(durationYears),
      expectedReturnRate: Number(expectedReturnRate),
      inflationRate: Number(inflationRate),
    },
    summary: {
      totalInvested: finalInvested,
      estimatedReturns: finalEstimatedReturns,
      maturityValue: finalMaturity,
      wealthMultiplier: `${wealthMultiplier}x`,
    },
    schedule,
  };
};

module.exports = {
  BASELINE_ALLOCATION_MATRIX,
  getTimeHorizonTier,
  getBaselineAllocation,
  applyAiDynamicTilt,
  calculateInvestmentProjections,
};
