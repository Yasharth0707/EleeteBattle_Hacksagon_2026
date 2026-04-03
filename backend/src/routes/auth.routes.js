const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { JWT_SECRET } = require('../config/env');

const router = express.Router();

// POST /api/register
router.post('/register', async (req, res) => {
  const { username, password } = req.body;
  
  if (!username || !password || username.length < 3 || password.length < 6) {
    return res.status(400).json({ error: 'Invalid username or password (min 3 chars / 6 chars).' });
  }

  try {
    const hash = await bcrypt.hash(password, 10);
    const user = await User.create({ username, password_hash: hash });

    const token = jwt.sign({ id: user._id, username: user.username, rating: user.rating }, JWT_SECRET, { expiresIn: '7d' });
    res.json({ token, user: { id: user._id, username: user.username, rating: user.rating } });
  } catch (err) {
    if (err.code === 11000) return res.status(400).json({ error: 'Username already taken.' });
    res.status(500).json({ error: 'Server error' });
  }
});


// POST /api/login
router.post('/login', async (req, res) => {
  const { username, password } = req.body;
  try {
    const user = await User.findOne({ username });
    if (!user) return res.status(400).json({ error: 'Invalid username or password.' });

    const match = await bcrypt.compare(password, user.password_hash);
    if (!match) return res.status(400).json({ error: 'Invalid username or password.' });

    const token = jwt.sign({ id: user._id, username: user.username, rating: user.rating }, JWT_SECRET, { expiresIn: '7d' });
    res.json({ token, user: { id: user._id, username: user.username, rating: user.rating, wins: user.wins, losses: user.losses } });
  } catch (err) {
    res.status(500).json({ error: 'Database error.' });
  }
});

module.exports = router;