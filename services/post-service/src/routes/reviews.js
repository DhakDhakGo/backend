const express = require('express');
const router = express.Router();

const {
  createReview,
  getReviewById,
  updateReview,
  deleteReview,
  getReviews,
  getReviewsByAuthor,
  incrementReviewLikeCount,
  decrementReviewLikeCount,
  incrementReviewCommentCount,
  decrementReviewCommentCount
} = require('../controllers/reviewController');

const { authenticateUserToken, extractUserInfoFromHeaders } = require('@dhakdhakgo/shared');

const userAuthMiddleware = process.env.NODE_ENV === 'local' ? authenticateUserToken : extractUserInfoFromHeaders

// Public routes
router.get('/', userAuthMiddleware, getReviews);
router.get('/:id', userAuthMiddleware, getReviewById);
router.get('/user/:userId', userAuthMiddleware, getReviewsByAuthor);

// Protected routes (require authentication)
router.post('/', userAuthMiddleware, createReview);
router.put('/:id', userAuthMiddleware, updateReview);
router.delete('/:id', userAuthMiddleware, deleteReview);

router.patch('/:id/increment-like', userAuthMiddleware, incrementReviewLikeCount);
router.patch('/:id/decrement-like', userAuthMiddleware, decrementReviewLikeCount);
router.patch('/:id/increment-comment', userAuthMiddleware, incrementReviewCommentCount);
router.patch('/:id/decrement-comment', userAuthMiddleware, decrementReviewCommentCount);

module.exports = router;
