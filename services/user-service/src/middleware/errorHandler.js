/**
 * Global error handling middleware
 * @param {Error} err - Error object
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next function
 */
const errorHandler = (err, req, res, next) => {
  console.error('Error:', err);

  // Firestore errors
  if (err.code === 5) {
    return res.status(404).json({
      success: false,
      error: 'user not found',
      message: err.message
    });
  }

  // Firebase Auth errors
  if (err.code && typeof err.code === 'string' && err.code.startsWith('auth/')) {
    return res.status(401).json({
      success: false,
      error: 'Authentication error',
      message: err.message
    });
  }

  // Default error response
  return res.status(err.status || 500).json({
    success: false,
    error: err.message || 'Internal server error',
    stack: err.stack
  });
};

module.exports = {
  errorHandler
};
