// Like Service
// Business logic for likes

const Like = require('../models/Like');
const likeRepository = require('../repositories/likeRepository');
const { getUserProfile, incrementPostCounter, decrementPostCounter } = require('./http-client');

/**
 * Create a new like
 * @param {string} userId - User ID
 * @param {Object} likeData - Like data {targetType, targetId}
 * @returns {Promise<Like>} Created like
 */
const createLike = async (userId, likeData) => {
  const { targetType, targetId } = likeData;

  // Validate target type
  const validTypes = ['review', 'experience', 'comment'];
  if (!validTypes.includes(targetType)) {
    throw new Error(`Invalid target type. Must be one of: ${validTypes.join(', ')}`);
  }

  // Check if user already liked this target
  const existingLike = await likeRepository.findByUserAndTarget(userId, targetType, targetId);
  if (existingLike) {
    throw new Error('Like already exists for this user and target');
  }

  // Verify user exists
  try {
    await getUserProfile(userId);
  } catch (error) {
    throw new Error('User not found');
  }

  // Create like instance
  const like = new Like({
    userId,
    targetType,
    targetId
  });

  // Validate
  const validation = like.validate();
  if (!validation.valid) {
    throw new Error(`Validation failed: ${validation.errors.join(', ')}`);
  }

  // Save to database
  const savedLike = await likeRepository.create(like);

  // Update like counter on the target
  try {
    await incrementPostCounter(targetType, targetId, 'likeCount');
  } catch (error) {
    console.error('Failed to increment like counter:', error);
    // Continue even if counter update fails
  }

  return savedLike;
};

/**
 * Get like by ID
 * @param {string} likeId - Like ID
 * @returns {Promise<Like>} Like instance
 */
const getLikeById = async (likeId) => {
  const like = await likeRepository.findById(likeId);
  
  if (!like) {
    throw new Error('Like not found');
  }
  
  return like;
};

/**
 * Get likes by target
 * @param {string} targetType - Target type
 * @param {string} targetId - Target ID
 * @param {number} limit - Number of likes to fetch
 * @returns {Promise<Array<Like>>} Array of likes
 */
const getLikesByTarget = async (targetType, targetId, limit = 20) => {
  return await likeRepository.findByTarget(targetType, targetId, limit);
};

/**
 * Get likes by user
 * @param {string} userId - User ID
 * @param {number} limit - Number of likes to fetch
 * @returns {Promise<Array<Like>>} Array of likes
 */
const getLikesByUser = async (userId, limit = 20) => {
  return await likeRepository.findByUser(userId, limit);
};

/**
 * Check if user liked a target
 * @param {string} userId - User ID
 * @param {string} targetType - Target type
 * @param {string} targetId - Target ID
 * @returns {Promise<boolean>} True if liked, false otherwise
 */
const hasUserLiked = async (userId, targetType, targetId) => {
  const like = await likeRepository.findByUserAndTarget(userId, targetType, targetId);
  return like !== null;
};

/**
 * Delete like (unlike)
 * @param {string} likeId - Like ID
 * @param {string} userId - User ID (for authorization)
 * @returns {Promise<void>}
 */
const deleteLike = async (likeId, userId) => {
  // Get existing like
  const like = await getLikeById(likeId);

  // Check ownership
  if (like.userId !== userId) {
    throw new Error('Unauthorized: You can only delete your own likes');
  }

  // Delete from database
  await likeRepository.deleteLike(likeId);

  // Decrement like counter on the target
  try {
    await decrementPostCounter(like.targetType, like.targetId, 'likeCount');
  } catch (error) {
    console.error('Failed to decrement like counter:', error);
  }
};

/**
 * Unlike by target (alternative to deleteLike)
 * @param {string} userId - User ID
 * @param {string} targetType - Target type
 * @param {string} targetId - Target ID
 * @returns {Promise<void>}
 */
const unlikeByTarget = async (userId, targetType, targetId) => {
  // Find like
  const like = await likeRepository.findByUserAndTarget(userId, targetType, targetId);
  
  if (!like) {
    throw new Error('Like not found');
  }

  // Delete
  await deleteLike(like.id, userId);
};

module.exports = {
  createLike,
  getLikeById,
  getLikesByTarget,
  getLikesByUser,
  hasUserLiked,
  deleteLike,
  unlikeByTarget
};
