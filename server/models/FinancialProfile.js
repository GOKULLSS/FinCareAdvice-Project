const mongoose = require('mongoose');

const financialProfileSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
    },
    // Income Streams (Monthly)
    income: {
      salary: { type: Number, default: 0, min: 0 },
      business: { type: Number, default: 0, min: 0 },
      investments: { type: Number, default: 0, min: 0 },
      other: { type: Number, default: 0, min: 0 },
    },
    // Consumption Expenses (Monthly)
    expensesConsumption: {
      rent: { type: Number, default: 0, min: 0 },
      groceries: { type: Number, default: 0, min: 0 },
      transport: { type: Number, default: 0, min: 0 },
      utilities: { type: Number, default: 0, min: 0 },
      dining: { type: Number, default: 0, min: 0 },
      subscriptions: { type: Number, default: 0, min: 0 },
    },
    // Commitment Expenses (Monthly)
    expensesCommitment: {
      loans: { type: Number, default: 0, min: 0 },
      emis: { type: Number, default: 0, min: 0 },
      creditCards: { type: Number, default: 0, min: 0 },
    },
    // Safety Net
    safety: {
      emergencyFundBalance: { type: Number, default: 0, min: 0 },
      activeInsurancePremiums: { type: Number, default: 0, min: 0 }, // Monthly or annualized monthly equivalent
    },
    // Growth & Investments (Monthly)
    growth: {
      sips: { type: Number, default: 0, min: 0 },
      investments: { type: Number, default: 0, min: 0 },
      courses: { type: Number, default: 0, min: 0 },
    },
    // Financial Goals
    goals: {
      goalName: { type: String, default: '' },
      targetAmount: { type: Number, default: 0, min: 0 },
      timeHorizonYears: { type: Number, default: 0, min: 0, max: 40 },
      riskProfile: {
        type: String,
        enum: ['Conservative', 'Moderate', 'Aggressive'],
        default: 'Moderate',
      },
    },
    // Employment & Stability Flags
    flags: {
      hasStableJob: { type: Boolean, default: false },
      hasStableIncome: { type: Boolean, default: false },
    },
  },
  {
    timestamps: true,
  }
);

// Virtual helper for total monthly income
financialProfileSchema.virtual('totalIncome').get(function () {
  const inc = this.income || {};
  return (inc.salary || 0) + (inc.business || 0) + (inc.investments || 0) + (inc.other || 0);
});

// Virtual helper for total monthly consumption expenses
financialProfileSchema.virtual('totalConsumption').get(function () {
  const c = this.expensesConsumption || {};
  return (
    (c.rent || 0) +
    (c.groceries || 0) +
    (c.transport || 0) +
    (c.utilities || 0) +
    (c.dining || 0) +
    (c.subscriptions || 0)
  );
});

// Virtual helper for total monthly commitment expenses
financialProfileSchema.virtual('totalCommitments').get(function () {
  const com = this.expensesCommitment || {};
  return (com.loans || 0) + (com.emis || 0) + (com.creditCards || 0);
});

module.exports = mongoose.model('FinancialProfile', financialProfileSchema);
