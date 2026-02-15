// Review Repository
// Handles Firestore operations for bike reviews

const { getFirestore } = require('../config/firestore');
const { collection, getDocs } = require("firebase/firestore");
const BikeReview = require('../models/BikeReview');
const admin = require('firebase-admin');
const { createQueryBasedOnCriteria } = require('#shared/utils/queryUtils');

/**
 * Create a new review
 * @param {BikeReview} review - Review instance
 * @returns {Promise<BikeReview>} Created review
 */
const create = async (review) => {
  const db = getFirestore();
  const docRef = await db.collection('bikeReviews').add(review.toFirestore());
  const doc = await db.collection('bikeReviews').doc(docRef.id).get();
  return BikeReview.fromFirestore(doc);
};

/**
 * Find review by ID
 * @param {string} reviewId - Review ID
 * @returns {Promise<BikeReview|null>} Review instance or null
 */
const findById = async (reviewId) => {
  const db = getFirestore();
  const doc = await db.collection('bikeReviews').doc(reviewId).get();
  return doc.exists ? BikeReview.fromFirestore(doc) : null;
};

const findByCriteria = async (criteria) => {
  const db = getFirestore();
  const bikeReviewsRef = collection(db, 'bikeReviews');
  const q = await createQueryBasedOnCriteria(criteria, bikeReviewsRef);
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => BikeReview.fromFirestore(doc));
};

/**
 * Find all reviews with pagination
 * @param {number} limit - Number of reviews to fetch
 * @param {string} lastDocId - Last document ID for pagination
 * @returns {Promise<Array<BikeReview>>} Array of reviews
 */
const findAll = async (limit = 20, lastDocId = null) => {
  const db = getFirestore();
  let query = db.collection('bikeReviews')
    .orderBy('createdAt', 'desc')
    .limit(limit);

  if (lastDocId) {
    const lastDoc = await db.collection('bikeReviews').doc(lastDocId).get();
    query = query.startAfter(lastDoc);
  }

  const snapshot = await query.get();
  return snapshot.docs.map(doc => BikeReview.fromFirestore(doc));
};

/**
 * Find reviews by bike name
 * @param {string} bikeName - Bike name
 * @param {number} limit - Number of reviews to fetch
 * @returns {Promise<Array<BikeReview>>} Array of reviews
 */
const findByBikeName = async (bikeName, limit = 20) => {
  const db = getFirestore();
  const snapshot = await db.collection('bikeReviews')
    .where('bikeName', '==', bikeName)
    .orderBy('createdAt', 'desc')
    .limit(limit)
    .get();

  return snapshot.docs.map(doc => BikeReview.fromFirestore(doc));
};

/**
 * Find reviews by author
 * @param {string} authorId - Author ID
 * @param {number} limit - Number of reviews to fetch
 * @returns {Promise<Array<BikeReview>>} Array of reviews
 */
const findByAuthor = async (authorId, limit = 20) => {
  const db = getFirestore();
  const snapshot = await db.collection('bikeReviews')
    .where('authorId', '==', authorId)
    .orderBy('createdAt', 'desc')
    .limit(limit)
    .get();

  return snapshot.docs.map(doc => BikeReview.fromFirestore(doc));
};

/**
 * Update review
 * @param {string} reviewId - Review ID
 * @param {Object} updateData - Data to update
 * @returns {Promise<BikeReview>} Updated review
 */
const update = async (reviewId, updateData) => {
  const db = getFirestore();
  
  const data = {
    ...updateData,
    updatedAt: admin.firestore.FieldValue.serverTimestamp()
  };
  
  await db.collection('bikeReviews').doc(reviewId).update(data);
  const updatedDoc = await db.collection('bikeReviews').doc(reviewId).get();
  return BikeReview.fromFirestore(updatedDoc);
};

/**
 * Delete review
 * @param {string} reviewId - Review ID
 * @returns {Promise<void>}
 */
const deleteReview = async (reviewId) => {
  const db = getFirestore();
  await db.collection('bikeReviews').doc(reviewId).delete();
};

/**
 * Increment like count
 * @param {string} reviewId - Review ID
 * @returns {Promise<void>}
 */
const incrementLikeCount = async (reviewId) => {
  const db = getFirestore();
  await db.collection('bikeReviews').doc(reviewId).update({
    likeCount: admin.firestore.FieldValue.increment(1)
  });
};

/**
 * Decrement like count
 * @param {string} reviewId - Review ID
 * @returns {Promise<void>}
 */
const decrementLikeCount = async (reviewId) => {
  const db = getFirestore();
  await db.collection('bikeReviews').doc(reviewId).update({
    likeCount: admin.firestore.FieldValue.increment(-1)
  });
};

/**
 * Increment comment count
 * @param {string} reviewId - Review ID
 * @returns {Promise<void>}
 */
const incrementCommentCount = async (reviewId) => {
  const db = getFirestore();
  await db.collection('bikeReviews').doc(reviewId).update({
    commentCount: admin.firestore.FieldValue.increment(1)
  });
};

/**
 * Decrement comment count
 * @param {string} reviewId - Review ID
 * @returns {Promise<void>}
 */
const decrementCommentCount = async (reviewId) => {
  const db = getFirestore();
  await db.collection('bikeReviews').doc(reviewId).update({
    commentCount: admin.firestore.FieldValue.increment(-1)
  });
};

module.exports = {
  create,
  findById,
  findAll,
  findByCriteria,
  findByBikeName,
  findByAuthor,
  update,
  deleteReview,
  incrementLikeCount,
  decrementLikeCount,
  incrementCommentCount,
  decrementCommentCount
};
