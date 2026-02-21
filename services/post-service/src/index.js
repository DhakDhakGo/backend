const express = require('express');
const cors = require('cors');
const { authenticateToken, optionalAuth, getUserInfo } = require('@dhak/shared/auth-middleware');
const { initializeFirestore } = require('./config/firestore');
const reviewRoutes = require('./routes/reviews');
const experienceRoutes = require('./routes/experiences');
const { errorHandler } = require('./middleware/errorHandler');

const app = express();
const PORT = process.env.PORT || 3001;

// Initialize Firestore
initializeFirestore();

// Middleware
app.use(cors());
app.use(express.json());

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ 
    status: 'healthy', 
    service: 'post-service',
    timestamp: new Date().toISOString(),
    port: PORT
  });
});

// Public endpoint (no authentication required)
app.get('/', (req, res) => {
  res.json({ 
    message: 'Hello from Post Service!',
    service: 'post-service',
    version: '1.0.0',
    authentication: 'Firebase Authentication configured'
  });
});

// Authentication test endpoint (requires valid Firebase token)
app.get('/auth-test', authenticateToken, (req, res) => {
  res.json({
    message: 'Authentication successful!',
    user: getUserInfo(req.user),
    service: 'post-service',
    timestamp: new Date().toISOString()
  });
});

// Optional authentication endpoint (works with or without token)
app.get('/optional-auth', optionalAuth, (req, res) => {
  const response = {
    message: 'Optional authentication endpoint',
    service: 'post-service',
    timestamp: new Date().toISOString()
  };

  if (req.user) {
    response.user = getUserInfo(req.user);
    response.message += ' - Authenticated user';
  } else {
    response.message += ' - No authentication provided';
  }

  res.json(response);
});

// Protected posts endpoint (requires authentication)
app.get('/posts', authenticateToken, (req, res) => {
  res.json({
    message: 'Posts endpoint - Authentication required',
    user: getUserInfo(req.user),
    posts: [], // Will be implemented later
    service: 'post-service'
  });
});

// API Routes
app.use('/api/reviews', reviewRoutes);
app.use('/api/experiences', experienceRoutes);

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
  console.log(`🚀 Post Service running on port ${PORT}`);
  console.log(`📊 Health check: http://localhost:${PORT}/health`);
});

module.exports = app;