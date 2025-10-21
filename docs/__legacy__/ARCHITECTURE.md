# System Architecture

## 🏗️ Microservices Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                          Client App                              │
│                     (Web/Mobile Frontend)                        │
└─────────────────────────┬───────────────────────────────────────┘
                          │
                          │ Firebase Auth Token
                          │
                          ▼
        ┌─────────────────────────────────────────┐
        │         API Gateway (Future)            │
        │        Cloud Endpoints + Auth           │
        └─────────────────┬───────────────────────┘
                          │
          ┌───────────────┼───────────────┬───────────────┐
          │               │               │               │
          ▼               ▼               ▼               ▼
    ┌─────────┐     ┌─────────┐   ┌─────────┐   ┌─────────────┐
    │  User   │     │  Post   │   │   AI    │   │Interaction  │
    │ Service │     │ Service │   │ Service │   │  Service    │
    │:3004    │     │:3001    │   │:3002    │   │:3003        │
    └────┬────┘     └────┬────┘   └────┬────┘   └────┬────────┘
         │               │             │              │
         │               │             │              │
         └───────┬───────┴──────┬──────┴──────┬───────┘
                 │              │             │
                 ▼              ▼             ▼
           ┌──────────────────────────────────────┐
           │         Cloud Firestore               │
           │  ┌─────────────────────────────┐     │
           │  │ Collections:                │     │
           │  │ - users/                    │     │
           │  │ - bikeReviews/              │     │
           │  │ - ownershipExperiences/     │     │
           │  │ - likes/                    │     │
           │  │ - comments/                 │     │
           │  └─────────────────────────────┘     │
           └──────────────────────────────────────┘
                            │
                            ▼
                  ┌──────────────────┐
                  │ Google Gemini API│
                  │  (AI Service)    │
                  └──────────────────┘
```

## 🎯 Service Responsibilities

### **User Service (Port 3004)**
**Responsibility**: User authentication and profile management

**Endpoints**:
- `POST /api/users/register` - Register user on first login
- `GET /api/users/me` - Get current user
- `GET /api/users/:userId` - Get user profile
- `PUT /api/users/:userId` - Update profile
- `GET /api/users/:userId/stats` - Get user statistics

**Database**:
- `users/` collection in Firestore

**Called by**:
- Post Service (to verify user exists)
- Interaction Service (to get user info)
- Client (for profile management)

---

### **Post Service (Port 3001)**
**Responsibility**: CRUD operations for bike reviews and ownership experiences

**Endpoints**:
- `POST /api/posts/reviews` - Create bike review
- `POST /api/posts/experiences` - Create ownership experience
- `GET /api/posts/reviews` - Get all reviews
- `GET /api/posts/experiences` - Get all experiences
- `GET /api/posts/reviews/:id` - Get specific review
- `GET /api/posts/experiences/:id` - Get specific experience

**Database**:
- `bikeReviews/` collection
- `ownershipExperiences/` collection

**Calls**:
- User Service (to verify author)
- AI Service (to get bike insights)

---

### **AI Service (Port 3002)**
**Responsibility**: Generate bike insights and comparisons using Gemini API

**Endpoints**:
- `POST /api/ai/bike-insights` - Get ownership insights for a bike
- `POST /api/ai/compare-bikes` - Compare multiple bikes
- `POST /api/ai/extract-data` - Extract structured data from text (future)

**External APIs**:
- Google Gemini API

**Called by**:
- Post Service (when creating reviews/experiences)
- Client (for bike research)

---

### **Interaction Service (Port 3003)**
**Responsibility**: Handle likes and comments on posts

**Endpoints**:
- `POST /api/interactions/like` - Like a post
- `DELETE /api/interactions/like/:id` - Unlike a post
- `POST /api/interactions/comment` - Comment on a post
- `GET /api/interactions/comments/:postId` - Get comments for a post
- `PUT /api/interactions/comment/:id` - Update comment
- `DELETE /api/interactions/comment/:id` - Delete comment

**Database**:
- `likes/` collection
- `comments/` collection

**Calls**:
- User Service (to get commenter info)
- Post Service (to update interaction counters)

---

## 🔄 Inter-Service Communication

### **Authentication Flow**

```
1. User logs in with Firebase → Gets ID token
2. Client sends request with token → User Service
3. User Service verifies token → Creates/returns user profile
4. Client stores token → Uses for all subsequent requests
```

### **Creating a Review Flow**

```
1. Client → POST /api/posts/reviews (with Firebase token)
2. Post Service:
   - Verifies token
   - Calls User Service → Verify user exists
   - Calls AI Service → Get bike insights
   - Creates review with AI data
   - Calls User Service → Increment totalReviews counter
3. Returns created review
```

### **Liking a Post Flow**

```
1. Client → POST /api/interactions/like
2. Interaction Service:
   - Verifies token
   - Creates like record
   - Calls Post Service → Increment like counter
   - Calls User Service → Increment totalLikes counter
