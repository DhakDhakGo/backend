// Review Service
// Business logic for bike reviews

const BikeReview = require('../models/BikeReview');
const reviewRepository = require('../repositories/reviewRepository');
// const { getBikeInsights } = require('@dhakdhakgo/shared');
const { callUserService, ContextHolder } = require('@dhakdhakgo/shared');

/**
 * Create a new review
 * @param {string} authorId - Author user ID
 * @param {Object} reviewData - Review data
 * @returns {Promise<BikeReview>} Created review
 */
const createReview = async (authorId, reviewData) => {
  // Verify user exists
  let userProfile;
  try {
    const userInfoToken = ContextHolder.getInfoForKey('userInfoToken');
    userProfile = await callUserService({
      method: 'GET',
      path: `/api/users/${authorId}`,
      additionalHeaders: { 'x-user-info': userInfoToken }
    });
  } catch (error) {
    throw new Error('User not found. Please register first.');
  }

  // Create review instance
  const review = new BikeReview({
    ...reviewData,
    authorId
  });

  // Validate
  const validation = review.validate();
  if (!validation.valid) {
    throw new Error(`Validation failed: ${validation.errors.join(', ')}`);
  }

  // Save to database
  const savedReview = await reviewRepository.create(review);

  // Update user counter
  try {
    //await modifyUsersPostCounter(authorId, 'totalReviews', 'increment');
  } catch (error) {
    console.error('Failed to update user counter:', error);
    // Don't fail the request
  }

  return savedReview;
};

const getAiDataForReview = async (review) => {
  try {
    //const aiData = await getBikeInsights(review.bikeName);
    //return aiData;
  } catch (error) {
    console.warn('Failed to fetch AI insights:', error.message);
    return null;
  }
};

/**
 * Get review by ID
 * @param {string} reviewId - Review ID
 * @returns {Promise<BikeReview>} Review instance
 */
const getReviewById = async (reviewId) => {
  const review = await reviewRepository.findById(reviewId);
  
  if (!review) {
    throw new Error('Review not found');
  }
  
  return review;
};

/**
 * Get all reviews with pagination
 * @param {number} limit - Number of reviews to fetch
 * @param {string} lastDocId - Last document ID for pagination
 * @returns {Promise<Array<BikeReview>>} Array of reviews
 */
const getAllReviews = async (limit = 20, lastDocId = null) => {
  return reviewRepository.findAll(limit, lastDocId);
};

/**
 * Get all reviews with pagination
 * @param {Object} criteria - An object with fields related to bike reviews
 * @returns {Promise<Array<BikeReview>>} Array of reviews
 */
const getAllReviewsBasedOnCriteria = async (criteria) => {
  return reviewRepository.findByCriteria(criteria);
}

/**
 * Get reviews by bike name
 * @param {string} bikeName - Bike name
 * @param {number} limit - Number of reviews to fetch
 * @returns {Promise<Array<BikeReview>>} Array of reviews
 */
const getReviewsByBike = async (bikeName, limit = 20) => {
  return await reviewRepository.findByBikeName(bikeName, limit);
};

/**
 * Get reviews by author
 * @param {string} authorId - Author ID
 * @param {number} limit - Number of reviews to fetch
 * @returns {Promise<Array<BikeReview>>} Array of reviews
 */
const getReviewsByAuthor = async (authorId, limit = 20) => {
  return await reviewRepository.findByAuthor(authorId, limit);
};

/**
 * Update review
 * @param {string} reviewId - Review ID
 * @param {string} authorId - Author ID (for authorization)
 * @param {Object} updateData - Data to update
 * @returns {Promise<BikeReview>} Updated review
 */
const updateReview = async (reviewId, authorId, updateData) => {
  // Get existing review
  const review = await getReviewById(reviewId);

  // Check ownership
  if (review.authorId !== authorId) {
    throw new Error('Unauthorized: You can only update your own reviews');
  }

  // Update allowed fields
  const allowedFields = ['title', 'content', 'rating', 'pros', 'cons', 'ridingExperience', 'images', 'tags'];
  const filteredData = {};
  
  for (const field of allowedFields) {
    if (updateData[field] !== undefined) {
      filteredData[field] = updateData[field];
    }
  }

  // Update in database
  const updatedReview = await reviewRepository.update(reviewId, filteredData);
  
  return updatedReview;
};

const setAIDataApprovedStatus = async (reviewId, authorId, isVerified) => {
  let userProfile;
  const review = await getReviewById(reviewId);
  try {
    const userInfoToken = ContextHolder.getInfoForKey('userInfoToken');
    ({ data: userProfile } = await callUserService({
      method: 'GET',
      path: `api/users/${authorId}`,
      additionalHeaders: { 'x-user-info': userInfoToken }
    }));
  } catch (error) {
    throw new Error('User not found. Please register first.');
  }
  if (review.authorId !== authorId && userProfile.userRole !== 'admin') {
    throw new Error('You are not authorized to approve AI data for this review');
  }

  // Update AI data approved status
  const updatedReview = await reviewRepository.update(reviewId, {
    isAiDataVerified: isVerified
  });

  return updatedReview;
};

/**
 * Delete review
 * @param {string} reviewId - Review ID
 * @param {string} authorId - Author ID (for authorization)
 * @returns {Promise<void>}
 */
const deleteReview = async (reviewId, authorId) => {
  // Get existing review
  const review = await getReviewById(reviewId);

  // Check ownership
  if (review.authorId !== authorId) {
    throw new Error('Unauthorized: You can only delete your own reviews');
  }

  // Delete from database
  await reviewRepository.deleteReview(reviewId);

  // Decrement user counter
  try {
    //await modifyUsersPostCounter(authorId, 'totalReviews', 'decrement');
  } catch (error) {
    console.error('Failed to update user counter:', error);
  }
};

/**
 * Increment like count
 * @param {string} reviewId - Review ID
 * @returns {Promise<void>}
 */
const incrementLikeCount = async (reviewId) => {
  await reviewRepository.incrementLikeCount(reviewId);
};

/**
 * Decrement like count
 * @param {string} reviewId - Review ID
 * @returns {Promise<void>}
 */
const decrementLikeCount = async (reviewId) => {
  await reviewRepository.decrementLikeCount(reviewId);
};

/**
 * Increment comment count
 * @param {string} reviewId - Review ID
 * @returns {Promise<void>}
 */
const incrementCommentCount = async (reviewId) => {
  await reviewRepository.incrementCommentCount(reviewId);
};

/**
 * Decrement comment count
 * @param {string} reviewId - Review ID
 * @returns {Promise<void>}
 */
const decrementCommentCount = async (reviewId) => {
  await reviewRepository.decrementCommentCount(reviewId);
};

module.exports = {
  createReview,
  getReviewById,
  getAllReviews,
  getAllReviewsBasedOnCriteria,
  getReviewsByBike,
  getReviewsByAuthor,
  updateReview,
  setAIDataApprovedStatus,
  deleteReview,
  incrementLikeCount,
  decrementLikeCount,
  incrementCommentCount,
  decrementCommentCount
};
