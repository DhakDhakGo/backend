# Code Organization & Shared Resources

## 📁 Project Structure

```
backend/
├── services/
│   ├── shared/                    # Shared code across services
│   │   ├── auth-middleware.js     # ✅ Shared authentication
│   │   ├── http-client.js         # ✅ Inter-service communication
│   │   └── firebase-config.js     # ✅ Firebase configuration
│   │
│   ├── user-service/              # User management (Port 3004)
│   ├── post-service/              # Posts & reviews (Port 3001)
│   ├── ai-service/                # AI insights (Port 3002)
│   └── interaction-service/       # Likes & comments (Port 3003)
│
├── infrastructure/                # Terraform IaC
│   └── terraform/
│       ├── main.tf
│       ├── services.tf
│       ├── firebase.tf
│       └── variables.tf
│
├── docs/                          # Documentation
│   ├── ARCHITECTURE.md
│   ├── DATA_MODELS.md
│   ├── AI_SERVICE_DESIGN.md
│   └── CODE_ORGANIZATION.md
│
├── scripts/                       # Deployment scripts
│   ├── deploy-infrastructure.ps1
│   └── deploy-firestore-config.ps1
│
├── firestore.rules               # Firestore security rules
├── firestore.indexes.json        # Firestore indexes
└── package.json                  # Root package with scripts
```

---

## 🔄 Shared Resources

### **1. Auth Middleware (`services/shared/auth-middleware.js`)**

**Purpose**: Firebase authentication middleware used by all services

**Exports**:
- `authenticateToken` - Verify Firebase token (required)
- `optionalAuth` - Optional authentication
- `getUserInfo` - Extract user info from token
- `isOwner` - Check if user owns the resource
- `admin` - Firebase Admin SDK instance

**Used by**:
- ✅ User Service
- ✅ Post Service
- ✅ Interaction Service
- ❌ AI Service (no auth required for now)

**Usage Example**:
```javascript
const { authenticateToken, isOwner } = require('../../shared/auth-middleware');

// Protect endpoint
router.get('/protected', authenticateToken, (req, res) => {
  // req.user contains decoded token
});

// Protect user's own resource
router.put('/users/:userId', authenticateToken, isOwner, (req, res) => {
  // Only the user can update their own profile
});
```

---

### **2. HTTP Client (`services/shared/http-client.js`)**

**Purpose**: Inter-service communication helper

**Exports**:
- `callUserService(method, path, data)` - Call User Service
- `callPostService(method, path, data)` - Call Post Service
- `callAIService(method, path, data)` - Call AI Service
- `callInteractionService(method, path, data)` - Call Interaction Service
- `getUserProfile(userId)` - Get user profile
- `verifyUserExists(userId)` - Check if user exists

**Used by**:
- Post Service → Calls User Service and AI Service
- Interaction Service → Calls User Service and Post Service
- AI Service → Can call Post Service for data

**Usage Example**:
```javascript
const { getUserProfile, callAIService } = require('../../shared/http-client');

// Verify user exists
const userProfile = await getUserProfile(userId);
if (!userProfile) {
  throw new Error('User not found');
}

// Get AI insights
const aiData = await callAIService('POST', '/api/ai/bike-insights', {
  bikeName: 'Honda CB350'
});
```

---

### **3. Firebase Config (`services/shared/firebase-config.js`)**

**Purpose**: Firebase configuration shared across services

**Exports**:
- `firebaseConfig` - Client SDK configuration
- `adminConfig` - Admin SDK configuration

**Used by**:
- All services that need Firebase configuration

---

## 🗑️ Cleaned Up

### **Removed Duplicates**:
- ❌ `services/post-service/src/auth-middleware.js` (deleted - use shared version)
- ❌ `services/user-service/src/middleware/auth-middleware.js` (deleted - use shared version)

### **Consolidated to**:
- ✅ `services/shared/auth-middleware.js` (single source of truth)

---

## 📦 Service-Specific Code

Each service has its own:

### **User Service**
- `models/User.js`
- `controllers/userController.js`
- `routes/users.js`

### **Post Service**
- `models/BikeReview.js`
- `models/OwnershipExperience.js`
- `models/User.js` (can be removed, use User Service instead)

### **AI Service**
- `models/BikeInsights.js`
- `models/BikeComparison.js`

### **Interaction Service**
- `models/Like.js`
- `models/Comment.js`

---

## 🎯 Benefits of This Organization

### **Code Reusability**
- ✅ Write authentication once, use everywhere
- ✅ Consistent error handling
- ✅ Shared utilities reduce duplication

### **Maintainability**
- ✅ Update auth logic in one place
- ✅ Easy to add new services
- ✅ Clear separation of concerns

### **Testing**
- ✅ Test shared code once
- ✅ Mock inter-service calls easily
- ✅ Isolated service testing

---

## 🔧 Best Practices

### **1. Import Shared Code**
```javascript
// ✅ Good - use shared
const { authenticateToken } = require('../../shared/auth-middleware');

// ❌ Bad - duplicate code
const { authenticateToken } = require('./auth-middleware');
```

### **2. Service Communication**
```javascript
// ✅ Good - use http-client
const { callUserService } = require('../../shared/http-client');

// ❌ Bad - direct axios calls
const axios = require('axios');
await axios.get('http://user-service/...');
```

### **3. Firebase Initialization**
```javascript
// ✅ Good - use shared config
const { adminConfig } = require('../../shared/firebase-config');

// ❌ Bad - hardcoded config
admin.initializeApp({ projectId: 'hardcoded-id' });
```

---

## 📋 Checklist for New Services

When adding a new service:

- [ ] Create service directory under `services/`
- [ ] Add `package.json`, `Dockerfile`, `cloudbuild.yaml`
- [ ] Use shared auth-middleware for authentication
- [ ] Use shared http-client for inter-service calls
- [ ] Add service to Terraform variables
- [ ] Update root `package.json` scripts
- [ ] Create service-specific models/controllers/routes
- [ ] Document API endpoints in service README

---

This organization ensures clean, maintainable, and scalable code! 🚀
