/**
 * Calculate Elo rating changes for winner and loser based on contextual factors.
 */
function calculateLogicalRating(ratingW, ratingL, diffStr, elapsedSec, submissions) {
  let basePoints = 30;

  // Rank Context Matrix
  let diffMult = 1.0;
  if (ratingW < 1200) { diffMult = (diffStr === 'Easy') ? 1.0 : (diffStr === 'Medium') ? 1.5 : 2.0; }
  else if (ratingW < 1500) { diffMult = (diffStr === 'Easy') ? 0.8 : (diffStr === 'Medium') ? 1.2 : 1.5; }
  else if (ratingW < 1800) { diffMult = (diffStr === 'Easy') ? 0.3 : (diffStr === 'Medium') ? 1.0 : 1.3; }
  else { diffMult = (diffStr === 'Easy') ? 0.05 : (diffStr === 'Medium') ? 0.5 : 1.0; }

  let points = basePoints * diffMult;

  // Time Multiplier
  let parTime = (diffStr === 'Easy') ? 600 : (diffStr === 'Medium') ? 1500 : 2700;
  if (elapsedSec <= parTime * 0.3) points *= 1.3;
  else if (elapsedSec >= parTime * 0.8) points *= 0.8;

  // Submission Multiplier
  if (submissions === 1) points *= 1.2;
  else if (submissions >= 4) points *= 0.8;

  // Opponent Ratings Offset
  let diff = ratingL - ratingW;
  if (diff > 0) {
    points += Math.min(25, diff / 20);
  } else {
    points += Math.max(-15, diff / 30);
  }

  let changeW = Math.max(2, Math.round(points));

  // Loser Calculation
  let loserDiff = ratingW - ratingL;
  let loserPenalty = 20;
  if (loserDiff > 0) {
    loserPenalty -= Math.min(15, loserDiff / 25);
  } else {
    loserPenalty -= Math.max(-20, loserDiff / 25);
  }

  let changeL = -Math.max(5, Math.round(loserPenalty));

  let newRatingW = ratingW + changeW;
  let newRatingL = Math.max(100, ratingL + changeL);

  return { newRatingW, newRatingL };
}

/**
 * Get the arena name based on Elo rating.
 */
function getArena(rating) {
  if (rating < 1400) return 'Bronze Arena';
  if (rating < 1800) return 'Silver Arena';
  if (rating < 2200) return 'Gold Arena';
  if (rating < 2600) return 'Diamond Arena';
  if (rating < 3000) return 'Master Arena';
  return 'Grand Champion';
}

module.exports = {
  calculateLogicalRating,
  getArena,
};
