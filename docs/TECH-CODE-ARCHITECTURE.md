# 🏛️ Code Architecture - Three-Layer Pattern

## Overview

All DhakDhakGo microservices follow a **three-layer architecture** for clean separation of concerns.

---

## 📐 The Three Layers

```
Request (HTTP)
   ↓
┌─────────────────────────────────┐
│      Controller Layer           │  ← HTTP concerns only
│                                 │
│  • Parse request (req, res)     │
│  • Extract params/body/query    │
│  • Call service layer           │
│  • Format HTTP response         │
│  • Handle errors (try/catch)    │
│  • Return status codes          │
└──────────────┬──────────────────┘
               ↓
┌─────────────────────────────────┐
│       Service Layer             │  ← Business logic
│                                 │
│  • Business validation          │
│  • Data transformation          │
│  • Orchestration                │
│  • External API calls           │
│  • Transaction management       │
│  • Throw business errors        │
└──────────────┬──────────────────┘
               ↓
┌─────────────────────────────────┐
│     Repository Layer            │  ← Data access
│                                 │
│  • Firestore queries            │
│  • CRUD operations              │
│  • Data mapping (to/from DB)    │
│  • Query building               │
└─────────────────────────────────┘
```

---

## 🎯 Layer Responsibilities

### **Controller Layer**

**Responsibilities:**
- ✅ Parse HTTP requests
- ✅ Extract authentication data
- ✅ Call service methods
- ✅ Format HTTP responses
- ✅ Handle HTTP errors
- ✅ Return proper status codes

**Does NOT:**
- ❌ Business logic
- ❌ Database queries
- ❌ Data validation
- ❌ External API calls

**Example:**

```javascript
// controllers/reviewController.js
const createReview = async (req, res, next) => {
  try {
    // Extract data from request
    const authorId = req.user.uid;
    const reviewData = req.body;

    // Call service layer
    const review = await reviewService.createReview(authorId, reviewData);

    // Return HTTP response
    res.status(201).json({
      success: true,
      message: 'Review created successfully',
      data: review
    });
  } catch (error) {
    next(error);
  }
};
```

---

### **Service Layer**

**Responsibilities:**
- ✅ Business logic and validation
- ✅ Orchestrate multiple operations
- ✅ Call other services (HTTP)
- ✅ Data transformation
- ✅ Transaction management
- ✅ Throw business errors

**Does NOT:**
- ❌ HTTP concerns (req, res)
- ❌ Direct database queries
- ❌ HTTP status codes

**Example:**

```javascript
// services/reviewService.js
const createReview = async (authorId, reviewData) => {
  // 1. Verify user exists
  const user = await userService.getUserById(authorId);
  if (!user) {
    throw new Error('User not found');
  }

  // 2. Create and validate review
  const review = new BikeReview({ ...reviewData, authorId });
  const validation = review.validate();
  if (!validation.valid) {
    throw new Error(`Validation failed: ${validation.errors.join(', ')}`);
  }

  // 3. Get AI insights (optional, non-blocking)
  try {
    const aiData = await aiService.getBikeInsights(review.bikeName);
    if (aiData) review.setAIData(aiData);
  } catch (error) {
    console.warn('AI insights failed:', error.message);
  }

  // 4. Save to database
  const savedReview = await reviewRepository.create(review);

  // 5. Update counters
  try {
    await userService.incrementCounter(authorId, 'totalReviews');
  } catch (error) {
    console.error('Counter update failed:', error);
  }

  return savedReview;
};
```

---

### **Repository Layer**

**Responsibilities:**
- ✅ Firestore queries
- ✅ CRUD operations
- ✅ Data mapping (Model ↔ Firestore)
- ✅ Query building

**Does NOT:**
- ❌ Business logic
- ❌ Validation
- ❌ External service calls

**Example:**

```javascript
// repositories/reviewRepository.js
const create = async (review) => {
  const db = getFirestore();
  
  // Save to Firestore
  const docRef = await db.collection('bikeReviews').add(
    review.toFirestore()
  );
  
  // Fetch created document
  const doc = await db.collection('bikeReviews').doc(docRef.id).get();
  
  // Map to model
  return BikeReview.fromFirestore(doc);
};

const findById = async (reviewId) => {
  const db = getFirestore();
  const doc = await db.collection('bikeReviews').doc(reviewId).get();
  
  return doc.exists ? BikeReview.fromFirestore(doc) : null;
};
```

---

## 📁 File Structure

```
services/[service-name]/src/
├── controllers/
│   ├── reviewController.js       ← HTTP handling
│   └── experienceController.js
│
├── services/
│   ├── reviewService.js          ← Business logic
│   └── experienceService.js
│
├── repositories/
│   ├── reviewRepository.js       ← Data access
│   └── experienceRepository.js
│
├── models/
│   ├── BikeReview.js             ← Data models
│   └── OwnershipExperience.js
│
├── routes/
│   ├── reviews.js                ← Route definitions
│   └── experiences.js
│
├── middleware/
│   ├── auth-middleware.js        ← Authentication
│   └── errorHandler.js           ← Error handling
│
├── config/
│   └── firestore.js              ← Config
│
└── index.js                      ← App entry point
```

