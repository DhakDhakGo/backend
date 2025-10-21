# Data Models for Bike Posts Application

## 📊 Firestore Collection Structure

```
/users/{userId}
/bikeReviews/{reviewId}
/ownershipExperiences/{experienceId}
/likes/{likeId}
/comments/{commentId}
```

## 🗂️ Collection Schemas

### 1. Users Collection (`/users/{userId}`)

```javascript
{
  userId: "firebase-auth-uid",           // Firebase Auth UID
  email: "user@example.com",
  displayName: "John Doe",
  photoURL: "https://...",
  createdAt: Timestamp,
  updatedAt: Timestamp,
  metadata: {
    totalReviews: 0,
    totalExperiences: 0,
    totalLikes: 0,
    totalComments: 0
  }
}
```

**Purpose**: Store user profile information  
**Source**: Created when user first authenticates  
**Service**: Post Service

---

### 2. Bike Reviews Collection (`/bikeReviews/{reviewId}`)

```javascript
{
  reviewId: "auto-generated-id",
  authorId: "firebase-auth-uid",         // Reference to users collection
  bikeName: "Honda CB350",
  bikeModel: "CB350",
  bikeManufacturer: "Honda",
  bikeYear: 2023,
  
  // Review content
  title: "Amazing bike for city riding",
  content: "Full review text here...",
  rating: 4.5,                           // Out of 5
  
  // Review categories (optional)
  categories: {
    performance: 4.5,
    comfort: 4.0,
    fuelEfficiency: 4.5,
    maintenance: 4.0,
    valueForMoney: 4.5
  },
  
  // AI-generated data (from AI Service)
  aiData: {
    maintenanceCosts: {
      monthly: 1500,
      yearly: 18000,
      currency: "INR"
    },
    repairCosts: {
      average: 5000,
      currency: "INR"
    },
    overallScore: 4.2,
    recommendation: "Good for city commuting",
    generatedAt: Timestamp
  },
  
  // Metadata
  createdAt: Timestamp,
  updatedAt: Timestamp,
  status: "published",                   // draft, published, archived
  visibility: "public",                  // public, private
  
  // Interaction counters (denormalized for performance)
  interactions: {
    likes: 0,
    comments: 0,
    views: 0
  },
  
  // Tags for search/filtering
  tags: ["honda", "commuter", "150cc"],
  
  // Media
  images: [
    {
      url: "https://storage.googleapis.com/...",
      caption: "Bike front view",
      order: 0
    }
  ]
}
```

**Purpose**: Store bike reviews  
**Service**: Post Service  
**Indexes Required**: `authorId`, `bikeName`, `createdAt`, `status`

---

### 3. Ownership Experiences Collection (`/ownershipExperiences/{experienceId}`)

```javascript
{
  experienceId: "auto-generated-id",
  authorId: "firebase-auth-uid",         // Reference to users collection
  bikeName: "Honda CB350",
  bikeModel: "CB350",
  bikeManufacturer: "Honda",
  
  // Ownership details
  purchaseDate: Timestamp,
  currentOwnership: true,                // Still owns the bike
  soldDate: Timestamp | null,
  ownershipDuration: 365,                // Days
  totalDistance: 15000,                  // Kilometers
  
  // Experience content
  title: "1 year with Honda CB350",
  content: "My ownership experience...",
  
  // Cost breakdown
  costs: {
    purchasePrice: 200000,
    maintenance: [
      {
        date: Timestamp,
        description: "First service",
        cost: 2000,
        odometer: 1000
      }
    ],
    repairs: [
      {
        date: Timestamp,
        description: "Brake pad replacement",
        cost: 3000,
        odometer: 10000
      }
    ],
    fuel: {
      averageMileage: 35,                // km/liter
      monthlyFuelCost: 2000
    },
    insurance: {
      annual: 5000
    },
    totalCost: 225000,
    currency: "INR"
  },
  
  // Pros and Cons
  pros: [
    "Excellent fuel efficiency",
    "Smooth ride quality"
  ],
  cons: [
    "Limited top speed",
    "Expensive spare parts"
  ],
  
  // AI-generated insights (from AI Service)
  aiData: {
    costEfficiency: 4.5,
    reliabilityScore: 4.0,
    comparison: "Better than average in this segment",
    generatedAt: Timestamp
  },
  
  // Metadata
  createdAt: Timestamp,
  updatedAt: Timestamp,
  status: "published",
  visibility: "public",
  
  // Interaction counters
  interactions: {
    likes: 0,
    comments: 0,
    views: 0
  },
  
  // Tags
  tags: ["honda", "ownership", "long-term"],
  
  // Media
  images: [
    {
      url: "https://storage.googleapis.com/...",
      caption: "Odometer reading",
      order: 0
    }
  ]
}
```

**Purpose**: Store ownership experience posts  
**Service**: Post Service  
**Indexes Required**: `authorId`, `bikeName`, `currentOwnership`, `createdAt`

---

### 4. Likes Collection (`/likes/{likeId}`)

