const express = require('express');
const router = express.Router();

const {
  createLike,
  deleteLike,
  getLikesForPost,
  checkUserLiked
} = require('../controllers/likeController');

const { authenticateToken } = require('@dhakdhakgo/shared');

// All like operations require authentication
router.post('/', authenticateToken, createLike);
router.delete('/:postId', authenticateToken, deleteLike);
router.get('/post/:postId', getLikesForPost);
router.get('/check/:postId', authenticateToken, checkUserLiked);

module.exports = router;
