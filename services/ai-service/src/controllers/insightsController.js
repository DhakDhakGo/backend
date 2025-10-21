const aiService = require('../services/aiService');

/**
 * Get bike ownership insights
 */
const getBikeInsights = async (req, res, next) => {
  try {
    // Extract data from request
    const { bikeName, bikeModel, country = 'India' } = req.body;

    // Validate required fields
    if (!bikeName) {
      return res.status(400).json({
        success: false,
        error: 'Bike name is required'
      });
    }

    // Call service layer
    const result = await aiService.getBikeInsights(bikeName, bikeModel, country);

    // Return response
    res.json({
      success: true,
      data: result.data,
      cached: result.cached
    });
  } catch (error) {
    console.error('Error generating bike insights:', error);
    
    // Return appropriate error response
    return res.status(500).json({
      success: false,
      error: 'Failed to fetch AI insights',
      message: error.message || 'The AI service encountered an error. Please try again later.'
    });
  }
};

/**
 * Get bike insights by bike name (GET endpoint)
 */
const getBikeInsightsByName = async (req, res, next) => {
  try {
    // Extract data from request
    const { bikeName } = req.params;
    const { country = 'India' } = req.query;

    // Call service layer
    const result = await aiService.getBikeInsights(bikeName, null, country);

    // Return response
    res.json({
      success: true,
      data: result.data,
      cached: result.cached
    });
  } catch (error) {
    console.error('Error fetching bike insights:', error);
    
    return res.status(500).json({
      success: false,
      error: 'Failed to fetch AI insights',
      message: error.message || 'The AI service encountered an error. Please try again later.'
    });
  }
};

module.exports = {
  getBikeInsights,
  getBikeInsightsByName
};
