const express = require('express');
const cors = require('cors');
const { initializeFirestore } = require('./config/firestore');
const likeRoutes = require('./routes/likes');
const commentRoutes = require('./routes/comments');
const { errorHandler } = require('./middleware/errorHandler');

const app = express();
const PORT = process.env.PORT || 3003;

// Initialize Firestore
initializeFirestore();

// Middleware
app.use(cors());
app.use(express.json());

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ 
    status: 'healthy', 
    service: 'interaction-service',
    timestamp: new Date().toISOString(),
    port: PORT
  });
});

// Hello World endpoint
app.get('/', (req, res) => {
  res.json({ 
    message: 'Hello from Interaction Service!',
    service: 'interaction-service',
    version: '1.0.0',
    endpoints: {
      likes: 'POST /api/likes',
      unlike: 'DELETE /api/likes/:postId',
      createComment: 'POST /api/comments',
      getComments: 'GET /api/comments/post/:postId'
    }
  });
});

// API Routes
app.use('/api/likes', likeRoutes);
app.use('/api/comments', commentRoutes);

// Error handling middleware
app.use(errorHandler);

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ 
    success: false,
    error: 'Route not found',
    path: req.originalUrl 
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Interaction Service running on port ${PORT}`);
  console.log(`📊 Health check: http://localhost:${PORT}/health`);
});

module.exports = app;