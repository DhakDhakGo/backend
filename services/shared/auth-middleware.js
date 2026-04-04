// Firebase Authentication Middleware
// This middleware can be used across all microservices to authenticate requests

const admin = require('firebase-admin');

let db;

function initializeFirebase() {
  // Initialize Firebase Admin SDK if not already initialized
  if (!admin.apps.length) {
    admin.initializeApp({
      credential: admin.credential.applicationDefault(),
      projectId: process.env.FIREBASE_PROJECT_ID
    });
  }
  db = admin.app().firestore();
}

/**
 * Middleware to authenticate Firebase ID tokens
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next function
 */
const authenticateToken = async (req, res, next) => {
  if (process.env.NODE_ENV === 'local') {
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
  } else {
    const encodedUserInfo = req.headers['x-apigateway-api-userinfo'];
    if (encodedUserInfo) {
      // 1. Decode base64url to string, then parse to JSON
      const decodedUserInfo = JSON.parse(
        Buffer.from(encodedUserInfo, 'base64').toString('utf-8')
      );
      req.user = decodedUserInfo; // Attach user info to request for downstream use
      next();
    } else {
      return res.status(401).json({
        error: 'Unauthorized',
        message: 'User information is missing in the request headers'
      });
    }
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
  initializeFirebase,
  getFirestoreDbInstance: () => db
};
