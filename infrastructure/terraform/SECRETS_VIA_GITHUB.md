# Secrets Management via GitHub Actions

## 📋 Overview

We use **GitHub Actions secrets** instead of Google Secret Manager for simpler, centralized secret management.

---

## ✅ Why GitHub Actions Secrets?

**Pros:**
- ✅ Simpler - One place for all secrets
- ✅ Free - No additional GCP costs
- ✅ Integrated - Works seamlessly with CI/CD
- ✅ Secure - Encrypted by GitHub
- ✅ Easy to update - Update once, all deployments use new value

**vs Google Secret Manager:**
- ❌ Additional GCP cost ($0.06/secret/month)
- ❌ More complex setup
- ❌ Need IAM configuration
- ❌ Separate management from CI/CD

---

## 🔑 Required GitHub Secrets

Add these secrets to your GitHub repository:

### **1. GCP_PROJECT_ID**
Your Google Cloud Project ID

**Value**: `dhakdhakgo-472515` (or your project ID)

---

### **2. GCP_SA_KEY**
Service Account Key for GitHub Actions to deploy to GCP

**How to create:**
```bash
# Set project
export PROJECT_ID="dhakdhakgo-472515"

# Create service account
gcloud iam service-accounts create github-actions \
  --display-name="GitHub Actions CI/CD" \
  --project=$PROJECT_ID

# Grant permissions
gcloud projects add-iam-policy-binding $PROJECT_ID \
  --member="serviceAccount:github-actions@$PROJECT_ID.iam.gserviceaccount.com" \
  --role="roles/run.admin"

gcloud projects add-iam-policy-binding $PROJECT_ID \
  --member="serviceAccount:github-actions@$PROJECT_ID.iam.gserviceaccount.com" \
  --role="roles/storage.admin"

gcloud projects add-iam-policy-binding $PROJECT_ID \
  --member="serviceAccount:github-actions@$PROJECT_ID.iam.gserviceaccount.com" \
  --role="roles/iam.serviceAccountUser"

# Create key
gcloud iam service-accounts keys create github-actions-key.json \
  --iam-account=github-actions@$PROJECT_ID.iam.gserviceaccount.com

# Copy the entire JSON content
cat github-actions-key.json

# Delete the file after copying (SECURITY!)
rm github-actions-key.json
```

**Value**: Entire JSON content (keep formatting)

---

### **3. GEMINI_API_KEY**
Your Google Gemini API key for AI Service

**How to get:**
1. Go to https://makersuite.google.com/app/apikey
2. Create new API key or use existing
3. Copy the key

**Value**: `AIzaSyXXXXXXXXXXXXXXXXXXXXXXXXX` (your actual key)

---

## 🛠️ How to Add Secrets to GitHub

### **Step 1: Navigate to Settings**
1. Go to your GitHub repository
2. Click **Settings**
3. Click **Secrets and variables** → **Actions**

### **Step 2: Add Each Secret**
For each secret:
1. Click **New repository secret**
2. Name: Enter secret name (e.g., `GCP_PROJECT_ID`)
3. Value: Enter secret value
4. Click **Add secret**

Repeat for all 3 secrets.

---

## 🔄 How Secrets Are Used

### **In GitHub Actions Workflows:**

```yaml
# .github/workflows/deploy-ai-service.yml

env:
  PROJECT_ID: ${{ secrets.GCP_PROJECT_ID }}    ← From GitHub Secret
  
steps:
  - name: Authenticate to Google Cloud
    uses: google-github-actions/auth@v1
    with:
      credentials_json: ${{ secrets.GCP_SA_KEY }}  ← From GitHub Secret
  
  - name: Deploy to Cloud Run
    run: |
      gcloud run deploy ai-service \
        --set-env-vars="GEMINI_API_KEY=${{ secrets.GEMINI_API_KEY }}"  ← Injected at deploy time
```

### **How It Works:**

```
1. You push code to GitHub
   ↓
2. GitHub Actions reads secrets
   ↓
3. Authenticates to GCP with GCP_SA_KEY
   ↓
4. Builds Docker image
   ↓
5. Deploys to Cloud Run with GEMINI_API_KEY set as env var
   ↓
6. AI Service uses GEMINI_API_KEY at runtime
```

