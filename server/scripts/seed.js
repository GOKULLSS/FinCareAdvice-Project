const mongoose = require('mongoose');
const dotenv = require('dotenv');
dotenv.config();

const User = require('../models/User');
const FinancialProfile = require('../models/FinancialProfile');
const DailySentiment = require('../models/DailySentiment');

const seedData = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/fincareadvice');
    console.log('[Seed]: Connected to MongoDB');

    // Clean existing demo user
    await User.deleteOne({ email: 'demo@fincareadvice.com' });
    const demoUser = await User.create({
      name: 'Priya Sharma',
      email: 'demo@fincareadvice.com',
      password: 'Password123!',
      age: 32,
      cityTier: 'metro',
      dependents: 1,
      hasFamily: true,
    });

    await FinancialProfile.deleteOne({ userId: demoUser._id });
    await FinancialProfile.create({
      userId: demoUser._id,
      income: {
        salary: 165000,
        business: 0,
        investments: 12000,
        other: 3000,
      },
      expensesConsumption: {
        rent: 38000,
        groceries: 16000,
        transport: 6500,
        utilities: 4500,
        dining: 8000,
        subscriptions: 2500,
      },
      expensesCommitment: {
        loans: 22000,
        emis: 5000,
        creditCards: 0,
      },
      safety: {
        emergencyFundBalance: 240000,
        activeInsurancePremiums: 6500,
      },
      growth: {
        sips: 35000,
        investments: 15000,
        courses: 3000,
      },
      goals: {
        goalName: 'Early Financial Independence & Child Education',
        targetAmount: 5000000,
        timeHorizonYears: 7,
        riskProfile: 'Moderate',
      },
      flags: {
        hasStableJob: true,
        hasStableIncome: true,
      },
    });

    // Seed Daily Sentiments
    const today = new Date().toISOString().split('T')[0];
    await DailySentiment.findOneAndUpdate(
      { date: today },
      {
        $set: {
          equities: 0.42,
          debt: -0.18,
          gold: 0.25,
          lastUpdated: new Date(),
          metadata: {
            source: 'Finnhub Live Market Scraper + DistilBERT Financial Model',
            equitiesArticlesAnalyzed: 24,
            debtArticlesAnalyzed: 15,
            goldArticlesAnalyzed: 10,
            model: 'distilbert-financial-phrasebank',
          },
        },
      },
      { upsert: true, new: true }
    );

    console.log('[Seed]: Successfully seeded demo user: demo@fincareadvice.com / Password123!');
    process.exit(0);
  } catch (err) {
    console.error('[Seed Error]:', err);
    process.exit(1);
  }
};

seedData();
