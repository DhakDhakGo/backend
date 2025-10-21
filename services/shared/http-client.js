// Shared HTTP Client for Inter-Service Communication
// Used by services to call other microservices

const axios = require('axios');

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
const callService = async (service, method, path, data = null, headers = {}) => {
  try {
    const serviceUrl = SERVICE_URLS[service];
    
    if (!serviceUrl) {
      throw new Error(`Unknown service: ${service}`);
    }

    const url = `${serviceUrl}${path}`;
    
    const config = {
      method,
      url,
      headers: {
        'Content-Type': 'application/json',
        ...headers
      },
      timeout: 10000 // 10 second timeout
    };

    if (data && (method === 'POST' || method === 'PUT' || method === 'PATCH')) {
      config.data = data;
    }

    const response = await axios(config);
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
 * Get user profile by ID
 * @param {string} userId - User ID
 * @returns {Promise<Object>} User profile
 */
const getUserProfile = async (userId) => {
  try {
    const response = await callUserService('GET', `/api/users/${userId}`);
    return response.data;
  } catch (error) {
    console.warn(`Failed to get user profile for ${userId}:`, error.message);
    return null;
  }
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
    return false;
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
  SERVICE_URLS
};
