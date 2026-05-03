// Firebase Authentication Middleware
// This middleware can be used across all microservices to authenticate requests

const admin = require('firebase-admin');

let db;

function initializeFirebase() {
  // Initialize Firebase Admin SDK if not already initialized
  if (!admin.apps.length) {
    admin.initializeApp({
      credential: admin.credential.applicationDefault(),
      projectId: process.env.FIREBASE_PROJECT_ID,
      databaseURL: `https://${process.env.DATABASE_NAME}.firebaseio.com`
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
  const authHeader = req.headers.authorization;
  // If running locally or in an environment without API Gateway, use Authorization header
  if (authHeader && process.env.IS_AUTHENTICATED_VIA_AUTH_GATEWAY !== 'true') {
    try {
      const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN
      if (!token) {
        return res.status(401).json({ 
          error: 'Access token required',
          message: 'Please provide a valid Firebase ID token in the Authorization header'
        });
      }

      // Verify the Firebase ID token
      const decodedToken = await admin.auth().verifyIdToken(token);
      req.user = getUserInfo(decodedToken);
      next();
    } catch (error) {
      console.error('Authentication error:', error);
      return res.status(403).json({ 
        error: 'Invalid token',
        message: 'The provided token is invalid or expired'
      });
    }  
  } else if (process.env.IS_AUTHENTICATED_VIA_AUTH_GATEWAY === 'true') {
    // When deployed behind API Gateway, user info is passed in a custom header (base64 encoded JSON)
    const encodedUserInfo = req.headers['x-apigateway-api-userinfo'];
    if (encodedUserInfo) {
      try {
        // 1. Decode base64url to string, then parse to JSON
        const decodedUserInfo = JSON.parse(
          Buffer.from(encodedUserInfo, 'base64').toString('utf-8')
        );
        if (decodedUserInfo && decodedUserInfo.iss === 'https://securetoken.google.com/dhakdhakgo-472515') {
          req.user = getUserInfo(decodedUserInfo);
          next();
        } else {
          return res.status(400).json({
            error: 'Bad Request',
            message: 'Invalid issuer information in headers'
          });
        }
      } catch (error) {
        return res.status(400).json({
          error: 'Bad Request',
          message: 'Invalid user information format in headers'
        });
      }
    } else {
      console.error('Authentication error: Missing user information in headers');
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
*/

/**
 * Get user information from decoded token
 * @param {Object} user - Decoded Firebase token
 * @returns {Object} User information
 */
const getUserInfo = (user) => {
  return {
    uid: user.uid ?? user.sub,
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
  //optionalAuth,
  getUserInfo,
  isOwner,
  initializeFirebase,
  getFirestoreDbInstance: () => db
};
