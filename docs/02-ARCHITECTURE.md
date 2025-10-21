# 🏗️ Architecture Overview - DhakDhakGo

## System Architecture

DhakDhakGo follows a **microservices architecture** deployed on Google Cloud Platform.

---

## 📊 High-Level Architecture Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                         Frontend                             │
│              (React/React Native - Future)                   │
└────────────────────────┬────────────────────────────────────┘
                         │
                    HTTPS/JSON
                         │
┌────────────────────────▼────────────────────────────────────┐
│                   API Gateway (Future)                       │
│           (Google Cloud Endpoints / API Gateway)             │
│    • Authentication • Rate Limiting • CORS • Logging         │
└─────────────┬──────────────────────────────────────────────┘
              │
       ┌──────┴──────┬──────────┬──────────┬──────────┐
       │             │          │          │          │
   ┌───▼───┐    ┌───▼───┐  ┌───▼───┐  ┌───▼───┐    │
   │ User  │    │ Post  │  │  AI   │  │Inter- │    │
   │Service│    │Service│  │Service│  │action │    │
   │       │    │       │  │       │  │Service│    │
   │:3000  │    │:3001  │  │:3002  │  │:3003  │    │
   └───┬───┘    └───┬───┘  └───┬───┘  └───┬───┘    │
       │            │          │          │         │
       │            └──────────┼──────────┘         │
       │                       │                    │
       └───────────────────────┼────────────────────┘
                               │
                    ┌──────────▼──────────┐
                    │                     │
          ┌─────────▼────────┐  ┌────────▼──────────┐
          │    Firebase      │  │   Gemini AI API   │
          │  Authentication  │  │  (Google AI)      │
          └─────────┬────────┘  └───────────────────┘
                    │
          ┌─────────▼────────┐
          │    Firestore     │
          │   (Database)     │
          └──────────────────┘
```

---

## 🎯 Microservices Overview

### **1. User Service** (`port 3000`)

**Responsibility**: User management and authentication

**Key Functions:**
- User registration and profile management
- User statistics (reviews, experiences, likes, comments)
- Counter management for user metrics

**Technology Stack:**
- Node.js + Express
- Firebase Admin SDK
- Firestore

**External Dependencies:**
- Firebase Authentication (token validation)
- Firestore (user data storage)

---

### **2. Post Service** (`port 3001`)

**Responsibility**: Bike reviews and ownership experiences

**Key Functions:**
- Create, read, update, delete bike reviews
- Create, read, update, delete ownership experiences
- Fetch AI insights for bikes
- User verification

**Technology Stack:**
- Node.js + Express
- Firebase Admin SDK
- Firestore

**External Dependencies:**
- User Service (verify users)
- AI Service (get bike insights)
- Firestore (reviews and experiences storage)

---

### **3. AI Service** (`port 3002`)

**Responsibility**: AI-powered insights and bike comparisons

**Key Functions:**
- Generate bike ownership insights using Gemini AI
- Compare multiple bikes across parameters
- Cache AI responses for performance and cost optimization
- Retry mechanism with auto-correction

**Technology Stack:**
- Node.js + Express
- Google Gemini API
- Firestore (caching)

**External Dependencies:**
- Gemini AI API (Google AI)
- Firestore (cache storage)

---

### **4. Interaction Service** (`port 3003`)

**Responsibility**: Social interactions (likes, comments)

**Key Functions:**
- Create and delete likes on reviews/experiences
- Create, read, update, delete comments
- Threaded comment replies
- Update interaction counters

**Technology Stack:**
- Node.js + Express
- Firebase Admin SDK
- Firestore

**External Dependencies:**
- User Service (verify users)
- Post Service (update like/comment counters)
- Firestore (likes and comments storage)

---

## 🔄 Service Communication

### **Inter-Service Communication:**

Services communicate via **HTTP REST APIs**:

```javascript
// Example: Post Service → User Service
const userProfile = await axios.get(
  `${USER_SERVICE_URL}/api/users/${userId}`
);

// Example: Post Service → AI Service
const aiInsights = await axios.post(
  `${AI_SERVICE_URL}/api/ai/bike-insights`,
  { bikeName: "Honda CB350" }
);
```

### **Communication Patterns:**

1. **Synchronous HTTP Calls**
   - Used for: User verification, AI insights, counter updates
   - Advantages: Simple, immediate response
   - Disadvantages: Blocking, requires service availability

2. **Graceful Degradation**
   - If AI Service is down, reviews are still created (without AI data)
   - If counter updates fail, operation continues (logged as warning)

---

## 🗄️ Data Architecture

### **Database: Cloud Firestore (NoSQL)**

**Collections:**

```
firestore/
├── users/                    ← User profiles
│   └── {userId}
│
├── bikeReviews/              ← Bike reviews
│   └── {reviewId}
│
├── ownershipExperiences/     ← Ownership experiences
│   └── {experienceId}
│
├── likes/                    ← Likes
│   └── {likeId}
│
├── comments/                 ← Comments
│   └── {commentId}
│
└── aiCache/                  ← AI response cache
    └── {cacheKey}
