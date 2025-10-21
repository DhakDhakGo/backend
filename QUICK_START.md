# 🚀 Quick Start - Next Steps

Your infrastructure is **deployed and running**! ✅

Here's what you need to do to go **fully live**:

---

## 📋 **5-Minute Setup Checklist**

### ✅ **DONE: Infrastructure** (Terraform)
- ✅ Cloud Run services deployed (4 services)
- ✅ Firestore database created
- ✅ Service accounts created
- ✅ IAM permissions configured
- ✅ Container images in GCR

---

### 🔐 **NEXT: Add GitHub Secrets** (5 minutes)

**Guide**: See `GITHUB_SECRETS_SETUP.md`

Go to: **GitHub Repository → Settings → Secrets and variables → Actions**

Add these 3 secrets:

#### 1. `GCP_SA_KEY`
```bash
# The JSON is in: github-actions-key.json
# Copy entire contents (including { and })
```

#### 2. `GCP_PROJECT_ID`
```
dhakdhakgo-472515
```

#### 3. `GEMINI_API_KEY`
```
AIzaSyCU-hFVETHPwqQdFcAArd2EuIG04lbzUIs
```

**Then delete the local key file:**
```bash
rm github-actions-key.json
```

---

### 🔒 **Secure Your Database** (2 minutes)

Deploy Firestore security rules:

```bash
# Login to Firebase
firebase login

# Select your project
firebase use dhakdhakgo-472515

# Deploy rules and indexes
firebase deploy --only firestore:rules,firestore:indexes
```

---

### ⚙️ **Configure Environment Variables** (2 minutes)

Set Gemini API key for AI service:

```bash
gcloud run services update ai-service \
  --region=asia-south1 \
  --set-env-vars="GEMINI_API_KEY=AIzaSyCU-hFVETHPwqQdFcAArd2EuIG04lbzUIs"
```

---

### 🔑 **Enable Firebase Authentication** (5 minutes)

1. Go to: https://console.firebase.google.com/
2. Select project: `dhakdhakgo-472515`
3. Go to: **Build → Authentication**
4. Click "Get Started"
5. Enable **Email/Password** provider
6. Enable **Google** provider

**Guide**: See `FIREBASE_SETUP.md`

---

### 🧪 **Test Your Services** (5 minutes)

```bash
# Test each service
curl https://user-service-ute6thusxq-el.a.run.app/health
curl https://post-service-ute6thusxq-el.a.run.app/health
curl https://ai-service-ute6thusxq-el.a.run.app/health
curl https://interaction-service-ute6thusxq-el.a.run.app/health
```

All should return `200 OK` ✅

---

### 🚀 **Enable CI/CD** (1 minute)

After adding GitHub secrets, just push code:

```bash
git add .
git commit -m "feat: Production ready"
git push origin main
```

**GitHub Actions will automatically:**
- Build Docker images
- Push to GCR
- Deploy to Cloud Run
- Set environment variables

Watch at: **Repository → Actions** tab

---

## 📊 **Your Services**

All running at:

- 🔵 **User Service**: https://user-service-ute6thusxq-el.a.run.app
- 📝 **Post Service**: https://post-service-ute6thusxq-el.a.run.app
- 🤖 **AI Service**: https://ai-service-ute6thusxq-el.a.run.app
- ❤️ **Interaction Service**: https://interaction-service-ute6thusxq-el.a.run.app

---

## ⏱️ **Total Time to Production**

| Step | Time | Status |
|------|------|--------|
| Infrastructure (Terraform) | ✅ DONE | Complete |
| GitHub Secrets | 5 min | **← START HERE** |
| Firestore Rules | 2 min | |
| Environment Vars | 2 min | |
| Firebase Auth | 5 min | |
| Testing | 5 min | |
| **TOTAL** | **~20 minutes** | |

---

## 🎯 **Recommended Order**

1. **GitHub Secrets** (enables CI/CD)
2. **Firestore Rules** (security)
3. **Environment Variables** (AI service needs this)
4. **Test Services** (verify everything works)
5. **Firebase Auth** (users can sign in)
6. **Push to GitHub** (auto-deploy)

---

## 📚 **Documentation**

- **GitHub Secrets Guide**: `GITHUB_SECRETS_SETUP.md`
- **Firebase Setup**: `FIREBASE_SETUP.md`
- **Secrets via GitHub**: `infrastructure/terraform/SECRETS_VIA_GITHUB.md`
- **CI/CD Summary**: `CI_CD_SETUP_SUMMARY.md`
- **Architecture**: `docs/ARCHITECTURE.md`
- **API Documentation**: Each service has `docs/API.md`

---

## 💡 **Quick Commands Reference**

### **Check Service Status**
```bash
gcloud run services list --region=asia-south1
```

### **View Logs**
```bash
gcloud run services logs read user-service --region=asia-south1 --limit=50
```

### **Update Environment Variable**
```bash
gcloud run services update SERVICE_NAME \
  --region=asia-south1 \
  --set-env-vars="KEY=VALUE"
```

### **Deploy Firestore Rules**
```bash
firebase deploy --only firestore:rules,firestore:indexes
```

---

## 🆘 **Need Help?**

- **Terraform issues**: See `infrastructure/terraform/README.md`
- **GitHub Actions not working**: Check `.github/workflows/` files
- **Service errors**: Check logs with `gcloud run services logs read SERVICE_NAME`
- **Firestore issues**: See `FIREBASE_SETUP.md`

---

## ✅ **Quick Checklist**

Copy this checklist:

```
□ Add GCP_SA_KEY to GitHub Secrets
□ Add GCP_PROJECT_ID to GitHub Secrets
□ Add GEMINI_API_KEY to GitHub Secrets
□ Delete github-actions-key.json locally
□ Deploy Firestore rules (firebase deploy)
□ Set GEMINI_API_KEY for ai-service
□ Enable Firebase Email/Password auth
□ Enable Firebase Google auth
□ Test all 4 service health endpoints
□ Push code to trigger CI/CD
□ Verify GitHub Actions deployment succeeds
□ Test end-to-end flow with actual requests
```

---

**Ready? Start with GitHub Secrets!** 🔐

Open: `GITHUB_SECRETS_SETUP.md`