3. Returns success
```

---

## 🔐 Authentication Strategy

### **Two-Level Authentication**

#### **Level 1: Token Verification (All Services)**
```javascript
// Lightweight - just verify Firebase token
app.use(authenticateToken);
// Result: req.user = { uid, email, email_verified, ... }
```

#### **Level 2: User Profile Loading (Optional)**
```javascript
// Heavier - get full user profile from User Service
const userProfile = await getUserProfile(req.user.uid);
```

### **When to Use Each Level**

| Service | Level 1 (Token) | Level 2 (Profile) |
|---------|----------------|-------------------|
| User Service | ✅ Always | ❌ Not needed |
| Post Service | ✅ Always | ✅ When creating posts |
| AI Service | ❌ Optional | ❌ Not needed |
| Interaction Service | ✅ Always | ✅ For comment display |

---

## 📊 Data Flow Examples

### **Example 1: User Registration**

```
┌────────┐     ┌──────────────┐     ┌───────────┐
│ Client │────▶│ User Service │────▶│ Firestore │
└────────┘     └──────────────┘     └───────────┘
    │                 │                    │
    │ Firebase token  │                    │
    │────────────────▶│                    │
    │                 │ Verify token       │
    │                 │ Create user doc    │
    │                 │───────────────────▶│
    │                 │                    │
    │                 │ User profile       │
    │◀────────────────│◀───────────────────│
```

### **Example 2: Creating a Review**

```
┌────────┐  ┌──────────────┐  ┌──────────────┐  ┌───────────┐
│ Client │  │ Post Service │  │ User Service │  │AI Service │
└───┬────┘  └──────┬───────┘  └──────┬───────┘  └─────┬─────┘
    │              │                 │                 │
    │POST review   │                 │                 │
    │─────────────▶│                 │                 │
    │              │ Verify user     │                 │
    │              │────────────────▶│                 │
    │              │ User exists     │                 │
    │              │◀────────────────│                 │
    │              │ Get bike data   │                 │
    │              │─────────────────────────────────▶│
    │              │ Bike insights   │                 │
    │              │◀─────────────────────────────────│
    │              │ Save review     │                 │
    │              │───────────────▶ Firestore         │
    │              │ Update counter  │                 │
    │              │────────────────▶│                 │
    │ Review saved │                 │                 │
    │◀─────────────│                 │                 │
```

---

## 🚀 Deployment Architecture

```
┌──────────────────────────────────────────────────┐
│           Google Cloud Run Services              │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐        │
│  │   User   │ │   Post   │ │    AI    │        │
│  │ Service  │ │ Service  │ │ Service  │        │
│  └──────────┘ └──────────┘ └──────────┘        │
│  ┌──────────────┐                               │
│  │ Interaction  │                               │
│  │   Service    │                               │
│  └──────────────┘                               │
└──────────────────────────────────────────────────┘
                    │
                    ▼
    ┌───────────────────────────────┐
    │    Google Cloud Firestore     │
    │  (asia-south1, Mumbai)        │
    └───────────────────────────────┘
```

---

## 🔧 Environment Variables

### **All Services Need:**
```bash
FIREBASE_PROJECT_ID=dhakdhakgo-472515
FIREBASE_API_KEY=your-api-key
NODE_ENV=production
```

### **Service-Specific URLs:**
```bash
USER_SERVICE_URL=https://user-service-134445090159.asia-south1.run.app
POST_SERVICE_URL=https://post-service-134445090159.asia-south1.run.app
AI_SERVICE_URL=https://ai-service-134445090159.asia-south1.run.app
INTERACTION_SERVICE_URL=https://interaction-service-134445090159.asia-south1.run.app
```

### **AI Service Only:**
```bash
GEMINI_API_KEY=your-gemini-api-key
```

---

## 📈 Scalability Considerations

### **Caching Strategy**
- User profiles cached in services (TTL: 5 minutes)
- Bike insights cached in Firestore (TTL: 7 days)
- Reduce inter-service calls with smart caching

### **Performance Optimization**
- Denormalized counters (likes, comments) for fast reads
- Composite indexes for complex queries
- Pagination for large datasets

### **Cost Optimization**
- Cache AI responses aggressively
- Use Firestore batch operations
- Minimize inter-service HTTP calls

---

## 🔒 Security

### **Service-Level Security**
- All services verify Firebase tokens
- User Service is source of truth for user identity
- Services only call each other via HTTPS

### **Firestore Security Rules**
- Users can only modify their own data
- Public posts readable by anyone
- Private posts only by owner

### **Future: API Gateway**
- Centralized authentication
- Rate limiting
- Request validation

---

## 🎯 Next Steps

1. Deploy User Service
2. Update other services to call User Service
3. Implement AI Service with Gemini
4. Add business logic to Post Service
5. Set up API Gateway

---

This architecture provides a solid foundation for a scalable, maintainable microservices application!
