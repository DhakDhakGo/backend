// Like Repository
// Handles Firestore operations for likes

const { getFirestoreDbInstance: getFirestore } = require('@dhakdhakgo/shared');
const Like = require('../models/Like');

/**
 * Create a new like
 * @param {Like} like - Like instance
 * @returns {Promise<Like>} Created like
 */
const create = async (like) => {
  const db = getFirestore();
  const docRef = await db.collection('likes').add(like.toFirestore());
  const doc = await db.collection('likes').doc(docRef.id).get();
  return Like.fromFirestore(doc);
};

/**
 * Find like by ID
 * @param {string} likeId - Like ID
 * @returns {Promise<Like|null>} Like instance or null
 */
const findById = async (likeId) => {
  const db = getFirestore();
  const doc = await db.collection('likes').doc(likeId).get();
  return doc.exists ? Like.fromFirestore(doc) : null;
};

/**
 * Find like by user and target
 * @param {string} userId - User ID
 * @param {string} targetType - Target type (review/experience)
 * @param {string} targetId - Target ID
 * @returns {Promise<Like|null>} Like instance or null
 */
const findByUserAndTarget = async (userId, targetType, targetId) => {
  const db = getFirestore();
  const snapshot = await db.collection('likes')
    .where('userId', '==', userId)
    .where('targetType', '==', targetType)
    .where('targetId', '==', targetId)
    .limit(1)
    .get();

  return snapshot.empty ? null : Like.fromFirestore(snapshot.docs[0]);
};

/**
 * Find all likes by target
 * @param {string} targetType - Target type
 * @param {string} targetId - Target ID
 * @param {number} limit - Number of likes to fetch
 * @returns {Promise<Array<Like>>} Array of likes
 */
const findByTarget = async (targetType, targetId, limit = 20) => {
  const db = getFirestore();
  const snapshot = await db.collection('likes')
    .where('targetType', '==', targetType)
    .where('targetId', '==', targetId)
    .orderBy('createdAt', 'desc')
    .limit(limit)
    .get();

  return snapshot.docs.map(doc => Like.fromFirestore(doc));
};

/**
 * Find all likes by user
 * @param {string} userId - User ID
 * @param {number} limit - Number of likes to fetch
 * @returns {Promise<Array<Like>>} Array of likes
 */
const findByUser = async (userId, limit = 20) => {
  const db = getFirestore();
  const snapshot = await db.collection('likes')
    .where('userId', '==', userId)
    .orderBy('createdAt', 'desc')
    .limit(limit)
    .get();

  return snapshot.docs.map(doc => Like.fromFirestore(doc));
};

/**
 * Delete like
 * @param {string} likeId - Like ID
 * @returns {Promise<void>}
 */
const deleteLike = async (likeId) => {
  const db = getFirestore();
  await db.collection('likes').doc(likeId).delete();
};

/**
 * Count likes for target
 * @param {string} targetType - Target type
 * @param {string} targetId - Target ID
 * @returns {Promise<number>} Like count
 */
const countByTarget = async (targetType, targetId) => {
  const db = getFirestore();
  const snapshot = await db.collection('likes')
    .where('targetType', '==', targetType)
    .where('targetId', '==', targetId)
    .get();

  return snapshot.size;
};

module.exports = {
  create,
  findById,
  findByUserAndTarget,
  findByTarget,
  findByUser,
  deleteLike,
  countByTarget
};
