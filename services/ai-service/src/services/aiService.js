// AI Service
// Business logic for AI operations (insights and comparisons)

const { generateWithRetry } = require('../utils/retryWithCorrection');
const { validateBikeInsights, validateBikeComparison, sanitizeResponse } = require('../utils/schemaValidator');
const { generateBikeInsightsPrompt } = require('../prompts/bikeInsightsPrompt');
const { generateBikeComparisonPrompt } = require('../prompts/bikeComparisonPrompt');
const BikeInsights = require('../models/BikeInsights');
const BikeComparison = require('../models/BikeComparison');
const cacheRepository = require('../repositories/cacheRepository');

/**
 * Generate cache key for bike insights
 * @param {string} bikeName - Bike name
 * @param {string} country - Country
 * @returns {string} Cache key
 */
const generateInsightsCacheKey = (bikeName, country = 'India') => {
  return `insights_${bikeName.toLowerCase().replace(/\s+/g, '_')}_${country.toLowerCase()}`;
};

/**
 * Generate cache key for bike comparison
 * @param {Array} bikes - Array of bike objects
 * @param {string} country - Country
 * @returns {string} Cache key
 */
const generateComparisonCacheKey = (bikes, country = 'India') => {
  const bikeNames = bikes.map(b => b.name.toLowerCase().replace(/\s+/g, '_')).sort().join('_vs_');
  return `comparison_${bikeNames}_${country.toLowerCase()}`;
};

/**
 * Get bike ownership insights
 * @param {string} bikeName - Bike name
 * @param {string} bikeModel - Bike model (optional)
 * @param {string} country - Country (default: India)
 * @returns {Promise<Object>} Insights with metadata
 */
const getBikeInsights = async (bikeName, bikeModel = null, country = 'India') => {
  // Generate cache key
  const cacheKey = generateInsightsCacheKey(bikeName, country);

  // Check cache
  const cachedData = await cacheRepository.get(cacheKey);
  if (cachedData) {
    console.log('✅ Cache hit for:', bikeName);
    return {
      data: cachedData,
      cached: true
    };
  }

  console.log('🔄 Generating bike insights for:', bikeName);

  // Generate prompt
  const prompt = generateBikeInsightsPrompt(bikeName, country);

  // Call Gemini API with automatic retry on validation failure
  const result = await generateWithRetry(
    prompt,
    validateBikeInsights,  // Validation function
    sanitizeResponse,      // Sanitization function
    2                      // Max attempts (initial + 1 retry)
  );

  // Check if generation was successful
  if (!result.success) {
    console.error('❌ Failed to generate valid insights after retries');
    throw new Error('Failed to fetch AI insights');
  }

  // Extract the validated response
  const aiResponse = result.data;

  // Log if correction was needed
  if (result.attempts > 1) {
    console.log(`✅ Response corrected on attempt ${result.attempts}`);
  }

  // Log warnings if any
  if (result.warnings && result.warnings.length > 0) {
    console.warn('⚠️ Response has warnings:', result.warnings);
  }

  // Create BikeInsights instance
  const insights = new BikeInsights({
    bikeName,
    bikeModel: bikeModel || aiResponse.bikeModel,
    ...aiResponse
  });

  // Convert to plain object for Firestore (can't save class instances)
  const insightsData = JSON.parse(JSON.stringify(insights));

  // Save to cache
  await cacheRepository.save(cacheKey, insightsData, 7); // Cache for 7 days

  return {
    data: insights,
    cached: false,
    attempts: result.attempts
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
  const cacheKey = generateComparisonCacheKey(bikes, country);

  // Check cache
  const cachedData = await cacheRepository.get(cacheKey);
  if (cachedData) {
    console.log('✅ Cache hit for comparison:', bikes.map(b => b.name).join(' vs '));
    return {
      data: cachedData,
      cached: true
    };
  }

  console.log('🔄 Generating bike comparison for:', bikes.map(b => b.name).join(' vs '));

  // Generate prompt
  const prompt = generateBikeComparisonPrompt(bikes, country);

  // Call Gemini API with automatic retry on validation failure
  const result = await generateWithRetry(
    prompt,
    validateBikeComparison,  // Validation function
    sanitizeResponse,        // Sanitization function
    2                        // Max attempts
  );

  // Check if generation was successful
  if (!result.success) {
    console.error('❌ Failed to generate valid comparison after retries');
    throw new Error('Failed to fetch bike comparison');
  }

  // Extract the validated response
  const aiResponse = result.data;

  // Log if correction was needed
  if (result.attempts > 1) {
    console.log(`✅ Comparison corrected on attempt ${result.attempts}`);
  }

  // Create BikeComparison instance
  const comparison = new BikeComparison({
    bikes,
    ...aiResponse
  });

  // Convert to plain object for Firestore (can't save class instances)
  const comparisonData = JSON.parse(JSON.stringify(comparison));

  // Save to cache
  await cacheRepository.save(cacheKey, comparisonData, 3); // Cache for 3 days

  return {
    data: comparison,
    cached: false,
    attempts: result.attempts
  };
};

/**
 * Get comparison summary
 * @param {Array} bikes - Array of bike objects [{name, model}]
 * @param {string} country - Country
 * @returns {Promise<Object>} Comparison summary
 */
const getComparisonSummary = async (bikes, country = 'India') => {
  const comparisonResult = await compareBikes(bikes, country);
  const comparison = comparisonResult.data;

  // Extract summary information
  return {
    bikes: comparison.bikes,
    overallWinner: comparison.overallWinner,
    categoryWinners: comparison.categoryWinners,
    summary: comparison.summary,
    cached: comparisonResult.cached
  };
};

module.exports = {
  getBikeInsights,
  compareBikes,
  getComparisonSummary
};
