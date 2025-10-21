# Firebase Authentication Setup Guide

## 🎯 Overview

This guide will help you set up Firebase Authentication manually through the Google Cloud Console, since Terraform encountered quota project issues with the Identity Toolkit API.

## 📋 Prerequisites

- Google Cloud Project: `dhakdhakgo-472515`
- Firebase project already initialized via Terraform
- Services deployed to Cloud Run with Firebase Admin SDK configured

## 🔧 Manual Setup Steps

### Step 1: Enable Firebase Authentication

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Select your project: `dhakdhakgo-472515`
3. Navigate to **Firebase** > **Authentication**
4. Click **Get Started**
5. Go to **Sign-in method** tab
6. Enable **Email/Password** authentication:
   - Click on **Email/Password**
   - Toggle **Enable**
   - Click **Save**

### Step 2: Configure Authentication Settings

1. In the **Authentication** section:
   - Go to **Settings** tab
   - Set **Authorized domains**:
     - `localhost` (for local development)
     - `post-service-134445090159.asia-south1.run.app`
     - `ai-service-134445090159.asia-south1.run.app`
     - `interaction-service-134445090159.asia-south1.run.app`
   - Add any custom domains you plan to use

### Step 3: Get Firebase Configuration

1. Go to **Project Settings** (gear icon)
2. Scroll down to **Your apps** section
3. Click **Add app** > **Web app**
4. Register your app with a name (e.g., "Bike Posts Backend")
5. Copy the Firebase configuration object

### Step 4: Configure Environment Variables

Add these environment variables to your Cloud Run services:

```bash
FIREBASE_PROJECT_ID=dhakdhakgo-472515
FIREBASE_API_KEY=your-api-key-here
FIREBASE_MESSAGING_SENDER_ID=your-sender-id-here
FIREBASE_APP_ID=your-app-id-here
```

## 🧪 Testing Authentication

### Test Public Endpoint
```bash
curl https://post-service-134445090159.asia-south1.run.app/
```

### Test Optional Authentication
```bash
curl https://post-service-134445090159.asia-south1.run.app/optional-auth
```

### Test Protected Endpoint (should fail without token)
```bash
curl https://post-service-134445090159.asia-south1.run.app/auth-test
```

### Test with Valid Token
```bash
# First, get a Firebase ID token from your client app
curl -H "Authorization: Bearer YOUR_FIREBASE_ID_TOKEN" \
     https://post-service-134445090159.asia-south1.run.app/auth-test
```

## 🔐 Authentication Endpoints

The Post Service now includes these authentication endpoints:

- **`/`** - Public endpoint (no auth required)
- **`/health`** - Health check (no auth required)
- **`/optional-auth`** - Works with or without authentication
- **`/auth-test`** - Requires valid Firebase token
- **`/posts`** - Protected endpoint (requires authentication)

## 🚀 Next Steps

1. **Set up Firebase Authentication** using the manual steps above
2. **Configure other services** with the same authentication middleware
3. **Test authentication flow** with a client application
4. **Implement business logic** in protected endpoints

## 📝 Notes

- Firebase Authentication is configured using Application Default Credentials
- The service account `cloud-run-sa@dhakdhakgo-472515.iam.gserviceaccount.com` has Firebase Admin permissions
- All services can use the same authentication middleware pattern
- Authentication tokens are verified using Firebase Admin SDK

## 🛠️ Troubleshooting

If you encounter issues:

1. **Check service account permissions**: Ensure the service account has Firebase Admin role
2. **Verify project ID**: Make sure `FIREBASE_PROJECT_ID` environment variable is set correctly
3. **Check token format**: Ensure tokens are sent as `Bearer TOKEN` in Authorization header
4. **Review logs**: Check Cloud Run logs for authentication errors
