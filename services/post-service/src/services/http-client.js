// HTTP Client for Inter-Service Communication
// Simplified version for Post Service

const axios = require('axios');

const SERVICE_URLS = {
  user: process.env.USER_SERVICE_URL || 'https://user-service-134445090159.asia-south1.run.app',
  ai: process.env.AI_SERVICE_URL || 'https://ai-service-134445090159.asia-south1.run.app',
};

/**
 * Call User Service to get user profile
 * @param {string} userId - User ID
 * @returns {Promise<Object>} User profile
 */
const getUserProfile = async (userId) => {
  try {
    const response = await axios.get(`${SERVICE_URLS.user}/api/users/${userId}`, {
      timeout: 5000
    });
    return response.data.data;
  } catch (error) {
    console.error('Failed to get user profile:', error.message);
    throw new Error('User not found or service unavailable');
  }
};

/**
 * Call AI Service to get bike insights
 * @param {string} bikeName - Bike name
 * @returns {Promise<Object>} Bike insights
 */
const getBikeInsights = async (bikeName) => {
  try {
    const response = await axios.post(`${SERVICE_URLS.ai}/api/ai/bike-insights`, {
      bikeName
    }, {
      timeout: 10000
    });
    return response.data;
  } catch (error) {
    console.warn('AI Service call failed:', error.message);
    return null; // Return null if AI service fails, post can still be created
  }
};

/**
 * Increment user counter
 * @param {string} userId - User ID
 * @param {string} counterType - Counter type (totalReviews, totalExperiences)
 */
const incrementUserCounter = async (userId, counterType) => {
  try {
    await axios.post(`${SERVICE_URLS.user}/api/users/${userId}/increment`, {
      counterType
    }, {
      timeout: 5000
    });
  } catch (error) {
    console.warn('Failed to increment user counter:', error.message);
  }
};

module.exports = {
  getUserProfile,
  getBikeInsights,
  incrementUserCounter
};
