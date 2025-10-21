# 📚 DhakDhakGo Backend Documentation

Welcome to the DhakDhakGo backend documentation! This guide will help you understand the product, architecture, and deployment.

---

## 📖 Documentation Structure

### **🎯 High-Level Documentation (Read First)**

1. **[Product Vision](./01-PRODUCT-VISION.md)** - What are we building and why?
2. **[Architecture Overview](./02-ARCHITECTURE.md)** - System design and microservices
3. **[Business Logic](./03-BUSINESS-LOGIC.md)** - Core features and workflows
4. **[Infrastructure](./04-INFRASTRUCTURE.md)** - GCP, Firebase, Terraform setup
5. **[Deployment Guide](./05-DEPLOYMENT.md)** - How to deploy everything

### **🔧 Service-Level Documentation**

Each service has its own README with:
- Service purpose and responsibilities
- API endpoints and examples
- Data models
- Deployment configuration

**Services:**
- **[User Service](../services/user-service/README.md)** - User management and profiles
- **[Post Service](../services/post-service/README.md)** - Reviews and ownership experiences
- **[AI Service](../services/ai-service/README.md)** - Gemini AI insights and comparisons
- **[Interaction Service](../services/interaction-service/README.md)** - Likes and comments

### **🛠️ Technical References**

- **[Code Architecture](./TECH-CODE-ARCHITECTURE.md)** - Three-layer pattern explained
- **[Data Models](./TECH-DATA-MODELS.md)** - All Firestore models in one place
- **[AI Implementation](./TECH-AI-IMPLEMENTATION.md)** - Gemini integration details

---

## 🚀 Quick Start

### **For Product Managers:**
1. Read [Product Vision](./01-PRODUCT-VISION.md)
2. Read [Business Logic](./03-BUSINESS-LOGIC.md)

### **For Developers (New to Project):**
1. Read [Architecture Overview](./02-ARCHITECTURE.md)
2. Read [Infrastructure](./04-INFRASTRUCTURE.md)
3. Explore individual service READMEs
4. Follow [Deployment Guide](./05-DEPLOYMENT.md)

### **For DevOps:**
1. Read [Infrastructure](./04-INFRASTRUCTURE.md)
2. Read [Deployment Guide](./05-DEPLOYMENT.md)
3. Check deployment configs in each service

---

## 📂 Repository Structure

```
backend/
├── docs/                          ← You are here
│   ├── README.md                  ← This file
│   ├── 01-PRODUCT-VISION.md
│   ├── 02-ARCHITECTURE.md
│   ├── 03-BUSINESS-LOGIC.md
│   ├── 04-INFRASTRUCTURE.md
│   ├── 05-DEPLOYMENT.md
│   ├── TECH-CODE-ARCHITECTURE.md
│   ├── TECH-DATA-MODELS.md
│   └── TECH-AI-IMPLEMENTATION.md
│
├── services/
│   ├── user-service/
│   │   ├── README.md              ← Service-specific docs
│   │   ├── src/
│   │   ├── Dockerfile
│   │   └── cloudbuild.yaml
│   ├── post-service/
│   │   ├── README.md
│   │   └── ...
│   ├── ai-service/
│   │   ├── README.md
│   │   └── ...
│   └── interaction-service/
│       ├── README.md
│       └── ...
│
├── infrastructure/
│   └── terraform/
│       └── (Terraform configs)
│
└── scripts/
    └── (Deployment scripts)
```

---

## 🎯 Documentation Philosophy

### **High-Level Docs (docs/)**
- **What**: Product vision, architecture, business logic
- **Why**: Understand the big picture
- **For**: Product managers, new developers, stakeholders

### **Service-Level Docs (services/*/README.md)**
- **What**: Specific service details, APIs, models
- **How**: Technical implementation
- **For**: Developers working on that service

### **Technical References (docs/TECH-*)**
- **What**: Deep technical details
- **How**: Implementation patterns
- **For**: Senior developers, architects

---

## 💡 Contributing to Docs

When adding documentation:
1. **High-level concepts** → `docs/`
2. **Service-specific details** → `services/[service-name]/README.md`
3. **Technical deep-dives** → `docs/TECH-*.md`

Keep docs:
- ✅ Up-to-date
- ✅ Example-rich
- ✅ Easy to navigate
- ✅ Well-structured

---

## 🔗 External Resources

- [Google Cloud Run Docs](https://cloud.google.com/run/docs)
- [Firebase Documentation](https://firebase.google.com/docs)
- [Terraform GCP Provider](https://registry.terraform.io/providers/hashicorp/google/latest/docs)
- [Gemini API Docs](https://ai.google.dev/docs)

---

**Need help?** Start with the [Product Vision](./01-PRODUCT-VISION.md) and work your way through!
