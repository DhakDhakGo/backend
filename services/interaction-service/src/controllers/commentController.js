// Comment Controller
// HTTP request handling for comments

const commentService = require('../services/commentService');

/**
 * Create a new comment
 */
const createComment = async (req, res, next) => {
  try {
    // Extract data from request
    const userId = req.user.uid;
    const commentData = req.body; // {targetType, targetId, content, parentCommentId}

    // Call service layer
    const createdComment = await commentService.createComment(userId, commentData);

    // Return response
    res.status(201).json({
      success: true,
      message: 'Comment created successfully',
      data: createdComment
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get comments by target
 */
const getCommentsByTarget = async (req, res, next) => {
  try {
    // Extract query parameters
    const { targetType, targetId, limit = 20 } = req.query;

    // Validate required parameters
    if (!targetType || !targetId) {
      return res.status(400).json({
        success: false,
        error: 'targetType and targetId are required'
      });
    }

    // Call service layer
    const comments = await commentService.getCommentsByTarget(targetType, targetId, parseInt(limit));

    // Return response
    res.json({
      success: true,
      count: comments.length,
      data: comments
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get comments by user
 */
const getCommentsByUser = async (req, res, next) => {
  try {
    // Extract parameters
    const { userId } = req.params;
    const { limit = 20 } = req.query;

    // Call service layer
    const comments = await commentService.getCommentsByUser(userId, parseInt(limit));

    // Return response
    res.json({
      success: true,
      count: comments.length,
      data: comments
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get comment by ID
 */
const getCommentById = async (req, res, next) => {
  try {
    // Extract comment ID from params
    const { id } = req.params;

    // Call service layer
    const comment = await commentService.getCommentById(id);

    // Return response
    res.json({
      success: true,
      data: comment
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get replies to a comment
 */
const getCommentReplies = async (req, res, next) => {
  try {
    // Extract parameters
    const { id } = req.params;
    const { limit = 20 } = req.query;

    // Call service layer
    const replies = await commentService.getCommentReplies(id, parseInt(limit));

    // Return response
    res.json({
      success: true,
      count: replies.length,
      data: replies
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Update comment
 */
const updateComment = async (req, res, next) => {
  try {
    // Extract data from request
    const { id } = req.params;
    const userId = req.user.uid;
    const updateData = req.body; // {content}

    // Call service layer
    const updatedComment = await commentService.updateComment(id, userId, updateData);

    // Return response
    res.json({
      success: true,
      message: 'Comment updated successfully',
      data: updatedComment
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Delete comment
 */
const deleteComment = async (req, res, next) => {
  try {
    // Extract data from request
    const { id } = req.params;
    const userId = req.user.uid;

    // Call service layer
    await commentService.deleteComment(id, userId);

    // Return response
    res.json({
      success: true,
      message: 'Comment deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createComment,
  getCommentsByTarget,
  getCommentsByUser,
  getCommentById,
  getCommentReplies,
  updateComment,
  deleteComment
};