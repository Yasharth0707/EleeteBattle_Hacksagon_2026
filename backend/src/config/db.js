const mongoose = require('mongoose');
const { DB_URI } = require('./env');
const connectDB = async () => {
  try {
    await mongoose.connect(DB_URI);
    console.log('✅ Connected to MongoDB database.');
  } catch (err) {
    console.error('❌ Error connecting to MongoDB:', err.message);
    process.exit(1);
  }
};
module.exports = connectDB;