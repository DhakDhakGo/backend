# 💼 Business Logic - DhakDhakGo

## Core Features & Workflows

This document explains how each feature works from a business perspective.

---

## 🔐 1. User Management

### **User Registration**

**Flow:**
```
1. User signs up with Firebase (email/Google/phone)
2. Frontend receives Firebase Auth token
3. User calls POST /api/users/register with token
4. User Service creates profile in Firestore
5. Profile includes: name, email, photo, counters (reviews, likes, etc.)
```

**Business Rules:**
- Email must be verified (Firebase handles this)
- Each user gets a unique `userId` (Firebase UID)
- Display name defaults to email prefix
- All counters start at 0

**Data Tracked:**
- Total reviews posted
- Total ownership experiences shared
- Total likes given
- Total comments made

---

## 📝 2. Bike Reviews

### **Creating a Review**

**Flow:**
```
1. User submits review (bike name, rating, content, pros/cons)
2. Post Service validates data
3. Post Service checks if user exists (User Service)
4. Post Service fetches AI insights for the bike (AI Service)
5. Review is saved with AI data enrichment
6. User's review counter is incremented
```

**Business Rules:**
- User must be authenticated
- Bike name is required
- Rating: 1-5 (overall, reliability, comfort, performance, value)
- Content must be at least 50 characters
- Pros and cons are optional arrays
- AI insights are optional (review is saved even if AI fails)

**Data Structure:**
```javascript
{
  bikeName: "Honda CB350",
  bikeModel: "2024",
  authorId: "user123",
  rating: 4.5,
  content: "Great bike for city commuting...",
  pros: ["Fuel efficient", "Comfortable"],
  cons: ["Lacks power on highways"],
  ridingExperience: {
    terrain: "City",
    distance: "5000 km"
  },
  aiEnrichedData: {
    averagePrice: 195000,
    estimatedMaintenance: 5000
  }
}
```

---

## 🏍️ 3. Ownership Experiences

### **Sharing an Experience**

**Flow:**
```
1. User submits ownership experience
2. Post Service validates data
3. Experience is saved with detailed metrics
4. User's experience counter is incremented
```

**Business Rules:**
- User must be authenticated
- Must include: bike name, ownership duration, km driven
- Ratings on: reliability, comfort, performance, value for money
- Maintenance cost tracking
- Fuel efficiency reporting

**Key Metrics Tracked:**
- Ownership duration (months)
- Kilometers driven
- Monthly/yearly maintenance costs
- Actual fuel efficiency (km/l)
- Issues faced with resolutions
- Overall satisfaction score

**Use Case:**
> *"I've owned my Honda CB350 for 18 months, driven 15,000 km. 
> Monthly maintenance: ₹1,500. Fuel efficiency: 42 km/l. 
> Had clutch cable issue at 12,000 km (₹800 to fix). 
> Overall very satisfied!"*

---

## 🤖 4. AI-Powered Insights

### **Generating Bike Insights**

**Flow:**
```
1. User/Service requests insights for a bike
2. AI Service checks cache (7-day TTL)
3. If cached, return immediately
4. If not cached:
   a. Generate prompt for Gemini AI
   b. Call Gemini API
   c. Validate response against schema
   d. If invalid, retry with correction prompt
   e. Cache validated response
5. Return insights
```

**Business Rules:**
- Insights cached for 7 days (reduce AI costs)
- Retry mechanism: 2 attempts max
- Response must match expected JSON schema
- Country-specific data (default: India)

**Insight Categories:**
```javascript
{
  bikeName: "Honda CB350",
  manufacturer: "Honda",
  
  ownershipExperience: {
    overallScore: 4.5,
    reliabilityScore: 4.5,
    valueForMoneyScore: 4.2
  },
  
  costs: {
    purchasePrice: { exShowroom: 195000, onRoad: 225000 },
    maintenance: { monthly: 1500, yearly: 18000 },
    insurance: { annual: 8000 },
    fuelCost: { monthly: 2500 }
  },
  
  performance: {
    engine: { displacement: 350, power: 21, torque: 30 },
    fuelEfficiency: { city: 38, highway: 45 }
  },
  
  commonIssues: [
    { issue: "Clutch cable wear", frequency: "moderate" }
  ],
  
  positiveAspects: ["Reliable engine", "Good fuel economy"],
  negativeAspects: ["Lacks power for highway cruising"]
}
```

---

### **Bike Comparison**

**Flow:**
```
1. User selects 2-5 bikes to compare
2. AI Service checks cache (3-day TTL for comparisons)
3. If not cached, generate comparison using Gemini
4. Compare across categories: design, performance, costs, reliability
5. Provide overall winner and category winners
6. Return structured comparison
```

**Business Rules:**
- Minimum 2 bikes, maximum 5 bikes
- Comparisons cached for 3 days
- Structured comparison across categories
- Recommendations based on use cases (commute, touring, sport)

