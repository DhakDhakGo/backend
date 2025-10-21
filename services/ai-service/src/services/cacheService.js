const { getFirestore } = require('../config/firestore');

/**
 * Get data from cache
 * @param {string} cacheKey - Cache key
 * @returns {Promise<Object|null>} Cached data or null
 */
const getFromCache = async (cacheKey) => {
  try {
    const db = getFirestore();
    const doc = await db.collection('aiInsightsCache').doc(cacheKey).get();

    if (!doc.exists) {
      return null;
    }

    const cacheData = doc.data();
    
    // Check if cache is expired
    const now = new Date();
    const expiresAt = cacheData.expiresAt.toDate();
    
    if (now > expiresAt) {
      console.log('⏰ Cache expired for:', cacheKey);
      // Delete expired cache
      await db.collection('aiInsightsCache').doc(cacheKey).delete();
      return null;
    }

    // Increment hit count
    await db.collection('aiInsightsCache').doc(cacheKey).update({
      hitCount: (cacheData.hitCount || 0) + 1,
      lastAccessedAt: now
    });

    return cacheData.data;
  } catch (error) {
    console.error('Cache read error:', error);
    return null; // Return null on cache error, don't fail the request
  }
};

/**
 * Save data to cache
 * @param {string} cacheKey - Cache key
 * @param {Object} data - Data to cache
 * @param {number} expiryDays - Number of days to cache (default: 7)
 */
const saveToCache = async (cacheKey, data, expiryDays = 7) => {
  try {
    const db = getFirestore();
    const now = new Date();
    const expiresAt = new Date(now.getTime() + expiryDays * 24 * 60 * 60 * 1000);

    await db.collection('aiInsightsCache').doc(cacheKey).set({
      cacheKey,
      data,
      createdAt: now,
      expiresAt,
      lastAccessedAt: now,
      hitCount: 0,
      expiryDays
    });

    console.log('💾 Saved to cache:', cacheKey);
  } catch (error) {
    console.error('Cache write error:', error);
    // Don't fail if caching fails
  }
};

/**
 * Clear cache for a specific key
 * @param {string} cacheKey - Cache key
 */
const clearCache = async (cacheKey) => {
  try {
    const db = getFirestore();
    await db.collection('aiInsightsCache').doc(cacheKey).delete();
    console.log('🗑️ Cache cleared:', cacheKey);
  } catch (error) {
    console.error('Cache clear error:', error);
  }
};

/**
 * Get cache statistics
 */
const getCacheStats = async () => {
  try {
    const db = getFirestore();
    const snapshot = await db.collection('aiInsightsCache')
      .orderBy('hitCount', 'desc')
      .limit(10)
      .get();

    const stats = snapshot.docs.map(doc => ({
      cacheKey: doc.data().cacheKey,
      hitCount: doc.data().hitCount,
      createdAt: doc.data().createdAt,
      expiresAt: doc.data().expiresAt
    }));

    return stats;
  } catch (error) {
    console.error('Cache stats error:', error);
    return [];
  }
};

module.exports = {
  getFromCache,
  saveToCache,
  clearCache,
  getCacheStats
};
