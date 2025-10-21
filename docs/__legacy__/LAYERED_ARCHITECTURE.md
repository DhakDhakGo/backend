# Layered Architecture Pattern

## 🏗️ Three-Layer Architecture

We follow a clean separation of concerns with three distinct layers:

```
Request
   ↓
┌─────────────────┐
│   Controller    │  ← HTTP concerns (req, res, error handling)
└────────┬────────┘
         ↓
┌─────────────────┐
│    Service      │  ← Business logic
└────────┬────────┘
         ↓
┌─────────────────┐
│   Repository    │  ← Data access (Firestore)
└─────────────────┘
```

---

## 📦 Layer Responsibilities

### **1. Controller Layer** (`controllers/`)

**Responsibility**: Handle HTTP requests and responses

**Does**:
- ✅ Parse request params, body, query
- ✅ Extract authentication data (req.user)
- ✅ Call service layer methods
- ✅ Format HTTP responses
- ✅ Handle HTTP errors (try/catch)
- ✅ Return proper status codes

**Doesn't**:
- ❌ Business logic
- ❌ Database queries
- ❌ Data validation
- ❌ External API calls

**Example**:
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

### **2. Service Layer** (`services/`)

**Responsibility**: Business logic and orchestration

**Does**:
- ✅ Business logic validation
- ✅ Orchestrate multiple operations
- ✅ Call other services (User Service, AI Service)
- ✅ Data transformation
- ✅ Transaction management
- ✅ Throw business logic errors

**Doesn't**:
- ❌ HTTP concerns (req, res)
- ❌ Direct database queries (uses repositories)
- ❌ HTTP status codes

**Example**:
```javascript
// services/reviewService.js
const createReview = async (authorId, reviewData) => {
  // 1. Verify user exists
  const user = await userService.getUserById(authorId);
  if (!user) {
    throw new Error('User not found');
  }

  // 2. Create review instance
  const review = new BikeReview({ ...reviewData, authorId });

  // 3. Validate
  const validation = review.validate();
  if (!validation.valid) {
    throw new ValidationError(validation.errors);
  }

  // 4. Get AI insights
  const aiInsights = await aiService.getBikeInsights(review.bikeName);
  if (aiInsights) {
    review.setAIData(aiInsights);
  }

  // 5. Save to database
  const savedReview = await reviewRepository.create(review);

  // 6. Update user counter
  await userService.incrementCounter(authorId, 'totalReviews');

  return savedReview;
};
```

---

### **3. Repository Layer** (`repositories/`)

**Responsibility**: Data access abstraction

**Does**:
- ✅ Direct Firestore queries
- ✅ CRUD operations
- ✅ Query building
- ✅ Data mapping (Firestore ↔ Model)

**Doesn't**:
- ❌ Business logic
- ❌ Validation
- ❌ External service calls

**Example**:
```javascript
// repositories/reviewRepository.js
const create = async (review) => {
  const db = getFirestore();
  const docRef = await db.collection('bikeReviews').add(review.toFirestore());
  const doc = await db.collection('bikeReviews').doc(docRef.id).get();
  return BikeReview.fromFirestore(doc);
};

const findById = async (id) => {
  const db = getFirestore();
  const doc = await db.collection('bikeReviews').doc(id).get();
  return doc.exists ? BikeReview.fromFirestore(doc) : null;
};
```

---

## 🎯 Benefits

### **Separation of Concerns**:
- Each layer has a single responsibility
- Easy to understand and maintain

### **Testability**:
- Test business logic without HTTP
- Mock repositories for service tests
- Mock services for controller tests

### **Reusability**:
- Service methods can be called from multiple controllers
- Repositories can be shared across services

### **Maintainability**:
- Changes to database don't affect controllers
- Changes to HTTP don't affect business logic

---

## 📁 Project Structure (After Refactoring)

```
services/user-service/src/
├── controllers/
│   └── userController.js       ← HTTP handling only
├── services/
│   └── userService.js          ← Business logic
├── repositories/
│   └── userRepository.js       ← Database access
├── models/
│   └── User.js                 ← Data models
├── routes/
│   └── users.js                ← Route definitions
└── middleware/
    └── auth-middleware.js      ← Authentication
```

---

## 🔄 Data Flow Example

### **Creating a Review:**

```
HTTP Request
    ↓
Controller (reviewController.js)
  - Extracts: authorId, reviewData
  - Calls: reviewService.createReview(authorId, reviewData)
    ↓
Service (reviewService.js)
  - Validates data
  - Calls: userService.getUserById(authorId)
  - Calls: aiService.getBikeInsights(bikeName)
  - Calls: reviewRepository.create(review)
  - Calls: userService.incrementCounter(authorId)
  - Returns: created review
    ↓
Repository (reviewRepository.js)
  - Executes: db.collection('bikeReviews').add(...)
  - Returns: BikeReview instance
    ↓
Service
  - Returns: review to controller
    ↓
Controller
  - Formats: { success: true, data: review }
  - Sends: HTTP 201 response
```

---

This pattern makes the code much cleaner, more testable, and easier to maintain!
