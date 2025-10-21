# 🏗️ Infrastructure - DhakDhakGo

## Overview

DhakDhakGo infrastructure is deployed on **Google Cloud Platform (GCP)** using **Terraform** for Infrastructure as Code (IaC) and **GitHub Actions** for CI/CD automation.

**Current Status**: ✅ Deployed and Running

- **Project ID**: `dhakdhakgo-472515`
- **Region**: `asia-south1` (Mumbai, India)
- **Environment**: Production
- **Deployment**: Automated via GitHub Actions

---

## 🌐 Google Cloud Platform Components

### **1. Google Cloud Run**
- **Purpose**: Host microservices
- **Benefits**:
  - Serverless (no server management)
  - Auto-scaling (0 to N instances)
  - Pay-per-request (cost-effective)
  - HTTPS by default
  - Built-in load balancing

**Services Deployed:**

| Service | URL | Port | Status |
|---------|-----|------|--------|
| `user-service` | https://user-service-ute6thusxq-el.a.run.app | 8080 | ✅ Running |
| `post-service` | https://post-service-ute6thusxq-el.a.run.app | 8080 | ✅ Running |
| `ai-service` | https://ai-service-ute6thusxq-el.a.run.app | 8080 | ✅ Running |
| `interaction-service` | https://interaction-service-ute6thusxq-el.a.run.app | 8080 | ✅ Running |

**Configuration:**
- Region: `asia-south1` (Mumbai, India)
- Memory: 512 MB per instance
- CPU: 1 vCPU
- Min Instances: 0 (scales to zero when idle)
- Max Instances: 10
- Timeout: 300 seconds (5 minutes)
- Service Account: `cloud-run-sa@dhakdhakgo-472515.iam.gserviceaccount.com`

---

### **2. Google Container Registry (GCR)**
- **Purpose**: Store Docker images
- **Repository**: `gcr.io/dhakdhakgo-472515/`
- **Image naming**: `gcr.io/dhakdhakgo-472515/{SERVICE_NAME}:latest`
- **Storage**: ~2-5 GB (4 services with multiple versions)
- **Cost**: ~$0.10-0.15/month

**Images:**
- `gcr.io/dhakdhakgo-472515/user-service:latest`
- `gcr.io/dhakdhakgo-472515/post-service:latest`
- `gcr.io/dhakdhakgo-472515/ai-service:latest`
- `gcr.io/dhakdhakgo-472515/interaction-service:latest`

---

### **3. Firebase**

#### **Firebase Authentication**
- **Status**: ✅ Enabled
- **Providers**: 
  - Email/Password ✅
  - Google Sign-In ✅
  - Phone (planned)
- JWT token generation and validation
- Firebase Admin SDK integration

#### **Cloud Firestore**
- **Database**: `(default)`
- **Type**: FIRESTORE_NATIVE
- **Location**: `asia-south1`
- **Delete Protection**: Disabled

**Collections:**
- `users` - User profiles
- `bikeReviews` - Bike reviews (9 composite indexes)
- `ownershipExperiences` - Ownership experiences (2 composite indexes)
- `likes` - Post likes (2 composite indexes)
- `comments` - Post comments (2 composite indexes)
- `aiCache` - Cached AI responses (7-day TTL)

**Security Rules**: ✅ Deployed
**Indexes**: ✅ Deployed (9 composite indexes)

---

### **4. Google Gemini API**
- **Purpose**: AI-powered insights and comparisons
- **API Key**: Stored in GitHub Secrets (`GEMINI_API_KEY`)
- **Model**: Gemini 1.5 Pro (via Vertex AI)
- **Features**:
  - Structured JSON output
  - Retry with self-correction
  - Schema validation
  - Response caching (7 days)

**Capabilities:**
1. Generate bike ownership insights
2. Compare bikes on multiple parameters
3. Structured data extraction

---

## 🛠️ Infrastructure as Code (Terraform)

### **Project Structure:**