**Comparison Output:**
```javascript
{
  bikes: ["Honda CB350", "Royal Enfield Classic 350"],
  
  comparison: {
    design: {
      winner: "Royal Enfield Classic 350",
      scores: { "Honda CB350": 4.0, "Royal Enfield": 4.5 }
    },
    performance: {
      winner: "Honda CB350",
      scores: { "Honda CB350": 4.2, "Royal Enfield": 3.8 }
    },
    costs: {
      winner: "Honda CB350",
      scores: { "Honda CB350": 4.5, "Royal Enfield": 4.0 }
    }
  },
  
  overallWinner: "Honda CB350",
  recommendation: {
    dailyCommute: "Honda CB350",
    weekendCruising: "Royal Enfield Classic 350"
  }
}
```

---

## ❤️ 5. Likes

### **Liking Content**

**Flow:**
```
1. User likes a review/experience/comment
2. Interaction Service creates like record
3. Target's like count is incremented
4. User's like counter is incremented
```

**Business Rules:**
- User can like each item only once
- Can like: reviews, ownership experiences, comments
- Can unlike (removes like, decrements counters)
- Liked items tracked per user

**Use Cases:**
- Upvote helpful reviews
- Show appreciation for detailed experiences
- Engage with community

---

## 💬 6. Comments

### **Commenting & Replies**

**Flow:**
```
1. User comments on a review/experience
2. Interaction Service validates and saves comment
3. Target's comment count is incremented
4. User's comment counter is incremented
5. For replies: parent comment's reply count is incremented
```

**Business Rules:**
- Can comment on: reviews, ownership experiences
- Can reply to comments (threaded replies)
- Comment must be at least 10 characters
- User can edit own comments (within 24 hours - future)
- User can delete own comments

**Comment Structure:**
```javascript
{
  userId: "user123",
  targetType: "review",
  targetId: "review456",
  content: "Great review! I had similar experience.",
  parentCommentId: null,  // or parent ID for replies
  likeCount: 5,
  replyCount: 2
}
```

---

## 🔄 Cross-Service Workflows

### **Example: Creating a Review (Full Flow)**

```
1. Frontend → POST /api/reviews (with auth token)
   ↓
2. Post Service: Validate token
   ↓
3. Post Service → User Service: GET /api/users/{userId}
   ↓ (verify user exists)
4. Post Service → AI Service: POST /api/ai/bike-insights
   ↓ (get bike insights - async, non-blocking)
5. Post Service: Save review to Firestore
   ↓
6. Post Service → User Service: POST /api/users/{userId}/counters
   ↓ (increment totalReviews counter)
7. Post Service → Frontend: 201 Created (review data)
```

### **Example: Liking a Review**

```
1. Frontend → POST /api/likes (targetType: review, targetId: review123)
   ↓
2. Interaction Service: Validate token
   ↓
3. Interaction Service: Check if already liked
   ↓
4. Interaction Service: Save like to Firestore
   ↓
5. Interaction Service → Post Service: POST /counters/increment
   ↓ (increment likeCount on review)
6. Interaction Service → Frontend: 201 Created
```

---

## 📊 Data Consistency

### **Counter Management:**

Counters are tracked in two places:
1. **User level**: Total reviews, experiences, likes, comments
2. **Content level**: Like count, comment count per review/experience

**Consistency Strategy:**
- Counters updated atomically using Firestore `FieldValue.increment()`
- If counter update fails, operation continues (logged as warning)
- Eventual consistency accepted for counters
- Can be reconciled periodically (future background job)

---

## 🎯 Validation Rules Summary

### **Reviews:**
- Bike name: Required, min 2 chars
- Rating: 1-5, required
- Content: Min 50 chars
- Pros/Cons: Array of strings, optional

### **Experiences:**
- Bike name: Required
- Ownership duration: Positive number (months)
- Km driven: Positive number
- Maintenance cost: Optional, positive number
- Fuel efficiency: Optional, positive number

### **Comments:**
- Content: Min 10 chars, max 1000 chars
- Target type: Must be 'review' or 'experience'
- Parent comment: Must exist if provided

### **Likes:**
- Target type: Must be 'review', 'experience', or 'comment'
- No duplicate likes allowed

---

## 🔮 Future Business Logic

### **Planned Features:**

1. **Verified Ownership**
   - Upload registration document
   - Badge for verified owners
   - Higher trust score

2. **Service Reminders**
   - Track service schedules
   - Reminders for upcoming services
   - Cost prediction

3. **Bike Value Estimator**
   - Resale value prediction
   - Based on ownership data and market trends

4. **Expert Reviews**
   - Professional reviewers
   - Featured content
   - Higher visibility

5. **Bike Discovery**
   - AI-powered bike recommendations
   - Based on user preferences and budget
   - Personalized suggestions

---

## 📚 Related Documentation

- **[Architecture](./02-ARCHITECTURE.md)** - System design
- **[Data Models](./TECH-DATA-MODELS.md)** - Detailed schemas
- **[AI Implementation](./TECH-AI-IMPLEMENTATION.md)** - AI details

---

**Next**: Learn about [Infrastructure](./04-INFRASTRUCTURE.md) setup!
