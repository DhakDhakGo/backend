// Comment Model
// Represents a user's comment on a post (review or experience)

const { Timestamp } = require('@google-cloud/firestore');

class Comment {
  constructor(data = {}) {
    this.commentId = data.commentId || null;
    this.userId = data.userId;             // Who commented
    this.postId = data.postId;             // Which post
    this.postType = data.postType;         // "review" or "experience"
    
    // Comment content
    this.content = data.content;
    
    // Metadata
    this.createdAt = data.createdAt || Timestamp.now();
    this.updatedAt = data.updatedAt || Timestamp.now();
    this.isEdited = data.isEdited || false;
    
    // Interaction counters (comments can be liked too)
    this.interactions = data.interactions || {
      likes: 0
    };
  }

  /**
   * Convert to Firestore document format
   * @returns {Object} Firestore document data
   */
  toFirestore() {
    const data = { ...this };
    delete data.commentId; // Don't store ID in document
    return data;
  }

  /**
   * Create from Firestore document
   * @param {Object} doc - Firestore document snapshot
   * @returns {Comment} Comment instance
   */
  static fromFirestore(doc) {
    const data = doc.data();
    return new Comment({
      commentId: doc.id,
      ...data
    });
  }

  /**
   * Validate comment data
   * @returns {Object} Validation result
   */
  validate() {
    const errors = [];

    if (!this.userId) errors.push('User ID is required');
    if (!this.postId) errors.push('Post ID is required');
    if (!this.postType) errors.push('Post type is required');
    if (!this.content || this.content.trim() === '') errors.push('Comment content is required');
    if (this.content && this.content.length > 5000) errors.push('Comment content too long (max 5000 characters)');
    if (!['review', 'experience'].includes(this.postType)) {
      errors.push('Post type must be either "review" or "experience"');
    }

    return {
      valid: errors.length === 0,
      errors
    };
  }

  /**
   * Update comment content
   * @param {string} newContent - New comment content
   */
  updateContent(newContent) {
    this.content = newContent;
    this.updatedAt = Timestamp.now();
    this.isEdited = true;
  }

  /**
   * Increment like counter
   */
  incrementLikes() {
    this.interactions.likes++;
    this.updatedAt = Timestamp.now();
  }

  /**
   * Decrement like counter
   */
  decrementLikes() {
    if (this.interactions.likes > 0) {
      this.interactions.likes--;
      this.updatedAt = Timestamp.now();
    }
  }
}

module.exports = Comment;