```
infrastructure/terraform/
├── main.tf                        # Provider configuration
├── variables.tf                   # Variable declarations
├── terraform.tfvars               # Values (gitignored)
├── services.tf                    # Cloud Run services
├── firebase.tf                    # Firebase + Service Accounts
├── outputs.tf                     # Output values
├── README.md                      # Terraform usage guide
├── FIREBASE_MANUAL_SETUP.md       # Firebase setup instructions
└── SECRETS_VIA_GITHUB.md          # Secrets management guide
```

---

### **Key Terraform Resources:**

#### **1. Cloud Run Services** (`services.tf`)

```hcl
resource "google_cloud_run_v2_service" "microservices" {
  for_each = toset(var.services)
  
  name     = each.value
  location = var.region
  project  = var.project_id

  template {
    containers {
      image = "gcr.io/${var.project_id}/${each.value}:latest"
      
      env {
        name  = "FIREBASE_PROJECT_ID"
        value = var.project_id
      }
      
      resources {
        limits = {
          cpu    = "1"
          memory = "512Mi"
        }
      }
    }
    
    service_account = google_service_account.cloud_run_sa.email
  }
}
```

#### **2. Firebase Configuration** (`firebase.tf`)

```hcl
# Firebase Authentication
resource "google_identity_platform_config" "auth" {
  project = var.project_id
  
  sign_in {
    allow_duplicate_emails = false
    email {
      enabled = true
    }
  }
}

# Firestore Database
resource "google_firestore_database" "database" {
  project     = var.project_id
  name        = "(default)"
  location_id = var.region
  type        = "FIRESTORE_NATIVE"
}
```

---

## 🔐 Security & IAM

### **Service Accounts:**

#### **1. Cloud Run Service Account**
- **Name**: `cloud-run-sa@dhakdhakgo-472515.iam.gserviceaccount.com`
- **Purpose**: Runtime identity for Cloud Run services
- **Permissions**:
  - `roles/datastore.user` - Firestore read/write access
  - `roles/firebase.admin` - Firebase admin operations
  - `roles/aiplatform.user` - Gemini AI access (optional)

#### **2. GitHub Actions Service Account** ✨ NEW
- **Name**: `github-actions@dhakdhakgo-472515.iam.gserviceaccount.com`
- **Purpose**: CI/CD deployments from GitHub Actions
- **Permissions**:
  - `roles/run.admin` - Deploy and manage Cloud Run services
  - `roles/storage.admin` - Access to GCS buckets (GCR backend)
  - `roles/artifactregistry.writer` - Push Docker images to GCR
  - `roles/iam.serviceAccountUser` - Use Cloud Run service account

**Key Management:**
- Service account key stored in GitHub Secrets as `GCP_SA_KEY`
- Key created via Terraform (manual step required)
- Never committed to repository

---

## 📋 Prerequisites

### **Required Tools:**

1. **Google Cloud CLI** (`gcloud`)
   - Install: https://cloud.google.com/sdk/docs/install
   - Authenticate: `gcloud auth login`

2. **Terraform** (v1.0+)
   - Install: https://developer.hashicorp.com/terraform/downloads

3. **Docker** (for local testing)
   - Install: https://docs.docker.com/get-docker/

4. **Node.js** (v18+)
   - Install: https://nodejs.org/

---

## 🚀 Setup Instructions

### **Current Setup** ✅

**Status**: Infrastructure is already deployed!

- All Terraform resources: ✅ Created
- All services: ✅ Running on Cloud Run
- Firebase: ✅ Enabled and configured
- GitHub Actions: ✅ Configured for CI/CD

### **For New Deployments:**

#### **Step 1: Terraform Deployment**

```bash
cd infrastructure/terraform

# Initialize Terraform
terraform init

# Plan infrastructure
terraform plan

# Apply infrastructure
terraform apply
```

**What Terraform Creates:**
- ✅ 4 Cloud Run services
- ✅ Firestore database
- ✅ 2 Service accounts (cloud-run-sa, github-actions)
- ✅ IAM permissions
- ✅ API enablements

#### **Step 2: Manual Setup** (One-time)

