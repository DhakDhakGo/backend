# User Service Deployment Guide

## 🎯 Overview

The User Service has been created and is ready for deployment. Since we've updated Terraform to include `user-service` in the variables, the infrastructure will be created when we deploy the service.

## 📋 Pre-Deployment Checklist

- [x] User Service code created
- [x] Terraform updated with user-service
- [x] Shared auth-middleware configured
- [x] Duplicates cleaned up
- [ ] Docker image built
- [ ] Docker image pushed to GCR
- [ ] Service deployed to Cloud Run

## 🚀 Deployment Steps

### **Step 1: Ensure Docker is Running**
```powershell
# Start Docker Desktop
# Verify Docker is running
docker --version
docker ps
```

### **Step 2: Build Docker Image**
```powershell
cd services/user-service
docker build -t gcr.io/dhakdhakgo-472515/user-service:latest .
```

### **Step 3: Push to Google Container Registry**
```powershell
docker push gcr.io/dhakdhakgo-472515/user-service:latest
```

### **Step 4: Deploy to Cloud Run**
```powershell
gcloud run deploy user-service \
  --image gcr.io/dhakdhakgo-472515/user-service:latest \
  --region asia-south1 \
  --allow-unauthenticated \
  --set-env-vars="FIREBASE_PROJECT_ID=dhakdhakgo-472515"
```

### **Step 5: Update Terraform (Optional)**
```powershell
cd ../../infrastructure/terraform
terraform apply
```

---

## 🔄 Alternative: Deploy Using gcloud Source Deploy

If Docker is not working, you can deploy directly from source:

```powershell
cd services/user-service
gcloud run deploy user-service \
  --source . \
  --region asia-south1 \
  --allow-unauthenticated \
  --set-env-vars="FIREBASE_PROJECT_ID=dhakdhakgo-472515"
```

This will build the Docker image in the cloud and deploy it.

---

## 🧪 Testing After Deployment

### **Test 1: Health Check**
```powershell
curl https://user-service-[hash].asia-south1.run.app/health
```

### **Test 2: Service Info**
```powershell
curl https://user-service-[hash].asia-south1.run.app/
```

### **Test 3: Register User (requires Firebase token)**
```powershell
curl -X POST https://user-service-[hash].asia-south1.run.app/api/users/register \
  -H "Authorization: Bearer YOUR_FIREBASE_TOKEN"
```

---

## 🔗 Integration with Other Services

After user-service is deployed, update the environment variables in other services:

### **Post Service**
```powershell
gcloud run services update post-service \
  --region asia-south1 \
  --set-env-vars="USER_SERVICE_URL=https://user-service-[hash].asia-south1.run.app"
```

### **Interaction Service**
```powershell
gcloud run services update interaction-service \
  --region asia-south1 \
  --set-env-vars="USER_SERVICE_URL=https://user-service-[hash].asia-south1.run.app"
```

### **AI Service**
```powershell
gcloud run services update ai-service \
  --region asia-south1 \
  --set-env-vars="USER_SERVICE_URL=https://user-service-[hash].asia-south1.run.app"
```

---

## 📊 Expected Service URLs

After deployment, you should have:

| Service | URL |
|---------|-----|
| User Service | https://user-service-[hash].asia-south1.run.app |
| Post Service | https://post-service-134445090159.asia-south1.run.app |
| AI Service | https://ai-service-134445090159.asia-south1.run.app |
| Interaction Service | https://interaction-service-134445090159.asia-south1.run.app |

---

## 🎯 Quick Deploy Commands

### **Option 1: Build Locally and Deploy**
```powershell
# Make sure Docker Desktop is running
cd services/user-service
docker build -t gcr.io/dhakdhakgo-472515/user-service:latest .
docker push gcr.io/dhakdhakgo-472515/user-service:latest
gcloud run deploy user-service --image gcr.io/dhakdhakgo-472515/user-service:latest --region asia-south1 --allow-unauthenticated
```

### **Option 2: Deploy from Source (Recommended if Docker issues)**
```powershell
cd services/user-service
gcloud run deploy user-service --source . --region asia-south1 --allow-unauthenticated
```

---

## ⚠️ Troubleshooting

### **Docker not running**
- Start Docker Desktop
- Wait for it to fully start
- Verify with `docker ps`

### **Authentication errors**
- Run `gcloud auth configure-docker`
- Ensure you're logged in with `gcloud auth list`

### **Build fails**
- Check if all files are present
- Verify package.json has all dependencies
- Check Dockerfile syntax

---

## ✅ Verification

After deployment, verify:

1. **Service is running**: Check health endpoint
2. **Authentication works**: Test with Firebase token
3. **Firestore connection**: Create a test user
4. **Other services can call it**: Test inter-service communication

---

Ready to deploy when Docker is available!
