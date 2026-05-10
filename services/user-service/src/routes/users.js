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

const { authenticateUserToken, isOwner, extractUserInfoFromHeaders } = require('@dhakdhakgo/shared');



// In cloud ennvironment, user authentication is handled by API Gateway. In local environment, add user authentication midleware.
const userAuthMiddleware = process.env.NODE_ENV === 'local' ? authenticateUserToken: extractUserInfoFromHeaders;

// Public routes (require authentication)
router.post('/register', userAuthMiddleware, registerUser);
//router.post('/login', userAuthMiddleware, registerUser);
router.get('/me', userAuthMiddleware, getCurrentUser);

// User profile routes
router.get('/:userId', userAuthMiddleware, getUserById);
router.put('/:userId', userAuthMiddleware, isOwner, updateUser);

// User stats
router.get('/:userId/stats', userAuthMiddleware, getUserStats);

// Internal routes (for other services to update user stats)
router.post('/:userId/increment', userAuthMiddleware, incrementCounter);
router.post('/:userId/decrement', userAuthMiddleware, decrementCounter);

module.exports = router;
