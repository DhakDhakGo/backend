const express = require('express');
const router = express.Router();

const {
  createExperience,
  getExperienceById,
  updateExperience,
  deleteExperience,
  getExperiencesByAuthor,
  getExperiences
} = require('../controllers/experienceController');

const { authenticateToken } = require('@DhakDhakGo/shared/auth-middleware');

// Public routes
router.get('/', getExperiences);
router.get('/:id', getExperienceById);
router.get('/user/:userId', getExperiencesByAuthor);

// Protected routes (require authentication)
router.post('/create', authenticateToken, createExperience);
router.put('/:id', authenticateToken, updateExperience);
router.delete('/:id', authenticateToken, deleteExperience);

module.exports = router;
