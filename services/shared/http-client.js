// Shared HTTP Client for Inter-Service Communication
// Used by services to call other microservices
const { GoogleAuth } = require('google-auth-library');

const auth = new GoogleAuth();

// Service URLs (from environment variables or defaults)
const SERVICE_URLS = {
  user: process.env.USER_SERVICE_URL || 'http://localhost:3004',
  post: process.env.POST_SERVICE_URL || 'http://localhost:3001',
  ai: process.env.AI_SERVICE_URL || 'http://localhost:3002',
  interaction: process.env.INTERACTION_SERVICE_URL || 'http://localhost:3003'
};

/**
 * Call another microservice
 * @param {string} service - Service name (user, post, ai, interaction)
 * @param {string} method - HTTP method (GET, POST, PUT, DELETE)
 * @param {string} path - API path
 * @param {Object} data - Request body data
 * @param {Object} headers - Additional headers
 * @returns {Promise<Object>} Response data
 */
const callService = async (service, method, path, data = null) => {
  try {
    const serviceUrl = SERVICE_URLS[service];
    
    if (!serviceUrl) {
      throw new Error(`Unknown service: ${service}`);
    }

    const url = `${serviceUrl}${path}`;

    const client = await auth.getIdTokenClient(url);
    const response = await client.request({
      url,
      method,
      data,
    });
    
    return response.data;
  } catch (error) {
    console.error(`Service call failed: ${service} ${method} ${path}`, error.message);
    
    if (error.response) {
      // Service responded with error
      throw new Error(`${service} service error: ${error.response.data.error || error.response.data.message || 'Unknown error'}`);
    } else if (error.request) {
      // No response received
      throw new Error(`${service} service unavailable`);
    } else {
      // Request setup error
      throw new Error(`Failed to call ${service} service: ${error.message}`);
    }
  }
};

/**
 * Call User Service
 * @param {string} method - HTTP method
 * @param {string} path - API path
 * @param {Object} data - Request data
 * @returns {Promise<Object>} Response data
 */
const callUserService = async (method, path, data = null) => {
  return callService('user', method, path, data);
};

/**
 * Call Post Service
 * @param {string} method - HTTP method
 * @param {string} path - API path
 * @param {Object} data - Request data
 * @returns {Promise<Object>} Response data
 */
const callPostService = async (method, path, data = null) => {
  return callService('post', method, path, data);
};

/**
 * Call AI Service
 * @param {string} method - HTTP method
 * @param {string} path - API path
 * @param {Object} data - Request data
 * @returns {Promise<Object>} Response data
 */
const callAIService = async (method, path, data = null) => {
  return callService('ai', method, path, data);
};

/**
 * Call Interaction Service
 * @param {string} method - HTTP method
 * @param {string} path - API path
 * @param {Object} data - Request data
 * @returns {Promise<Object>} Response data
 */
const callInteractionService = async (method, path, data = null) => {
  return callService('interaction', method, path, data);
};

/**
 * Increment post interaction counter
 * @param {string} postId - Post ID
 * @param {string} postType - Post type (review or experience)
 * @param {string} interactionType - Interaction type (likes or comments)
 * @param {boolean} incrementOrDecrement - True to increment, false to decrement
 */
const incrementOrDecrementInteractionCounterOnPost = async (postId, postType, interactionType, incrementOrDecrement) => {
  try {
    const interaction = interactionType === 'likes' ? 'likes' : 'comments';
    const action = incrementOrDecrement ? 'increment' : 'decrement';
    if (interaction === 'comments') {
      await callPostService('PATCH', `/api/${postType}/${postId}/${action}-comment`);
    } else {
      await callPostService('PATCH', `/api/${postType}/${postId}/${action}-like`);
    }
  } catch (error) {
    console.warn('Failed to increment post counter:', error.message);
  }
};

/**
 * Increment user counter
 * @param {string} userId - User ID
 * @param {string} counterType - Counter type
 * @param {boolean} incrementOrDecrement - True to increment, false to decrement
 */
const incrementOrDecrementUserCounter = async (userId, counterType, incrementOrDecrement) => {
  try {
    const action = incrementOrDecrement ? 'increment' : 'decrement';
    await axios.post(`${SERVICE_URLS.user}/api/users/${userId}/${action}`, {
      counterType
    });
  } catch (error) {
    console.warn('Failed to increment user counter:', error.message);
  }
};

/**
 * Get user profile by ID
 * @param {string} userId - User ID
 * @returns {Promise<Object>} User profile
 */
const getUserProfile = async (userId) => {
  const response = await callUserService('GET', `/api/users/${userId}`);
  return response.data;
};

/**
 * Verify user exists
 * @param {string} userId - User ID
 * @returns {Promise<boolean>} True if user exists
 */
const verifyUserExists = async (userId) => {
  try {
    await getUserProfile(userId);
    return true;
  } catch (error) {
    if (error.status === 404) {
      return false;
    } else {
      throw error;
    }
  }
};

module.exports = {
  callService,
  callUserService,
  callPostService,
  callAIService,
  callInteractionService,
  getUserProfile,
  verifyUserExists,
  incrementOrDecrementInteractionCounterOnPost,
  incrementOrDecrementUserCounter,
  SERVICE_URLS
};
