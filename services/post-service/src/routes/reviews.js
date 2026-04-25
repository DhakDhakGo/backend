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

const { authenticateToken } = require('@dhakdhakgo/shared');

// Public routes
router.get('/', getReviews);
router.get('/:id', getReviewById);
router.get('/user/:userId', getReviewsByAuthor);

// Protected routes (require authentication)
router.post('/', authenticateToken, createReview);
router.put('/:id', authenticateToken, updateReview);
router.delete('/:id', authenticateToken, deleteReview);

router.patch('/:id/increment-like', authenticateToken, incrementReviewLikeCount);
router.patch('/:id/decrement-like', authenticateToken, decrementReviewLikeCount);
router.patch('/:id/increment-comment', authenticateToken, incrementReviewCommentCount);
router.patch('/:id/decrement-comment', authenticateToken, decrementReviewCommentCount);

module.exports = router;
