const aiService = require('../services/aiService');

/**
 * Compare multiple bikes
 */
const compareBikes = async (req, res, next) => {
  try {
    // Extract data from request
    const { bikes, country = 'India' } = req.body;

    // Basic validation (detailed validation in service layer)
    if (!bikes || !Array.isArray(bikes) || bikes.length < 2) {
      return res.status(400).json({
        success: false,
        error: 'At least 2 bikes are required for comparison'
      });
    }

    if (bikes.length > 5) {
      return res.status(400).json({
        success: false,
        error: 'Maximum 5 bikes can be compared at once'
      });
    }

    // Call service layer
    const result = await aiService.compareBikes(bikes, country);

    // Return response
    res.json({
      success: true,
      data: result.data,
      cached: result.cached
    });
  } catch (error) {
    console.error('Error generating bike comparison:', error);
    
    return res.status(500).json({
      success: false,
      error: 'Failed to fetch bike comparison',
      message: error.message || 'The AI service encountered an error. Please try again later.'
    });
  }
};

/**
 * Get comparison summary
 */
const getComparisonSummary = async (req, res, next) => {
  try {
    // Extract data from request
    const { bikes, country = 'India' } = req.body;

    // Validate
    if (!bikes || bikes.length < 2) {
      return res.status(400).json({
        success: false,
        error: 'At least 2 bikes required'
      });
    }

    // Call service layer
    const result = await aiService.getComparisonSummary(bikes, country);

    // Return response
    res.json({
      success: true,
      data: result,
      cached: result.cached
    });
  } catch (error) {
    console.error('Error generating comparison summary:', error);
    
    return res.status(500).json({
      success: false,
      error: 'Failed to fetch comparison summary',
      message: error.message || 'The AI service encountered an error. Please try again later.'
    });
  }
};

module.exports = {
  compareBikes,
  getComparisonSummary
};
