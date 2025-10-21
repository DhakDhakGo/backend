/**
 * Generate prompt for bike ownership insights
 * @param {string} bikeName - Name of the bike
 * @param {string} country - Country (default: India)
 * @returns {string} Formatted prompt for Gemini
 */
const generateBikeInsightsPrompt = (bikeName, country = 'India') => {
  return `You are a motorcycle expert in ${country} with extensive knowledge of bike ownership experiences, costs, and market trends.

Provide comprehensive ownership data for ${bikeName} in ${country}. Be realistic and accurate based on actual market conditions.

Include the following information in a structured JSON format:

1. Basic Information:
   - bikeName, manufacturer, segment, launchYear

2. Ownership Experience Scores (out of 5):
   - overallScore, reliabilityScore, valueForMoneyScore
   - recommendation (string explaining the scores)
   - idealFor (array of use cases)
   - notIdealFor (array of use cases)

3. Costs (in INR for India):
   - Purchase price (ex-showroom, on-road, range)
   - Maintenance (monthly, yearly, service intervals and costs)
   - Insurance (first year, renewal)
   - Fuel (tank capacity, price per liter, average mileage, monthly cost)
   - Common repairs (item, frequency, cost)
   - Total ownership cost (1 year, 3 years, 5 years)

4. Performance:
   - Engine specifications (displacement, power, torque)
   - Fuel efficiency (city, highway, average in kmpl)
   - Top speed (kmph)
   - Acceleration (0-60, 0-100 in seconds)

5. Common Issues (array):
   - Each issue: name, severity, frequency, description, solutions

6. Positive Aspects (array):
   - Each aspect: name, rating out of 5, description

7. Negative Aspects (array):
   - Each aspect: name, rating out of 5, description

8. User Demographics:
   - Ideal age range, experience level, primary use, average monthly distance

9. Resale Value:
   - Depreciation rate, resale values (1, 3, 5 years), demand rating

Return ONLY valid JSON matching this EXACT structure (example for reference):

{
  "bikeName": "Honda CB350",
  "manufacturer": "Honda",
  "segment": "Classic 350cc",
  "launchYear": 2020,
  "ownershipExperience": {
    "overallScore": 4.3,
    "reliabilityScore": 4.5,
    "valueForMoneyScore": 4.2,
    "recommendation": "Excellent for city commuting...",
    "idealFor": ["city commuting", "beginners"],
    "notIdealFor": ["off-roading", "racing"]
  },
  "costs": {
    "currency": "INR",
    "purchasePrice": {
      "exShowroom": 195000,
      "onRoad": 215000,
      "range": { "min": 190000, "max": 210000 }
    },
    "maintenance": {
      "monthly": 1500,
      "yearly": 18000,
      "serviceInterval": "Every 6000 km"
    },
    "fuel": {
      "averageMileage": 35
    },
    "totalOwnershipCost": {
      "firstYear": 246000,
      "threeYearTotal": 308000
    }
  },
  "performance": {
    "engine": {
      "displacement": "348.36 cc",
      "power": "20.8 PS",
      "torque": "30 Nm"
    },
    "fuelEfficiency": {
      "city": 32,
      "highway": 38,
      "average": 35
    }
  },
  "commonIssues": [
    {
      "issue": "Vibration at high speeds",
      "severity": "moderate",
      "description": "Some vibration above 80 kmph"
    }
  ],
  "positiveAspects": [
    {
      "aspect": "Fuel efficiency",
      "rating": 4.8,
      "description": "Excellent mileage"
    }
  ],
  "negativeAspects": [
    {
      "aspect": "High-speed stability",
      "rating": 3.5,
      "description": "Vibrations at speed"
    }
  ]
}

Use this structure but fill with accurate data for ${bikeName}. Return ONLY the JSON, no markdown, no explanations.`;
};

module.exports = {
  generateBikeInsightsPrompt
};
