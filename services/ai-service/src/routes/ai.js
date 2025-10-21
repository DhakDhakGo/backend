const express = require('express');
const router = express.Router();

const {
  getBikeInsights,
  getBikeInsightsByName
} = require('../controllers/insightsController');

const {
  compareBikes,
  getComparisonSummary
} = require('../controllers/comparisonController');

// Bike insights endpoints
router.post('/bike-insights', getBikeInsights);
router.get('/bike-insights/:bikeName', getBikeInsightsByName);

// Bike comparison endpoints
router.post('/compare-bikes', compareBikes);
router.post('/compare-summary', getComparisonSummary);

module.exports = router;
