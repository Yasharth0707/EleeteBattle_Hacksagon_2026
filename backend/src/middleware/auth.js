const jwt = require('jsonwebtoken');
const { JWT_SECRET } = require('../config/env');

/**
 * Express middleware to verify JWT from Authorization header.
 * Attaches decoded payload to req.user on success.
 */
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) return res.status(401).json({ error: 'No token provided' });

  const token = authHeader.split(' ')[1];
  jwt.verify(token, JWT_SECRET, (err, decoded) => {
    if (err) return res.status(401).json({ error: 'Invalid token' });
    req.user = decoded;
    next();
  });
};

module.exports = { authenticateToken };