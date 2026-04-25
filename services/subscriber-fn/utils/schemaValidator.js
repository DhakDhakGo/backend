/**
 * Schema Validator for AI Responses
 * Validates that Gemini responses match expected formats
 */

/**
 * Validate bike insights response
 * @param {Object} data - AI response data
 * @returns {Object} Validation result with missing/invalid fields
 */
const validateBikeInsights = (data) => {
  const errors = [];
  const warnings = [];

  // Required top-level fields
  if (!data.bikeName) errors.push('Missing bikeName');
  if (!data.manufacturer) warnings.push('Missing manufacturer');
  
  // Ownership experience
  if (!data.ownershipExperience) {
    errors.push('Missing ownershipExperience');
  } else {
    if (typeof data.ownershipExperience.overallScore !== 'number') {
      errors.push('ownershipExperience.overallScore must be a number');
    }
    if (data.ownershipExperience.overallScore < 0 || data.ownershipExperience.overallScore > 5) {
      warnings.push('overallScore should be between 0 and 5');
    }
  }

  // Costs
  if (!data.costs) {
    errors.push('Missing costs');
  } else {
    if (!data.costs.currency) warnings.push('Missing costs.currency');
    if (!data.costs.purchasePrice) warnings.push('Missing costs.purchasePrice');
    if (!data.costs.maintenance) warnings.push('Missing costs.maintenance');
  }

  // Performance
  if (!data.performance) {
    warnings.push('Missing performance data');
  } else {
    if (!data.performance.fuelEfficiency) {
      warnings.push('Missing fuelEfficiency');
    }
  }

  // Arrays
  if (!Array.isArray(data.commonIssues)) {
    warnings.push('commonIssues should be an array');
  }
  if (!Array.isArray(data.positiveAspects)) {
    warnings.push('positiveAspects should be an array');
  }
  if (!Array.isArray(data.negativeAspects)) {
    warnings.push('negativeAspects should be an array');
  }

  return {
    valid: errors.length === 0,
    errors,
    warnings
  };
};

/**
 * Validate bike comparison response
 * @param {Object} data - AI response data
 * @returns {Object} Validation result
 */
const validateBikeComparison = (data) => {
  const errors = [];
  const warnings = [];

  // Bikes array
  if (!Array.isArray(data.bikes) || data.bikes.length < 2) {
    errors.push('bikes array must contain at least 2 bikes');
  }

  // Comparison object
  if (!data.comparison) {
    errors.push('Missing comparison object');
  } else {
    const requiredCategories = ['design', 'performance', 'costs', 'features', 'reliability', 'characteristics'];
    requiredCategories.forEach(category => {
      if (!data.comparison[category]) {
        warnings.push(`Missing comparison.${category}`);
      }
    });
  }

  // Overall comparison
  if (!data.overallComparison) {
    errors.push('Missing overallComparison');
  } else {
    if (!Array.isArray(data.overallComparison.rankings)) {
      errors.push('overallComparison.rankings must be an array');
    }
    if (!data.overallComparison.recommendation) {
      warnings.push('Missing recommendations');
    }
  }

  return {
    valid: errors.length === 0,
    errors,
    warnings
  };
};

/**
 * Sanitize AI response (remove invalid values)
 * @param {Object} data - AI response data
 * @returns {Object} Sanitized data
 */
const sanitizeResponse = (data) => {
  // Deep clone to avoid modifying original
  const sanitized = JSON.parse(JSON.stringify(data, (key, value) => {
    // Replace NaN and Infinity with null
    if (typeof value === 'number' && !isFinite(value)) {
      return null;
    }
    // Replace undefined with null
    if (value === undefined) {
      return null;
    }
    return value;
  }));

  return sanitized;
};

module.exports = {
  validateBikeInsights,
  validateBikeComparison,
  sanitizeResponse
};
