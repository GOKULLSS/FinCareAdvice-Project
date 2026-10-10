const FinancialProfile = require('../models/FinancialProfile');

/**
 * @desc    Get user's financial profile
 * @route   GET /api/v1/profile/financial
 * @access  Private
 */
const getFinancialProfile = async (req, res, next) => {
  try {
    let profile = await FinancialProfile.findOne({ userId: req.user._id });

    if (!profile) {
      // Create a default initial profile with empty / 0 values
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

    res.status(200).json({
      success: true,
      data: profile,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Update user's financial profile
 * @route   PUT /api/v1/profile/financial
 * @access  Private
 */
const updateFinancialProfile = async (req, res, next) => {
  try {
    const {
      income,
      expensesConsumption,
      expensesCommitment,
      safety,
      growth,
      goals,
      flags,
    } = req.body;

    const updatedData = {};
    if (income) updatedData.income = income;
    if (expensesConsumption) updatedData.expensesConsumption = expensesConsumption;
    if (expensesCommitment) updatedData.expensesCommitment = expensesCommitment;
    if (safety) updatedData.safety = safety;
    if (growth) updatedData.growth = growth;
    if (goals) updatedData.goals = goals;
    if (flags) updatedData.flags = flags;

    const profile = await FinancialProfile.findOneAndUpdate(
      { userId: req.user._id },
      { $set: updatedData },
      { new: true, upsert: true, runValidators: true }
    );

    res.status(200).json({
      success: true,
      message: 'Financial profile saved successfully.',
      data: profile,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getFinancialProfile,
  updateFinancialProfile,
};
