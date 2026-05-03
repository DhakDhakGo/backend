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
 * @param {Object} queryParams - Query parameters
 * @param {Object} headers - Additional headers
 * @returns {Promise<Object>} Response data
 */
const callService = async (service, method, path, data = null, queryParams = null, withRetry = false) => {
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
    params: queryParams
  });
  return response.data;
};

/**
 * Call User Service
 * @param {string} method - HTTP method
 * @param {string} path - API path
 * @param {Object} data - Request data
 * @returns {Promise<Object>} Response data
 */
const callUserService = async (method, path, data = null, queryParams = null) => {
  return callService('user', method, path, data, queryParams);
};

/**
 * Call Post Service
 * @param {string} method - HTTP method
 * @param {string} path - API path
 * @param {Object} data - Request data
 * @returns {Promise<Object>} Response data
 */
const callPostService = async (method, path, data = null, queryParams = null) => {
  return callService('post', method, path, data, queryParams);
};

/**
 * Call AI Service
 * @param {string} method - HTTP method
 * @param {string} path - API path
 * @param {Object} data - Request data
 * @returns {Promise<Object>} Response data
 */
const callAIService = async (method, path, data = null, queryParams = null) => {
  return callService('ai', method, path, data, queryParams);
};

/**
 * Call Interaction Service
 * @param {string} method - HTTP method
 * @param {string} path - API path
 * @param {Object} data - Request data
 * @returns {Promise<Object>} Response data
 */
const callInteractionService = async (method, path, data = null, queryParams = null) => {
  return callService('interaction', method, path, data, queryParams);
};

/**
 * Increment post interaction counter
 * @param {string} postId - Post ID
 * @param {string} postType - Post type (review or experience)
 * @param {string} interactionType - Interaction type (likes or comments)
 * @param {boolean} incrementOrDecrement - True to increment, false to decrement
 */
const modifyInteractionCounterOnPost = async (postId, postType, interactionType, incrementOrDecrement) => {
  const interaction = interactionType === 'likes' ? 'likes' : 'comments';
  const action = incrementOrDecrement ? 'increment' : 'decrement';
  if (interaction === 'comments') {
    await callPostService('PATCH', `/api/${postType}/${postId}/${action}-comment`);
  } else {
    await callPostService('PATCH', `/api/${postType}/${postId}/${action}-like`);
  }
};

/**
 * Increment user counter
 * @param {string} userId - User ID
 * @param {string} postType - Counter type
 * @param {boolean} incrementOrDecrement - True to increment, false to decrement
 */
const modifyUsersPostCounter = async (userId, postType, incrementOrDecrement) => {
  const action = incrementOrDecrement ? 'increment' : 'decrement';
  await callUserService('POST', `/api/users/${userId}/${action}`, { postType }, null);
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
  modifyInteractionCounterOnPost,
  modifyUsersPostCounter,
  SERVICE_URLS
};
