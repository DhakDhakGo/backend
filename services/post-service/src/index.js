const express = require('express');
const cors = require('cors');
const { initializeFirebase, ContextHolder } = require('@dhakdhakgo/shared');
const reviewRoutes = require('./routes/reviews');
const experienceRoutes = require('./routes/experiences');
const { errorHandler } = require('./middleware/errorHandler');

const app = express();
const PORT = process.env.PORT || 3001;

const isLocal = process.env.NODE_ENV === 'local';

// Initialize firebase
initializeFirebase();

ContextHolder.initialize();

// Middleware
app.use(cors());
app.use(express.json());

app.use(ContextHolder.contextMiddleware);

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ 
    status: 'healthy', 
    service: 'post-service',
    timestamp: new Date().toISOString(),
    port: PORT
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