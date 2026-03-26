// Bike Review Model
// Represents a user's review of a bike

const { Timestamp } = require('@google-cloud/firestore');

class BikeReview {
  constructor(data = {}) {
    this.reviewId = data.reviewId || null;
    this.authorId = data.authorId;
    this.bikeName = data.bikeName;
    this.bikeModel = data.bikeModel || '';
    this.bikeManufacturer = data.bikeManufacturer || '';
    this.bikeYear = data.bikeYear || null;
    
    // Review content
    this.title = data.title;
    this.content = data.content;
    this.rating = data.rating || 0;
    
    // Review categories (optional)
    this.categories = data.categories || {
      performance: 0,
      comfort: 0,
      fuelEfficiency: 0,
      maintenance: 0,
      valueForMoney: 0
    };
    
    // AI-generated data (will be populated by AI Service)
    this.aiData = data.aiData || null;
    this.isAiDataVerified = data.isAiDataVerified || false;
    
    // Metadata
    this.createdAt = data.createdAt || Timestamp.now();
    this.updatedAt = data.updatedAt || Timestamp.now();
    this.status = data.status || 'published'; // draft, published, archived
    this.visibility = data.visibility || 'public'; // public, private
    
    // Interaction counters
    this.interactions = data.interactions || {
      likes: 0,
      comments: 0,
      views: 0
    };
    
    // Tags for search/filtering
    this.tags = data.tags || [];
    
    // Media
    this.images = data.images || [];
  }

  /**
   * Convert to Firestore document format
   * @returns {Object} Firestore document data
   */
  toFirestore() {
    const data = { ...this };
    delete data.reviewId; // Don't store ID in document
    return data;
  }

  /**
   * Create from Firestore document
   * @param {Object} doc - Firestore document snapshot
   * @returns {BikeReview} BikeReview instance
   */
  static fromFirestore(doc) {
    const data = doc.data();
    return new BikeReview({
      reviewId: doc.id,
      ...data
    });
  }

  /**
   * Validate review data
   * @returns {Object} Validation result
   */
  validate() {
    const errors = [];

    if (!this.authorId) errors.push('Author ID is required');
    if (!this.bikeName) errors.push('Bike name is required');
    if (!this.title) errors.push('Title is required');
    if (!this.content) errors.push('Content is required');
    if (this.rating < 0 || this.rating > 5) errors.push('Rating must be between 0 and 5');

    return {
      valid: errors.length === 0,
      errors
    };
  }

  /**
   * Increment interaction counter
   * @param {string} type - Type of interaction (likes, comments, views)
   */
  incrementInteraction(type) {
    if (this.interactions[type] !== undefined) {
      this.interactions[type]++;
      this.updatedAt = Timestamp.now();
    }
  }

  /**
   * Decrement interaction counter
   * @param {string} type - Type of interaction (likes, comments, views)
   */
  decrementInteraction(type) {
    if (this.interactions[type] !== undefined && this.interactions[type] > 0) {
      this.interactions[type]--;
      this.updatedAt = Timestamp.now();
    }
  }

  /**
   * Add AI data to review
   * @param {Object} aiData - AI-generated data
   */
  setAIData(aiData) {
    this.aiData = {
      ...aiData,
      generatedAt: Timestamp.now()
    };
    this.updatedAt = Timestamp.now();
  }
}

module.exports = BikeReview;
