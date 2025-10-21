const express = require('express');
const router = express.Router();

const {
  createReview,
  getAllReviews,
  getReview,
  updateReview,
  deleteReview,
  getReviewsByUser
} = require('../controllers/reviewController');

const { authenticateToken } = require('../middleware/auth-middleware');

// Public routes
router.get('/', getAllReviews);
router.get('/:id', getReview);
router.get('/user/:userId', getReviewsByUser);

// Protected routes (require authentication)
router.post('/', authenticateToken, createReview);
router.put('/:id', authenticateToken, updateReview);
router.delete('/:id', authenticateToken, deleteReview);

module.exports = router;
