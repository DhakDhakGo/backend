// Firebase Authentication Middleware
// This middleware can be used across all microservices to authenticate requests

const admin = require('firebase-admin');

// Initialize Firebase Admin SDK if not already initialized
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.applicationDefault(),
    projectId: process.env.FIREBASE_PROJECT_ID || 'dhakdhakgo-472515'
  });
}

/**
 * Middleware to authenticate Firebase ID tokens
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next function
 */
const authenticateToken = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

    if (!token) {
      return res.status(401).json({ 
        error: 'Access token required',
        message: 'Please provide a valid Firebase ID token in the Authorization header'
      });
    }

    // Verify the Firebase ID token
    const decodedToken = await admin.auth().verifyIdToken(token);
    req.user = decodedToken;
    next();
  } catch (error) {
    console.error('Authentication error:', error);
    return res.status(403).json({ 
      error: 'Invalid token',
      message: 'The provided token is invalid or expired'
    });
  }
};

/**
 * Optional authentication middleware - doesn't fail if no token provided
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next function
 */
const optionalAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(' ')[1];

    if (token) {
      const decodedToken = await admin.auth().verifyIdToken(token);
      req.user = decodedToken;
    }
    
    next();
  } catch (error) {
    // If token is invalid, continue without authentication
    console.warn('Optional auth failed:', error.message);
    next();
  }
};

/**
 * Get user information from decoded token
 * @param {Object} user - Decoded Firebase token
 * @returns {Object} User information
 */
const getUserInfo = (user) => {
  return {
    uid: user.uid,
    email: user.email,
    emailVerified: user.email_verified,
    name: user.name,
    picture: user.picture
  };
};

/**
 * Middleware to check if user is accessing their own resource
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next function
 */
const isOwner = (req, res, next) => {
  const userId = req.params.userId;
  
  if (req.user && req.user.uid === userId) {
    next();
  } else {
    res.status(403).json({
      success: false,
      error: 'Forbidden',
      message: 'You can only access your own resources'
    });
  }
};

module.exports = {
  authenticateToken,
  optionalAuth,
  getUserInfo,
  isOwner,
  admin
};
