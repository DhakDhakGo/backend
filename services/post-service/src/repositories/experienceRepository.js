// Experience Repository
// Handles Firestore operations for ownership experiences

const { createQueryBasedOnCriteria, getFirestoreDbInstance: getFirestore } = require('@dhakdhakgo/shared');
const OwnershipExperience = require('../models/OwnershipExperience');
const admin = require('firebase-admin');

/**
 * Create a new experience
 * @param {OwnershipExperience} experience - Experience instance
 * @returns {Promise<OwnershipExperience>} Created experience
 */
const create = async (experience) => {
  const db = getFirestore();
  const docRef = await db.collection('ownershipExperiences').add(experience.toFirestore());
  const doc = await db.collection('ownershipExperiences').doc(docRef.id).get();
  return OwnershipExperience.fromFirestore(doc);
};

/**
 * Find experience by ID
 * @param {string} experienceId - Experience ID
 * @returns {Promise<OwnershipExperience|null>} Experience instance or null
 */
const findById = async (experienceId) => {
  const db = getFirestore();
  const doc = await db.collection('ownershipExperiences').doc(experienceId).get();
  return doc.exists ? OwnershipExperience.fromFirestore(doc) : null;
};

/**
 * Find experience by criteria
 * @param {Object} criteria - Search criteria
 * @returns {Promise<Array<OwnershipExperience>>} Array of matching experiences
 */
const findByCriteria = async (criteria) => {
  const db = getFirestore();
  const experiencesRef = collection(db, 'ownershipExperiences');
  const q = await createQueryBasedOnCriteria(criteria, experiencesRef);
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => OwnershipExperience.fromFirestore(doc));
};

/**
 * Find all experiences with pagination
 * @param {number} limit - Number of experiences to fetch
 * @param {string} lastDocId - Last document ID for pagination
 * @returns {Promise<Array<OwnershipExperience>>} Array of experiences
 */
const findAll = async (limit = 20, lastDocId = null) => {
  const db = getFirestore();
  let query = db.collection('ownershipExperiences')
    .orderBy('createdAt', 'desc')
    .limit(limit);

  if (lastDocId) {
    const lastDoc = await db.collection('ownershipExperiences').doc(lastDocId).get();
    query = query.startAfter(lastDoc);
  }

  const snapshot = await query.get();
  return snapshot.docs.map(doc => OwnershipExperience.fromFirestore(doc));
};

/**
 * Find experiences by bike name
 * @param {string} bikeName - Bike name
 * @param {number} limit - Number of experiences to fetch
 * @returns {Promise<Array<OwnershipExperience>>} Array of experiences
 */
const findByBikeName = async (bikeName, limit = 20) => {
  const db = getFirestore();
  const snapshot = await db.collection('ownershipExperiences')
    .where('bikeName', '==', bikeName)
    .orderBy('createdAt', 'desc')
    .limit(limit)
    .get();

  return snapshot.docs.map(doc => OwnershipExperience.fromFirestore(doc));
};

/**
 * Find experiences by author
 * @param {string} authorId - Author ID
 * @param {number} limit - Number of experiences to fetch
 * @returns {Promise<Array<OwnershipExperience>>} Array of experiences
 */
const findByAuthor = async (authorId, limit = 20) => {
  const db = getFirestore();
  const snapshot = await db.collection('ownershipExperiences')
    .where('authorId', '==', authorId)
    .orderBy('createdAt', 'desc')
    .limit(limit)
    .get();

  return snapshot.docs.map(doc => OwnershipExperience.fromFirestore(doc));
};

/**
 * Update experience
 * @param {string} experienceId - Experience ID
 * @param {Object} updateData - Data to update
 * @returns {Promise<OwnershipExperience>} Updated experience
 */
const update = async (experienceId, updateData) => {
  const db = getFirestore();
  
  const data = {
    ...updateData,
    updatedAt: admin.firestore.FieldValue.serverTimestamp()
  };
  
  await db.collection('ownershipExperiences').doc(experienceId).update(data);
  const updatedDoc = await db.collection('ownershipExperiences').doc(experienceId).get();
  return OwnershipExperience.fromFirestore(updatedDoc);
};

/**
 * Delete experience
 * @param {string} experienceId - Experience ID
 * @returns {Promise<void>}
 */
const deleteExperience = async (experienceId) => {
  const db = getFirestore();
  await db.collection('ownershipExperiences').doc(experienceId).delete();
};

/**
 * Increment like count
 * @param {string} experienceId - Experience ID
 * @returns {Promise<void>}
 */
const incrementLikeCount = async (experienceId) => {
  const db = getFirestore();
  await db.collection('ownershipExperiences').doc(experienceId).update({
    likeCount: admin.firestore.FieldValue.increment(1)
  });
};

/**
 * Decrement like count
 * @param {string} experienceId - Experience ID
 * @returns {Promise<void>}
 */
const decrementLikeCount = async (experienceId) => {
  const db = getFirestore();
  await db.collection('ownershipExperiences').doc(experienceId).update({
    likeCount: admin.firestore.FieldValue.increment(-1)
  });
};

/**
 * Increment comment count
 * @param {string} experienceId - Experience ID
 * @returns {Promise<void>}
 */
const incrementCommentCount = async (experienceId) => {
  const db = getFirestore();
  await db.collection('ownershipExperiences').doc(experienceId).update({
    commentCount: admin.firestore.FieldValue.increment(1)
  });
};

/**
 * Decrement comment count
 * @param {string} experienceId - Experience ID
 * @returns {Promise<void>}
 */
const decrementCommentCount = async (experienceId) => {
  const db = getFirestore();
  await db.collection('ownershipExperiences').doc(experienceId).update({
    commentCount: admin.firestore.FieldValue.increment(-1)
  });
};

module.exports = {
  create,
  findById,
  findAll,
  findByBikeName,
  findByAuthor,
  findByCriteria,
  update,
  deleteExperience,
  incrementLikeCount,
  decrementLikeCount,
  incrementCommentCount,
  decrementCommentCount
};
