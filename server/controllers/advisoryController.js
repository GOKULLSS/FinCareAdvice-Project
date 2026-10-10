const FinancialProfile = require('../models/FinancialProfile');
const DailySentiment = require('../models/DailySentiment');
const User = require('../models/User');
const { generateAdvisoryAnalysis } = require('../services/rulesEngine');
const {
  getBaselineAllocation,
  applyAiDynamicTilt,
  calculateInvestmentProjections,
} = require('../services/portfolioEngine');

/**
 * @desc    Get comprehensive financial advisory diagnostics
 * @route   GET /api/v1/advisory
 * @access  Private
 */
const getAdvisoryReport = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);
    let profile = await FinancialProfile.findOne({ userId: req.user._id });

    if (!profile) {
      profile = await FinancialProfile.create({
        userId: req.user._id,
        income: { salary: 0, business: 0, investments: 0, other: 0 },
        expensesConsumption: {
          rent: 0,
          groceries: 0,
          transport: 0,
          utilities: 0,
          dining: 0,
          subscriptions: 0,
        },
        expensesCommitment: { loans: 0, emis: 0, creditCards: 0 },
        safety: { emergencyFundBalance: 0, activeInsurancePremiums: 0 },
        growth: { sips: 0, investments: 0, courses: 0 },
        goals: {
          goalName: '',
          targetAmount: 0,
          timeHorizonYears: 0,
          riskProfile: 'Moderate',
        },
        flags: { hasStableJob: false, hasStableIncome: false },
      });
    }

    const advisoryData = generateAdvisoryAnalysis(profile, user);

    res.status(200).json({
      success: true,
      data: advisoryData,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get Asset Allocation with Deterministic Baseline & AI Dynamic Tilt
 * @route   GET /api/v1/advisory/portfolio
 * @access  Private
 */
const getPortfolioAllocation = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);
    const profile = await FinancialProfile.findOne({ userId: req.user._id });

    // Allow query parameters to dynamically test different horizons & risk profiles
    const timeHorizonYears = Number(
      req.query.timeHorizonYears || profile?.goals?.timeHorizonYears || 5
    );
    const riskProfile =
      req.query.riskProfile || profile?.goals?.riskProfile || 'Moderate';
    const maxTilt = Number(req.query.maxTilt || 5.0);

    // Step 1: Calculate Deterministic Baseline
    const baselineResult = getBaselineAllocation(timeHorizonYears, riskProfile);

    // Step 2: Fetch latest DailySentiment from MongoDB
    let latestSentiment = null;
    try {
      latestSentiment = await DailySentiment.findOne().sort({ date: -1 });
    } catch (err) {
      console.warn('[Portfolio] Could not query DailySentiment from MongoDB:', err.message);
    }

    // Step 3: Apply Guardrailed AI Dynamic Tilt
    const tiltResult = applyAiDynamicTilt({
      baselineAllocation: baselineResult.allocation,
      sentimentScores: latestSentiment
        ? {
            equities: latestSentiment.equities,
            debt: latestSentiment.debt,
            gold: latestSentiment.gold,
          }
        : null,
      maxTiltPercentage: maxTilt,
    });

    const response = {
      success: true,
      data: {
        goalParameters: {
          timeHorizonYears,
          horizonTier: baselineResult.horizonTier,
          riskProfile: baselineResult.riskProfile,
        },
        sentimentData: latestSentiment
          ? {
              date: latestSentiment.date,
              equities: latestSentiment.equities,
              debt: latestSentiment.debt,
              gold: latestSentiment.gold,
              lastUpdated: latestSentiment.lastUpdated,
              metadata: latestSentiment.metadata,
            }
          : null,
        baselineAllocation: baselineResult.allocation,
        aiTiltAllocation: tiltResult.finalAllocation,
        realizedTilts: tiltResult.tilts,
        safeguards: {
          isGuardrailed: tiltResult.isGuardrailed,
          maxTiltAllowed: `${tiltResult.maxTiltAllowed}%`,
          allocationSum: `${tiltResult.allocationSum}%`,
          status: tiltResult.status,
          ruleExplanation:
            'The AI can only tilt the deterministic baseline by a maximum of ±5% to ±10% per asset class. The sum of all asset classes strictly equals 100.00%.',
        },
        disclaimer:
          'Probabilistic AI recommendation based on current news sentiment. Market investments are subject to risk. Please perform independent due diligence.',
      },
    };

    res.status(200).json(response);
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Compound Investment Calculator (SIP & Lumpsum)
 * @route   POST /api/v1/finance/calculator
 * @access  Public (or Private)
 */
const calculateInvestment = async (req, res, next) => {
  try {
    const {
      monthlySip = 10000,
      lumpsum = 50000,
      durationYears = 10,
      expectedReturnRate = 12.0,
      inflationRate = 6.0,
    } = req.body;

    const projection = calculateInvestmentProjections({
      monthlySip: Number(monthlySip),
      lumpsum: Number(lumpsum),
      durationYears: Number(durationYears),
      expectedReturnRate: Number(expectedReturnRate),
      inflationRate: Number(inflationRate),
    });

    res.status(200).json({
      success: true,
      data: projection,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAdvisoryReport,
  getPortfolioAllocation,
  calculateInvestment,
};
