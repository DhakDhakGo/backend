// Like Controller
// HTTP request handling for likes

const likeService = require('../services/likeService');

/**
 * Create a new like
 */
const createLike = async (req, res, next) => {
  try {
    // Extract data from request
    const userId = req.user.uid;
    const likeData = req.body; // {targetType, targetId}

    // Call service layer
    const createdLike = await likeService.createLike(userId, likeData);

    // Return response
    res.status(201).json({
      success: true,
      message: 'Like added successfully',
      data: createdLike
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get likes by target
 */
const getLikesByTarget = async (req, res, next) => {
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
    const likes = await likeService.getLikesByTarget(targetType, targetId, parseInt(limit));

    // Return response
    res.json({
      success: true,
      count: likes.length,
      data: likes
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get likes by user
 */
const getLikesByUser = async (req, res, next) => {
  try {
    // Extract query parameters
    const { userId } = req.params;
    const { limit = 20 } = req.query;

    // Call service layer
    const likes = await likeService.getLikesByUser(userId, parseInt(limit));

    // Return response
    res.json({
      success: true,
      count: likes.length,
      data: likes
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Check if user liked a target
 */
const checkUserLike = async (req, res, next) => {
  try {
    // Extract data from request
    const userId = req.user.uid;
    const { targetType, targetId } = req.query;

    // Validate required parameters
    if (!targetType || !targetId) {
      return res.status(400).json({
        success: false,
        error: 'targetType and targetId are required'
      });
    }

    // Call service layer
    const hasLiked = await likeService.hasUserLiked(userId, targetType, targetId);

    // Return response
    res.json({
      success: true,
      hasLiked
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Delete like (unlike)
 */
const deleteLike = async (req, res, next) => {
  try {
    // Extract data from request
    const { id } = req.params;
    const userId = req.user.uid;

    // Call service layer
    await likeService.deleteLike(id, userId);

    // Return response
    res.json({
      success: true,
      message: 'Like removed successfully'
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Unlike by target (alternative endpoint)
 */
const unlikeByTarget = async (req, res, next) => {
  try {
    // Extract data from request
    const userId = req.user.uid;
    const { targetType, targetId } = req.body;

    // Validate required parameters
    if (!targetType || !targetId) {
      return res.status(400).json({
        success: false,
        error: 'targetType and targetId are required'
      });
    }

    // Call service layer
    await likeService.unlikeByTarget(userId, targetType, targetId);

    // Return response
    res.json({
      success: true,
      message: 'Like removed successfully'
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createLike,
  getLikesByTarget,
  getLikesByUser,
  checkUserLike,
  deleteLike,
  unlikeByTarget
};