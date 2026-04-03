const mongoose = require('mongoose');
const { DB_URI } = require('./env');

const connectDB = async () => {
  try {
    await mongoose.connect(DB_URI);
    console.log('✅ MongoDB Connected');
  } catch (err) {
    console.error('❌ DB Error:', err.message);
    process.exit(1);
  }
};

module.exports = connectDB;