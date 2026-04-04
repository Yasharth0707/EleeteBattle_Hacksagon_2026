/**
 * Calculate Elo rating changes for winner and loser based on contextual factors.
 */
function calculateLogicalRating(ratingW, ratingL, diffStr, elapsedSec, submissions) {
  let basePoints = 30;

  // Difficulty Multiplier
  let diffMult = 1.0;
  if (diffStr === 'Easy') diffMult = 0.8;
  else if (diffStr === 'Medium') diffMult = 1.2;
  else if (diffStr === 'Hard') diffMult = 1.5;

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

module.exports = {
  calculateLogicalRating,
};
