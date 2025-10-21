// Bike Insights Model
// Represents AI-generated ownership insights for a bike

class BikeInsights {
  constructor(data = {}) {
    this.bikeName = data.bikeName;
    this.bikeModel = data.bikeModel || '';
    this.manufacturer = data.manufacturer || '';
    this.segment = data.segment || '';
    this.launchYear = data.launchYear || null;
    
    this.ownershipExperience = data.ownershipExperience || {
      overallScore: 0,
      reliabilityScore: 0,
      valueForMoneyScore: 0,
      recommendation: '',
      idealFor: [],
      notIdealFor: []
    };
    
    this.costs = data.costs || {
      currency: 'INR',
      purchasePrice: {},
      maintenance: {},
      insurance: {},
      fuel: {},
      repairs: {},
      totalOwnershipCost: {}
    };
    
    this.performance = data.performance || {
      engine: {},
      fuelEfficiency: {},
      topSpeed: 0,
      acceleration: {}
    };
    
    this.commonIssues = data.commonIssues || [];
    this.positiveAspects = data.positiveAspects || [];
    this.negativeAspects = data.negativeAspects || [];
    this.userDemographics = data.userDemographics || {};
    this.resaleValue = data.resaleValue || {};
    
    this.metadata = data.metadata || {
      dataSource: 'AI-generated',
      confidence: 0.85,
      lastUpdated: new Date().toISOString(),
      disclaimer: 'Data is AI-generated and may vary based on location, usage, and individual experiences'
    };
  }

  /**
   * Validate the bike insights data
   * @returns {Object} Validation result
   */
  validate() {
    const errors = [];

    if (!this.bikeName) errors.push('Bike name is required');
    if (!this.ownershipExperience.overallScore) errors.push('Overall score is required');
    if (!this.costs.currency) errors.push('Currency is required');

    return {
      valid: errors.length === 0,
      errors
    };
  }

  /**
   * Convert to JSON for API response
   * @returns {Object} JSON response
   */
  toJSON() {
    return {
      success: true,
      bikeName: this.bikeName,
      bikeModel: this.bikeModel,
      manufacturer: this.manufacturer,
      segment: this.segment,
      launchYear: this.launchYear,
      ownershipExperience: this.ownershipExperience,
      costs: this.costs,
      performance: this.performance,
      commonIssues: this.commonIssues,
      positiveAspects: this.positiveAspects,
      negativeAspects: this.negativeAspects,
      userDemographics: this.userDemographics,
      resaleValue: this.resaleValue,
      metadata: this.metadata
    };
  }

  /**
   * Get summary for quick display
   * @returns {Object} Summary
   */
  getSummary() {
    return {
      bikeName: this.bikeName,
      overallScore: this.ownershipExperience.overallScore,
      reliabilityScore: this.ownershipExperience.reliabilityScore,
      recommendation: this.ownershipExperience.recommendation,
      yearlyMaintenanceCost: this.costs.maintenance.yearly,
      averageMileage: this.performance.fuelEfficiency.average
    };
  }
}

module.exports = BikeInsights;
