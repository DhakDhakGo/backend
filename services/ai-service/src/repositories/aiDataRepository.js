// Cache Repository
// Handles Firestore operations for AI response caching

const { getFirestoreDbInstance: getFirestore } = require('@dhakdhakgo/shared');

/**
 * Get cached data by key
 * @param {string} cacheKey - Cache key
 * @returns {Promise<Object|null>} Cached data or null
 */
const get = async (cacheKey) => {
  const db = getFirestore();
  const doc = await db.collection('aiData').doc(cacheKey).get();
  
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
 * @param {string} cacheKey - Cache key
 * @param {Object} data - Data to cache
 * @param {number} ttlDays - Time to live in days
 * @returns {Promise<void>}
 */
const save = async (cacheKey, data, ttlDays = 90) => {
  const db = getFirestore();
  
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + ttlDays);
  
  await db.collection('aiCache').doc(cacheKey).set({
    data,
    createdAt: new Date(),
    expiresAt,
    ttlDays
  });
};

/**
 * Delete cached data
 * @param {string} cacheKey - Cache key
 * @returns {Promise<void>}
 */
const deleteCache = async (cacheKey) => {
  const db = getFirestore();
  await db.collection('aiCache').doc(cacheKey).delete();
};

module.exports = {
  get,
  save,
  deleteCache
};
