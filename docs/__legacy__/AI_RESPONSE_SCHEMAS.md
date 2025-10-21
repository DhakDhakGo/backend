# AI Service Response Schemas

## 📋 Overview

This document defines the structured JSON formats that Google Gemini API will return for different AI service operations.

---

## 🏍️ Use Case 1: Bike Ownership Insights

### **Endpoint**: `POST /api/ai/bike-insights`

### **Input Schema**
```json
{
  "bikeName": "Honda CB350",
  "bikeModel": "CB350 H'Ness",
  "country": "India"
}
```

### **Output Schema**
```json
{
  "success": true,
  "bikeName": "Honda CB350",
  "bikeModel": "CB350 H'Ness",
  "manufacturer": "Honda",
  "segment": "Classic 350cc",
  "launchYear": 2020,
  
  "ownershipExperience": {
    "overallScore": 4.3,
    "reliabilityScore": 4.5,
    "valueForMoneyScore": 4.2,
    "recommendation": "Excellent for city commuting and beginners. Great fuel efficiency and low maintenance costs.",
    "idealFor": ["city commuting", "beginners", "daily commute"],
    "notIdealFor": ["long highway trips", "off-roading", "racing"]
  },
  
  "costs": {
    "currency": "INR",
    "purchasePrice": {
      "exShowroom": 195000,
      "onRoad": 215000,
      "range": {
        "min": 190000,
        "max": 210000
      }
    },
    "maintenance": {
      "monthly": 1500,
      "yearly": 18000,
      "firstServiceCost": 500,
      "regularServiceCost": 2000,
      "serviceInterval": "Every 6000 km or 6 months"
    },
    "insurance": {
      "firstYear": 8000,
      "renewalYearly": 5000
    },
    "fuel": {
      "tankCapacity": 15,
      "pricePerLiter": 100,
      "averageMileage": 35,
      "monthlyFuelCost": 3000,
      "costPerKm": 2.86
    },
    "repairs": {
      "commonRepairs": [
        {
          "item": "Brake pads",
          "frequency": "Every 15000-20000 km",
          "cost": 3000
        },
        {
          "item": "Chain and sprocket",
          "frequency": "Every 25000-30000 km",
          "cost": 4500
        },
        {
          "item": "Tires",
          "frequency": "Every 20000-25000 km",
          "cost": 8000
        }
      ],
      "averageYearlyRepairCost": 5000
    },
    "totalOwnershipCost": {
      "firstYear": 246000,
      "yearlyAfter": 31000,
      "threeYearTotal": 308000,
      "fiveYearTotal": 370000
    }
  },
  
  "performance": {
    "engine": {
      "displacement": "348.36 cc",
      "power": "20.8 PS @ 5500 rpm",
      "torque": "30 Nm @ 3000 rpm",
      "type": "Single cylinder, air-cooled"
    },
    "fuelEfficiency": {
      "city": 32,
      "highway": 38,
      "average": 35,
      "unit": "kmpl"
    },
    "topSpeed": 115,
    "acceleration": {
      "zeroToSixty": 5.2,
      "zeroToHundred": 12.5,
      "unit": "seconds"
    }
  },
  
  "commonIssues": [
    {
      "issue": "Vibration at high speeds",
      "severity": "moderate",
      "frequency": "common",
      "occurAfter": "80+ kmph",
      "description": "Some users report vibration in handlebars and footpegs at speeds above 80 kmph",
      "solutions": ["Rubber dampers", "Handlebar weights"]
    },
    {
      "issue": "Seat comfort for long rides",
      "severity": "low",
      "frequency": "occasional",
      "occurAfter": "100+ km rides",
      "description": "Stock seat may be uncomfortable for rides longer than 100 km",
      "solutions": ["Aftermarket seat", "Seat cushion"]
    },
    {
      "issue": "Heat from engine",
      "severity": "low",
      "frequency": "common",
      "occurAfter": "In traffic",
      "description": "Air-cooled engine generates heat in stop-and-go traffic",
      "solutions": ["Heat shield", "Proper riding gear"]
    }
  ],
  
  "positiveAspects": [
    {
      "aspect": "Fuel efficiency",
      "rating": 4.8,
      "description": "Excellent fuel economy, 35+ kmpl in mixed conditions"
    },
    {
      "aspect": "Build quality",
      "rating": 4.5,
      "description": "Solid build with premium fit and finish"
    },
    {
      "aspect": "Low-end torque",
      "rating": 4.6,
      "description": "Great torque delivery at low RPMs, perfect for city riding"
    },
    {
      "aspect": "Retro styling",
      "rating": 4.7,
      "description": "Classic design with modern features"
    }
  ],
  
  "negativeAspects": [
    {
      "aspect": "High-speed stability",
      "rating": 3.5,
      "description": "Vibrations at speeds above 80 kmph"
    },
    {
      "aspect": "Seat comfort",
      "rating": 3.8,
      "description": "Stock seat not ideal for long rides"
    },
    {
      "aspect": "Spare parts availability",
      "rating": 3.9,
      "description": "Limited availability in tier 2/3 cities"
    }
  ],
  
  "userDemographics": {
    "idealAge": "25-45 years",
    "experienceLevel": "Beginner to Intermediate",
    "primaryUse": "City commuting, weekend rides",
    "averageMonthlyDistance": "800-1200 km"
  },
  
  "resaleValue": {
    "depreciationRate": 15,
    "oneYearResale": 170000,
    "threeYearResale": 135000,
    "fiveYearResale": 100000,
    "demandRating": 4.0
  },
  
  "metadata": {
    "dataSource": "AI-generated based on market data and user experiences",
    "confidence": 0.85,
    "lastUpdated": "2025-10-05T10:30:00Z",
    "disclaimer": "Data is AI-generated and may vary based on location, usage, and individual experiences"
  }
}
```

