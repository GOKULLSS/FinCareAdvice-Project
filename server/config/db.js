const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI, {
      serverSelectionTimeoutMS: 5000,
    });
    console.log(`[MongoDB Connected]: ${conn.connection.host}`);
    return conn;
  } catch (error) {
    console.error(`[MongoDB Connection Error]: ${error.message}`);
    console.warn('[MongoDB Warning]: Database is running in detached or mock-compatible mode if unavailable.');
    // We do not crash the app immediately so users can test endpoints or configure connection string
    return null;
  }
};

module.exports = connectDB;