1. **Enable Firebase** (2 minutes)
   ```bash
   # Via console: https://console.firebase.google.com/
   # Select project: dhakdhakgo-472515
   ```
   
   See: `infrastructure/terraform/FIREBASE_MANUAL_SETUP.md`

2. **Create GitHub Actions Key** (already done)
   ```bash
   # Already created via Terraform
   # Key stored in GitHub Secrets as GCP_SA_KEY
   ```

3. **Add GitHub Secrets** (5 minutes)
   - `GCP_SA_KEY` - Service account JSON
   - `GCP_PROJECT_ID` - `dhakdhakgo-472515`
   - `GEMINI_API_KEY` - AI API key
   
   See: `GITHUB_SECRETS_SETUP.md`

4. **Deploy Firestore Rules** (2 minutes)
   ```bash
   firebase use dhakdhakgo-472515
   firebase deploy --only firestore:rules,firestore:indexes
   ```

#### **Step 3: Automated Deployment via GitHub Actions** ✨

**Once GitHub Secrets are set up**, deployments are automatic:

```bash
# Make code changes
git add .
git commit -m "your changes"
git push origin main

# GitHub Actions automatically:
# 1. Builds Docker images
# 2. Pushes to GCR
# 3. Deploys to Cloud Run
# 4. Sets environment variables
```

**Manual deployment** (if needed):
```bash
cd services/user-service
gcloud builds submit --tag gcr.io/dhakdhakgo-472515/user-service

gcloud run deploy user-service \
  --image gcr.io/dhakdhakgo-472515/user-service \
  --region asia-south1
```

---

## 🔧 Infrastructure Management

### **View Deployed Resources:**

```bash
# List Cloud Run services
gcloud run services list --region=asia-south1

# Describe a service
gcloud run services describe user-service --region=asia-south1

# View Firestore databases
gcloud firestore databases list
```

---

### **Update Infrastructure:**

```bash
cd infrastructure/terraform

# Make changes to .tf files
# ...

# Plan changes
terraform plan

# Apply changes
terraform apply
```

---

### **Destroy Infrastructure:**

```bash
cd infrastructure/terraform

# WARNING: This will delete everything!
terraform destroy
```

---

## 💰 Cost Optimization

### **Cloud Run:**
- **Pricing**: Pay per request + CPU/memory time
- **Optimization**:
  - Set minimum instances to 0 (scale to zero)
  - Use appropriate memory/CPU limits
  - Enable concurrency (80 requests/instance)

### **Firestore:**
- **Pricing**: Per read/write/delete operation
- **Optimization**:
  - Use caching (AI Service caches for 7 days)
  - Batch operations when possible
  - Use indexes efficiently

### **Gemini API:**
- **Pricing**: Per token (input + output)
- **Optimization**:
  - Cache responses (7-day TTL for insights)
  - Use retry with correction (avoid wasted calls)
  - Monitor usage

**Estimated Monthly Cost** (moderate usage):
- Cloud Run: $10-30
- Firestore: $5-20
- Gemini API: $20-50
- **Total: ~$35-100/month**

---

## 📊 Monitoring & Logging

### **Cloud Logging:**

```bash
# View logs for a service
gcloud run services logs read user-service --region=asia-south1 --limit=50

# Tail logs in real-time
gcloud run services logs tail user-service --region=asia-south1

# Filter by severity
gcloud run services logs read post-service --region=asia-south1 \
  --log-filter="severity>=ERROR"
```

### **Cloud Monitoring:**

- **Metrics**: Request count, latency, error rate, instance count
- **Dashboards**: Available in GCP Console → Cloud Run
- **Alerts**: Set up alerts for:
  - High error rate (>5%)
  - High latency (>2s)
  - Service unavailability

### **Application Performance:**

Check service health:
```bash
curl https://user-service-ute6thusxq-el.a.run.app/health
curl https://post-service-ute6thusxq-el.a.run.app/health
curl https://ai-service-ute6thusxq-el.a.run.app/health
curl https://interaction-service-ute6thusxq-el.a.run.app/health
```