---

## 🔄 Use Case 2: Comparative Analysis

### **Endpoint**: `POST /api/ai/compare-bikes`

### **Input Schema**
```json
{
  "bikes": [
    {
      "name": "Honda CB350",
      "variant": "H'Ness"
    },
    {
      "name": "Royal Enfield Classic 350",
      "variant": "Standard"
    },
    {
      "name": "Jawa 42",
      "variant": "Standard"
    }
  ],
  "compareOn": ["performance", "costs", "reliability", "features"],
  "country": "India"
}
```

### **Output Schema**
```json
{
  "success": true,
  "comparisonDate": "2025-10-05T10:30:00Z",
  "bikes": [
    {
      "name": "Honda CB350",
      "variant": "H'Ness",
      "manufacturer": "Honda"
    },
    {
      "name": "Royal Enfield Classic 350",
      "variant": "Standard",
      "manufacturer": "Royal Enfield"
    },
    {
      "name": "Jawa 42",
      "variant": "Standard",
      "manufacturer": "Jawa"
    }
  ],
  
  "comparison": {
    "design": {
      "category": "Design & Aesthetics",
      "parameters": [
        {
          "parameter": "Styling",
          "scores": {
            "Honda CB350": 4.5,
            "Royal Enfield Classic 350": 4.8,
            "Jawa 42": 4.3
          },
          "winner": "Royal Enfield Classic 350",
          "analysis": "Royal Enfield has the most authentic retro design, Honda offers modern retro styling, Jawa provides neo-retro aesthetics"
        },
        {
          "parameter": "Build Quality",
          "scores": {
            "Honda CB350": 4.7,
            "Royal Enfield Classic 350": 4.2,
            "Jawa 42": 4.0
          },
          "winner": "Honda CB350",
          "analysis": "Honda has superior fit and finish, RE has improved but still has quality issues, Jawa needs improvement"
        },
        {
          "parameter": "Ergonomics",
          "scores": {
            "Honda CB350": 4.4,
            "Royal Enfield Classic 350": 4.5,
            "Jawa 42": 4.2
          },
          "winner": "Royal Enfield Classic 350",
          "analysis": "RE offers relaxed riding position, Honda is comfortable but slightly sporty, Jawa is good for shorter riders"
        }
      ],
      "overallWinner": "Honda CB350",
      "summary": "Honda leads in build quality, RE in styling, balanced ergonomics across all"
    },
    
    "performance": {
      "category": "Performance & Ride Quality",
      "parameters": [
        {
          "parameter": "Engine Performance",
          "scores": {
            "Honda CB350": 4.5,
            "Royal Enfield Classic 350": 4.0,
            "Jawa 42": 4.2
          },
          "winner": "Honda CB350",
          "details": {
            "Honda CB350": "Smooth, refined, good low-end torque",
            "Royal Enfield Classic 350": "Thumpy, character-rich, decent power",
            "Jawa 42": "Smooth but lacks character"
          },
          "analysis": "Honda offers the most refined engine with best power delivery"
        },
        {
          "parameter": "Fuel Efficiency",
          "scores": {
            "Honda CB350": 4.8,
            "Royal Enfield Classic 350": 3.8,
            "Jawa 42": 4.2
          },
          "winner": "Honda CB350",
          "values": {
            "Honda CB350": "35 kmpl",
            "Royal Enfield Classic 350": "30 kmpl",
            "Jawa 42": "32 kmpl"
          },
          "analysis": "Honda clearly wins in fuel efficiency, offering 15-20% better mileage"
        },
        {
          "parameter": "Ride Quality",
          "scores": {
            "Honda CB350": 4.4,
            "Royal Enfield Classic 350": 4.5,
            "Jawa 42": 4.1
          },
          "winner": "Royal Enfield Classic 350",
          "analysis": "RE offers plush ride, Honda is slightly sporty, Jawa is decent but firm"
        }
      ],
      "overallWinner": "Honda CB350",
      "summary": "Honda leads in performance and efficiency, RE offers better ride comfort"
    },
    
    "costs": {
      "category": "Costs & Ownership",
      "parameters": [
        {
          "parameter": "Purchase Price (Ex-showroom)",
          "scores": {
            "Honda CB350": 4.2,
            "Royal Enfield Classic 350": 4.5,
            "Jawa 42": 4.6
          },
          "winner": "Jawa 42",
          "values": {
            "Honda CB350": "₹1,95,000",
            "Royal Enfield Classic 350": "₹1,85,000",
            "Jawa 42": "₹1,80,000"
          },
          "analysis": "Jawa is most affordable, followed by RE, Honda is premium-priced"
        },
        {
          "parameter": "Maintenance Costs (Yearly)",
          "scores": {
            "Honda CB350": 4.8,
            "Royal Enfield Classic 350": 3.5,
            "Jawa 42": 3.8
          },
          "winner": "Honda CB350",
          "values": {
            "Honda CB350": "₹18,000",
            "Royal Enfield Classic 350": "₹25,000",
            "Jawa 42": "₹22,000"
          },
          "analysis": "Honda has lowest maintenance costs, RE is highest due to frequent servicing"
        },
        {
          "parameter": "Resale Value (3 years)",
          "scores": {
            "Honda CB350": 4.3,
            "Royal Enfield Classic 350": 4.7,
            "Jawa 42": 3.5
          },
          "winner": "Royal Enfield Classic 350",
          "values": {
            "Honda CB350": "₹1,35,000 (69%)",
            "Royal Enfield Classic 350": "₹1,45,000 (78%)",
            "Jawa 42": "₹1,10,000 (61%)"
          },
          "analysis": "RE holds value best, Honda is good, Jawa depreciates faster"
        }
      ],
      "overallWinner": "Honda CB350",
      "totalOwnershipCost": {
        "threeYears": {
          "Honda CB350": "₹3,08,000",
          "Royal Enfield Classic 350": "₹3,35,000",
          "Jawa 42": "₹3,12,000"
        },
        "fiveYears": {
          "Honda CB350": "₹3,70,000",
          "Royal Enfield Classic 350": "₹4,10,000",
          "Jawa 42": "₹3,82,000"
        }
      },
      "summary": "Honda offers best overall value despite higher initial cost"
    },
    
    "features": {
      "category": "Features & Technology",
      "parameters": [
        {
          "parameter": "Instrument Cluster",
          "scores": {
            "Honda CB350": 4.5,
            "Royal Enfield Classic 350": 3.5,
            "Jawa 42": 4.0
          },
          "winner": "Honda CB350",
          "details": {
            "Honda CB350": "Digital-analog combo, Bluetooth connectivity, turn-by-turn navigation",
            "Royal Enfield Classic 350": "Analog speedometer, basic functionality",
            "Jawa 42": "Digital cluster, good visibility"
          }
        },
        {
          "parameter": "Braking System",
          "scores": {
            "Honda CB350": 4.6,
            "Royal Enfield Classic 350": 4.3,
            "Jawa 42": 4.4
          },
          "winner": "Honda CB350",
          "details": {
            "Honda CB350": "Dual-channel ABS, excellent braking",
            "Royal Enfield Classic 350": "Dual-channel ABS, good braking",
            "Jawa 42": "Dual-channel ABS, decent braking"
          }
        },
        {
          "parameter": "Suspension",
          "scores": {
            "Honda CB350": 4.3,
            "Royal Enfield Classic 350": 4.6,
            "Jawa 42": 4.0
          },
          "winner": "Royal Enfield Classic 350",
          "details": {
            "Honda CB350": "Telescopic front, twin shock rear - sporty setup",
            "Royal Enfield Classic 350": "Telescopic front, twin shock rear - plush setup",
            "Jawa 42": "Telescopic front, twin shock rear - balanced"
          }
        }
      ],
      "overallWinner": "Honda CB350",
      "summary": "Honda leads in features and technology, RE focuses on classic simplicity"
    },
    
    "reliability": {
      "category": "Reliability & Durability",
      "parameters": [
        {
          "parameter": "Engine Reliability",
          "scores": {
            "Honda CB350": 4.7,
            "Royal Enfield Classic 350": 4.2,
            "Jawa 42": 3.8
          },
          "winner": "Honda CB350",
          "analysis": "Honda engine is most reliable with fewer reported issues"
        },
        {
          "parameter": "Build Durability",
          "scores": {
            "Honda CB350": 4.6,
            "Royal Enfield Classic 350": 4.3,
            "Jawa 42": 3.9
          },
          "winner": "Honda CB350",
          "analysis": "Honda has best build quality, RE has improved, Jawa needs improvement"
        },
        {
          "parameter": "After-sales Service",
          "scores": {
            "Honda CB350": 4.5,
            "Royal Enfield Classic 350": 4.6,
            "Jawa 42": 3.7
          },
          "winner": "Royal Enfield Classic 350",
          "analysis": "RE has best service network, Honda is good, Jawa is limited"
        }
      ],
      "overallWinner": "Honda CB350",
      "summary": "Honda is most reliable, RE has best service network, Jawa trails"
    },
    
    "characteristics": {
      "category": "Riding Characteristics",
      "parameters": [
        {
          "parameter": "City Riding",
          "scores": {
            "Honda CB350": 4.7,
            "Royal Enfield Classic 350": 4.2,
            "Jawa 42": 4.4
          },
          "winner": "Honda CB350",
          "analysis": "Honda excels in city with light weight, good mileage, and smooth engine"
        },
        {
          "parameter": "Highway Cruising",
          "scores": {
            "Honda CB350": 4.0,
            "Royal Enfield Classic 350": 4.5,
            "Jawa 42": 4.1
          },
          "winner": "Royal Enfield Classic 350",
          "analysis": "RE is most comfortable for long highway rides with relaxed ergonomics"
        },
        {
          "parameter": "Handling & Maneuverability",
          "scores": {
            "Honda CB350": 4.6,
            "Royal Enfield Classic 350": 4.0,
            "Jawa 42": 4.3
          },
          "winner": "Honda CB350",
          "analysis": "Honda is nimblest with best handling, lighter weight helps"
        }
      ],
      "overallWinner": "Honda CB350",
      "summary": "Honda best for city, RE for highways, Jawa balanced"
    }
  },
  
  "overallComparison": {
    "rankings": [
      {
        "rank": 1,
        "bikeName": "Honda CB350",
        "overallScore": 4.52,
        "strengths": ["fuel efficiency", "reliability", "build quality", "features"],
        "weaknesses": ["price", "high-speed comfort"],
        "bestFor": "Daily city commuting, beginners, fuel economy conscious"
      },
      {
        "rank": 2,
        "bikeName": "Royal Enfield Classic 350",
        "overallScore": 4.28,
        "strengths": ["styling", "highway comfort", "resale value", "service network"],
        "weaknesses": ["fuel efficiency", "maintenance costs"],
        "bestFor": "Highway cruising, brand value, long-distance touring"
      },
      {
        "rank": 3,
        "bikeName": "Jawa 42",
        "overallScore": 4.08,
        "strengths": ["price", "styling", "balanced performance"],
        "weaknesses": ["reliability", "service network", "resale value"],
        "bestFor": "Budget buyers, neo-retro styling enthusiasts"
      }
    ],
    
    "recommendation": {
      "forCityCommute": "Honda CB350",
      "forHighwayTouring": "Royal Enfield Classic 350",
      "forBudgetBuyers": "Jawa 42",
      "forBeginners": "Honda CB350",
      "forFuelEfficiency": "Honda CB350",
      "forResaleValue": "Royal Enfield Classic 350"
    },
    
    "summary": "Honda CB350 is the most well-rounded package with excellent reliability, fuel efficiency, and features. Royal Enfield Classic 350 is best for those who prioritize highway comfort and brand heritage. Jawa 42 is a good budget option but lacks the refinement and reliability of the other two.",
    
    "priceToPerformanceRatio": {
      "Honda CB350": 4.4,
      "Royal Enfield Classic 350": 4.3,
      "Jawa 42": 4.5
    }
  },
  
  "metadata": {
    "dataSource": "AI-generated comparative analysis",
    "confidence": 0.88,
    "bikesCompared": 3,
    "parametersAnalyzed": 15,
    "generatedAt": "2025-10-05T10:30:00Z",
    "disclaimer": "Comparison is AI-generated based on available data and may vary based on individual usage and location"
  }
}
```

