// User Repository
// Handles all Firestore operations for users

const { getFirestore } = require('../config/firestore');
const User = require('../models/User');
const admin = require('firebase-admin');

/**
 * Create or get user
 * @param {User} user - User instance
 * @returns {Promise<User>} Created or existing user
 */
const createOrGet = async (user) => {
  const db = getFirestore();
  const userId = user.userId;

  // Check if user exists
  const doc = await db.collection('users').doc(userId).get();
  
  if (doc.exists) {
    return User.fromFirestore(doc);
  }

  // Create new user
  await db.collection('users').doc(userId).set(user.toFirestore());
  const createdDoc = await db.collection('users').doc(userId).get();
  return User.fromFirestore(createdDoc);
};

/**
 * Find user by ID
 * @param {string} userId - User ID
 * @returns {Promise<User|null>} User instance or null
 */
const findById = async (userId) => {
  const db = getFirestore();
  const doc = await db.collection('users').doc(userId).get();
  return doc.exists ? User.fromFirestore(doc) : null;
};

/**
 * Update user
 * @param {string} userId - User ID
 * @param {Object} updateData - Data to update
 * @returns {Promise<User>} Updated user
 */
const update = async (userId, updateData) => {
  const db = getFirestore();
  
  const data = {
    ...updateData,
    updatedAt: new Date()
  };
  
  await db.collection('users').doc(userId).update(data);
  const updatedDoc = await db.collection('users').doc(userId).get();
  return User.fromFirestore(updatedDoc);
};

/**
 * Delete user
 * @param {string} userId - User ID
 * @returns {Promise<void>}
 */
const deleteUser = async (userId) => {
  const db = getFirestore();
  await db.collection('users').doc(userId).delete();
};

/**
 * Increment user counter
 * @param {string} userId - User ID
 * @param {string} counterType - Counter type
 * @returns {Promise<void>}
 */
const incrementCounter = async (userId, counterType) => {
  const db = getFirestore();
  await db.collection('users').doc(userId).update({
    [`metadata.${counterType}`]: admin.firestore.FieldValue.increment(1),
    updatedAt: new Date()
  });
};

/**
 * Decrement user counter
 * @param {string} userId - User ID
 * @param {string} counterType - Counter type
 * @returns {Promise<void>}
 */
const decrementCounter = async (userId, counterType) => {
  const db = getFirestore();
  await db.collection('users').doc(userId).update({
    [`metadata.${counterType}`]: admin.firestore.FieldValue.increment(-1),
    updatedAt: new Date()
  });
};

module.exports = {
  createOrGet,
  findById,
  update,
  deleteUser,
  incrementCounter,
  decrementCounter
};
