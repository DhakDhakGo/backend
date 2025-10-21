const express = require('express');
const router = express.Router();

const {
  createComment,
  getCommentsForPost,
  updateComment,
  deleteComment,
  getCommentsByUser
} = require('../controllers/commentController');

const { authenticateToken } = require('../middleware/auth-middleware');

// Public routes
router.get('/post/:postId', getCommentsForPost);
router.get('/user/:userId', getCommentsByUser);

// Protected routes (require authentication)
router.post('/', authenticateToken, createComment);
router.put('/:id', authenticateToken, updateComment);
router.delete('/:id', authenticateToken, deleteComment);

module.exports = router;
