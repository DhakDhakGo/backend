/**
 * Global error handling middleware
 * @param {Error} err - Error object
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next function
 */
const errorHandler = (err, req, res, next) => {
  console.error('Error:', err);

  // Gemini API errors
  if (err.message && err.message.includes('Gemini')) {
    return res.status(503).json({
      success: false,
      error: 'AI service temporarily unavailable',
      message: 'Please try again later'
    });
  }

  // JSON parsing errors
  if (err instanceof SyntaxError && err.message.includes('JSON')) {
    return res.status(500).json({
      success: false,
      error: 'AI response format error',
      message: 'Failed to parse AI response'
    });
  }

  // Firestore errors
  if (err.code === 5) {
    return res.status(404).json({
      success: false,
      error: 'Not found',
      message: err.message
    });
  }

  // Default error response
  res.status(err.status || 500).json({
    success: false,
    error: err.message || 'Internal server error',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
};

module.exports = {
  errorHandler
};
