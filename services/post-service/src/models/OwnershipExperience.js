// Ownership Experience Model
// Represents a user's long-term ownership experience with a bike

const { Timestamp } = require('@google-cloud/firestore');

class OwnershipExperience {
  constructor(data = {}) {
    this.experienceId = data.experienceId || null;
    this.authorId = data.authorId;
    this.bikeName = data.bikeName;
    this.bikeModel = data.bikeModel || '';
    this.bikeManufacturer = data.bikeManufacturer || '';
    
    // Ownership details
    this.purchaseDate = data.purchaseDate || null;
    this.currentOwnership = data.currentOwnership !== undefined ? data.currentOwnership : true;
    this.soldDate = data.soldDate || null;
    this.ownershipDuration = data.ownershipDuration || 0; // Days
    this.totalDistance = data.totalDistance || 0; // Kilometers
    
    // Experience content
    this.title = data.title;
    this.content = data.content;
    
    // Cost breakdown
    this.costs = data.costs || {
      purchasePrice: 0,
      maintenance: [],
      repairs: [],
      fuel: {
        averageMileage: 0,
        monthlyFuelCost: 0
      },
      insurance: {
        annual: 0
      },
      totalCost: 0,
      currency: 'INR'
    };
    
    // Pros and Cons
    this.pros = data.pros || [];
    this.cons = data.cons || [];
    
    // AI-generated insights (from AI Service)
    this.aiData = data.aiData || null;
    
    // Metadata
    this.createdAt = data.createdAt || Timestamp.now();
    this.updatedAt = data.updatedAt || Timestamp.now();
    this.status = data.status || 'published';
    this.visibility = data.visibility || 'public';
    
    // Interaction counters
    this.interactions = data.interactions || {
      likes: 0,
      comments: 0,
      views: 0
    };
    
    // Tags
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
    delete data.experienceId; // Don't store ID in document
    return data;
  }

  /**
   * Create from Firestore document
   * @param {Object} doc - Firestore document snapshot
   * @returns {OwnershipExperience} OwnershipExperience instance
   */
  static fromFirestore(doc) {
    const data = doc.data();
    return new OwnershipExperience({
      experienceId: doc.id,
      ...data
    });
  }

  /**
   * Validate experience data
   * @returns {Object} Validation result
   */
  validate() {
    const errors = [];

    if (!this.authorId) errors.push('Author ID is required');
    if (!this.bikeName) errors.push('Bike name is required');
    if (!this.title) errors.push('Title is required');
    if (!this.content) errors.push('Content is required');
    if (this.totalDistance < 0) errors.push('Total distance cannot be negative');

    return {
      valid: errors.length === 0,
      errors
    };
  }

  /**
   * Calculate total ownership cost
   * @returns {number} Total cost
   */
  calculateTotalCost() {
    const maintenanceCost = this.costs.maintenance.reduce((sum, item) => sum + item.cost, 0);
    const repairCost = this.costs.repairs.reduce((sum, item) => sum + item.cost, 0);
    const insuranceCost = this.costs.insurance.annual || 0;
    
    this.costs.totalCost = this.costs.purchasePrice + maintenanceCost + repairCost + insuranceCost;
    return this.costs.totalCost;
  }

  /**
   * Add maintenance record
   * @param {Object} maintenance - Maintenance record
   */
  addMaintenance(maintenance) {
    this.costs.maintenance.push({
      date: maintenance.date || Timestamp.now(),
      description: maintenance.description,
      cost: maintenance.cost,
      odometer: maintenance.odometer || 0
    });
    this.calculateTotalCost();
    this.updatedAt = Timestamp.now();
  }

  /**
   * Add repair record
   * @param {Object} repair - Repair record
   */
  addRepair(repair) {
    this.costs.repairs.push({
      date: repair.date || Timestamp.now(),
      description: repair.description,
      cost: repair.cost,
      odometer: repair.odometer || 0
    });
    this.calculateTotalCost();
    this.updatedAt = Timestamp.now();
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
   * Add AI insights
   * @param {Object} aiData - AI-generated insights
  setAIData(aiData) {
    this.aiData = {
      ...aiData,
      generatedAt: Timestamp.now()
    };
    this.updatedAt = Timestamp.now();
  }
  */
}

module.exports = OwnershipExperience;