```

**Why Firestore?**
- ✅ Serverless (no management overhead)
- ✅ Real-time capabilities (future feature)
- ✅ Automatic scaling
- ✅ Strong consistency
- ✅ Built-in offline support (for mobile)

---

## 🏛️ Code Architecture (Three-Layer Pattern)

Each microservice follows a **three-layer architecture**:

```
┌─────────────────────────────────┐
│      Controller Layer           │
│  • Parse HTTP requests          │
│  • Format responses             │
│  • Handle errors                │
│  • HTTP status codes            │
└──────────────┬──────────────────┘
               │
┌──────────────▼──────────────────┐
│       Service Layer             │
│  • Business logic               │
│  • Validation                   │
│  • Orchestration                │
│  • External API calls           │
└──────────────┬──────────────────┘
               │
┌──────────────▼──────────────────┐
│     Repository Layer            │
│  • Database queries             │
│  • CRUD operations              │
│  • Data mapping                 │
└─────────────────────────────────┘
```

**Benefits:**
- Clear separation of concerns
- Easy to test and maintain
- Reusable business logic
- Database-agnostic (can switch databases)

**Learn more**: [Code Architecture](./TECH-CODE-ARCHITECTURE.md)

---

## 🔐 Authentication & Authorization

### **Authentication Flow:**

```
1. User authenticates with Firebase (frontend)
   ↓
2. Firebase returns JWT token
   ↓
3. Frontend sends token in Authorization header
   ↓
4. Service validates token using Firebase Admin SDK
   ↓
5. Service extracts user ID from token
   ↓
6. Service processes request
```

### **Authorization:**

- **Resource Ownership**: Users can only modify their own data
- **Middleware**: Shared `auth-middleware.js` validates tokens
- **Future**: Role-based access control (admin, moderator, user)

---

## ☁️ Deployment Architecture

### **Google Cloud Platform:**

```
┌─────────────────────────────────────────────┐
│        Google Cloud Run (Serverless)        │
│                                             │
│  ┌────────┐  ┌────────┐  ┌────────┐       │
│  │ User   │  │ Post   │  │  AI    │       │
│  │Service │  │Service │  │Service │ ...   │
│  └────────┘  └────────┘  └────────┘       │
│                                             │
│  • Auto-scaling (0 to N instances)         │
│  • Pay per request                         │
│  • HTTPS endpoints                         │
└─────────────────────────────────────────────┘

┌─────────────────────────────────────────────┐
│      Google Container Registry (GCR)        │
│  • Docker image storage                     │
│  • Version control                          │
└─────────────────────────────────────────────┘

┌─────────────────────────────────────────────┐
│          Firebase (BaaS)                    │
│  • Authentication                           │
│  • Firestore Database                      │
└─────────────────────────────────────────────┘
```

### **Infrastructure as Code (Terraform):**

All infrastructure is defined in Terraform:
- Cloud Run services
- Firebase project
- Firestore database
- IAM permissions
- Service accounts

**Learn more**: [Infrastructure](./04-INFRASTRUCTURE.md)

---

## 📦 Technology Stack Summary

| Component | Technology | Why? |
|-----------|-----------|------|
| **Language** | Node.js (JavaScript) | Fast development, large ecosystem |
| **Framework** | Express.js | Simple, flexible, well-documented |
| **Database** | Cloud Firestore | Serverless, scalable, real-time |
| **Auth** | Firebase Authentication | Easy integration, supports multiple providers |
| **AI** | Google Gemini API | Powerful, structured output, cost-effective |
| **Hosting** | Google Cloud Run | Serverless, auto-scaling, pay-per-use |
| **IaC** | Terraform | Version-controlled infrastructure |
| **CI/CD** | Google Cloud Build | Integrated with GCP, automated deployments |

---

## 🔮 Future Enhancements

### **Planned Architecture Improvements:**

1. **API Gateway**
   - Centralized routing and authentication
   - Rate limiting and throttling
   - API versioning

2. **Caching Layer**
   - Redis for frequently accessed data
   - Reduce database calls

3. **Message Queue**
   - Async processing (email notifications, analytics)
   - Pub/Sub for event-driven architecture

4. **CDN**
   - Static asset delivery
   - Image optimization

5. **Monitoring & Observability**
   - Centralized logging (Cloud Logging)
   - Distributed tracing (Cloud Trace)
   - Performance monitoring (Cloud Monitoring)

---

## 📚 Related Documentation

- **[Business Logic](./03-BUSINESS-LOGIC.md)** - How features work
- **[Infrastructure](./04-INFRASTRUCTURE.md)** - GCP setup
- **[Deployment Guide](./05-DEPLOYMENT.md)** - How to deploy
- **[Code Architecture](./TECH-CODE-ARCHITECTURE.md)** - Three-layer pattern

---

**Next**: Read about [Business Logic](./03-BUSINESS-LOGIC.md) to understand how features work!
