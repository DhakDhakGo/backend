# DhakDhakGo Backend

Microservices backend for motorcycle ownership platform with automated CI/CD.

## 🎯 Services

- **User Service** (Port 3000) - User management and authentication
- **Post Service** (Port 3001) - Bike reviews and ownership experiences
- **AI Service** (Port 3002) - Google Gemini AI insights and comparisons
- **Interaction Service** (Port 3003) - Likes and comments

## 📚 Documentation

**Start here**: [`docs/README.md`](docs/README.md)

- [Product Vision](docs/01-PRODUCT-VISION.md) - What we're building
- [Architecture](docs/02-ARCHITECTURE.md) - System design
- [Business Logic](docs/03-BUSINESS-LOGIC.md) - How features work
- [Infrastructure](docs/04-INFRASTRUCTURE.md) - GCP & Terraform
- [Deployment](docs/05-DEPLOYMENT.md) - How to deploy

## 🚀 Quick Start

**✅ Infrastructure Deployed!** Your services are running on Cloud Run.

**Next Steps** (20 minutes to production):
👉 **See [`QUICK_START.md`](QUICK_START.md)** for step-by-step checklist

### What's Left:
1. 🔐 Add GitHub Secrets (5 min) - See [`GITHUB_SECRETS_SETUP.md`](GITHUB_SECRETS_SETUP.md)
2. 🔒 Deploy Firestore rules (2 min)
3. ⚙️ Configure environment variables (2 min)
4. 🔑 Enable Firebase Auth (5 min)
5. 🧪 Test services (5 min)

### Prerequisites
- Node.js 18+
- Google Cloud CLI (authenticated)
- Firebase CLI (`npm install -g firebase-tools`)
- GitHub account

### 1. Deploy Infrastructure
```bash
# Set your project ID
export PROJECT_ID=your-gcp-project-id

# Deploy infrastructure (Linux/Mac)
./scripts/deploy-infrastructure.sh

# Deploy infrastructure (Windows)
.\scripts\deploy-infrastructure.ps1 -ProjectId your-gcp-project-id
```

### 2. Local Development
```bash
# Install dependencies
npm install

# Run all services locally
npm run dev

# Or run individual services
npm run dev:post      # http://localhost:3001
npm run dev:ai        # http://localhost:3002  
npm run dev:interaction # http://localhost:3003
```

### 3. Set Up CI/CD (Automated Deployments)

**Using GitHub Actions** (Recommended):
1. Push code to GitHub
2. Set up GitHub secrets (see [`.github/SETUP.md`](.github/SETUP.md))
3. Push to `main` branch → Automatic deployment! 🎉

**Manual Deployment**:
```bash
# Deploy all services
npm run deploy:all

# Or deploy individual services
npm run deploy:user
npm run deploy:post
npm run deploy:ai
npm run deploy:interaction
```

## 🔄 CI/CD Pipeline

Each service automatically deploys when you push changes:

```
Push to main → GitHub Actions → Build Docker → Push to GCR → Deploy to Cloud Run ✅
```

**Setup Guide**: [`.github/SETUP.md`](.github/SETUP.md)

## 🔗 Service Endpoints

Each service provides:
- `GET /health` - Health check
- `GET /` - Service info
- Service-specific API endpoints (see service READMEs)

## 📦 Technology Stack

- **Runtime**: Node.js 18+
- **Framework**: Express.js
- **Database**: Cloud Firestore
- **Auth**: Firebase Authentication
- **AI**: Google Gemini API
- **Hosting**: Google Cloud Run
- **Container**: Docker
- **IaC**: Terraform
- **CI/CD**: GitHub Actions

## 🤝 Contributing

See individual service READMEs for development guidelines.