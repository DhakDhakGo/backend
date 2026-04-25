// Cache Repository
// Handles Firestore operations for AI response caching

const { getFirebaseDbInstance: getFirestore } = require('@dhakdhakgo/shared');

/**
 * Get cached data by key
 * @param {string} jobId - Cache key
 * @returns {Promise<Object|null>} Cached data or null
 */
const get = async (jobId) => {
  const db = getFirestore();
  const doc = await db.collection('aiData').doc(jobId).get();
  
  if (!doc.exists) {
    return null;
  }
  
  const data = doc.data();
  
  // Check if cache has expired
  if (data.expiresAt && data.expiresAt.toDate() < new Date()) {
    return null;
  }
  
  return data.data;
};

/**
 * Save data to cache
 * @param {string} jobId - Cache key
 * @param {Object} data - Data to cache
 * @param {number} ttlDays - Time to live in days
 * @returns {Promise<void>}
 */
const save = async (jobId, data, ttlDays = 90) => {
  const db = getFirestore();
  
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + ttlDays);
  
  await db.collection('aiData').doc(jobId).set({
    data,
    createdAt: new Date(),
    expiresAt,
    ttlDays
  });
};

/**
 * Delete cached data
 * @param {string} jobId - Cache key
 * @returns {Promise<void>}
 */
const deleteCache = async (jobId) => {
  const db = getFirestore();
  await db.collection('aiData').doc(jobId).delete();
};

module.exports = {
  get,
  save,
  deleteCache
};
