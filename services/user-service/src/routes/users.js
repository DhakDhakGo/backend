const express = require('express');
const router = express.Router();

const {
  registerUser,
  getCurrentUser,
  getUserById,
  updateUser,
  getUserStats,
  incrementCounter,
  decrementCounter
} = require('../controllers/userController');

const { authenticateToken, isOwner } = require('@dhakdhakgo/shared/auth-middleware');

// Public routes (require authentication)
router.post('/register', authenticateToken, registerUser);
router.get('/me', authenticateToken, getCurrentUser);

// User profile routes
router.get('/:userId', getUserById);
router.put('/:userId', authenticateToken, isOwner, updateUser);

// User stats
router.get('/:userId/stats', getUserStats);

// Internal routes (for other services to update user stats)
router.post('/:userId/increment', incrementCounter);
router.post('/:userId/decrement', decrementCounter);

module.exports = router;
