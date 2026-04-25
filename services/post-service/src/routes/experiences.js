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

const { authenticateToken } = require('@dhakdhakgo/shared');

// Public routes
router.get('/', getExperiences);
router.get('/:id', getExperienceById);
router.get('/user/:userId', getExperiencesByAuthor);

// Protected routes (require authentication)
router.post('/', authenticateToken, createExperience);
router.put('/:id', authenticateToken, updateExperience);
router.delete('/:id', authenticateToken, deleteExperience);

router.patch('/:id/increment-like', authenticateToken, incrementExperienceLikeCount);
router.patch('/:id/decrement-like', authenticateToken, decrementExperienceLikeCount);
router.patch('/:id/increment-comment', authenticateToken, incrementExperienceCommentCount);
router.patch('/:id/decrement-comment', authenticateToken, decrementExperienceCommentCount);

module.exports = router;
