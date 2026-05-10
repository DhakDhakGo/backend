const express = require('express');
const router = express.Router();

const {
  createExperience,
  getExperienceById,
  updateExperience,
  deleteExperience,
  getExperiencesByAuthor,
  getExperiences,
  incrementExperienceLikeCount,
  decrementExperienceLikeCount,
  incrementExperienceCommentCount,
  decrementExperienceCommentCount

} = require('../controllers/experienceController');

const { authenticateUserToken, extractUserInfoFromHeaders } = require('@dhakdhakgo/shared');

const userAuthMiddleware = process.env.NODE_ENV === 'local' ? authenticateUserToken : extractUserInfoFromHeaders

// Public routes
router.get('/', userAuthMiddleware, getExperiences);
router.get('/:id', userAuthMiddleware, getExperienceById);
router.get('/user/:userId', userAuthMiddleware, getExperiencesByAuthor);

// Protected routes (require authentication)
router.post('/', userAuthMiddleware, createExperience);
router.put('/:id', userAuthMiddleware, updateExperience);
router.delete('/:id', userAuthMiddleware, deleteExperience);

router.patch('/:id/increment-like', userAuthMiddleware, incrementExperienceLikeCount);
router.patch('/:id/decrement-like', userAuthMiddleware, decrementExperienceLikeCount);
router.patch('/:id/increment-comment', userAuthMiddleware, incrementExperienceCommentCount);
router.patch('/:id/decrement-comment', userAuthMiddleware, decrementExperienceCommentCount);

module.exports = router;
