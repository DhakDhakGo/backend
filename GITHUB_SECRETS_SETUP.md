# 🔐 GitHub Secrets Setup - Quick Guide

**Time Required**: 5 minutes

The GitHub Actions service account was **automatically created by Terraform** ✅  
You just need to add the secrets to GitHub!

---

## ✅ What Terraform Already Did

- ✅ Created service account: `github-actions@dhakdhakgo-472515.iam.gserviceaccount.com`
- ✅ Assigned all necessary IAM permissions
- ✅ Generated the JSON key file: `github-actions-key.json`

---

## 📋 Your Manual Steps

### **Step 1: Add Secrets to GitHub** (3 minutes)

Go to your GitHub repository:
```
Repository → Settings → Secrets and variables → Actions
```

Click **"New repository secret"** and add these **3 secrets**:

---

#### **Secret 1: GCP_SA_KEY**

**Name**: `GCP_SA_KEY`

**Value**: Copy the **entire contents** of `github-actions-key.json`

<details>
<summary>📄 Click to see the full JSON (copy this)</summary>

```json
{
  "type": "service_account",
  "project_id": "dhakdhakgo-472515",
  "private_key_id": "c040093b76d94eea509a9ce19644fef812a1683b",
  "private_key": "-----BEGIN PRIVATE KEY-----\nMIIEvAIBADANBgkqhkiG9w0BAQEFAASCBKYwggSiAgEAAoIBAQC7kw89rJt2xzUw\nB4Fb71l/Z1WIUpe5Q+jVs5xq5/G0njn+Ysi4PPKki6QLadf7XxCtnZH5x5rswGhw\nlbx2jxzikTVrU5BjNGBCvZt4gKFMK8pnr0WO7kR/gcjdx5tBaREe1+klXLTTNAmh\nbnMzrlrF3BZawka/6cJzZTO6rjls2HGaZf5OvdXtKPH6ql3xu7+BBf8bzgirdWM7\nGw07BhnX9fESs7cR8LB99Bwh3UbWt7ckGzla4w6MY+DyhShfGFw2gpmw8FYmMI8L\n53Hmumw8ehGKetWaCeB3uOjAIQh++zaHMWL9l0uYa7AD8GaPzPrWgYOJcUqICCGn\n1Dst29WTAgMBAAECggEABtMPZwgVPY9jm5iyTwfYnPiguFk6vvCbE3L/gsEhr+kE\nMN6vH6gpG6fwbTcm8O8JvVmDl8y+TAOmF6i3XLF0Ls+5Cj0ElcawYJ60w8W+TPYe\nXQ5dlAHrg0J2nNWcXX/rVK3PssdAMpuEB9ImDsMT4B4CY3nETmJfjp+zZCferXK9\nOm88bzCOs4cf/jdxEAjAOhNAApa0KJmtPkY9B2BAnW4uuP78ipeBTu2PootXxrpr\n+Kc7Smuls7mzFwgSrPqszys7ZJZ+q0PPpz5c08000iEsbxOEEheGlelmmYQQ8U3P\n3W7jF+o6zENWJI59FQo40+OvR9L2cQK81N5FcpmTtQKBgQDyxYPeovsL9AKfDBc9\nYKxy5iK+8rkOeyrW3UEbGHDEqtDvgI7UM+ETfPOokZUrjq/94LrMQx3kNPGpNY74\ngyCCJUQC3DPSi0PoLIxjpdXH3hcqy/8ZziNfCYBn9t7s914TiJVOIil4h610g/fA\nM0bt907sp15D9Ns91UVuPdfctQKBgQDFy5XihnjmZWQylqLIO6MwkAghfH2cexVH\nQPZtoC8OAiq+Un5mQ1Cki82uUwrmJKRmc/dn2E9b8V46kXdyHKlMc4lrk+VHrYji\nnB/gM3gQdAQTzii0sGojrJnJ074aWRkKibx+Kd9jUxRm+WzQDL+rlAgZT1/JdBL/\nehanyyweJwKBgGiDq8/PLnDo7a/3DpI36kXU2aSG7jBTyg+SVRMLJJEmUKirGdI1\nO3KeWm95rVSBKzcK5qBFTLsQJ/GGwzQtj3M4A92PWygLGIL9mrrTjANtk1+zTvGX\nExc5CfS4DSTLIc8a/9wRTPU8w+njXmd6K9EKpQmwzB5JbZFjHW7mZOX5AoGAHdrQ\n0NRDQ2NicFBUWazGwPm8gHFt9ESPvaWMjJd1AsRI91k0QvM+JNgFP57BMmOtfNlc\nKox3zgTsmCKEyPCSjTuTLm2wWdVTqACwvwKFyNX6F5MyibNnEeNngxM2yntQUErh\n7JkdYryTg8d6KR0DgT5iyo80gg/HHlCrQsBj9FkCgYAQHllQ5W/zwNrCqvO3NC/Y\nLewAWhfLM3EgjHkiwXD6eIk+4Q/KHZO9UVdcPxShK9+BykrWa/0xBLoMkiABAJe+\n85XZD/ZVgmpIawm5Koo+bU+wCGIuDkHrxAyEN31ksYylMj6y8l6z0VQgTdx8NRjh\nRMSbZcvNpEFZVPwk9x+dQw==\n-----END PRIVATE KEY-----\n",
  "client_email": "github-actions@dhakdhakgo-472515.iam.gserviceaccount.com",
  "client_id": "118446496036338085584",
  "auth_uri": "https://accounts.google.com/o/oauth2/auth",
  "token_uri": "https://oauth2.googleapis.com/token",
  "auth_provider_x509_cert_url": "https://www.googleapis.com/oauth2/v1/certs",
  "client_x509_cert_url": "https://www.googleapis.com/robot/v1/metadata/x509/github-actions%40dhakdhakgo-472515.iam.gserviceaccount.com",
  "universe_domain": "googleapis.com"
}
```

