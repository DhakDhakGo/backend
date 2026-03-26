// User Model
// Represents a user profile in the system

const { Timestamp } = require('@google-cloud/firestore');

class User {
  constructor(data = {}) {
    this.userId = data.userId; // Firebase Auth UID
    this.email = data.email;
    this.displayName = data.displayName || '';
    this.photoURL = data.photoURL || '';
    this.userRole = data.userRole || 'user'; // user, admin, etc.
    
    // Metadata
    this.createdAt = data.createdAt || Timestamp.now();
    this.updatedAt = data.updatedAt || Timestamp.now();
    
    // User statistics
    this.metadata = data.metadata || {
      totalReviews: 0,
      totalExperiences: 0,
      totalLikes: 0,
      totalComments: 0
    };
  }

  /**
   * Convert to Firestore document format
   * @returns {Object} Firestore document data
   */
  toFirestore() {
    const data = { ...this };
    delete data.userId; // Don't store ID in document
    return data;
  }

  /**
   * Create from Firestore document
   * @param {Object} doc - Firestore document snapshot
   * @returns {User} User instance
   */
  static fromFirestore(doc) {
    const data = doc.data();
    return new User({
      userId: doc.id,
      ...data
    });
  }

  /**
   * Create from Firebase Auth user
   * @param {Object} firebaseUser - Firebase Auth user object
   * @returns {User} User instance
   */
  static fromFirebaseAuth(firebaseUser) {
    return new User({
      userId: firebaseUser.uid,
      email: firebaseUser.email,
      displayName: firebaseUser.name || firebaseUser.displayName || '',
      photoURL: firebaseUser.picture || firebaseUser.photoURL || ''
    });
  }

  /**
   * Validate user data
   * @returns {Object} Validation result
   */
  validate() {
    const errors = [];

    if (!this.userId) errors.push('User ID is required');
    if (!this.email) errors.push('Email is required');

    return {
      valid: errors.length === 0,
      errors
    };
  }

  /**
   * Increment metadata counter
   * @param {string} type - Type of counter (totalReviews, totalExperiences, etc.)
   */
  incrementCounter(type) {
    if (this.metadata[type] !== undefined) {
      this.metadata[type]++;
      this.updatedAt = Timestamp.now();
    }
  }

  /**
   * Decrement metadata counter
   * @param {string} type - Type of counter
   */
  decrementCounter(type) {
    if (this.metadata[type] !== undefined && this.metadata[type] > 0) {
      this.metadata[type]--;
      this.updatedAt = Timestamp.now();
    }
  }
}

module.exports = User;
