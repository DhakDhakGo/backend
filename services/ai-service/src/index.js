const express = require('express');
const cors = require('cors');
const { initializeFirestore } = require('./config/firestore');
const aiRoutes = require('./routes/ai');
const { errorHandler } = require('./middleware/errorHandler');

const app = express();
const PORT = process.env.PORT || 3002;

// Initialize Firestore
initializeFirestore();

// Middleware
app.use(cors());
app.use(express.json());

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ 
    status: 'healthy', 
    service: 'ai-service',
    timestamp: new Date().toISOString(),
    port: PORT
  });
});

// Hello World endpoint
app.get('/', (req, res) => {
  res.json({ 
    message: 'Hello from AI Service!',
    service: 'ai-service',
    version: '1.0.0',
    powered_by: 'Google Gemini API',
    endpoints: {
      getBikeInsights: 'POST /api/ai/bike-insights',
      getBikeInsightsByName: 'GET /api/ai/bike-insights/:bikeName',
      compareBikes: 'POST /api/ai/compare-bikes',
      getComparisonSummary: 'POST /api/ai/compare-summary'
    }
  });
});

// API Routes
app.use('/api/ai', aiRoutes);

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
  console.log(`🚀 AI Service running on port ${PORT}`);
  console.log(`📊 Health check: http://localhost:${PORT}/health`);
});

module.exports = app;