---

## 🔄 Data Flow Example

### **Creating a Review:**

```
1. HTTP POST /api/reviews
   ↓
2. reviewController.createReview(req, res)
   - Extract: authorId, reviewData
   - Call: reviewService.createReview(authorId, reviewData)
   ↓
3. reviewService.createReview(authorId, reviewData)
   - Verify user exists
   - Validate review data
   - Get AI insights
   - Call: reviewRepository.create(review)
   - Update user counter
   - Return: saved review
   ↓
4. reviewRepository.create(review)
   - Save to Firestore
   - Return: BikeReview instance
   ↓
5. reviewController
   - Format response
   - Return: 201 Created with review data
```

---

## ✅ Benefits

### **1. Separation of Concerns**
- Each layer has a single responsibility
- Easy to understand what each file does

### **2. Testability**
```javascript
// Test business logic without HTTP
describe('reviewService', () => {
  it('should create review', async () => {
    const review = await reviewService.createReview(userId, data);
    expect(review).toBeDefined();
  });
});

// Mock repository for service tests
jest.mock('../repositories/reviewRepository');
```

### **3. Reusability**
- Service methods can be called from multiple controllers
- Repository methods can be shared across services

### **4. Maintainability**
- Database changes only affect repositories
- Business logic changes only affect services
- HTTP changes only affect controllers

### **5. Flexibility**
- Easy to switch databases (update repositories only)
- Easy to add new endpoints (add controllers)
- Easy to change business rules (update services)

---

## 🔄 Before vs After Refactoring

### **Before (Everything in Controller):**

```javascript
// ❌ BAD: 200+ lines, mixed concerns
const createReview = async (req, res, next) => {
  try {
    const db = getFirestore();
    const authorId = req.user.uid;
    
    // HTTP parsing
    const reviewData = { ...req.body, authorId };
    
    // Business logic
    const userProfile = await getUserProfile(authorId);
    if (!userProfile) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    const review = new BikeReview(reviewData);
    const validation = review.validate();
    if (!validation.valid) {
      return res.status(400).json({ errors: validation.errors });
    }
    
    const aiInsights = await getBikeInsights(review.bikeName);
    if (aiInsights) review.setAIData(aiInsights);
    
    // Data access
    const docRef = await db.collection('bikeReviews').add(review.toFirestore());
    await incrementUserCounter(authorId, 'totalReviews');
    const createdDoc = await db.collection('bikeReviews').doc(docRef.id).get();
    const createdReview = BikeReview.fromFirestore(createdDoc);
    
    // HTTP response
    res.status(201).json({ success: true, data: createdReview });
  } catch (error) {
    next(error);
  }
};
```

### **After (Clean Separation):**

```javascript
// ✅ GOOD: Controller - HTTP only
const createReview = async (req, res, next) => {
  try {
    const authorId = req.user.uid;
    const reviewData = req.body;
    const review = await reviewService.createReview(authorId, reviewData);
    res.status(201).json({ success: true, data: review });
  } catch (error) {
    next(error);
  }
};

// ✅ GOOD: Service - Business logic
const createReview = async (authorId, reviewData) => {
  await userService.getUserById(authorId);
  const review = new BikeReview({ ...reviewData, authorId });
  const validation = review.validate();
  if (!validation.valid) throw new Error('Validation failed');
  
  const aiData = await aiService.getBikeInsights(review.bikeName);
  if (aiData) review.setAIData(aiData);
  
  const savedReview = await reviewRepository.create(review);
  await userService.incrementCounter(authorId, 'totalReviews');
  return savedReview;
};

// ✅ GOOD: Repository - Data access
const create = async (review) => {
  const db = getFirestore();
  const docRef = await db.collection('bikeReviews').add(review.toFirestore());
  const doc = await db.collection('bikeReviews').doc(docRef.id).get();
  return BikeReview.fromFirestore(doc);
};
```

---

## 📊 Code Quality Metrics

| Metric | Before | After |
|--------|--------|-------|
| Controller LOC | 200-300 | 50-100 |
| Code Duplication | High | Low |
| Testability | Hard | Easy |
| Maintainability | Low | High |
| Reusability | Low | High |

---

## 📚 Related Documentation

- **[Architecture Overview](./02-ARCHITECTURE.md)** - System design
- **[Data Models](./TECH-DATA-MODELS.md)** - Model definitions
- **Service READMEs** - Implementation examples

---

This architecture makes the codebase professional, maintainable, and scalable! 🚀
