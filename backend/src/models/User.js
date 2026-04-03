const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  username: { type: String, unique: true, required: true },
  password_hash: { type: String, required: true },
  rating: { type: Number, default: 1000 },
  wins: { type: Number, default: 0 },
  losses: { type: Number, default: 0 },
  ratingHistory: [{
    rating: Number,
    date: { type: Date, default: Date.now }
  }],
  matchHistory: [{
    result: String,
    ratingDelta: Number,
    newRating: Number,
    opponentName: String,
    opponentRating: Number,
    problemTitle: String,
    problemSlug: String,
    difficulty: String,
    timeTaken: Number,
    submissions: Number,
    arena: String,
    isRated: Boolean,
    date: { type: Date, default: Date.now }
  }]
});

const User = mongoose.model('User', userSchema);

module.exports = User;
