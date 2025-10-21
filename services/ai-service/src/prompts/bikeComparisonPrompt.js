/**
 * Generate prompt for bike comparison
 * @param {Array} bikes - Array of bike objects with name and variant
 * @param {string} country - Country (default: India)
 * @returns {string} Formatted prompt for Gemini
 */
const generateBikeComparisonPrompt = (bikes, country = 'India') => {
  const bikeList = bikes.map(b => `${b.name} ${b.variant || ''}`).join(', ');
  
  return `You are a motorcycle expert comparing bikes in the ${country} market.

Compare the following bikes: ${bikeList}

Provide a detailed comparison across these categories:

1. Design & Aesthetics:
   - Styling, Build Quality, Ergonomics
   - Rate each bike out of 5
   - Declare category winner
   - Provide detailed analysis

2. Performance & Ride Quality:
   - Engine Performance, Fuel Efficiency, Ride Quality
   - Rate each bike out of 5
   - Include specific values (e.g., "35 kmpl" for fuel efficiency)
   - Declare category winner

3. Costs & Ownership:
   - Purchase Price (ex-showroom in INR)
   - Maintenance Costs (yearly in INR)
   - Resale Value (3 years, with percentage)
   - Total ownership cost (3 years, 5 years in INR)
   - Rate each bike out of 5
   - Declare category winner

4. Features & Technology:
   - Instrument Cluster, Braking System, Suspension
   - Rate each bike out of 5
   - Include specific details
   - Declare category winner

5. Reliability & Durability:
   - Engine Reliability, Build Durability, After-sales Service
   - Rate each bike out of 5
   - Declare category winner

6. Riding Characteristics:
   - City Riding, Highway Cruising, Handling & Maneuverability
   - Rate each bike out of 5
   - Declare category winner

7. Overall Comparison:
   - Rank all bikes (1, 2, 3, etc.) with overall scores
   - For each bike: strengths, weaknesses, bestFor
   - Recommendations for different use cases (city commute, highway, budget, etc.)
   - Price-to-performance ratio scores
   - Summary comparing all bikes

Return ONLY valid JSON matching the schema structure with all categories, parameters, scores, and analyses. Do not include markdown formatting or explanations.`;
};

module.exports = {
  generateBikeComparisonPrompt
};
