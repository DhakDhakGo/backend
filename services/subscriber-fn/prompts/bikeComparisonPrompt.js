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
   - Summary comparing all bikes

Return ONLY valid JSON matching this EXACT structure (example for reference):

{
  "categoryComparisons": {
    "designAesthetics": {
      "bikes": [
        {
          "name": "Honda CB350",
          "variant": "Standard",
          "score": 4.0,
          "styling": "Classic, retro design",
          "buildQuality": "Solid construction",
          "ergonomics": "Comfortable for city riding"
        },
        {
          "name": "Royal Enfield Interstellar",
          "variant": "650cc",
          "score": 4.5,
          "styling": "Classic modern design",
          "buildQuality": "Premium feel",
          "ergonomics": "Comfortable but upright posture"
        }
      ],
      "winner": "Royal Enfield Interstellar",
      "reason": "Superior styling and premium build quality with better aesthetic appeal"
    },
    "performanceRideQuality": {
      "bikes": [
        {
          "name": "Honda CB350",
          "variant": "Standard",
          "score": 4.1,
          "enginePerformance": "348cc, 20.8 PS",
          "fuelEfficiency": "35 kmpl",
          "rideQuality": "Smooth, comfortable on bumpy roads"
        },
        {
          "name": "Royal Enfield Interstellar",
          "variant": "650cc",
          "score": 4.0,
          "enginePerformance": "650cc, 47 PS",
          "fuelEfficiency": "32 kmpl",
          "rideQuality": "Vibration at high speeds"
        }
      ],
      "winner": "Honda CB350",
      "reason": "Better fuel efficiency and smoother ride quality, though lower power"
    },
    "costsOwnership": {
      "bikes": [
        {
          "name": "Honda CB350",
          "variant": "Standard",
          "score": 4.3,
          "purchasePrice": 215000,
          "maintenanceCostsYearly": 18000,
          "resaleValue3Years": "65-70%",
          "totalOwnershipCost5Years": "450000-500000"
        },
        {
          "name": "Royal Enfield Interstellar",
          "variant": "650cc",
          "score": 3.8,
          "purchasePrice": 290000,
          "maintenanceCostsYearly": 22000,
          "resaleValue3Years": "60-65%",
          "totalOwnershipCost5Years": "580000-650000"
        }
      ],
      "winner": "Honda CB350",
      "reason": "Significantly lower purchase price and maintenance costs with better total ownership value"
    },
    "featuresAndTechnology": {
      "bikes": [
        {
          "name": "Honda CB350",
          "variant": "Standard",
          "score": 3.9,
          "instrumentCluster": "Analog with basic digital",
          "brakingSystem": "Drum/Disc combo",
          "suspension": "Telescopic front, mono-shock rear"
        },
        {
          "name": "Royal Enfield Interstellar",
          "variant": "650cc",
          "score": 3.7,
          "instrumentCluster": "Analog speedo",
          "brakingSystem": "Disc both ends",
          "suspension": "Telescopic front, mono-shock rear"
        }
      ],
      "winner": "Honda CB350",
      "reason": "Better instrument cluster and superior braking setup"
    },
    "reliabilityDurability": {
      "bikes": [
        {
          "name": "Honda CB350",
          "variant": "Standard",
          "score": 4.5,
          "engineReliability": "Excellent, proven platform",
          "buildDurability": "Robust construction",
          "afterSalesService": "Excellent Honda network"
        },
        {
          "name": "Royal Enfield Interstellar",
          "variant": "650cc",
          "score": 4.1,
          "engineReliability": "Good, but older design",
          "buildDurability": "Sturdy",
          "afterSalesService": "Good network"
        }
      ],
      "winner": "Honda CB350",
      "reason": "Proven reliability track record and superior after-sales service network"
    },
    "ridingCharacteristics": {
      "bikes": [
        {
          "name": "Honda CB350",
          "variant": "Standard",
          "score": 4.0,
          "cityRiding": 4.2,
          "highwayCruising": 3.9,
          "handlingManeuverability": 4.0
        },
        {
          "name": "Royal Enfield Interstellar",
          "variant": "650cc",
          "score": 4.2,
          "cityRiding": 3.8,
          "highwayCruising": 4.5,
          "handlingManeuverability": 3.9
        }
      ],
      "winner": "Royal Enfield Interstellar",
      "reason": "Superior highway cruising capabilities and overall riding characteristics for long-distance touring"
    }
  },
  "overallComparison": {
    "ranking": [
      {
        "rank": 1,
        "bike": "Honda CB350",
        "score": 4.2,
        "reason": "Best all-rounder with reliability, economy, and everyday practicality"
      },
      {
        "rank": 2,
        "bike": "Royal Enfield Interstellar 650cc",
        "score": 4.0,
        "reason": "Better for highway riding and touring with superior long-distance cruising"
      }
    ],
    "recommendations": {
      "bestForCity": "Honda CB350",
      "bestForHighway": "Royal Enfield Interstellar 650cc",
      "bestForBudget": "Honda CB350",
      "bestForPerformance": "Royal Enfield Interstellar 650cc",
      "bestValue": "Honda CB350"
    },
    "summary": "Honda CB350 is ideal for daily commuting and city usage with excellent value. Royal Enfield Interstellar 650cc excels at highway cruising and long-distance riding."
  }
}

Use this structure to return a comparison of the provided bikes. Return ONLY the JSON, no markdown, no explanations.`;
};

module.exports = {
  generateBikeComparisonPrompt
};
