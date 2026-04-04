const express = require('express');
const { fetchProblem, getRandomProblemSlug } = require('../services/leetcode.service');

const router = express.Router();

// GET /api/problem/:slug
router.get('/problem/:slug', async (req, res) => {
  const { slug } = req.params;
  try {
    const problem = await fetchProblem(slug);
    res.json(problem);
  } catch (err) {
    res.status(502).json({ error: 'Failed to fetch problem from LeetCode.', detail: err.message });
  }
});

// GET /api/random-problem
router.get('/random-problem', async (req, res) => {
  const difficulty = req.query.difficulty || 'easy';
  try {
    const slug = await getRandomProblemSlug(difficulty);
    const problem = await fetchProblem(slug);
    res.json(problem);
  } catch (err) {
    res.status(502).json({ error: 'Failed to fetch random problem.', detail: err.message });
  }
});

module.exports = router;
