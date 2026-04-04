// AI Service
// Business logic for AI operations (insights and comparisons)
const aiDataRepository = require('../repositories/aiDataRepository');

const { PubSub } = require('@google-cloud/pubsub');
const pubsub = new PubSub();

/**
 * Generate job ID for bike insights
 * @param {string} bikeName - Bike name
 * @param {string} country - Country
 * @returns {string} Cache key
 */
const generateInsightsJobId = (bikeName, country = 'India') => {
  const currentMonthAndYear = new Date().toISOString().slice(0, 7); // e.g. "2024-06"
  return `insights_${bikeName.toLowerCase().replace(/\s+/g, '_')}_${country.toLowerCase()}_${currentMonthAndYear}`;
};

/**
 * Generate job ID for bike comparison
 * @param {Array} bikes - Array of bike objects
 * @param {string} country - Country
 * @returns {string} Cache key
 */
const generateComparisonJobId = (bikes, country = 'India') => {
  const currentMonthAndYear = new Date().toISOString().slice(0, 7); // e.g. "2024-06"
  const bikeNames = bikes.map(b => b.name.toLowerCase().replace(/\s+/g, '_')).sort().join('_vs_');
  return `comparison_${bikeNames}_${country.toLowerCase()}_${currentMonthAndYear}`;
};

/**
 * Get bike ownership insights
 * @param {string} bikeName - Bike name
 * @param {string} bikeModel - Bike model (optional)
 * @param {string} country - Country (default: India)
 * @returns {Promise<Object>} Insights with metadata
 */
const getBikeInsights = async (bikeName, bikeModel = null, country = 'India') => {
  // Generate job id
  const jobId = generateInsightsJobId(bikeName, country);
  // Check cache
  const cachedData = await aiDataRepository.get(jobId);
  if (cachedData) {
    console.log('✅ Cache hit for:', bikeName);
    return {
      jobId,
      data: cachedData,
      cached: true
    };
  }
  const bufferData = Buffer.from(JSON.stringify({
    bikeName,
    bikeModel,
    country
  }));
  pubsub.topic('ai-data').publishMessage({
    data: bufferData,
    attributes: {
      jobId,
      type: 'bike-insights'
    }
  });

  return {
    data: {
      jobId,
    },
  };
};

/**
 * Compare multiple bikes
 * @param {Array} bikes - Array of bike objects [{name, model}]
 * @param {string} country - Country (default: India)
 * @returns {Promise<Object>} Comparison with metadata
 */
const compareBikes = async (bikes, country = 'India') => {
  // Validate bikes array
  if (!Array.isArray(bikes) || bikes.length < 2) {
    throw new Error('At least 2 bikes are required for comparison');
  }

  if (bikes.length > 5) {
    throw new Error('Maximum 5 bikes can be compared at once');
  }

  // Validate bike objects
  for (const bike of bikes) {
    if (!bike.name) {
      throw new Error('Each bike must have a name');
    }
  }

  // Generate cache key
  const jobId = generateComparisonJobId(bikes, country);

  // Check cache
  const cachedData = await aiDataRepository.get(jobId);
  if (cachedData) {
    console.log('✅ Cache hit for comparison:', bikes.map(b => b.name).join(' vs '));
    return {
      jobId,
      data: cachedData,
      cached: true
    };
  }

  const bufferData = Buffer.from(JSON.stringify({
    bikes,
    country
  }));

  pubsub.topic('ai-data').publishMessage({
    data: bufferData,
    attributes: {
      jobId,
      type: 'bike-comparison'
    }
  });

  return {
    data: {
      jobId,
    },
  };
};

module.exports = {
  getBikeInsights,
  compareBikes
};