---

## 🎯 Gemini Prompt Templates

### **For Bike Insights**

```
You are a motorcycle expert in India with extensive knowledge of bike ownership experiences. 
Provide comprehensive ownership data for {bikeName} including:

1. Overall scores (ownership, reliability, value for money)
2. Detailed cost breakdown (purchase, maintenance, insurance, fuel, repairs)
3. Performance metrics (fuel efficiency, power, torque)
4. Common issues with severity and solutions
5. Positive and negative aspects with ratings
6. Ideal user demographics
7. Resale value analysis

Return ONLY valid JSON in the exact schema provided. Use realistic Indian market data.
```

### **For Comparative Analysis**

```
You are a motorcycle expert comparing bikes in the Indian market.
Compare the following bikes: {bikeList}

Provide detailed comparison on:
1. Design & Aesthetics
2. Performance & Ride Quality  
3. Costs & Ownership (purchase, maintenance, resale)
4. Features & Technology
5. Reliability & Durability
6. Riding Characteristics (city, highway, handling)

For each category:
- Rate each bike (out of 5)
- Declare a winner
- Provide detailed analysis
- Include specific data points

Finally provide overall rankings and recommendations for different use cases.

Return ONLY valid JSON in the exact schema provided.
```

---

## 📊 Response Size Estimates

- **Bike Insights**: ~3-5 KB per response
- **Comparative Analysis**: ~8-12 KB per response (3 bikes)

## 🔄 Caching Strategy

To reduce API costs:
1. Cache bike insights for 7 days
2. Cache comparisons for 3 days
3. Update when new user data is available
4. Store in Firestore for persistence

## ✅ Data Validation

AI responses should be validated for:
- Required fields present
- Numeric values in valid ranges
- Dates in proper format
- Currency consistency
- Score values (0-5)

---

This schema ensures consistent, structured, and useful AI responses for your application!
