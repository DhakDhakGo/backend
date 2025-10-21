const { Firestore } = require('@google-cloud/firestore');

let db;

const initializeFirestore = () => {
  try {
    db = new Firestore({
      projectId: process.env.FIREBASE_PROJECT_ID || 'dhakdhakgo-472515',
    });
    
    console.log('✅ Firestore initialized successfully');
    return db;
  } catch (error) {
    console.error('❌ Failed to initialize Firestore:', error);
    throw error;
  }
};

const getFirestore = () => {
  if (!db) {
    throw new Error('Firestore not initialized. Call initializeFirestore() first.');
  }
  return db;
};

module.exports = {
  initializeFirestore,
  getFirestore
};
