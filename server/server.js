const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

const connectDB = require('./config/db');
// const apiRoutes = require('./routes/api');
// const errorHandler = require('./middleware/errorHandler');
// const DailySentiment = require('./models/DailySentiment');

// Initialize Express App
const app = express();
const PORT = process.env.PORT || 5000;

// Security & Utility Middlewares
app.use(helmet());
app.use(
  cors({
    origin: process.env.CLIENT_URL || 'http://localhost:5173',
    credentials: true,
  })
);
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

if (process.env.NODE_ENV !== 'test') {
  app.use(morgan('dev'));
}

// Rate Limiting (100 requests per 15 minutes)
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 300,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Too many requests from this IP, please try again after 15 minutes',
  },
});
app.use('/api', limiter);

// Mount API Routes
// app.use('/api/v1', apiRoutes);

// Root route
app.get('/', (req, res) => {
  res.json({
    project: 'FinCareAdvice API',
    description: 'Personal Finance, Financial Advisory & AI Asset Allocation Platform',
    version: '1.0.0',
    documentation: '/api/v1/health',
  });
});

// Central Error Handler
// app.use(errorHandler);

// Connect to MongoDB and start listening
const startServer = async () => {
  await connectDB();

  // Seed default sentiment if none exists
  try {
    const existing = await DailySentiment.findOne();
    if (!existing) {
      const today = new Date().toISOString().split('T')[0];
      await DailySentiment.create({
        date: today,
        equities: 0.35,
        debt: -0.15,
        gold: 0.20,
        metadata: {
          source: 'Finnhub Market News + DistilBERT Financial Model (Boot Seed)',
          equitiesArticlesAnalyzed: 18,
          debtArticlesAnalyzed: 12,
          goldArticlesAnalyzed: 8,
          model: 'distilbert-financial-phrasebank',
        },
      });
      console.log(`[Seed]: Created default daily sentiment for ${today}`);
    }
  } catch (seedErr) {
    console.warn('[Seed Warning]: Could not seed initial sentiment:', seedErr.message);
  }

  const server = app.listen(PORT, () => {
    console.log(
      `[Server Running]: FinCareAdvice REST API listening on http://localhost:${PORT} in ${process.env.NODE_ENV || 'development'} mode`
    );
  });

  return server;
};

startServer();

module.exports = app;
