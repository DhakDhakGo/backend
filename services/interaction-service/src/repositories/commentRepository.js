// Comment Repository
// Handles Firestore operations for comments

const { getFirestore } = require('../config/firestore');
const Comment = require('../models/Comment');
const admin = require('firebase-admin');

/**
 * Create a new comment
 * @param {Comment} comment - Comment instance
 * @returns {Promise<Comment>} Created comment
 */
const create = async (comment) => {
  const db = getFirestore();
  const docRef = await db.collection('comments').add(comment.toFirestore());
  const doc = await db.collection('comments').doc(docRef.id).get();
  return Comment.fromFirestore(doc);
};

/**
 * Find comment by ID
 * @param {string} commentId - Comment ID
 * @returns {Promise<Comment|null>} Comment instance or null
 */
const findById = async (commentId) => {
  const db = getFirestore();
  const doc = await db.collection('comments').doc(commentId).get();
  return doc.exists ? Comment.fromFirestore(doc) : null;
};

/**
 * Find all comments by target
 * @param {string} targetType - Target type (review/experience)
 * @param {string} targetId - Target ID
 * @param {number} limit - Number of comments to fetch
 * @returns {Promise<Array<Comment>>} Array of comments
 */
const findByTarget = async (targetType, targetId, limit = 20) => {
  const db = getFirestore();
  const snapshot = await db.collection('comments')
    .where('targetType', '==', targetType)
    .where('targetId', '==', targetId)
    .orderBy('createdAt', 'desc')
    .limit(limit)
    .get();

  return snapshot.docs.map(doc => Comment.fromFirestore(doc));
};

/**
 * Find all comments by user
 * @param {string} userId - User ID
 * @param {number} limit - Number of comments to fetch
 * @returns {Promise<Array<Comment>>} Array of comments
 */
const findByUser = async (userId, limit = 20) => {
  const db = getFirestore();
  const snapshot = await db.collection('comments')
    .where('userId', '==', userId)
    .orderBy('createdAt', 'desc')
    .limit(limit)
    .get();

  return snapshot.docs.map(doc => Comment.fromFirestore(doc));
};

/**
 * Find replies to a comment
 * @param {string} parentCommentId - Parent comment ID
 * @param {number} limit - Number of replies to fetch
 * @returns {Promise<Array<Comment>>} Array of reply comments
 */
const findReplies = async (parentCommentId, limit = 20) => {
  const db = getFirestore();
  const snapshot = await db.collection('comments')
    .where('parentCommentId', '==', parentCommentId)
    .orderBy('createdAt', 'asc')
    .limit(limit)
    .get();

  return snapshot.docs.map(doc => Comment.fromFirestore(doc));
};

/**
 * Update comment
 * @param {string} commentId - Comment ID
 * @param {Object} updateData - Data to update
 * @returns {Promise<Comment>} Updated comment
 */
const update = async (commentId, updateData) => {
  const db = getFirestore();
  
  const data = {
    ...updateData,
    updatedAt: admin.firestore.FieldValue.serverTimestamp()
  };
  
  await db.collection('comments').doc(commentId).update(data);
  const updatedDoc = await db.collection('comments').doc(commentId).get();
  return Comment.fromFirestore(updatedDoc);
};

/**
 * Delete comment
 * @param {string} commentId - Comment ID
 * @returns {Promise<void>}
 */
const deleteComment = async (commentId) => {
  const db = getFirestore();
  await db.collection('comments').doc(commentId).delete();
};

/**
 * Increment like count
 * @param {string} commentId - Comment ID
 * @returns {Promise<void>}
 */
const incrementLikeCount = async (commentId) => {
  const db = getFirestore();
  await db.collection('comments').doc(commentId).update({
    likeCount: admin.firestore.FieldValue.increment(1)
  });
};

/**
 * Decrement like count
 * @param {string} commentId - Comment ID
 * @returns {Promise<void>}
 */
const decrementLikeCount = async (commentId) => {
  const db = getFirestore();
  await db.collection('comments').doc(commentId).update({
    likeCount: admin.firestore.FieldValue.increment(-1)
  });
};

/**
 * Increment reply count
 * @param {string} commentId - Comment ID
 * @returns {Promise<void>}
 */
const incrementReplyCount = async (commentId) => {
  const db = getFirestore();
  await db.collection('comments').doc(commentId).update({
    replyCount: admin.firestore.FieldValue.increment(1)
  });
};

/**
 * Decrement reply count
 * @param {string} commentId - Comment ID
 * @returns {Promise<void>}
 */
const decrementReplyCount = async (commentId) => {
  const db = getFirestore();
  await db.collection('comments').doc(commentId).update({
    replyCount: admin.firestore.FieldValue.increment(-1)
  });
};

module.exports = {
  create,
  findById,
  findByTarget,
  findByUser,
  findReplies,
  update,
  deleteComment,
  incrementLikeCount,
  decrementLikeCount,
  incrementReplyCount,
  decrementReplyCount
};
