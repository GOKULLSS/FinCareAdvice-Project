/**
 * Rules Engine for Financial Advisory
 * Handles deterministic financial planning logic:
 * - Essential Expenses Aggregation
 * - Emergency Fund Gap Analysis (3x, 6x, 12x logic)
 * - Insurance Adequacy & Health Cover Benchmarks
 */

// City Tier Health Benchmarks (in INR)
const HEALTH_COVER_BENCHMARKS = {
  metro: { min: 1500000, max: 5000000, label: '₹15L - ₹50L' }, // Tier 1 Metro
  tier2: { min: 1000000, max: 2500000, label: '₹10L - ₹25L' }, // Tier 2 Cities
  town: { min: 500000, max: 1500000, label: '₹5L - ₹15L' },    // Small Towns / Rural
};

/**
 * Calculates total consumption expenses
 */
const calculateTotalConsumption = (consumption = {}) => {
  return (
    (Number(consumption.rent) || 0) +
    (Number(consumption.groceries) || 0) +
    (Number(consumption.transport) || 0) +
    (Number(consumption.utilities) || 0) +
    (Number(consumption.dining) || 0) +
    (Number(consumption.subscriptions) || 0)
  );
};

/**
 * Calculates total commitment expenses
 */
const calculateTotalCommitments = (commitments = {}) => {
  return (
    (Number(commitments.loans) || 0) +
    (Number(commitments.emis) || 0) +
    (Number(commitments.creditCards) || 0)
  );
};

/**
 * Calculates total gross income
 */
const calculateTotalIncome = (income = {}) => {
  return (
    (Number(income.salary) || 0) +
    (Number(income.business) || 0) +
    (Number(income.investments) || 0) +
    (Number(income.other) || 0)
  );
};

/**
 * Evaluates Emergency Fund adequacy
 * Rules:
 * - Stable Job + Stable Income (no dependents) = 3x Essential Expenses
 * - Stable Job + Dependents = 6x Essential Expenses
 * - Dependents only / Variable income (unstable job or unstable income) = 12x Essential Expenses
 */
const evaluateEmergencyFund = ({
  essentialExpenses,
  currentEmergencyFund = 0,
  hasStableJob = true,
  hasStableIncome = true,
  dependents = 0,
  hasFamily = false,
}) => {
  let targetMultiplier = 3;
  let ruleReason = '';

  const hasDependentsOrFamily = dependents > 0 || hasFamily;
  const isIncomeVariable = !hasStableJob || !hasStableIncome;

  if (isIncomeVariable || (hasDependentsOrFamily && !hasStableJob)) {
    // Variable income or dependents without stable job -> 12 months buffer
    targetMultiplier = 12;
    ruleReason =
      '12 Months Buffer: Applied due to variable income streams and/or single-earner family dependencies.';
  } else if (hasStableJob && hasDependentsOrFamily) {
    // Stable job with dependents -> 6 months buffer
    targetMultiplier = 6;
    ruleReason =
      '6 Months Buffer: Applied for stable salaried professional supporting family dependents.';
  } else {
    // Stable job and stable income without dependents -> 3 months buffer
    targetMultiplier = 3;
    ruleReason =
      '3 Months Buffer: Applied for salaried individual with stable income and minimal external dependencies.';
  }

  const targetFund = Math.round(essentialExpenses * targetMultiplier);
  const currentFund = Math.max(0, Number(currentEmergencyFund) || 0);
  const fundingGap = Math.max(0, targetFund - currentFund);
  const surplus = Math.max(0, currentFund - targetFund);
  const fundingRatio = targetFund > 0 ? Math.min(100, Math.round((currentFund / targetFund) * 100)) : 100;

  let status = 'adequate';
  let statusLabel = 'Well Protected';
  let severity = 'success';

  if (essentialExpenses === 0 && currentFund === 0) {
    status = 'not_configured';
    statusLabel = 'Pending Intake';
    severity = 'warning';
  } else if (fundingRatio < 40) {
    status = 'critical_gap';
    statusLabel = 'Critical Shortfall';
    severity = 'danger';
  } else if (fundingRatio < 100) {
    status = 'moderate_gap';
    statusLabel = 'Funding Gap';
    severity = 'warning';
  }

  // Recommendations
  const recommendations = [];
  if (essentialExpenses === 0 && currentFund === 0) {
    recommendations.push(
      'No monthly expenses recorded yet. Input your regular monthly expenses in the Intake Dashboard to calculate your target emergency buffer.'
    );
  } else if (fundingGap > 0) {
    const recommendedMonthlyAllocation = Math.round(fundingGap / 6);
    recommendations.push(
      `Priority 1: Build your safety buffer by allocating ₹${recommendedMonthlyAllocation.toLocaleString(
        'en-IN'
      )}/month into high-liquidity instruments (Liquid Mutual Funds or High-yield Savings) to reach full coverage within 6 months.`
    );
    recommendations.push(
      `Keep at least 1 month of essential expenses (₹${essentialExpenses.toLocaleString(
        'en-IN'
      )}) in an instantly accessible sweep-in fixed deposit.`
    );
  } else {
    recommendations.push(
      `Safety net is fully funded at ₹${currentFund.toLocaleString(
        'en-IN'
      )}! Excess monthly cashflow can be channeled directly into long-term wealth compounding assets.`
    );
  }

  return {
    targetMultiplier,
    ruleReason,
    essentialExpenses,
    currentFund,
    targetFund,
    fundingGap,
    surplus,
    fundingRatio,
    status,
    statusLabel,
    severity,
    recommendations,
  };
};

