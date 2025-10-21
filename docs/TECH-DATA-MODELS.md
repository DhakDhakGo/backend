# 📊 Data Models Reference

Complete reference for all Firestore data models used in DhakDhakGo.

---

## 🗄️ Firestore Collections

```
firestore/
├── users/                    ← User profiles
├── bikeReviews/              ← Bike reviews
├── ownershipExperiences/     ← Ownership experiences
├── likes/                    ← Likes
├── comments/                 ← Comments
└── aiCache/                  ← AI response cache
```

---

## 👤 User Model

**Collection**: `users`  
**Document ID**: Firebase Auth UID

```javascript
{
  userId: string,              // Firebase Auth UID (required)
  email: string,               // User email (required)
  displayName: string,         // Display name
  photoURL: string,            // Profile photo URL
  
  metadata: {
    totalReviews: number,      // Total reviews posted (default: 0)
    totalExperiences: number,  // Total experiences shared (default: 0)
    totalLikes: number,        // Total likes given (default: 0)
    totalComments: number      // Total comments made (default: 0)
  },
  
  createdAt: timestamp,        // Account creation date
  updatedAt: timestamp         // Last update date
}
```

**Example:**
```json
{
  "userId": "abc123",
  "email": "rider@example.com",
  "displayName": "John Rider",
  "photoURL": "https://example.com/photo.jpg",
  "metadata": {
    "totalReviews": 5,
    "totalExperiences": 2,
    "totalLikes": 15,
    "totalComments": 8
  },
  "createdAt": "2024-01-15T10:30:00Z",
  "updatedAt": "2024-01-20T14:20:00Z"
}
```

---

## 📝 Bike Review Model

**Collection**: `bikeReviews`  
**Document ID**: Auto-generated

```javascript
{
  id: string,                  // Document ID (auto-generated)
  bikeName: string,            // Bike name (required)
  bikeModel: string,           // Bike model/year
  authorId: string,            // User ID (required)
  
  rating: {
    overall: number,           // Overall rating (1-5, required)
    reliability: number,       // Reliability rating (1-5)
    comfort: number,           // Comfort rating (1-5)
    performance: number,       // Performance rating (1-5)
    valueForMoney: number      // Value rating (1-5)
  },
  
  title: string,               // Review title
  content: string,             // Review content (min 50 chars)
  
  pros: [string],              // Array of pros
  cons: [string],              // Array of cons
  
  ridingExperience: {
    terrain: string,           // City/Highway/Mixed
    distance: string,          // Distance ridden
    duration: string           // Duration of riding
  },
  
  images: [string],            // Array of image URLs
  tags: [string],              // Tags/categories
  
  aiEnrichedData: {            // AI-generated data (optional)
    averagePrice: number,
    estimatedMaintenance: number,
    fuelEfficiency: number,
    // ... other AI fields
  },
  
  likeCount: number,           // Like count (default: 0)
  commentCount: number,        // Comment count (default: 0)
  
  status: string,              // published/draft/archived
  
  createdAt: timestamp,
  updatedAt: timestamp
}
```

---

## 🏍️ Ownership Experience Model

**Collection**: `ownershipExperiences`  
**Document ID**: Auto-generated

```javascript
{
  id: string,                  // Document ID
  bikeName: string,            // Bike name (required)
  bikeModel: string,           // Model/year
  ownerId: string,             // User ID (required)
  
  ownershipDuration: number,   // Duration in months (required)
  kmDriven: number,            // Total km driven (required)
  
  maintenanceCost: {
    monthly: number,           // Monthly cost
    yearly: number,            // Yearly cost
    totalSpent: number         // Total spent
  },
  
  fuelEfficiency: {
    city: number,              // City km/l
    highway: number,           // Highway km/l
    average: number            // Average km/l
  },
  
  ratings: {
    reliability: number,       // 1-5
    comfort: number,           // 1-5
    performance: number,       // 1-5
    valueForMoney: number      // 1-5
  },
  
  overallExperience: string,   // Detailed experience text
  
  pros: [string],
  cons: [string],
  
  issues: [{
    issue: string,             // Issue description
    occurredAt: number,        // At what km
    resolution: string,        // How it was resolved
    cost: number               // Cost to fix
  }],
  
  images: [string],
  tags: [string],
  
  likeCount: number,
  commentCount: number,
  
  createdAt: timestamp,
  updatedAt: timestamp
}
```

---

## ❤️ Like Model

**Collection**: `likes`  
**Document ID**: Auto-generated

```javascript
{
  id: string,                  // Document ID
  userId: string,              // User who liked (required)
  
  targetType: string,          // review/experience/comment (required)
  targetId: string,            // ID of liked item (required)
  
  createdAt: timestamp
}
```

**Constraints:**
- User can like each item only once
- Composite unique index: (userId, targetType, targetId)

