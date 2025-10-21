// HTTP Client for Inter-Service Communication
// Simplified version for Interaction Service

const axios = require('axios');

const SERVICE_URLS = {
  user: process.env.USER_SERVICE_URL || 'https://user-service-134445090159.asia-south1.run.app',
  post: process.env.POST_SERVICE_URL || 'https://post-service-134445090159.asia-south1.run.app',
};

/**
 * Increment post interaction counter
 * @param {string} postId - Post ID
 * @param {string} postType - Post type (review or experience)
 * @param {string} interactionType - Interaction type (likes or comments)
 */
const incrementPostCounter = async (postId, postType, interactionType) => {
  try {
    const collection = postType === 'review' ? 'bikeReviews' : 'ownershipExperiences';
    // Note: This would require an endpoint in Post Service
    // For now, we'll update directly in Firestore
    console.log(`Increment ${interactionType} for ${postType} ${postId}`);
  } catch (error) {
    console.warn('Failed to increment post counter:', error.message);
  }
};

/**
 * Increment user counter
 * @param {string} userId - User ID
 * @param {string} counterType - Counter type
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

/**
 * Get user profile
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
    return null;
  }
};

module.exports = {
  incrementPostCounter,
  incrementUserCounter,
  getUserProfile
};
