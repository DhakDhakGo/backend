// Bike Comparison Model
// Represents AI-generated comparative analysis of multiple bikes

class BikeComparison {
  constructor(data = {}) {
    this.comparisonDate = data.comparisonDate || new Date().toISOString();
    this.bikes = data.bikes || [];
    
    this.comparison = data.comparison || {
      design: {},
      performance: {},
      costs: {},
      features: {},
      reliability: {},
      characteristics: {}
    };
    
    this.overallComparison = data.overallComparison || {
      rankings: [],
      recommendation: {},
      summary: '',
      priceToPerformanceRatio: {}
    };
    
    this.metadata = data.metadata || {
      dataSource: 'AI-generated comparative analysis',
      confidence: 0.88,
      bikesCompared: 0,
      parametersAnalyzed: 0,
      generatedAt: new Date().toISOString(),
      disclaimer: 'Comparison is AI-generated and may vary based on individual usage and location'
    };
  }

  /**
   * Validate comparison data
   * @returns {Object} Validation result
   */
  validate() {
    const errors = [];

    if (!this.bikes || this.bikes.length < 2) {
      errors.push('At least 2 bikes required for comparison');
    }
    if (!this.comparison) errors.push('Comparison data is required');
    if (!this.overallComparison.rankings || this.overallComparison.rankings.length === 0) {
      errors.push('Rankings are required');
    }

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
      comparisonDate: this.comparisonDate,
      bikes: this.bikes,
      comparison: this.comparison,
      overallComparison: this.overallComparison,
      metadata: this.metadata
    };
  }

  /**
   * Get winner for a specific category
   * @param {string} category - Category name (design, performance, costs, etc.)
   * @returns {string} Winner bike name
   */
  getCategoryWinner(category) {
    if (this.comparison[category] && this.comparison[category].overallWinner) {
      return this.comparison[category].overallWinner;
    }
    return null;
  }

  /**
   * Get overall winner
   * @returns {Object} Top-ranked bike
   */
  getOverallWinner() {
    if (this.overallComparison.rankings && this.overallComparison.rankings.length > 0) {
      return this.overallComparison.rankings[0];
    }
    return null;
  }

  /**
   * Get recommendation for a specific use case
   * @param {string} useCase - Use case (e.g., 'cityCommute', 'highwayTouring')
   * @returns {string} Recommended bike name
   */
  getRecommendationFor(useCase) {
    if (this.overallComparison.recommendation && this.overallComparison.recommendation[useCase]) {
      return this.overallComparison.recommendation[useCase];
    }
    return null;
  }

  /**
   * Get summary comparison table
   * @returns {Array} Summary table
   */
  getSummaryTable() {
    return this.overallComparison.rankings.map(bike => ({
      rank: bike.rank,
      name: bike.bikeName,
      score: bike.overallScore,
      bestFor: bike.bestFor.join(', ')
    }));
  }

  /**
   * Get category-wise winners summary
   * @returns {Object} Category winners
   */
  getCategoryWinners() {
    const winners = {};
    
    Object.keys(this.comparison).forEach(category => {
      if (this.comparison[category].overallWinner) {
        winners[category] = this.comparison[category].overallWinner;
      }
    });
    
    return winners;
  }
}

module.exports = BikeComparison;