---

## 💬 Comment Model

**Collection**: `comments`  
**Document ID**: Auto-generated

```javascript
{
  id: string,                  // Document ID
  userId: string,              // Comment author (required)
  
  targetType: string,          // review/experience (required)
  targetId: string,            // ID of target (required)
  
  content: string,             // Comment text (min 10 chars, required)
  
  parentCommentId: string,     // Parent comment ID (null for top-level)
  
  likeCount: number,           // Like count (default: 0)
  replyCount: number,          // Reply count (default: 0)
  
  createdAt: timestamp,
  updatedAt: timestamp
}
```

**Threading:**
- Top-level comments: `parentCommentId = null`
- Replies: `parentCommentId = parent comment ID`
- Max nesting: 1 level (replies to replies not allowed)

---

## 🤖 AI Cache Model

**Collection**: `aiCache`  
**Document ID**: Cache key (e.g., `insights_honda_cb350_india`)

```javascript
{
  data: object,                // Cached AI response
  createdAt: timestamp,        // Cache creation time
  expiresAt: timestamp,        // Cache expiration time
  ttlDays: number              // TTL in days
}
```

**Cache Keys:**
- Insights: `insights_{bikeName}_{country}`
- Comparisons: `comparison_{bike1}_vs_{bike2}_{country}`

**TTL:**
- Insights: 7 days
- Comparisons: 3 days

---

## 🔍 Firestore Indexes

### **Required Composite Indexes:**

```json
{
  "collectionGroup": "bikeReviews",
  "queryScope": "COLLECTION",
  "fields": [
    { "fieldPath": "bikeName", "order": "ASCENDING" },
    { "fieldPath": "createdAt", "order": "DESCENDING" }
  ]
}

{
  "collectionGroup": "bikeReviews",
  "queryScope": "COLLECTION",
  "fields": [
    { "fieldPath": "authorId", "order": "ASCENDING" },
    { "fieldPath": "createdAt", "order": "DESCENDING" }
  ]
}

{
  "collectionGroup": "comments",
  "queryScope": "COLLECTION",
  "fields": [
    { "fieldPath": "targetType", "order": "ASCENDING" },
    { "fieldPath": "targetId", "order": "ASCENDING" },
    { "fieldPath": "createdAt", "order": "DESCENDING" }
  ]
}

{
  "collectionGroup": "likes",
  "queryScope": "COLLECTION",
  "fields": [
    { "fieldPath": "userId", "order": "ASCENDING" },
    { "fieldPath": "targetType", "order": "ASCENDING" },
    { "fieldPath": "targetId", "order": "ASCENDING" }
  ]
}
```

---

## 📋 Data Validation Rules

### **User:**
- Email: Valid email format, required
- Display name: 2-50 characters

### **Review:**
- Bike name: Min 2 characters, required
- Rating: 1-5, required
- Content: Min 50 characters
- Pros/Cons: Array, optional

### **Experience:**
- Bike name: Required
- Ownership duration: Positive number
- Km driven: Positive number
- Maintenance cost: Optional, positive
- Fuel efficiency: Optional, positive

### **Comment:**
- Content: 10-1000 characters
- Target type: Must be 'review' or 'experience'
- Parent comment: Must exist if provided

### **Like:**
- Target type: Must be 'review', 'experience', or 'comment'
- No duplicate likes

---

## 🔐 Security Rules

Key security rules enforced:

```javascript
// Users can read all, write own
match /users/{userId} {
  allow read: if true;
  allow write: if request.auth.uid == userId;
}

// Reviews: read all, write own
match /bikeReviews/{reviewId} {
  allow read: if true;
  allow create: if request.auth != null;
  allow update, delete: if request.auth.uid == resource.data.authorId;
}

// Likes: read all, write own
match /likes/{likeId} {
  allow read: if true;
  allow create: if request.auth != null;
  allow delete: if request.auth.uid == resource.data.userId;
}
```

---

## 📚 Model Files Location

**JavaScript Model Classes:**
- User: `services/user-service/src/models/User.js`
- BikeReview: `services/post-service/src/models/BikeReview.js`
- OwnershipExperience: `services/post-service/src/models/OwnershipExperience.js`
- Like: `services/interaction-service/src/models/Like.js`
- Comment: `services/interaction-service/src/models/Comment.js`
- BikeInsights: `services/ai-service/src/models/BikeInsights.js`
- BikeComparison: `services/ai-service/src/models/BikeComparison.js`

---

## 🔄 Related Documentation

- **[Business Logic](./03-BUSINESS-LOGIC.md)** - How data flows
- **[Architecture](./02-ARCHITECTURE.md)** - System overview
- **Service READMEs** - Implementation details

---

**Note**: All timestamps are stored as Firestore Timestamp objects and automatically managed by Firestore.