---

## 🔐 Security Benefits

### **GitHub Secrets Are:**
- ✅ **Encrypted** - Encrypted at rest and in transit
- ✅ **Never logged** - Redacted in logs (`***`)
- ✅ **Access controlled** - Only workflows can read
- ✅ **Audited** - Changes are logged

### **Best Practices:**
1. ✅ Never commit secrets to code
2. ✅ Rotate service account keys periodically
3. ✅ Use least-privilege IAM roles
4. ✅ Different secrets for different environments (dev/staging/prod)

---

## 🔄 Updating Secrets

### **To Update Gemini API Key:**

1. Go to GitHub → Settings → Secrets → Actions
2. Find `GEMINI_API_KEY`
3. Click **Update**
4. Enter new value
5. Click **Update secret**

Next deployment automatically uses the new key! ✅

### **To Rotate Service Account Key:**

```bash
# Delete old key (find KEY_ID first)
gcloud iam service-accounts keys list \
  --iam-account=github-actions@$PROJECT_ID.iam.gserviceaccount.com

gcloud iam service-accounts keys delete KEY_ID \
  --iam-account=github-actions@$PROJECT_ID.iam.gserviceaccount.com

# Create new key
gcloud iam service-accounts keys create new-key.json \
  --iam-account=github-actions@$PROJECT_ID.iam.gserviceaccount.com

# Update GitHub secret with new-key.json content
# Then delete new-key.json
rm new-key.json
```

---

## 📊 Comparison

| Feature | GitHub Secrets | Google Secret Manager |
|---------|---------------|----------------------|
| **Cost** | Free ✅ | $0.06/secret/month |
| **Setup** | Simple ✅ | Complex |
| **CI/CD Integration** | Native ✅ | Requires IAM setup |
| **Updates** | Instant ✅ | Need to redeploy |
| **Management** | GitHub UI ✅ | GCP Console |
| **Audit Logs** | GitHub ✅ | Cloud Logging |

**Winner**: GitHub Secrets for CI/CD use case! 🏆

---

## 🚀 Manual Deployment (Optional)

If deploying manually without GitHub Actions:

```bash
# Set environment variable for AI service
gcloud run services update ai-service \
  --region=asia-south1 \
  --set-env-vars="GEMINI_API_KEY=your-actual-api-key"
```

⚠️ **Better**: Use GitHub Actions for deployment (secrets managed automatically)

---

## ✅ What's NOT in Terraform

Since secrets are in GitHub Actions, these are **not** in Terraform:
- ❌ No `secrets.tf` file
- ❌ No Secret Manager API
- ❌ No secret IAM bindings
- ❌ No secret resources

**Result**: Simpler Terraform configuration! 🎉

---

## 🔍 Verification

After deployment, verify secrets are set:

```bash
# Check AI service has GEMINI_API_KEY
gcloud run services describe ai-service \
  --region=asia-south1 \
  --format='value(spec.template.spec.containers[0].env)' \
  | grep GEMINI_API_KEY

# Should output: name: GEMINI_API_KEY, value: [REDACTED]
```

---

## 📚 Related Documentation

- **GitHub Actions Setup**: [`.github/SETUP.md`](../../.github/SETUP.md)
- **CI/CD Summary**: [`CI_CD_SETUP_SUMMARY.md`](../../CI_CD_SETUP_SUMMARY.md)
- **Terraform README**: [`README.md`](README.md)

---

## ❓ FAQ

### **Q: Can I use both GitHub Secrets and Secret Manager?**
A: Yes, but not recommended. Pick one approach for simplicity.

### **Q: What if I don't use GitHub Actions?**
A: Set environment variables manually via `gcloud` or GCP Console.

### **Q: Are GitHub Secrets secure enough for production?**
A: Yes! Used by thousands of companies. Same encryption as Secret Manager.

### **Q: How many secrets can I have?**
A: 100 secrets per repository (more than enough).

### **Q: Can I use secrets in Terraform?**
A: Not directly. But Terraform doesn't need secrets - GitHub Actions injects them at deploy time.

---

**Summary**: GitHub Secrets = Simple, Free, Secure, Perfect for CI/CD! ✅