</details>

**Or from command line:**
```bash
cat github-actions-key.json
# Copy the entire output
```

---

#### **Secret 2: GCP_PROJECT_ID**

**Name**: `GCP_PROJECT_ID`

**Value**: `dhakdhakgo-472515`

---

#### **Secret 3: GEMINI_API_KEY**

**Name**: `GEMINI_API_KEY`

**Value**: `AIzaSyCU-hFVETHPwqQdFcAArd2EuIG04lbzUIs`

---

### **Step 2: Delete the Local Key File** 🔒 (Security!)

After copying to GitHub, **immediately delete** the local file:

```bash
rm github-actions-key.json
```

⚠️ **NEVER commit this file to Git!**

---

### **Step 3: Verify GitHub Secrets** ✅

Go back to:
```
Repository → Settings → Secrets and variables → Actions
```

You should see **3 secrets**:
- ✅ `GCP_PROJECT_ID`
- ✅ `GCP_SA_KEY`
- ✅ `GEMINI_API_KEY`

---

## 🎉 Done! What Happens Next?

Once you push code to GitHub:

1. **GitHub Actions triggers** automatically
2. **Authenticates** using `GCP_SA_KEY`
3. **Builds** Docker images for all 4 services
4. **Pushes** images to Google Container Registry
5. **Deploys** to Cloud Run with `GEMINI_API_KEY` set
6. **Your services are live!** 🚀

---

## 🔍 How to Verify It Works

After setting up secrets, test the CI/CD:

```bash
# Make a small change
echo "# Test" >> README.md

# Commit and push
git add README.md
git commit -m "test: Trigger CI/CD"
git push origin main

# Watch the workflow
# Go to: Repository → Actions tab
```

You should see the workflow running and deploying all 4 services! ✅

---

## 🛠️ Troubleshooting

### **Issue: Secret not found**
- Make sure secret names are **exact**: `GCP_SA_KEY`, `GCP_PROJECT_ID`, `GEMINI_API_KEY`
- No extra spaces or typos

### **Issue: Authentication failed**
- Verify `GCP_SA_KEY` contains the **entire JSON** (including `{` and `}`)
- Check that service account has permissions (Terraform already did this ✅)

### **Issue: Deployment failed**
- Check GitHub Actions logs: Repository → Actions → Click on the failed workflow
- Look for specific error messages

---

## 📚 Related Documentation

- **Secrets via GitHub**: `infrastructure/terraform/SECRETS_VIA_GITHUB.md`
- **CI/CD Setup**: `CI_CD_SETUP_SUMMARY.md`
- **GitHub Actions Workflows**: `.github/workflows/`

---

## ✅ Checklist

- [ ] Add `GCP_SA_KEY` to GitHub Secrets
- [ ] Add `GCP_PROJECT_ID` to GitHub Secrets
- [ ] Add `GEMINI_API_KEY` to GitHub Secrets
- [ ] Delete `github-actions-key.json` from local machine
- [ ] Verify all 3 secrets show up in GitHub
- [ ] Push code to test CI/CD

---

**Time to complete**: ~5 minutes  
**Automation level**: 95% (Terraform) + 5% (Manual secrets)  
**One-time setup**: Yes! Never need to do this again ✅

