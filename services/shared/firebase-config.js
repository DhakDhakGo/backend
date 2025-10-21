// Firebase Configuration for Microservices
// This file contains the Firebase configuration that can be shared across services

const firebaseConfig = {
  apiKey: process.env.FIREBASE_API_KEY,
  authDomain: `${process.env.FIREBASE_PROJECT_ID}.firebaseapp.com`,
  projectId: process.env.FIREBASE_PROJECT_ID,
  storageBucket: `${process.env.FIREBASE_PROJECT_ID}.appspot.com`,
  messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.FIREBASE_APP_ID
};

// Firebase Admin SDK Configuration
const adminConfig = {
  projectId: process.env.FIREBASE_PROJECT_ID,
  // Service account key will be provided via environment variables
  // or through the service account attached to Cloud Run
};

module.exports = {
  firebaseConfig,
  adminConfig
};
