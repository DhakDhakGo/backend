# AI Service Design Document

## 🎯 Purpose

The AI Service leverages Google Gemini API to provide **ownership insights and comparative analysis** for bikes, even when your platform has no user-generated data yet. This helps bootstrap your application with valuable content and increases its reach.

## 💡 Core Idea

Instead of scraping the web (legal/technical challenges), we use **Gemini's trained knowledge** to generate realistic, structured ownership data based on real-world information it learned during training.

**Think of it as**: Gemini has "read" millions of bike reviews, forums, and ownership experiences during training. We're asking it to synthesize that knowledge into structured data.

## 🚀 AI Service Capabilities

### **1. Bike Ownership Insights**

**What it does:**
- Generates comprehensive ownership data for any bike
- Includes costs, issues, performance, reliability
- Provides realistic estimates based on market data
- Returns structured JSON format

**Value proposition:**
- Works even with ZERO user data on your platform
- Provides immediate value to users
- Helps users make informed decisions
- Bootstraps your content

**Example:**
```
User: "Tell me about Honda CB350"
AI Service: Returns detailed ownership data with costs, issues, ratings
User: Gets valuable insights immediately (even if no one reviewed it yet)
```

---

### **2. Comparative Analysis**

**What it does:**
- Compares 2-5 bikes across multiple parameters
- Provides category-wise winners
- Ranks bikes overall
- Gives recommendations for different use cases

**Value proposition:**
- Helps users decide between bikes
- Unique feature (not available on other platforms)
- Data-driven decision making
- Increases user engagement

**Example:**
```
User: "Compare Honda CB350 vs Royal Enfield Classic 350"
AI Service: Returns detailed comparison across 6 categories
User: Can see which bike wins in what aspect
```

---

## 🎨 API Design

### **Endpoint 1: Get Bike Insights**

```http
POST /api/ai/bike-insights
Content-Type: application/json

{
  "bikeName": "Honda CB350",
  "bikeModel": "H'Ness",
  "country": "India"
}
```

**Response**: 3-5 KB JSON with ownership data (see AI_RESPONSE_SCHEMAS.md)

---

### **Endpoint 2: Compare Bikes**

```http
POST /api/ai/compare-bikes
Content-Type: application/json

{
  "bikes": [
    { "name": "Honda CB350", "variant": "H'Ness" },
    { "name": "Royal Enfield Classic 350", "variant": "Standard" }
  ],
  "compareOn": ["performance", "costs", "reliability", "features"],
  "country": "India"
}
```

**Response**: 8-12 KB JSON with comparative analysis

---

## 🧠 Gemini Integration Strategy

### **Prompt Engineering**

```javascript
const systemPrompt = `
You are a motorcycle expert in India with extensive knowledge of bike 
ownership experiences, costs, and market trends. You have analyzed thousands 
of owner reviews, maintenance records, and market data.

Provide accurate, realistic data based on actual market conditions in India.
All costs should be in INR. All distances in kilometers.

Return responses ONLY in valid JSON format matching the exact schema provided.
Do not include markdown formatting or code blocks.
`;
```

### **Structured Output**

Using Gemini's JSON mode:
```javascript
const model = genAI.getGenerativeModel({ 
  model: "gemini-pro",
  generationConfig: {
    temperature: 0.7,  // Balanced creativity
    topK: 40,
    topP: 0.95,
    maxOutputTokens: 2048,
  }
});
```

---

## 💾 Caching Strategy

To reduce costs and improve performance:

### **Cache in Firestore**

```javascript
// Collection: aiInsightsCache
{
  cacheKey: "bike_insights_honda_cb350",
  bikeName: "Honda CB350",
  data: { ... }, // Full AI response
  createdAt: Timestamp,
  expiresAt: Timestamp, // 7 days from creation
  hitCount: 0
}
```

### **Cache Logic**

