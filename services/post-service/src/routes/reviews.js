const express = require('express');
const router = express.Router();

const {
  createReview,
  getReviewById,
  updateReview,
  deleteReview,
  getReviews,
  getReviewsByAuthor
} = require('../controllers/reviewController');

const { authenticateToken } = require('@DhakDhakGo/shared/auth-middleware');

// Public routes
router.get('/', getReviews);
router.get('/:id', getReviewById);
router.get('/user/:userId', getReviewsByAuthor);

// Protected routes (require authentication)
router.post('/', authenticateToken, createReview);
router.put('/:id', authenticateToken, updateReview);
router.delete('/:id', authenticateToken, deleteReview);

module.exports = router;
