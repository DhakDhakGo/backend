# 🏗️ Infrastructure - DhakDhakGo

## Overview

DhakDhakGo infrastructure is deployed on **Google Cloud Platform (GCP)** using **Terraform** for Infrastructure as Code (IaC).

---

## 🌐 Google Cloud Platform Components

### **1. Google Cloud Run**
- **Purpose**: Host microservices
- **Benefits**:
  - Serverless (no server management)
  - Auto-scaling (0 to N instances)
  - Pay-per-request (cost-effective)
  - HTTPS by default

**Services Deployed:**
- `user-service` (port 3000)
- `post-service` (port 3001)
- `ai-service` (port 3002)
- `interaction-service` (port 3003)

**Configuration:**
- Region: `asia-south1` (Mumbai, India)
- Memory: 512 MB per instance
- CPU: 1 vCPU
- Concurrency: 80 requests per instance
- Timeout: 300 seconds

---

### **2. Google Container Registry (GCR)**
- **Purpose**: Store Docker images
- **Image naming**: `gcr.io/{PROJECT_ID}/{SERVICE_NAME}:latest`

---

### **3. Firebase**

#### **Firebase Authentication**
- User sign-up and sign-in
- Providers: Email/Password, Google, Phone (future)
- JWT token generation and validation

#### **Cloud Firestore**
- NoSQL document database
- Collections: users, bikeReviews, ownershipExperiences, likes, comments, aiCache
- Real-time capabilities
- Automatic scaling

---

### **4. Google Gemini API**
- AI-powered insights generation
- Bike comparisons
- Structured JSON output
- Pay-per-token pricing

---

## 🛠️ Infrastructure as Code (Terraform)

### **Project Structure:**

```
infrastructure/terraform/
├── main.tf              # Provider and backend configuration
├── variables.tf         # Variable declarations
├── terraform.tfvars     # Variable values (gitignored)
├── services.tf          # Cloud Run services
├── firebase.tf          # Firebase configuration
├── outputs.tf           # Output values
└── README.md            # Terraform usage guide
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

### **Service Account:**

- **Name**: `cloud-run-sa`
- **Purpose**: Cloud Run services run with this identity
- **Permissions**:
  - `roles/datastore.user` - Firestore access
  - `roles/firebase.admin` - Firebase admin operations

```hcl
resource "google_service_account" "cloud_run_sa" {
  account_id   = "cloud-run-sa"
  display_name = "Cloud Run Service Account"
  project      = var.project_id
}
```

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

### **Step 1: GCP Project Setup**

```bash
# Set project ID
export PROJECT_ID="your-project-id"
gcloud config set project $PROJECT_ID

# Enable required APIs
gcloud services enable run.googleapis.com
gcloud services enable cloudbuild.googleapis.com
gcloud services enable containerregistry.googleapis.com
gcloud services enable firestore.googleapis.com
gcloud services enable identitytoolkit.googleapis.com

# Set up Application Default Credentials
gcloud auth application-default login
gcloud auth application-default set-quota-project $PROJECT_ID
```

---

### **Step 2: Terraform Configuration**

```bash
cd infrastructure/terraform

# Copy example vars
cp terraform.tfvars.example terraform.tfvars

# Edit terraform.tfvars
# Set your project_id, region, etc.

# Initialize Terraform
terraform init

# Plan infrastructure
terraform plan

# Apply infrastructure
terraform apply
```

**`terraform.tfvars` example:**

```hcl
project_id  = "dhakdhakgo-472515"
region      = "asia-south1"
zone        = "asia-south1-a"
environment = "production"
```

---

### **Step 3: Deploy Services**

```bash
# Build Docker images for all services
cd services/user-service
docker build -t gcr.io/$PROJECT_ID/user-service:latest .
docker push gcr.io/$PROJECT_ID/user-service:latest

cd ../post-service
docker build -t gcr.io/$PROJECT_ID/post-service:latest .
docker push gcr.io/$PROJECT_ID/post-service:latest

cd ../ai-service
docker build -t gcr.io/$PROJECT_ID/ai-service:latest .
docker push gcr.io/$PROJECT_ID/ai-service:latest

cd ../interaction-service
docker build -t gcr.io/$PROJECT_ID/interaction-service:latest .
docker push gcr.io/$PROJECT_ID/interaction-service:latest
```

**Or use Cloud Build:**

```bash
cd services/user-service
gcloud builds submit --tag gcr.io/$PROJECT_ID/user-service

# Repeat for other services...
```

---

### **Step 4: Configure Environment Variables**

Set environment variables in Cloud Run:

```bash
# AI Service - Gemini API Key
gcloud run services update ai-service \
  --region=asia-south1 \
  --set-env-vars="GEMINI_API_KEY=your-api-key"

# All services - Firebase Project ID (already set by Terraform)
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

## 📊 Monitoring

### **Cloud Logging:**

```bash
# View logs for a service
gcloud logging read "resource.type=cloud_run_revision AND resource.labels.service_name=user-service" \
  --limit 50 \
  --format json

# Tail logs
gcloud run services logs tail user-service --region=asia-south1
```

### **Cloud Monitoring:**

- **Metrics**: Request count, latency, error rate
- **Alerts**: Set up alerts for:
  - High error rate (>5%)
  - High latency (>2s)
  - Service unavailability

---

## 🔮 Future Infrastructure

### **Planned Additions:**

1. **Cloud CDN** - Static asset delivery
2. **Cloud Load Balancer** - API Gateway routing
3. **Cloud SQL / Redis** - Caching layer
4. **Cloud Pub/Sub** - Event-driven architecture
5. **Cloud Storage** - Image/file uploads

---

## 📚 Related Documentation

- **[Architecture](./02-ARCHITECTURE.md)** - System design
- **[Deployment Guide](./05-DEPLOYMENT.md)** - Deployment steps
- **[Terraform README](../infrastructure/terraform/README.md)** - Terraform details

---

**Next**: Learn how to [Deploy Services](./05-DEPLOYMENT.md)!
