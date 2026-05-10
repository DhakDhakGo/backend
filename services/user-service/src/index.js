const express = require('express');
const cors = require('cors');

const userRoutes = require('./routes/users');
const { errorHandler } = require('./middleware/errorHandler');
const { initializeFirebase, ContextHolder } = require('@dhakdhakgo/shared');

const app = express();
const PORT = process.env.PORT || 3004;

const isLocal = process.env.NODE_ENV === 'local';

// Initialize firebase
initializeFirebase();

ContextHolder.initialize();

// Middleware
app.use(cors());
app.use(express.json());

app.use(ContextHolder.contextMiddleware)

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ 
    status: 'healthy', 
    service: 'user-service',
    timestamp: new Date().toISOString(),
    port: PORT
  });
});

// Public endpoint
app.get('/', (req, res) => {
  res.json({ 
    message: 'Hello from User Service!',
    service: 'user-service',
    version: '1.0.0',
    endpoints: {
      register: 'POST /api/users/register',
      getCurrentUser: 'GET /api/users/me',
      getUserById: 'GET /api/users/:userId',
      updateUser: 'PUT /api/users/:userId',
      getUserStats: 'GET /api/users/:userId/stats'
    }
  });
});

// Routes
app.use('/api/users', userRoutes);

if (!isLocal) {
  app.use(extractUserInfoErrorHandler);
}

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
  console.log(`🚀 User Service running on port ${PORT}`);
  console.log(`📊 Health check: http://localhost:${PORT}/health`);
  console.log(`👤 User API: http://localhost:${PORT}/api/users`);
});

module.exports = app;
