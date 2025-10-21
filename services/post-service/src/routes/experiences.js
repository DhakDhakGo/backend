const express = require('express');
const router = express.Router();

const {
  createExperience,
  getAllExperiences,
  getExperience,
  updateExperience,
  deleteExperience,
  getExperiencesByUser
} = require('../controllers/experienceController');

const { authenticateToken } = require('../middleware/auth-middleware');

// Public routes
router.get('/', getAllExperiences);
router.get('/:id', getExperience);
router.get('/user/:userId', getExperiencesByUser);

// Protected routes (require authentication)
router.post('/', authenticateToken, createExperience);
router.put('/:id', authenticateToken, updateExperience);
router.delete('/:id', authenticateToken, deleteExperience);

module.exports = router;
