# 🚀 Deployment Guide - DhakDhakGo

## Quick Deployment

Follow these steps to deploy DhakDhakGo from scratch.

---

## 📋 Prerequisites Checklist

- [ ] Google Cloud account with billing enabled
- [ ] `gcloud` CLI installed and authenticated
- [ ] Terraform installed (v1.0+)
- [ ] Docker installed
- [ ] Node.js 18+ installed
- [ ] Git repository cloned

---

## 🎯 Deployment Steps

### **Step 1: GCP Project Setup** (5 minutes)

```bash
# 1. Set your project ID
export PROJECT_ID="your-project-id"
gcloud config set project $PROJECT_ID

# 2. Enable required APIs
gcloud services enable run.googleapis.com \
  cloudbuild.googleapis.com \
  containerregistry.googleapis.com \
  firestore.googleapis.com \
  identitytoolkit.googleapis.com

# 3. Set up authentication
gcloud auth login
gcloud auth application-default login
gcloud auth application-default set-quota-project $PROJECT_ID
```

---

### **Step 2: Deploy Infrastructure** (10 minutes)

```bash
# 1. Navigate to Terraform directory
cd infrastructure/terraform

# 2. Create terraform.tfvars
cat > terraform.tfvars <<EOF
project_id  = "$PROJECT_ID"
region      = "asia-south1"
zone        = "asia-south1-a"
environment = "production"
EOF

# 3. Initialize Terraform
terraform init

# 4. Review infrastructure plan
terraform plan

# 5. Deploy infrastructure
terraform apply -auto-approve
```

**What this creates:**
- ✅ Cloud Run services (4 microservices)
- ✅ Firebase project
- ✅ Firestore database
- ✅ Service accounts and IAM permissions

---

### **Step 3: Build & Push Docker Images** (15 minutes)

```bash
# Configure Docker for GCR
gcloud auth configure-docker

# Build and push all services
cd ../../  # Back to project root

# User Service
cd services/user-service
docker build -t gcr.io/$PROJECT_ID/user-service:latest .
docker push gcr.io/$PROJECT_ID/user-service:latest

# Post Service
cd ../post-service
docker build -t gcr.io/$PROJECT_ID/post-service:latest .
docker push gcr.io/$PROJECT_ID/post-service:latest

# AI Service
cd ../ai-service
docker build -t gcr.io/$PROJECT_ID/ai-service:latest .
docker push gcr.io/$PROJECT_ID/ai-service:latest

# Interaction Service
cd ../interaction-service
docker build -t gcr.io/$PROJECT_ID/interaction-service:latest .
docker push gcr.io/$PROJECT_ID/interaction-service:latest

cd ../..  # Back to root
```

---

### **Step 4: Deploy Services to Cloud Run** (5 minutes)

```bash
# Deploy all services (images now exist in GCR)
cd infrastructure/terraform
terraform apply -auto-approve
```

**Or deploy individually:**

```bash
gcloud run deploy user-service \
  --image gcr.io/$PROJECT_ID/user-service:latest \
  --region asia-south1 \
  --allow-unauthenticated

gcloud run deploy post-service \
  --image gcr.io/$PROJECT_ID/post-service:latest \
  --region asia-south1 \
  --allow-unauthenticated

gcloud run deploy ai-service \
  --image gcr.io/$PROJECT_ID/ai-service:latest \
  --region asia-south1 \
  --allow-unauthenticated

gcloud run deploy interaction-service \
  --image gcr.io/$PROJECT_ID/interaction-service:latest \
  --region asia-south1 \
  --allow-unauthenticated
```

---

### **Step 5: Configure Environment Variables** (5 minutes)

#### **Get Gemini API Key:**
1. Go to https://makersuite.google.com/app/apikey
2. Create API key
3. Copy the key

#### **Set in Cloud Run:**

```bash
# AI Service - Add Gemini API Key
gcloud run services update ai-service \
  --region=asia-south1 \
  --set-env-vars="GEMINI_API_KEY=your-gemini-api-key-here"
```

---

### **Step 6: Deploy Firestore Configuration** (Optional)

```bash
# Deploy Firestore rules and indexes
firebase deploy --only firestore:rules,firestore:indexes
```

If Firebase CLI not installed:
```bash
npm install -g firebase-tools
firebase login
firebase use $PROJECT_ID
```

---

### **Step 7: Verify Deployment** (2 minutes)

```bash
# Get service URLs
gcloud run services list --region=asia-south1

# Test each service
export USER_SERVICE_URL=$(gcloud run services describe user-service --region=asia-south1 --format='value(status.url)')
export POST_SERVICE_URL=$(gcloud run services describe post-service --region=asia-south1 --format='value(status.url)')
export AI_SERVICE_URL=$(gcloud run services describe ai-service --region=asia-south1 --format='value(status.url)')
export INTERACTION_SERVICE_URL=$(gcloud run services describe interaction-service --region=asia-south1 --format='value(status.url)')

# Test health endpoints
curl $USER_SERVICE_URL/health
curl $POST_SERVICE_URL/health
curl $AI_SERVICE_URL/health
curl $INTERACTION_SERVICE_URL/health
```