/**
 * Evaluates Insurance coverage and budget
 * Rules:
 * - Premium budget is 5%–8% of net income
 * - Health cover benchmarks: Metro (₹15L-₹50L), Tier 2 (₹10L-₹25L), Town (₹5L-₹15L)
 * - Multiplied by 2x for families (hasFamily === true or dependents > 0)
 * - Term Life Benchmark: 10x - 15x of annual income if dependents exist
 */
const evaluateInsurance = ({
  netIncome,
  annualIncome,
  activePremiums = 0,
  cityTier = 'metro',
  hasFamily = false,
  dependents = 0,
}) => {
  const normalizedTier = HEALTH_COVER_BENCHMARKS[cityTier] ? cityTier : 'metro';
  const baseBenchmark = HEALTH_COVER_BENCHMARKS[normalizedTier];

  const hasDependentsOrFamily = hasFamily || dependents > 0;
  const familyMultiplier = hasDependentsOrFamily ? 2 : 1;

  const recommendedHealthMin = baseBenchmark.min * familyMultiplier;
  const recommendedHealthMax = baseBenchmark.max * familyMultiplier;

  // Monthly insurance premium budget: 5% to 8% of monthly net income
  const safeMonthlyNetIncome = Math.max(0, netIncome);
  const minMonthlyPremiumBudget = Math.round(safeMonthlyNetIncome * 0.05);
  const maxMonthlyPremiumBudget = Math.round(safeMonthlyNetIncome * 0.08);

  const currentMonthlyPremium = Math.max(0, Number(activePremiums) || 0);

  // Term life coverage benchmark (10x - 15x of annual income if dependents)
  const recommendedTermCoverMin = hasDependentsOrFamily ? Math.round(annualIncome * 10) : 0;
  const recommendedTermCoverMax = hasDependentsOrFamily ? Math.round(annualIncome * 15) : 0;

  // Analysis of current spend
  let budgetStatus = 'optimal';
  let budgetStatusMessage = 'Your insurance premium spend is within healthy financial guidelines (5% - 8% of net income).';

  if (safeMonthlyNetIncome === 0) {
    budgetStatus = 'optimal';
    budgetStatusMessage = 'Update your income in the Intake Dashboard to receive a personalized insurance premium recommendation.';
  } else if (currentMonthlyPremium < minMonthlyPremiumBudget) {
    budgetStatus = 'under_allocated';
    budgetStatusMessage = `You are spending less than 5% of net income (₹${minMonthlyPremiumBudget.toLocaleString(
      'en-IN'
    )}/mo). Ensure you have adequate pure-term and comprehensive health floater policies in place.`;
  } else if (currentMonthlyPremium > maxMonthlyPremiumBudget) {
    budgetStatus = 'over_allocated';
    budgetStatusMessage = `You are spending more than 8% of net income (₹${maxMonthlyPremiumBudget.toLocaleString(
      'en-IN'
    )}/mo) on insurance premiums. Check if you hold low-yield ULIPs or endowment plans that can be rationalized into pure-term cover.`;
  }

  const recommendations = [
    `Health Cover Benchmark: For a ${hasDependentsOrFamily ? 'family' : 'single individual'} in a ${normalizedTier} location, maintain a base health insurance cover between ₹${(
      recommendedHealthMin / 100000
    ).toFixed(0)} Lakhs and ₹${(recommendedHealthMax / 100000).toFixed(0)} Lakhs.`,
  ];

  if (hasDependentsOrFamily) {
    recommendations.push(
      `Term Life Cover: With ${dependents} dependent(s), obtain a Pure Term Life insurance policy with a sum assured of ₹${(
        recommendedTermCoverMin / 10000000
      ).toFixed(1)} Cr – ₹${(recommendedTermCoverMax / 10000000).toFixed(1)} Cr (10x–15x annual income).`
    );
  } else {
    recommendations.push(
      `Term Life Cover: No immediate dependents detected. Prioritize comprehensive health insurance with super top-up before purchasing term cover.`
    );
  }

  if (safeMonthlyNetIncome === 0) {
    recommendations.push(
      'Record your monthly income in the Intake Dashboard to determine your recommended insurance premium budget (5% – 8% of net income).'
    );
  } else {
    recommendations.push(
      `Optimal Insurance Budget: Keep overall monthly insurance outgo between ₹${minMonthlyPremiumBudget.toLocaleString(
        'en-IN'
      )} and ₹${maxMonthlyPremiumBudget.toLocaleString('en-IN')}.`
    );
  }

  return {
    cityTier: normalizedTier,
    familyMultiplier,
    currentMonthlyPremium,
    premiumBudget: {
      min: minMonthlyPremiumBudget,
      max: maxMonthlyPremiumBudget,
      recommendedRange: `₹${minMonthlyPremiumBudget.toLocaleString('en-IN')} – ₹${maxMonthlyPremiumBudget.toLocaleString(
        'en-IN'
      )} / month`,
    },
    healthCoverRange: {
      min: recommendedHealthMin,
      max: recommendedHealthMax,
      formatted: `₹${(recommendedHealthMin / 100000).toFixed(0)} Lakhs – ₹${(
        recommendedHealthMax / 100000
      ).toFixed(0)} Lakhs`,
    },
    termLifeCoverRange: {
      min: recommendedTermCoverMin,
      max: recommendedTermCoverMax,
      formatted: hasDependentsOrFamily
        ? `₹${(recommendedTermCoverMin / 10000000).toFixed(1)} Cr – ₹${(
            recommendedTermCoverMax / 10000000
          ).toFixed(1)} Cr`
        : 'Not strictly required (No dependents)',
    },
    budgetStatus,
    budgetStatusMessage,
    recommendations,
  };
};

