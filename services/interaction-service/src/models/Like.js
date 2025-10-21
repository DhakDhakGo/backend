// Like Model
// Represents a user's like on a post (review or experience)

const { Timestamp } = require('@google-cloud/firestore');

class Like {
  constructor(data = {}) {
    this.likeId = data.likeId || null;
    this.userId = data.userId;             // Who liked
    this.postId = data.postId;             // What was liked
    this.postType = data.postType;         // "review" or "experience"
    this.createdAt = data.createdAt || Timestamp.now();
  }

  /**
   * Convert to Firestore document format
   * @returns {Object} Firestore document data
   */
  toFirestore() {
    const data = { ...this };
    delete data.likeId; // Don't store ID in document
    return data;
  }

  /**
   * Create from Firestore document
   * @param {Object} doc - Firestore document snapshot
   * @returns {Like} Like instance
   */
  static fromFirestore(doc) {
    const data = doc.data();
    return new Like({
      likeId: doc.id,
      ...data
    });
  }

  /**
   * Validate like data
   * @returns {Object} Validation result
   */
  validate() {
    const errors = [];

    if (!this.userId) errors.push('User ID is required');
    if (!this.postId) errors.push('Post ID is required');
    if (!this.postType) errors.push('Post type is required');
    if (!['review', 'experience'].includes(this.postType)) {
      errors.push('Post type must be either "review" or "experience"');
    }

    return {
      valid: errors.length === 0,
      errors
    };
  }

  /**
   * Create a composite key for uniqueness checking
   * @returns {string} Composite key
   */
  getCompositeKey() {
    return `${this.userId}_${this.postId}`;
  }
}

module.exports = Like;
