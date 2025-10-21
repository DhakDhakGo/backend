# Terraform Configuration for DhakDhakGo Backend

## 📋 Overview

This Terraform configuration manages all infrastructure for the DhakDhakGo backend microservices.

---

## 🏗️ Infrastructure Components 

### **What Gets Created:**

1. **Cloud Run Services** (4)
   - user-service
   - post-service
   - ai-service
   - interaction-service

2. **Firebase**
   - Firebase project
   - Firestore database (Native mode)
   - Authentication (manual setup required)

3. **IAM & Security**
   - Service account for Cloud Run
   - IAM permissions (Firestore, Firebase, AI Platform)

4. **APIs Enabled**
   - Cloud Run
   - Cloud Build
   - Container Registry
   - Firestore
   - Firebase
   - Identity Toolkit (Auth)

---

## 🚀 Quick Start

### **Prerequisites:**

```bash
# Install Terraform
# https://developer.hashicorp.com/terraform/downloads

# Authenticate to GCP
gcloud auth login
gcloud auth application-default login

# Set project
export PROJECT_ID="dhakdhakgo-472515"
gcloud config set project $PROJECT_ID
gcloud auth application-default set-quota-project $PROJECT_ID
```

---

### **Step 1: Configure Variables**

```bash
# Copy example file
cp terraform.tfvars.example terraform.tfvars

# Edit terraform.tfvars
nano terraform.tfvars
```

**Required values**:
```hcl
project_id  = "your-project-id"
region      = "asia-south1"
zone        = "asia-south1-a"
environment = "dev"  # or "staging", "prod"
```

---

### **Step 2: Initialize Terraform**

```bash
terraform init
```

This will:
- Download required providers (google, google-beta)
- Initialize backend
- Prepare modules

---

### **Step 3: Plan Infrastructure**

```bash
terraform plan
```

Review the plan to see:
- What will be created
- What will be modified
- What will be destroyed

---

### **Step 4: Apply Configuration**

```bash
terraform apply
```

Type `yes` to confirm.

**Expected time**: 5-10 minutes

---

## 📁 File Structure

```
infrastructure/terraform/
├── main.tf              # Provider configuration
├── variables.tf         # Variable declarations
├── terraform.tfvars     # Variable values (gitignored)
├── services.tf          # Cloud Run services
├── firebase.tf          # Firebase & Firestore
├── outputs.tf           # Output values
├── terraform.tfvars.example  # Example variables
├── README.md           # This file
├── FIREBASE_MANUAL_SETUP.md  # Firebase setup guide
└── SECRETS_VIA_GITHUB.md     # Secrets management guide
```

---

## 🔧 Configuration Details

### **Services Configuration** (`services.tf`)

Each Cloud Run service gets:
- **Memory**: 512Mi (configurable)
- **CPU**: 1 vCPU
- **Min instances**: 0 (scale to zero)
- **Max instances**: 10
- **Timeout**: 300 seconds
- **Port**: 8080
- **Authentication**: Allow unauthenticated (temporary)

**Environment Variables** (automatically set):
- `NODE_ENV`: Environment (dev/staging/prod)
- `FIREBASE_PROJECT_ID`: Your project ID
- `USER_SERVICE_URL`: URL for User Service (for other services)
- `AI_SERVICE_URL`: URL for AI Service (for Post/Interaction services)
- `POST_SERVICE_URL`: URL for Post Service (for Interaction service)

---

### **Inter-Service Communication**

Services are configured to communicate via HTTPS:

```
post-service → USER_SERVICE_URL, AI_SERVICE_URL
interaction-service → USER_SERVICE_URL, POST_SERVICE_URL
ai-service → (no dependencies)
user-service → (no dependencies)
```

---

### **Firebase Configuration** (`firebase.tf`)

Creates:
- Firebase project (linked to GCP)
- Firestore Native database
- Service account for Cloud Run
- IAM roles:
  - `roles/datastore.user` - Firestore access
  - `roles/firebase.admin` - Firebase operations
  - `roles/aiplatform.user` - Gemini AI access

**Note**: Firebase Authentication must be configured manually via console.

---

### **Secrets Management**

**Secrets are managed via GitHub Actions**, not in Terraform.

See [`SECRETS_VIA_GITHUB.md`](SECRETS_VIA_GITHUB.md) for:
- How to set up GitHub secrets
- How secrets are injected during deployment
- Security best practices

**For AI Service**, the Gemini API key is set during deployment:
```yaml
# In GitHub Actions workflow
--set-env-vars="GEMINI_API_KEY=${{ secrets.GEMINI_API_KEY }}"
```

---

## 🔄 Common Operations

### **View Current State**

```bash
# See what's deployed
terraform show

# List all resources
terraform state list

# Get specific output
terraform output service_urls
```

---

### **Update Services**

```bash
# After code changes, update terraform
terraform plan
terraform apply
```

---

### **Add New Service**

1. Add to `variables.tf` default services list
2. Add to `terraform.tfvars` services array
3. Run `terraform apply`

---

### **Modify Resources**