```javascript
{
  likeId: "auto-generated-id",
  userId: "firebase-auth-uid",           // Who liked
  postId: "reviewId-or-experienceId",    // What was liked
  postType: "review",                    // "review" or "experience"
  createdAt: Timestamp
}
```

**Purpose**: Store user likes on posts  
**Service**: Interaction Service  
**Indexes Required**: Composite index on `(postId, userId)` for uniqueness  
**Indexes Required**: `userId`, `postId`, `createdAt`

---

### 5. Comments Collection (`/comments/{commentId}`)

```javascript
{
  commentId: "auto-generated-id",
  userId: "firebase-auth-uid",           // Who commented
  postId: "reviewId-or-experienceId",    // Which post
  postType: "review",                    // "review" or "experience"
  
  // Comment content
  content: "Great review! I have the same bike.",
  
  // Metadata
  createdAt: Timestamp,
  updatedAt: Timestamp,
  isEdited: false,
  
  // Interaction counters
  interactions: {
    likes: 0                             // Comments can be liked too
  }
}
```

**Purpose**: Store comments on posts  
**Service**: Interaction Service  
**Indexes Required**: `postId`, `userId`, `createdAt`

---

## 🔗 Relationships

```
User (1) ──┬──▶ Bike Reviews (Many)
           └──▶ Ownership Experiences (Many)

Bike Review (1) ──┬──▶ Likes (Many)
                  └──▶ Comments (Many)

Ownership Experience (1) ──┬──▶ Likes (Many)
                           └──▶ Comments (Many)

Comment (1) ──▶ Likes (Many)
```

## 📝 Design Decisions

### **1. Separate Reviews and Experiences**
- **Reason**: Different data structures and use cases
- **Benefit**: Easier to query and filter
- **Trade-off**: More collections to manage

### **2. Denormalized Counters**
- **Fields**: `interactions.likes`, `interactions.comments`
- **Reason**: Faster read performance
- **Update**: Increment/decrement using Firestore transactions

### **3. Composite Indexes**
```javascript
// likes collection
{
  fields: ["postId", "userId"],
  queryScope: "COLLECTION"
}

// comments collection
{
  fields: ["postId", "createdAt"],
  queryScope: "COLLECTION"
}
```

### **4. AI Data Embedded**
- **Reason**: AI data is specific to each post
- **Benefit**: Single read operation
- **Trade-off**: Larger documents

## 🎯 Query Patterns

### **Get all reviews by a user**
```javascript
db.collection('bikeReviews')
  .where('authorId', '==', userId)
  .orderBy('createdAt', 'desc')
  .get()
```

### **Get all reviews for a bike**
```javascript
db.collection('bikeReviews')
  .where('bikeName', '==', 'Honda CB350')
  .where('status', '==', 'published')
  .orderBy('createdAt', 'desc')
  .get()
```

### **Get comments for a post**
```javascript
db.collection('comments')
  .where('postId', '==', reviewId)
  .orderBy('createdAt', 'asc')
  .get()
```

### **Check if user liked a post**
```javascript
db.collection('likes')
  .where('postId', '==', reviewId)
  .where('userId', '==', userId)
  .limit(1)
  .get()
```

## 🔒 Security Rules

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    
    // Users can only read/write their own data
    match /users/{userId} {
      allow read: if request.auth != null;
      allow write: if request.auth != null && request.auth.uid == userId;
    }
    
    // Reviews
    match /bikeReviews/{reviewId} {
      allow read: if resource.data.visibility == 'public' || 
                     (request.auth != null && request.auth.uid == resource.data.authorId);
      allow create: if request.auth != null && request.resource.data.authorId == request.auth.uid;
      allow update, delete: if request.auth != null && request.auth.uid == resource.data.authorId;
    }
    
    // Ownership Experiences
    match /ownershipExperiences/{experienceId} {
      allow read: if resource.data.visibility == 'public' || 
                     (request.auth != null && request.auth.uid == resource.data.authorId);
      allow create: if request.auth != null && request.resource.data.authorId == request.auth.uid;
      allow update, delete: if request.auth != null && request.auth.uid == resource.data.authorId;
    }
    
    // Likes
    match /likes/{likeId} {
      allow read: if request.auth != null;
      allow create: if request.auth != null && request.resource.data.userId == request.auth.uid;
      allow delete: if request.auth != null && request.auth.uid == resource.data.userId;
    }
    
    // Comments
    match /comments/{commentId} {
      allow read: if request.auth != null;
      allow create: if request.auth != null && request.resource.data.userId == request.auth.uid;
      allow update, delete: if request.auth != null && request.auth.uid == resource.data.userId;
    }
  }
}
```

## 📈 Performance Considerations

1. **Use composite indexes** for complex queries
2. **Denormalize interaction counts** for faster reads
3. **Paginate queries** with cursor-based pagination
4. **Cache frequently accessed data** in the client
5. **Use batch writes** for atomic updates

## 🚀 Next Steps

1. Implement model classes/schemas
2. Create Firestore indexes
3. Implement CRUD operations
4. Add validation logic
5. Deploy and test
