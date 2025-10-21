# GitHub Actions CI/CD Setup Guide

## 📋 Overview

This repository uses GitHub Actions for automated CI/CD. Each service has its own workflow that:
1. Builds a Docker image on code changes
2. Pushes the image to Google Container Registry (GCR)
3. Deploys to Google Cloud Run

**🎓 New to GitHub Actions?** See [GITHUB_ACTIONS_EXPLAINED.md](./GITHUB_ACTIONS_EXPLAINED.md) for a detailed tutorial using your actual workflows!

---

## 🔑 Required GitHub Secrets

You need to configure these secrets in your GitHub repository:

### **1. GCP_PROJECT_ID**
Your Google Cloud Project ID

**Value**: `your-project-id` (e.g., `dhakdhakgo-472515`)

---

### **2. GCP_SA_KEY**
Service Account Key JSON for GitHub Actions to authenticate with GCP

**✅ Service account already created by Terraform!**
- Email: `github-actions@dhakdhakgo-472515.iam.gserviceaccount.com`
- Permissions: All required roles assigned ✅

#### **How to Get the Key:**

The service account exists, you just need to create a key:

```bash
# Create key (Terraform provides this command)
gcloud iam service-accounts keys create github-actions-key.json \
  --iam-account=github-actions@dhakdhakgo-472515.iam.gserviceaccount.com

# View the key (copy entire JSON)
cat github-actions-key.json

# Delete after copying to GitHub (security!)
rm github-actions-key.json
```

**Note**: All IAM permissions are already set by Terraform. No additional `gcloud` commands needed!

**Value**: Entire JSON content (keep the formatting)

⚠️ **Security**: Never commit this file! Delete it after adding to GitHub secrets.

---

### **3. GEMINI_API_KEY** (For AI Service only)
Your Google Gemini API key

**Value**: Your Gemini API key from https://makersuite.google.com/app/apikey

---

## 🛠️ How to Add Secrets to GitHub

1. Go to your GitHub repository
2. Click **Settings** → **Secrets and variables** → **Actions**
3. Click **New repository secret**
4. Add each secret:
   - Name: `GCP_PROJECT_ID`, Value: `your-project-id`
   - Name: `GCP_SA_KEY`, Value: `{...JSON content...}`
   - Name: `GEMINI_API_KEY`, Value: `your-api-key`

---

## 🚀 Workflows

### **Automated Deployment Triggers:**

Each service has a workflow that triggers when:
- ✅ Code is pushed to `main` branch
- ✅ Changes are made to that service's directory
- ✅ Changes are made to shared code
- ✅ Manually triggered via GitHub UI

### **Available Workflows:**

| Workflow | Triggers On |
|----------|------------|
| `deploy-user-service.yml` | `services/user-service/**`, `services/shared/**` |
| `deploy-post-service.yml` | `services/post-service/**`, `services/shared/**` |
| `deploy-ai-service.yml` | `services/ai-service/**` |
| `deploy-interaction-service.yml` | `services/interaction-service/**`, `services/shared/**` |

---

## 📝 How It Works

### **Workflow Steps:**

```
1. Checkout code
   ↓
2. Authenticate to GCP
   ↓
3. Set up gcloud CLI
   ↓
4. Configure Docker for GCR
   ↓
5. Build Docker image
   ↓
6. Push to GCR (with git SHA and 'latest' tags)
   ↓
7. Deploy to Cloud Run
   ↓
8. Show deployment URL
```

---

## 🎯 Usage

### **Automatic Deployment:**

1. Make changes to a service (e.g., `services/user-service/`)
2. Commit and push to `main` branch
3. GitHub Actions automatically:
   - Builds the Docker image
   - Pushes to GCR
   - Deploys to Cloud Run
4. Check the **Actions** tab on GitHub to monitor progress

### **Manual Deployment:**

1. Go to **Actions** tab on GitHub
2. Select the workflow (e.g., "Deploy User Service")
3. Click **Run workflow**
4. Select branch and click **Run workflow**

---

## 🔍 Monitoring Deployments

### **GitHub Actions UI:**

- Go to **Actions** tab
- Click on a workflow run to see logs
- Each step shows detailed output

### **Cloud Run Console:**

```bash
# View service status
gcloud run services list --region=asia-south1

# View logs
gcloud run services logs read user-service --region=asia-south1 --limit=50
```

---

## ⚙️ Workflow Configuration

Each workflow is configured with:

```yaml
env:
  PROJECT_ID: ${{ secrets.GCP_PROJECT_ID }}
  SERVICE_NAME: user-service
  REGION: asia-south1
```

### **Cloud Run Deployment Settings:**

- **Memory**: 512Mi
- **CPU**: 1
- **Max instances**: 10
- **Min instances**: 0 (scale to zero)
- **Timeout**: 300 seconds
- **Port**: 8080
- **Authentication**: Allow unauthenticated (will be changed for production)

---

## 🔧 Customization

### **Change Deployment Region:**

Edit the workflow file and update:
```yaml
env:
  REGION: your-region  # e.g., us-central1, europe-west1
```

### **Change Resource Limits:**

Edit the `gcloud run deploy` command:
```bash
--memory 1Gi \
--cpu 2 \
--max-instances 20
```

### **Add Environment Variables:**

In the `Deploy to Cloud Run` step:
```bash
gcloud run deploy ${{ env.SERVICE_NAME }} \
  ... \
  --set-env-vars="VAR1=value1,VAR2=value2"
```

---

## 🐛 Troubleshooting

### **Issue 1: Authentication Failed**

**Error**: `ERROR: (gcloud.auth) There was a problem refreshing your credentials`

**Solution**:
- Check that `GCP_SA_KEY` secret contains valid JSON
- Verify service account has necessary permissions
- Ensure service account is not deleted

---

### **Issue 2: Image Push Failed**

**Error**: `denied: Permission denied for "..."` 

**Solution**:
- Service account needs `roles/storage.admin`
- Run the permission grant commands above

---

### **Issue 3: Deployment Failed**

**Error**: `ERROR: (gcloud.run.deploy) PERMISSION_DENIED`

**Solution**:
- Service account needs `roles/run.admin`
- Service account needs `roles/iam.serviceAccountUser`

---

### **Issue 4: Workflow Doesn't Trigger**

**Solution**:
- Check the `paths` filter in workflow file
- Ensure you're pushing to `main` branch
- Check **Actions** tab for any errors

---

## 🔒 Security Best Practices

1. ✅ **Never commit service account keys** to the repository
2. ✅ **Use GitHub Secrets** for sensitive data
3. ✅ **Limit service account permissions** to minimum required
4. ✅ **Rotate service account keys** periodically
5. ✅ **Review workflow logs** for sensitive data exposure
6. ✅ **Use branch protection** for production branch

---

## 📊 Cost Implications

### **GitHub Actions:**
- **Free tier**: 2,000 minutes/month for private repos
- **Each deployment**: ~5-10 minutes
- **Monthly estimate**: ~100-200 deployments within free tier

### **Google Cloud:**
- Build time is on GitHub (free)
- Only Cloud Run deployment and runtime costs apply
- No Cloud Build charges

---

## 🔄 CI/CD Pipeline Flow

```
Developer pushes code
    ↓
GitHub detects change in service directory
    ↓
GitHub Actions starts workflow
    ↓
Build Docker image
    ↓
Push to GCR
    ↓
Deploy to Cloud Run
    ↓
Service is live! 🎉
```

---

## 📚 Additional Resources

- [GitHub Actions Documentation](https://docs.github.com/en/actions)
- [Google Cloud Run Documentation](https://cloud.google.com/run/docs)
- [GCR Documentation](https://cloud.google.com/container-registry/docs)

---

## ✅ Checklist

Before first deployment:
- [ ] Create GitHub repository
- [ ] Add all three secrets (GCP_PROJECT_ID, GCP_SA_KEY, GEMINI_API_KEY)
- [ ] Grant service account permissions
- [ ] Push code to `main` branch
- [ ] Check Actions tab for workflow run
- [ ] Verify deployment in Cloud Run console

---

## 📚 Documentation

- **[GITHUB_ACTIONS_EXPLAINED.md](./GITHUB_ACTIONS_EXPLAINED.md)** - 🎓 How GitHub Actions works (tutorial with examples)
- **[Secrets Management](../infrastructure/terraform/SECRETS_VIA_GITHUB.md)** - Why GitHub Secrets
- **[Infrastructure Overview](../docs/04-INFRASTRUCTURE.md)** - GCP architecture

---

**🎓 New to GitHub Actions?** Start with [GITHUB_ACTIONS_EXPLAINED.md](./GITHUB_ACTIONS_EXPLAINED.md)!

**Need help?** Check the **Actions** tab for detailed logs of each deployment.
