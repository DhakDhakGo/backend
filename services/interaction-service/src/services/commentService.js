// Comment Service
// Business logic for comments

const Comment = require('../models/Comment');
const commentRepository = require('../repositories/commentRepository');
const { getUserProfile, incrementPostCounter, decrementPostCounter } = require('./http-client');

/**
 * Create a new comment
 * @param {string} userId - User ID
 * @param {Object} commentData - Comment data {targetType, targetId, content, parentCommentId}
 * @returns {Promise<Comment>} Created comment
 */
const createComment = async (userId, commentData) => {
  const { targetType, targetId, content, parentCommentId } = commentData;

  // Validate target type
  const validTypes = ['review', 'experience'];
  if (!validTypes.includes(targetType)) {
    throw new Error(`Invalid target type. Must be one of: ${validTypes.join(', ')}`);
  }

  // Verify user exists
  try {
    await getUserProfile(userId);
  } catch (error) {
    throw new Error('User not found');
  }

  // If this is a reply, verify parent comment exists
  if (parentCommentId) {
    const parentComment = await commentRepository.findById(parentCommentId);
    if (!parentComment) {
      throw new Error('Parent comment not found');
    }
    // Verify parent comment belongs to the same target
    if (parentComment.targetType !== targetType || parentComment.targetId !== targetId) {
      throw new Error('Parent comment does not belong to this target');
    }
  }

  // Create comment instance
  const comment = new Comment({
    userId,
    targetType,
    targetId,
    content,
    parentCommentId: parentCommentId || null
  });

  // Validate
  const validation = comment.validate();
  if (!validation.valid) {
    throw new Error(`Validation failed: ${validation.errors.join(', ')}`);
  }

  // Save to database
  const savedComment = await commentRepository.create(comment);

  // Update counters
  try {
    // Increment comment counter on the target
    await incrementPostCounter(targetType, targetId, 'commentCount');

    // If this is a reply, increment reply count on parent comment
    if (parentCommentId) {
      await commentRepository.incrementReplyCount(parentCommentId);
    }
  } catch (error) {
    console.error('Failed to update counters:', error);
    // Continue even if counter update fails
  }

  return savedComment;
};

/**
 * Get comment by ID
 * @param {string} commentId - Comment ID
 * @returns {Promise<Comment>} Comment instance
 */
const getCommentById = async (commentId) => {
  const comment = await commentRepository.findById(commentId);
  
  if (!comment) {
    throw new Error('Comment not found');
  }
  
  return comment;
};

/**
 * Get comments by target
 * @param {string} targetType - Target type
 * @param {string} targetId - Target ID
 * @param {number} limit - Number of comments to fetch
 * @returns {Promise<Array<Comment>>} Array of comments
 */
const getCommentsByTarget = async (targetType, targetId, limit = 20) => {
  return await commentRepository.findByTarget(targetType, targetId, limit);
};

/**
 * Get comments by user
 * @param {string} userId - User ID
 * @param {number} limit - Number of comments to fetch
 * @returns {Promise<Array<Comment>>} Array of comments
 */
const getCommentsByUser = async (userId, limit = 20) => {
  return await commentRepository.findByUser(userId, limit);
};

/**
 * Get replies to a comment
 * @param {string} commentId - Parent comment ID
 * @param {number} limit - Number of replies to fetch
 * @returns {Promise<Array<Comment>>} Array of reply comments
 */
const getCommentReplies = async (commentId, limit = 20) => {
  return await commentRepository.findReplies(commentId, limit);
};

/**
 * Update comment
 * @param {string} commentId - Comment ID
 * @param {string} userId - User ID (for authorization)
 * @param {Object} updateData - Data to update {content}
 * @returns {Promise<Comment>} Updated comment
 */
const updateComment = async (commentId, userId, updateData) => {
  // Get existing comment
  const comment = await getCommentById(commentId);

  // Check ownership
  if (comment.userId !== userId) {
    throw new Error('Unauthorized: You can only update your own comments');
  }

  // Only allow updating content
  const filteredData = {};
  if (updateData.content !== undefined) {
    filteredData.content = updateData.content;
  }

  // Update in database
  const updatedComment = await commentRepository.update(commentId, filteredData);
  
  return updatedComment;
};

/**
 * Delete comment
 * @param {string} commentId - Comment ID
 * @param {string} userId - User ID (for authorization)
 * @returns {Promise<void>}
 */
const deleteComment = async (commentId, userId) => {
  // Get existing comment
  const comment = await getCommentById(commentId);

  // Check ownership
  if (comment.userId !== userId) {
    throw new Error('Unauthorized: You can only delete your own comments');
  }

  // Delete from database
  await commentRepository.deleteComment(commentId);

  // Update counters
  try {
    // Decrement comment counter on the target
    await decrementPostCounter(comment.targetType, comment.targetId, 'commentCount');

    // If this is a reply, decrement reply count on parent comment
    if (comment.parentCommentId) {
      await commentRepository.decrementReplyCount(comment.parentCommentId);
    }
  } catch (error) {
    console.error('Failed to update counters:', error);
  }
};

module.exports = {
  createComment,
  getCommentById,
  getCommentsByTarget,
  getCommentsByUser,
  getCommentReplies,
  updateComment,
  deleteComment
};