Edit the relevant `.tf` file:
- Service config → `services.tf`
- Firebase config → `firebase.tf`
- Secrets → See `SECRETS_VIA_GITHUB.md` (managed in GitHub Actions)

Then:
```bash
terraform plan
terraform apply
```

---

### **Destroy Infrastructure**

```bash
# Review what will be destroyed
terraform plan -destroy

# Destroy everything (⚠️ CAREFUL!)
terraform destroy
```

---

## 🔍 Outputs

After `terraform apply`, you'll see:

```
service_urls = {
  "user-service"        = "https://user-service-xxx.run.app"
  "post-service"        = "https://post-service-xxx.run.app"
  "ai-service"          = "https://ai-service-xxx.run.app"
  "interaction-service" = "https://interaction-service-xxx.run.app"
}

service_account_email = "cloud-run-sa@PROJECT_ID.iam.gserviceaccount.com"
project_id = "your-project-id"
region = "asia-south1"
```

---

## ⚠️ Important Notes

### **Docker Images Required**

Terraform expects Docker images to already exist in GCR:
```
gcr.io/PROJECT_ID/user-service:latest
gcr.io/PROJECT_ID/post-service:latest
gcr.io/PROJECT_ID/ai-service:latest
gcr.io/PROJECT_ID/interaction-service:latest
```

**Before first apply**, build and push images:
```bash
cd ../../services/user-service
docker build -t gcr.io/$PROJECT_ID/user-service:latest .
docker push gcr.io/$PROJECT_ID/user-service:latest
# Repeat for all services
```

Or use placeholder images for first apply, then update after building.

---

### **Firebase Authentication**

The `google_identity_platform_config` resource is commented out due to API limitations.

**Manual setup required**:
1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project
3. Navigate to **Authentication**
4. Enable sign-in methods:
   - Email/Password
   - Google
   - (Optional) Phone

---

### **Secrets**

Secrets (like Gemini API key) are managed via **GitHub Actions**, not Terraform.

See [`SECRETS_VIA_GITHUB.md`](SECRETS_VIA_GITHUB.md) for complete guide.

---

## 🐛 Troubleshooting

### **Error: Image not found**

```
Error: Error waiting for Creating Service: error waiting for operation:
container image not found
```

**Solution**: Build and push Docker images first (see above)

---

### **Error: API not enabled**

```
Error: Error creating Service: googleapi: Error 403:
API [service] is not enabled for project
```

**Solution**: Terraform will enable APIs automatically. Wait 1-2 minutes and retry.

---

### **Error: Quota exceeded**

```
Error: Quota exceeded for quota metric
```

**Solution**: 
- Check [GCP Quotas](https://console.cloud.google.com/iam-admin/quotas)
- Request quota increase
- Or reduce `max_instances` in `terraform.tfvars`

---

### **State Lock Error**

```
Error: Error acquiring the state lock
```

**Solution**:
```bash
# If no one else is running terraform
terraform force-unlock LOCK_ID
```

---

## 💰 Cost Estimation

**Monthly costs** (approximate, low traffic):
- Cloud Run: $5-20 (pay-per-use)
- Firestore: $5-15 (reads/writes)
- Container Registry: $0.26/GB
- **Total: ~$10-35/month**

**Free tier includes**:
- 2 million Cloud Run requests/month
- 50K Firestore reads/day
- 20K writes/day

---

## 🔐 Security Best Practices

1. ✅ **Never commit `terraform.tfvars`** (may contain sensitive data)
2. ✅ **Use GitHub Secrets** for API keys (see `SECRETS_VIA_GITHUB.md`)
3. ✅ **Enable state encryption** (use GCS backend)
4. ✅ **Limit service account permissions** (least privilege)
5. ✅ **Review IAM bindings** regularly
6. ✅ **Enable audit logs** for production

---

## 🔄 State Management

### **Local State** (current):
- State stored in `terraform.tfstate`
- ⚠️ Not suitable for teams
- ⚠️ No locking mechanism

### **Remote State** (recommended):

Uncomment in `main.tf`:
```hcl
backend "gcs" {
  bucket = "your-project-id-terraform-state"
  prefix = "dhakdhakgo-backend"
}
```

Create bucket:
```bash
gsutil mb gs://$PROJECT_ID-terraform-state
gsutil versioning set on gs://$PROJECT_ID-terraform-state
```

---

## 📚 Additional Resources

- [Terraform Google Provider Docs](https://registry.terraform.io/providers/hashicorp/google/latest/docs)
- [Cloud Run Documentation](https://cloud.google.com/run/docs)
- [Terraform Best Practices](https://www.terraform.io/docs/language/index.html)

---

## ✅ Validation

After deployment, verify:

```bash
# Check services are running
gcloud run services list --region=asia-south1

# Test health endpoints
curl $(terraform output -raw service_urls | jq -r '.["user-service"]')/health
curl $(terraform output -raw service_urls | jq -r '.["post-service"]')/health
curl $(terraform output -raw service_urls | jq -r '.["ai-service"]')/health
curl $(terraform output -raw service_urls | jq -r '.["interaction-service"]')/health
```

Expected: `{"status": "healthy", "service": "xxx-service", ...}`

---

**Need help?** See main documentation in `../../docs/`