```javascript
1. Check if cache exists and is not expired
2. If cache hit: Return cached data (increment hitCount)
3. If cache miss: Call Gemini API
4. Store response in cache
5. Return data
```

### **Benefits:**
- ✅ Reduces API costs (Gemini charges per request)
- ✅ Faster response times
- ✅ Analytics on popular bikes (via hitCount)
- ✅ Can update cache periodically

---

## 📊 Cost Analysis

### **Gemini API Pricing** (approximate):
- ~$0.00025 per 1K characters for input
- ~$0.001 per 1K characters for output

### **Per Request Estimate:**
- Bike Insights: ~$0.005 per request
- Comparison (3 bikes): ~$0.015 per request

### **With Caching (7-day cache):**
- Popular bikes: 1 API call serves 100+ users
- Effective cost: <$0.0001 per user

---

## 🔐 Security Considerations

### **API Key Protection**
- Store Gemini API key in Cloud Run environment variables
- Use Secret Manager for production
- Never expose in client-side code

### **Rate Limiting**
- Limit requests per user: 10/hour
- Limit requests per IP: 50/hour
- Cache aggressively

### **Input Validation**
- Sanitize bike names
- Limit bike comparison to max 5 bikes
- Validate input length

---

## 🎯 Use Cases in Your Application

### **Scenario 1: User Searches for a Bike**
```
User searches: "Honda CB350"
→ Call AI Service for insights
→ Display ownership costs, issues, ratings
→ User gets immediate value (even if no reviews exist)
```

### **Scenario 2: User Creates a Review**
```
User creates review for: "Honda CB350"
→ Call AI Service for baseline data
→ Show user how their experience compares to general data
→ Auto-fill cost estimates if user doesn't provide
```

### **Scenario 3: User Compares Bikes**
```
User selects: "Honda CB350 vs Royal Enfield Classic 350"
→ Call AI Service for comparison
→ Display side-by-side comparison
→ Show which bike wins in what category
→ Help user make informed decision
```

### **Scenario 4: "Find My Bike" Feature**
```
User inputs: Budget, usage, preferences
→ AI Service recommends bikes with detailed comparison
→ User discovers bikes they might not have considered
→ Increases platform engagement
```

---

## 🚀 Implementation Priority

### **Phase 1: Bike Insights** (Implement First)
- Single bike ownership data
- Core feature for initial launch
- Highest value with minimal complexity

### **Phase 2: Comparative Analysis** (Implement Second)
- Compare 2-3 bikes
- Differentiating feature
- Increases user engagement

### **Phase 3: Caching Layer** (Implement Third)
- Add Firestore caching
- Reduce API costs
- Improve performance

---

## 📈 Success Metrics

1. **API Response Time**: < 3 seconds
2. **Cache Hit Rate**: > 80% after 1 month
3. **Data Accuracy**: User feedback on AI data quality
4. **Cost per Insight**: < $0.001 with caching
5. **User Engagement**: Time spent on AI-generated insights

---

## ⚠️ Limitations & Disclaimers

### **Important to Display:**
```
"This data is AI-generated based on general market information and user 
experiences from across the internet. Actual costs and experiences may vary 
based on your location, riding style, and maintenance practices. 

For the most accurate information, please refer to user reviews and 
ownership experiences shared by our community."
```

### **Data Freshness:**
- AI data based on Gemini's training cutoff
- May not reflect very recent model updates
- Combine with user-generated content as platform grows

---

## 🎯 Conclusion

Your AI service will:

1. ✅ **Provide immediate value** with zero user data
2. ✅ **Generate realistic insights** from Gemini's knowledge
3. ✅ **Differentiate your platform** from competitors
4. ✅ **Scale efficiently** with caching
5. ✅ **Complement user content** as platform grows

This is a **smart bootstrap strategy** - provide AI-generated insights initially, then gradually shift to user-generated content as your platform grows!

Would you like me to implement the AI Service with these capabilities?
