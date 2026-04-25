// AI Service
// Business logic for AI operations (insights and comparisons)

const { generateWithRetry } = require('../utils/retryWithCorrection');
const { validateBikeInsights, validateBikeComparison, sanitizeResponse } = require('../utils/schemaValidator');
const { generateBikeInsightsPrompt } = require('../prompts/bikeInsightsPrompt');
const { generateBikeComparisonPrompt } = require('../prompts/bikeComparisonPrompt');
const BikeInsights = require('../models/BikeInsights');
const BikeComparison = require('../models/BikeComparison');
const aiDataRepository = require('../repository/aiDataRepository');

/**
 * Get bike ownership insights
 * @param {string} bikeName - Bike name
 * @param {string} bikeModel - Bike model (optional)
 * @param {string} country - Country (default: India)
 * @returns {Promise<Object>} Insights with metadata
 */
const getBikeInsights = async (jobId, bikeDetails) => {
  const { bikeName, bikeModel, country } = bikeDetails;

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
  await aiDataRepository.save(jobId, insightsData, 90); // Cache for 90 days

  console.log('Bike insights generated and cached with jobId:', jobId, 'Attempts:', result.attempts, 'Warnings:', result.warnings);
};

/**
 * Compare multiple bikes
 * @param {Array} bikes - Array of bike objects [{name, model}]
 * @param {string} country - Country (default: India)
 * @returns {Promise<Object>} Comparison with metadata
 */
const compareBikes = async (jobId, bikeComparisionDetails) => {
  const { bikes, country } = bikeComparisionDetails;

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
  await aiDataRepository.save(jobId, comparisonData, 3);
};

module.exports = {
  getBikeInsights,
  compareBikes
};
