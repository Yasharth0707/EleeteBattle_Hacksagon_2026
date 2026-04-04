const express = require('express');
const User = require('../models/User');

const router = express.Router();

// GET /api/leaderboard
router.get('/leaderboard', async (req, res) => {
  try {
    const rows = await User.find().select('_id username rating wins losses').sort({ rating: -1 }).limit(50);
    const formattedRows = rows.map(r => ({ id: r._id, username: r.username, rating: r.rating, wins: r.wins, losses: r.losses }));
    res.json({ leaderboard: formattedRows });
  } catch (err) {
    res.status(500).json({ error: 'Database error' });
  }
});

module.exports = router;
