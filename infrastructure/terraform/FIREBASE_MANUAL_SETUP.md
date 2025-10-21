# Firebase Manual Setup

Since we removed the `google-beta` provider, Firebase needs to be enabled manually (one-time setup).

---

## 🔧 One-Time Firebase Setup

### **Option 1: Via Firebase Console** (Recommended)

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click "Add project"
3. Select your existing GCP project: `dhakdhakgo-472515`
4. Click "Continue"
5. Choose plan (Spark/Free is fine)
6. Click "Continue"
7. Done! Firebase is now enabled

**Time**: 2 minutes

---

### **Option 2: Via gcloud CLI**

```bash
# Enable Firebase API
gcloud services enable firebase.googleapis.com --project=dhakdhakgo-472515

# Add Firebase to your project
gcloud alpha firebase projects:create dhakdhakgo-472515
```

**Note**: This requires `gcloud alpha` components.

---

## ✅ Verify Firebase is Enabled

```bash
# Check if Firebase is enabled
gcloud services list --enabled --project=dhakdhakgo-472515 | grep firebase

# Or visit Firebase console
open https://console.firebase.google.com/project/dhakdhakgo-472515
```

---

## 🔑 Enable Firebase Authentication

After Firebase is enabled:

1. Go to [Firebase Console](https://console.firebase.google.com/project/dhakdhakgo-472515)
2. Click **Authentication** in the left menu
3. Click **Get started**
4. Click **Sign-in method** tab
5. Enable providers:
   - **Email/Password** → Enable
   - **Google** → Enable (configure OAuth)
   - (Optional) Phone authentication

---

## 📊 What Terraform Still Manages

Even without `google-beta`, Terraform still creates:

- ✅ Firestore database (Native mode)
- ✅ Service accounts
- ✅ IAM permissions
- ✅ Cloud Run services
- ✅ All GCP resources

**Only Firebase enablement is manual** (one-time, 2-minute task).

---

## 🤔 Why Remove google-beta?

**Pros of removing**:
- ✅ Simpler configuration
- ✅ One less provider to manage
- ✅ No beta API dependencies
- ✅ More stable infrastructure

**Cons**:
- ⚠️ One manual step (enabling Firebase)

**Trade-off**: Worth it for simpler, more stable configuration.

---

## 🔄 If You Want to Re-add google-beta

If you prefer full automation:

1. Uncomment in `main.tf`:
```hcl
google-beta = {
  source  = "hashicorp/google-beta"
  version = "~> 5.0"
}

provider "google-beta" {
  project = var.project_id
  region  = var.region
}
```

2. Uncomment in `firebase.tf`:
```hcl
resource "google_firebase_project" "default" {
  provider = google-beta
  project  = var.project_id
}
```

3. Run `terraform init -upgrade` and `terraform apply`

---

## ✅ Summary

**After Firebase manual setup, everything else is automated via Terraform!**

Just enable Firebase once (2 minutes), then:
```bash
terraform init
terraform plan
terraform apply
```

All services, databases, and infrastructure will be created automatically.

---

**Next**: Follow the main deployment guide in [`README.md`](README.md)