---

## 🔄 CI/CD Pipeline (GitHub Actions)

### **Workflow Files:**

```
.github/workflows/
├── deploy-user-service.yml
├── deploy-post-service.yml
├── deploy-ai-service.yml
└── deploy-interaction-service.yml
```

### **Deployment Flow:**

```
Code Push to main
    ↓
GitHub Actions Triggered
    ↓
Authenticate with GCP (using GCP_SA_KEY)
    ↓
Build Docker Image
    ↓
Push to gcr.io/dhakdhakgo-472515/
    ↓
Deploy to Cloud Run
    ↓
Set Environment Variables (GEMINI_API_KEY from secrets)
    ↓
Service Running ✅
```

### **Secrets Management:**

All secrets managed via **GitHub Secrets** (not Google Secret Manager):

| Secret | Purpose | Set in |
|--------|---------|--------|
| `GCP_SA_KEY` | GitHub Actions authentication | GitHub Secrets |
| `GCP_PROJECT_ID` | Project identification | GitHub Secrets |
| `GEMINI_API_KEY` | AI service API key | GitHub Secrets |

**Why GitHub Secrets?**
- ✅ Free (no GCP cost)
- ✅ Integrated with CI/CD
- ✅ Easy to update
- ✅ Encrypted by GitHub

See: `infrastructure/terraform/SECRETS_VIA_GITHUB.md`

---

## 🔮 Future Infrastructure

### **Planned Additions:**

1. **Cloud CDN** - Static asset delivery
2. **Cloud Load Balancer** - API Gateway routing with custom domain
3. **Cloud Storage** - Image/file uploads for bike photos
4. **Cloud Pub/Sub** - Event-driven architecture for notifications
5. **Cloud Memorystore (Redis)** - Additional caching layer
6. **Cloud Armor** - DDoS protection and WAF

---

## 📋 Current Infrastructure Status

**Last Updated**: October 21, 2025

### **Deployment Status:**

| Component | Status | Details |
|-----------|--------|---------|
| **Terraform** | ✅ Deployed | All resources created |
| **Cloud Run Services** | ✅ Running | 4/4 services operational |
| **Firestore** | ✅ Active | Database + indexes deployed |
| **Firebase Auth** | ✅ Enabled | Email & Google sign-in |
| **GCR Images** | ✅ Stored | 4 services, multiple versions |
| **Service Accounts** | ✅ Created | cloud-run-sa + github-actions |
| **GitHub Actions** | ✅ Configured | CI/CD pipeline active |

### **Service Endpoints:**

```
User Service:        https://user-service-ute6thusxq-el.a.run.app
Post Service:        https://post-service-ute6thusxq-el.a.run.app
AI Service:          https://ai-service-ute6thusxq-el.a.run.app
Interaction Service: https://interaction-service-ute6thusxq-el.a.run.app
```

### **Quick Commands:**

```bash
# Check all services
gcloud run services list --region=asia-south1

# View Terraform state
cd infrastructure/terraform && terraform show

# Deploy Firestore rules
firebase deploy --only firestore:rules,firestore:indexes

# Trigger redeployment
git push origin main
```

---

## 📚 Related Documentation

- **[Quick Start Guide](../QUICK_START.md)** - Next steps to production
- **[GitHub Secrets Setup](../GITHUB_SECRETS_SETUP.md)** - CI/CD configuration
- **[Architecture](./02-ARCHITECTURE.md)** - System design
- **[Deployment Guide](./05-DEPLOYMENT.md)** - Deployment steps
- **[Terraform README](../infrastructure/terraform/README.md)** - Terraform details
- **[Terraform Secrets Guide](../infrastructure/terraform/SECRETS_VIA_GITHUB.md)** - Secrets management
- **[Firebase Manual Setup](../infrastructure/terraform/FIREBASE_MANUAL_SETUP.md)** - Firebase configuration

---

**Infrastructure is production-ready!** ✅  
**Next**: Complete [remaining setup steps](../QUICK_START.md) to go fully live!
