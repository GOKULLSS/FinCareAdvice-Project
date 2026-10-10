const mongoose = require('mongoose');

const dailySentimentSchema = new mongoose.Schema(
  {
    date: {
      type: String, // Format: YYYY-MM-DD
      required: true,
      unique: true,
      trim: true,
    },
    equities: {
      type: Number,
      required: true,
      min: -1.0,
      max: 1.0,
    },
    debt: {
      type: Number,
      required: true,
      min: -1.0,
      max: 1.0,
    },
    gold: {
      type: Number,
      required: true,
      min: -1.0,
      max: 1.0,
    },
    lastUpdated: {
      type: Date,
      default: Date.now,
    },
    metadata: {
      source: { type: String, default: 'Finnhub Market News + DistilBERT' },
      equitiesArticlesAnalyzed: { type: Number, default: 0 },
      debtArticlesAnalyzed: { type: Number, default: 0 },
      goldArticlesAnalyzed: { type: Number, default: 0 },
      model: { type: String, default: 'distilbert-financial-phrasebank' },
    },
  },
  {
    timestamps: true,
  }
);

// Helpful index on date
dailySentimentSchema.index({ date: -1 });

module.exports = mongoose.model('DailySentiment', dailySentimentSchema);
