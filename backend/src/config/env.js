require('dotenv').config();

const env = {
  PORT: process.env.PORT || 3000,
  DB_URI: process.env.DB_URI || 'mongodb+srv://yt:battle@yt-complete-backend.89vupgt.mongodb.net/?appName=yt-complete-backend',
  JWT_SECRET: process.env.JWT_SECRET,
};

module.exports = env;