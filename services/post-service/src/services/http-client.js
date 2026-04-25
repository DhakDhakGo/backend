// HTTP Client for Inter-Service Communication
// Simplified version for Post Service

const axios = require('axios');
const { GoogleAuth } = require('google-auth-library');

const auth = new GoogleAuth();

const SERVICE_URLS = {
  user: process.env.USER_SERVICE_URL || 'https://user-service-134445090159.us-central1.run.app',
  ai: process.env.AI_SERVICE_URL || 'https://ai-service-134445090159.us-central1.run.app',
};

/**
 * Call User Service to get user profile
 * @param {string} userId - User ID
 * @returns {Promise<Object>} User profile
 */
const getUserProfile = async (userId) => {
  try {
    const client = await auth.getIdTokenClient(`${SERVICE_URLS.user}`);
    const response = await client.request({
      url: `${SERVICE_URLS.user}/api/users/${userId}`,
      method: 'GET',
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
    const client = await auth.getIdTokenClient(`${SERVICE_URLS.ai}/api/ai/bike-insights`);
    const response = await client.request({
      url: `${SERVICE_URLS.ai}/api/ai/bike-insights`,
      method: 'POST',
      data: {
        bikeName
      }
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
    const client = await auth.getIdTokenClient(`${SERVICE_URLS.user}/api/users/${userId}/increment`);
    await client.request({
      url: `${SERVICE_URLS.user}/api/users/${userId}/increment`,
      method: 'POST',
      data: {
        counterType
      }
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
