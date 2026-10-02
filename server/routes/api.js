const express = require('express');
const router = express.Router();

const { protect } = require('../middleware/auth');

// Controllers
const {
  register,
  login,
  getMe,
  updateDemographics,
} = require('../controllers/authController');

const {
  getFinancialProfile,
  updateFinancialProfile,
} = require('../controllers/profileController');

const {
  getAdvisoryReport,
  getPortfolioAllocation,
  calculateInvestment,
} = require('../controllers/advisoryController');

const {
  getLatestSentiment,
  upsertSentiment,
} = require('../controllers/sentimentController');

// 1. Authentication Routes
router.post('/auth/register', register);
router.post('/auth/login', login);
router.get('/auth/me', protect, getMe);
router.put('/auth/profile', protect, updateDemographics);

// 2. Financial Profile Routes
router.get('/profile/financial', protect, getFinancialProfile);
router.put('/profile/financial', protect, updateFinancialProfile);

// 3. Financial Advisory & Portfolio Allocation Routes
router.get('/advisory', protect, getAdvisoryReport);
router.get('/advisory/portfolio', protect, getPortfolioAllocation);

// 4. Investment Calculator
router.post('/finance/calculator', calculateInvestment);

// 5. Daily Sentiment Routes
router.get('/sentiment/latest', getLatestSentiment);
router.post('/sentiment', upsertSentiment);

// Health check endpoint
router.get('/health', (req, res) => {
  res.status(200).json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    service: 'FinCareAdvice Backend API',
    version: '1.0.0',
  });
});

module.exports = router;