/**
 * Full advisory assessment aggregator
 */
const generateAdvisoryAnalysis = (profile, user) => {
  const income = profile.income || {};
  const consumption = profile.expensesConsumption || {};
  const commitments = profile.expensesCommitment || {};
  const safety = profile.safety || {};
  const flags = profile.flags || {};

  const totalMonthlyIncome = calculateTotalIncome(income);
  const totalConsumption = calculateTotalConsumption(consumption);
  const totalCommitments = calculateTotalCommitments(commitments);
  const essentialExpenses = totalConsumption + totalCommitments;
  const netMonthlyIncome = Math.max(0, totalMonthlyIncome - totalCommitments);
  const annualIncome = totalMonthlyIncome * 12;
  const monthlyDiscretionaryCashflow = totalMonthlyIncome - essentialExpenses;
  const savingsRate =
    totalMonthlyIncome > 0
      ? Math.max(0, Math.round(((totalMonthlyIncome - essentialExpenses) / totalMonthlyIncome) * 100))
      : 0;

  // Emergency Fund Engine
  const emergencyFundReport = evaluateEmergencyFund({
    essentialExpenses,
    currentEmergencyFund: safety.emergencyFundBalance || 0,
    hasStableJob: flags.hasStableJob ?? true,
    hasStableIncome: flags.hasStableIncome ?? true,
    dependents: user.dependents || 0,
    hasFamily: user.hasFamily || false,
  });

  // Insurance Engine
  const insuranceReport = evaluateInsurance({
    netIncome: netMonthlyIncome,
    annualIncome,
    activePremiums: safety.activeInsurancePremiums || 0,
    cityTier: user.cityTier || 'metro',
    hasFamily: user.hasFamily || false,
    dependents: user.dependents || 0,
  });

  return {
    cashflowSummary: {
      totalMonthlyIncome,
      totalConsumption,
      totalCommitments,
      essentialExpenses,
      netMonthlyIncome,
      monthlyDiscretionaryCashflow,
      savingsRate,
      annualIncome,
    },
    emergencyFund: emergencyFundReport,
    insurance: insuranceReport,
    generatedAt: new Date().toISOString(),
  };
};

module.exports = {
  HEALTH_COVER_BENCHMARKS,
  calculateTotalConsumption,
  calculateTotalCommitments,
  calculateTotalIncome,
  evaluateEmergencyFund,
  evaluateInsurance,
  generateAdvisoryAnalysis,
};