**Expected Response:**
```json
{
  "status": "healthy",
  "service": "user-service",
  "timestamp": "2024-01-15T10:30:00.000Z"
}
```

---

## 🔄 Continuous Deployment

### **Using Cloud Build** (Recommended)

Each service has a `cloudbuild.yaml` file for automated builds:

```bash
# Deploy a service using Cloud Build
cd services/user-service
gcloud builds submit --config cloudbuild.yaml

# This automatically:
# 1. Builds Docker image
# 2. Pushes to GCR
# 3. Deploys to Cloud Run
```

### **Using npm Scripts** (Quick Deploy)

```bash
# From project root

# Deploy all services
npm run deploy:all

# Or individual services
npm run deploy:user
npm run deploy:post
npm run deploy:ai
npm run deploy:interaction
```

---

## 🧪 Local Development

### **Run All Services Locally:**

```bash
# Install dependencies
npm install
cd services/user-service && npm install && cd ../..
cd services/post-service && npm install && cd ../..
cd services/ai-service && npm install && cd ../..
cd services/interaction-service && npm install && cd ../..

# Run all services concurrently
npm run dev
```

**Services will be available at:**
- User Service: http://localhost:3000
- Post Service: http://localhost:3001
- AI Service: http://localhost:3002
- Interaction Service: http://localhost:3003

---

## 📊 Post-Deployment

### **1. Monitor Logs:**

```bash
# View logs for a service
gcloud run services logs read user-service --region=asia-south1 --limit=50

# Tail logs (real-time)
gcloud run services logs tail user-service --region=asia-south1
```

### **2. Set Up Monitoring:**

```bash
# Create uptime checks (Google Cloud Console)
# Navigate to: Monitoring > Uptime checks

# Check:
- Health endpoints every 5 minutes
- Alert if service is down for > 2 minutes
```

### **3. Configure Firestore Indexes:**

Indexes are created automatically from `firestore.indexes.json`, but you can also create them manually:

```bash
firebase deploy --only firestore:indexes
```

### **4. Set Up Firebase Authentication:**

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project
3. Navigate to Authentication > Sign-in method
4. Enable: Email/Password, Google
5. Configure authorized domains

---

## 🔧 Common Deployment Issues

### **Issue 1: Docker Build Fails**

**Error**: `npm ci requires package-lock.json`

**Solution**:
```bash
cd services/[service-name]
npm install  # Generates package-lock.json
```

---

### **Issue 2: Service Won't Start**

**Error**: `Cloud Run error: Container failed to start`

**Solution**:
```bash
# Check logs
gcloud run services logs read [service-name] --region=asia-south1

# Common causes:
# - Missing environment variables
# - Firestore initialization failure
# - Port not set correctly (should listen on PORT env var)
```

---

### **Issue 3: Terraform Apply Fails**

**Error**: `Error creating Service: googleapi: Error 400: Invalid image`

**Solution**:
```bash
# Ensure Docker images exist before Terraform apply
docker push gcr.io/$PROJECT_ID/[service-name]:latest

# Then retry Terraform
terraform apply
```

---

### **Issue 4: Authentication Errors**

**Error**: `google: could not find default credentials`

**Solution**:
```bash
# Reauthenticate
gcloud auth application-default login
gcloud auth application-default set-quota-project $PROJECT_ID
```

---

## 🔄 Update Deployment

### **Update a Service:**

```bash
# 1. Make code changes
# 2. Rebuild Docker image
cd services/[service-name]
docker build -t gcr.io/$PROJECT_ID/[service-name]:latest .
docker push gcr.io/$PROJECT_ID/[service-name]:latest

# 3. Deploy new version
gcloud run deploy [service-name] \
  --image gcr.io/$PROJECT_ID/[service-name]:latest \
  --region asia-south1
```

### **Rollback a Service:**

```bash
# List revisions
gcloud run revisions list --service=[service-name] --region=asia-south1

# Rollback to previous revision
gcloud run services update-traffic [service-name] \
  --to-revisions=[revision-name]=100 \
  --region=asia-south1
```

---

## 🧹 Cleanup / Teardown

### **Remove All Infrastructure:**

```bash
cd infrastructure/terraform
terraform destroy -auto-approve
```

**⚠️ WARNING**: This will delete:
- All Cloud Run services
- Firestore database (and all data!)
- Service accounts
- IAM bindings

---

## 📚 Related Documentation

- **[Infrastructure](./04-INFRASTRUCTURE.md)** - Infrastructure details
- **[Architecture](./02-ARCHITECTURE.md)** - System design
- **Service READMEs** - Service-specific deployment details

---

## ✅ Deployment Checklist

**Before going to production:**

- [ ] Enable Firebase Authentication providers
- [ ] Deploy Firestore security rules
- [ ] Set up monitoring and alerts
- [ ] Configure custom domain (Cloud Run)
- [ ] Enable CORS properly
- [ ] Set up API Gateway (future)
- [ ] Configure backup for Firestore
- [ ] Set up budget alerts in GCP
- [ ] Review and optimize costs
- [ ] Load testing completed

---

**Congratulations!** 🎉 Your DhakDhakGo backend is deployed!
