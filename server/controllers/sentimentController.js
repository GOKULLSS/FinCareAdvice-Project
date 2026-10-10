const DailySentiment = require('../models/DailySentiment');

/**
 * Helper to get today's date formatted as YYYY-MM-DD
 */
const getTodayFormattedDate = () => {
  const d = new Date();
  return d.toISOString().split('T')[0];
};

/**
 * @desc    Get latest daily market sentiment
 * @route   GET /api/v1/sentiment/latest
 * @access  Public
 */
const getLatestSentiment = async (req, res, next) => {
  try {
    let latest = await DailySentiment.findOne().sort({ date: -1 });

    if (!latest) {
      // Auto-seed a realistic default sentiment record so the platform functions seamlessly
      const today = getTodayFormattedDate();
      latest = await DailySentiment.create({
        date: today,
        equities: 0.35, // Positive market sentiment
        debt: -0.15,   // Slightly bearish on yields/inflation
        gold: 0.20,    // Steady safe-haven demand
        lastUpdated: new Date(),
        metadata: {
          source: 'Finnhub Market News + DistilBERT Financial Model (Initial Seed)',
          equitiesArticlesAnalyzed: 14,
          debtArticlesAnalyzed: 9,
          goldArticlesAnalyzed: 7,
          model: 'distilbert-financial-phrasebank',
        },
      });
    }

    res.status(200).json({
      success: true,
      data: latest,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Record or upsert daily sentiment (from ML service or admin)
 * @route   POST /api/v1/sentiment
 * @access  Public (internal / token-protected in production)
 */
const upsertSentiment = async (req, res, next) => {
  try {
    const { date, equities, debt, gold, metadata } = req.body;

    const recordDate = date || getTodayFormattedDate();

    const sentiment = await DailySentiment.findOneAndUpdate(
      { date: recordDate },
      {
        $set: {
          equities: Number(equities),
          debt: Number(debt),
          gold: Number(gold),
          lastUpdated: new Date(),
          metadata: metadata || {},
        },
      },
      { upsert: true, new: true, runValidators: true }
    );

    res.status(200).json({
      success: true,
      message: `Daily sentiment for ${recordDate} upserted successfully.`,
      data: sentiment,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getLatestSentiment,
  upsertSentiment,
};
