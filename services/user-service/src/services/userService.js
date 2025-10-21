// User Service
// Business logic for user operations

const User = require('../models/User');
const userRepository = require('../repositories/userRepository');

/**
 * Register or get existing user
 * @param {Object} firebaseUser - Firebase Auth user object
 * @returns {Promise<Object>} Result with user and isNew flag
 */
const registerUser = async (firebaseUser) => {
  // Create user instance from Firebase Auth
  const user = User.fromFirebaseAuth(firebaseUser);

  // Validate
  const validation = user.validate();
  if (!validation.valid) {
    throw new Error(`Validation failed: ${validation.errors.join(', ')}`);
  }

  // Check if user exists
  const existingUser = await userRepository.findById(user.userId);
  
  if (existingUser) {
    return {
      user: existingUser,
      isNew: false
    };
  }

  // Create new user
  const createdUser = await userRepository.createOrGet(user);
  
  return {
    user: createdUser,
    isNew: true
  };
};

/**
 * Get user by ID
 * @param {string} userId - User ID
 * @returns {Promise<User>} User instance
 */
const getUserById = async (userId) => {
  const user = await userRepository.findById(userId);
  
  if (!user) {
    throw new Error('User not found');
  }
  
  return user;
};

/**
 * Update user profile
 * @param {string} userId - User ID
 * @param {Object} updateData - Data to update
 * @returns {Promise<User>} Updated user
 */
const updateUserProfile = async (userId, updateData) => {
  // Verify user exists
  await getUserById(userId);

  // Update user
  const updatedUser = await userRepository.update(userId, updateData);
  
  return updatedUser;
};

/**
 * Get user statistics
 * @param {string} userId - User ID
 * @returns {Promise<Object>} User statistics
 */
const getUserStats = async (userId) => {
  const user = await getUserById(userId);
  
  return {
    userId: user.userId,
    stats: user.metadata
  };
};

/**
 * Increment user counter
 * @param {string} userId - User ID
 * @param {string} counterType - Counter type
 * @returns {Promise<void>}
 */
const incrementCounter = async (userId, counterType) => {
  const validCounters = ['totalReviews', 'totalExperiences', 'totalLikes', 'totalComments'];
  
  if (!validCounters.includes(counterType)) {
    throw new Error(`Invalid counter type. Valid types: ${validCounters.join(', ')}`);
  }

  await userRepository.incrementCounter(userId, counterType);
};

/**
 * Decrement user counter
 * @param {string} userId - User ID
 * @param {string} counterType - Counter type
 * @returns {Promise<void>}
 */
const decrementCounter = async (userId, counterType) => {
  const validCounters = ['totalReviews', 'totalExperiences', 'totalLikes', 'totalComments'];
  
  if (!validCounters.includes(counterType)) {
    throw new Error(`Invalid counter type. Valid types: ${validCounters.join(', ')}`);
  }

  await userRepository.decrementCounter(userId, counterType);
};

module.exports = {
  registerUser,
  getUserById,
  updateUserProfile,
  getUserStats,
  incrementCounter,
  decrementCounter
};
