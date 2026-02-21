// Review Controller
// HTTP request handling for bike reviews

const reviewService = require('../services/reviewService');
const { createSearchCriteria } = require('@DhakDhakGo/shared/utils/queryUtils');

/**
 * Create a new bike review
 */
const createReview = async (req, res, next) => {
  try {
    // Extract data from request
    const authorId = req.user.uid;
    const reviewData = req.body;

    // Call service layer
    const createdReview = await reviewService.createReview(authorId, reviewData);

    // Return response
    res.status(201).json({
      success: true,
      message: 'Review created successfully',
      data: createdReview
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get all bike reviews with pagination
 */
const getAllReviews = async (req, res, next) => {
  try {
    // Extract query parameters
    const { limit = 20, lastDocId, bikeName, authorId } = req.query;
    
    let reviews;
    
    // Route to appropriate service method
    if (bikeName) {
      reviews = await reviewService.getReviewsByBike(bikeName, parseInt(limit));
    } else if (authorId) {
      reviews = await reviewService.getReviewsByAuthor(authorId, parseInt(limit));
    } else {
      reviews = await reviewService.getAllReviews(parseInt(limit), lastDocId);
    }
    
    // Return response
    res.json({
      success: true,
      count: reviews.length,
      data: reviews
    });
  } catch (error) {
    next(error);
  }
};

const getReviewsByAuthor = async (req, res, next) => {
  try {
    // Extract user ID from params
    const { userId } = req.params;
    const query = req.query;
    const criteria = createSearchCriteria({ ...query, authorId: userId });
    const reviews = await reviewService.getAllReviewsBasedOnCriteria(criteria);
    // Return response
    res.json({
      success: true,
      count: reviews.length,
      data: reviews
    });
  } catch (error) {
    next(error);
  }
};

const getReviews = async (req, res, next) => {
  try {
    const criteria = createSearchCriteria(req.query);
    const reviews = await reviewService.getAllReviewsBasedOnCriteria(criteria);
    res.json({
      success: true,
      count: reviews.length,
      data: reviews
    });
  } catch(error) {
    next(error);
  }
};

/**
 * Get review by ID
 */
const getReviewById = async (req, res, next) => {
  try {
    // Extract review ID from params
    const { id } = req.params;
    
    // Call service layer
    const review = await reviewService.getReviewById(id);
    
    // Return response
    res.json({
      success: true,
      data: review
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Update review
 */
const updateReview = async (req, res, next) => {
  try {
    // Extract data from request
    const { id } = req.params;
    const authorId = req.user.uid;
    const updateData = req.body;
    
    // Call service layer
    const updatedReview = await reviewService.updateReview(id, authorId, updateData);
    
    // Return response
    res.json({
      success: true,
      message: 'Review updated successfully',
      data: updatedReview
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Delete review
 */
const deleteReview = async (req, res, next) => {
  try {
    // Extract data from request
    const { id } = req.params;
    const authorId = req.user.uid;
    
    // Call service layer
    await reviewService.deleteReview(id, authorId);
    
    // Return response
    res.json({
      success: true,
      message: 'Review deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createReview,
  getAllReviews,
  getReviews,
  getReviewsByAuthor,
  getReviewById,
  updateReview,
  deleteReview
};