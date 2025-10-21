# 🎓 How Terraform Works - DhakDhakGo Example

## Overview

This guide explains how Terraform works by walking through **your actual project setup** (`dhakdhakgo-472515`). We'll see what happens when you run `terraform apply` and how everything connects.

---

## 📚 Table of Contents

1. [The Basics](#the-basics)
2. [Your Project Structure](#your-project-structure)
3. [Step-by-Step Execution](#step-by-step-execution)
4. [Real Example Walkthrough](#real-example-walkthrough)
5. [State Management](#state-management)
6. [Dependency Graph](#dependency-graph)
7. [Common Scenarios](#common-scenarios)

---

## The Basics

### **What is Terraform?**

Terraform is an **Infrastructure as Code (IaC)** tool. Instead of clicking through GCP console, you:
1. Write code describing your infrastructure
2. Let Terraform create/update/delete resources automatically

### **Key Concepts:**

```
Provider → Resource → State → Plan → Apply
```

**Provider**: Connects to GCP  
**Resource**: Things you create (Cloud Run service, Firestore, etc.)  
**State**: What currently exists  
**Plan**: What will change  
**Apply**: Make the changes  

---

## Your Project Structure

```
infrastructure/terraform/
├── main.tf           # Provider & backend config
├── variables.tf      # Input variables (reusable values)
├── terraform.tfvars  # Actual values (project ID, region, etc.)
├── firebase.tf       # Firebase, Firestore, Service Accounts
├── services.tf       # Cloud Run services (4 microservices)
├── outputs.tf        # Output values (URLs, emails, etc.)
└── terraform.tfstate # Current state (what exists in GCP)
```

---

## Step-by-Step Execution

### **Phase 1: Initialization** (`terraform init`)

```bash
terraform init
```

**What happens:**

1. **Reads `main.tf`**:
   ```hcl
   terraform {
     required_providers {
       google = {
         source  = "hashicorp/google"
         version = "~> 5.0"
       }
     }
   }
   ```
   
2. **Downloads Google Cloud Provider plugin**:
   - Provider version ~5.0 (latest 5.x)
   - Stored in `.terraform/` folder
   
3. **Creates `.terraform.lock.hcl`**:
   - Locks provider versions for consistency
   
4. **Result**:
   ```
   ✅ Terraform has been successfully initialized!
   ```

---

### **Phase 2: Planning** (`terraform plan`)

```bash
terraform plan
```

**What happens:**

#### **Step 1: Load Configuration**

Terraform reads all `.tf` files and builds a mental model:

```
main.tf         → Provider: google (project: dhakdhakgo-472515)
variables.tf    → Variables: project_id, region, services
terraform.tfvars → Values: project_id="dhakdhakgo-472515", region="asia-south1"
firebase.tf     → Resources: 2 service accounts, Firestore database
services.tf     → Resources: 4 Cloud Run services
```

#### **Step 2: Read Current State**

Terraform reads `terraform.tfstate` to see what already exists:

```json
{
  "version": 4,
  "terraform_version": "1.0.0",
  "resources": [
    {
      "type": "google_service_account",
      "name": "cloud_run_sa",
      "instances": [...]
    },
    ...
  ]
}
```

#### **Step 3: Query GCP**

Terraform calls GCP APIs to get current resource state:

```
GET https://iam.googleapis.com/v1/projects/dhakdhakgo-472515/serviceAccounts
GET https://run.googleapis.com/v2/projects/dhakdhakgo-472515/locations/asia-south1/services
GET https://firestore.googleapis.com/v1/projects/dhakdhakgo-472515/databases
```

#### **Step 4: Build Dependency Graph**

Terraform determines order of operations:

```
1. Enable APIs (google_project_service)
   ↓
2. Create Service Accounts (google_service_account)
   ↓
3. Assign IAM Roles (google_project_iam_member)
   ↓
4. Create Firestore Database (google_firestore_database)
   ↓
5. Deploy Cloud Run Services (google_cloud_run_v2_service)
   ↓
6. Set IAM Policies (google_cloud_run_service_iam_policy)
```

#### **Step 5: Calculate Changes**

Terraform compares desired state vs. actual state:

```
Plan: 2 to add, 1 to change, 0 to destroy.

+ google_project_iam_member.github_actions_roles["roles/artifactregistry.writer"]
  → Will create new IAM binding

~ google_cloud_run_v2_service.microservices["ai-service"]
  → Will update environment variables

✓ google_service_account.cloud_run_sa
  → No changes
```

#### **Step 6: Show Plan**

Terraform displays the execution plan:

```hcl
# google_project_iam_member.github_actions_roles["roles/artifactregistry.writer"] will be created
+ resource "google_project_iam_member" "github_actions_roles" {
    + member  = "serviceAccount:github-actions@dhakdhakgo-472515.iam.gserviceaccount.com"
    + project = "dhakdhakgo-472515"
    + role    = "roles/artifactregistry.writer"
  }
```

---

### **Phase 3: Applying** (`terraform apply`)

```bash
terraform apply
```

**What happens:**

#### **Step 1: Confirmation**

```
Do you want to perform these actions?
  Terraform will perform the actions described above.
  Only 'yes' will be accepted to approve.

  Enter a value: yes
```

#### **Step 2: Execute in Order**

Terraform makes API calls to GCP following the dependency graph:

**Example: Creating GitHub Actions Service Account**

1. **API Call**:
   ```http
   POST https://iam.googleapis.com/v1/projects/dhakdhakgo-472515/serviceAccounts
   {
     "accountId": "github-actions",
     "serviceAccount": {
       "displayName": "GitHub Actions CI/CD"
     }
   }
   ```

2. **Response**:
   ```json
   {
     "name": "projects/dhakdhakgo-472515/serviceAccounts/github-actions@dhakdhakgo-472515.iam.gserviceaccount.com",
     "email": "github-actions@dhakdhakgo-472515.iam.gserviceaccount.com",
     "uniqueId": "118446496036338085584"
   }
   ```

3. **Update State**:
   Terraform saves this to `terraform.tfstate`

#### **Step 3: Assign IAM Roles**

For each role in `firebase.tf`:

```hcl
for_each = toset([
  "roles/run.admin",
  "roles/storage.admin",
  "roles/artifactregistry.writer",
  "roles/iam.serviceAccountUser"
])
```

Terraform makes 4 API calls:

```http
POST https://cloudresourcemanager.googleapis.com/v1/projects/dhakdhakgo-472515:setIamPolicy
{
  "policy": {
    "bindings": [
      {
        "role": "roles/run.admin",
        "members": ["serviceAccount:github-actions@dhakdhakgo-472515.iam.gserviceaccount.com"]
      }
    ]
  }
}
```

#### **Step 4: Deploy Cloud Run Services**

For each service in `services.tf`:

```hcl
for_each = toset(["user-service", "post-service", "ai-service", "interaction-service"])
```

Terraform makes 4 API calls:

```http
POST https://run.googleapis.com/v2/projects/dhakdhakgo-472515/locations/asia-south1/services
{
  "name": "user-service",
  "template": {
    "containers": [{
      "image": "gcr.io/dhakdhakgo-472515/user-service:latest",
      "env": [
        {"name": "NODE_ENV", "value": "dev"},
        {"name": "FIREBASE_PROJECT_ID", "value": "dhakdhakgo-472515"}
      ],
      "resources": {
        "limits": {
          "cpu": "1",
          "memory": "512Mi"
        }
      }
    }],
    "serviceAccount": "cloud-run-sa@dhakdhakgo-472515.iam.gserviceaccount.com"
  }
}
```

#### **Step 5: Update State File**

After each successful API call, Terraform updates `terraform.tfstate`:

```json
{
  "version": 4,
  "terraform_version": "1.0.0",
  "resources": [
    {
      "mode": "managed",
      "type": "google_service_account",
      "name": "github_actions_sa",
      "provider": "provider[\"registry.terraform.io/hashicorp/google\"]",
      "instances": [
        {
          "attributes": {
            "account_id": "github-actions",
            "email": "github-actions@dhakdhakgo-472515.iam.gserviceaccount.com",
            "project": "dhakdhakgo-472515",
            "unique_id": "118446496036338085584"
          }
        }
      ]
    }
  ]
}
```

#### **Step 6: Generate Outputs**

Terraform evaluates `outputs.tf`:

```hcl
output "cloud_run_urls" {
  value = {
    for service_name, service in google_cloud_run_v2_service.microservices :
    service_name => service.uri
  }
}
```

Result:

```
Outputs:

cloud_run_urls = {
  "ai-service" = "https://ai-service-ute6thusxq-el.a.run.app"
  "interaction-service" = "https://interaction-service-ute6thusxq-el.a.run.app"
  "post-service" = "https://post-service-ute6thusxq-el.a.run.app"
  "user-service" = "https://user-service-ute6thusxq-el.a.run.app"
}
```

---

## Real Example Walkthrough

### **Scenario: Adding a New IAM Role**

You want to add `roles/artifactregistry.writer` to GitHub Actions service account.

#### **1. Edit Code** (`firebase.tf`)

```hcl
# Before:
for_each = toset([
  "roles/run.admin",
  "roles/storage.admin",
  "roles/iam.serviceAccountUser"
])

# After:
for_each = toset([
  "roles/run.admin",
  "roles/storage.admin",
  "roles/artifactregistry.writer",  # ← NEW!
  "roles/iam.serviceAccountUser"
])
```

#### **2. Run Plan**

```bash
$ terraform plan

Terraform will perform the following actions:

  # google_project_iam_member.github_actions_roles["roles/artifactregistry.writer"] will be created
  + resource "google_project_iam_member" "github_actions_roles" {
      + etag    = (known after apply)
      + id      = (known after apply)
      + member  = "serviceAccount:github-actions@dhakdhakgo-472515.iam.gserviceaccount.com"
      + project = "dhakdhakgo-472515"
      + role    = "roles/artifactregistry.writer"
    }

Plan: 1 to add, 0 to change, 0 to destroy.
```

**Terraform detected:**
- 1 new resource to create
- 0 existing resources to modify
- 0 resources to delete

#### **3. Run Apply**

```bash
$ terraform apply

...plan output...

Do you want to perform these actions? yes

google_project_iam_member.github_actions_roles["roles/artifactregistry.writer"]: Creating...
google_project_iam_member.github_actions_roles["roles/artifactregistry.writer"]: Still creating... [10s elapsed]
google_project_iam_member.github_actions_roles["roles/artifactregistry.writer"]: Creation complete after 12s

Apply complete! Resources: 1 added, 0 changed, 0 destroyed.
```

**What actually happened in GCP:**

1. Terraform called:
   ```http
   POST https://cloudresourcemanager.googleapis.com/v1/projects/dhakdhakgo-472515:setIamPolicy
   ```

2. GCP added the binding:
   ```json
   {
     "role": "roles/artifactregistry.writer",
     "members": ["serviceAccount:github-actions@dhakdhakgo-472515.iam.gserviceaccount.com"]
   }
   ```

3. Terraform updated state file with new IAM binding

#### **4. Verify in GCP**

```bash
$ gcloud projects get-iam-policy dhakdhakgo-472515 \
  --flatten="bindings[].members" \
  --filter="bindings.members:github-actions@dhakdhakgo-472515.iam.gserviceaccount.com"

bindings:
- members:
  - serviceAccount:github-actions@dhakdhakgo-472515.iam.gserviceaccount.com
  role: roles/artifactregistry.writer  ← NEW!
- members:
  - serviceAccount:github-actions@dhakdhakgo-472515.iam.gserviceaccount.com
  role: roles/run.admin
```

---

## State Management

### **What is Terraform State?**

`terraform.tfstate` is a JSON file tracking what Terraform created:

```json
{
  "version": 4,
  "terraform_version": "1.0.0",
  "serial": 15,
  "lineage": "abc123...",
  "resources": [
    {
      "mode": "managed",
      "type": "google_cloud_run_v2_service",
      "name": "microservices",
      "provider": "provider[\"registry.terraform.io/hashicorp/google\"]",
      "instances": [
        {
          "index_key": "user-service",
          "attributes": {
            "name": "user-service",
            "location": "asia-south1",
            "uri": "https://user-service-ute6thusxq-el.a.run.app",
            ...
          }
        }
      ]
    }
  ]
}
```

### **Why State Matters:**

**Without state**, Terraform would need to query GCP every time to know what exists.

**With state**, Terraform:
1. Reads local state file (fast)
2. Only queries GCP to verify (slower)
3. Calculates diff between desired vs. actual

### **State in Your Project:**

**Current:** Local file (`terraform.tfstate`)
- ✅ Simple for single-person projects
- ❌ Not suitable for teams
- ❌ Risk of loss

**Future:** Remote backend (GCS)
```hcl
backend "gcs" {
  bucket = "dhakdhakgo-terraform-state"
  prefix = "prod"
}
```
- ✅ Shared across team
- ✅ Versioned and backed up
- ✅ Supports locking

---

## Dependency Graph

### **How Terraform Determines Order:**

Terraform builds a **directed acyclic graph (DAG)** based on dependencies.

#### **Your Project's Graph:**

```
google_project_service.required_apis
        ↓
google_service_account.cloud_run_sa
        ↓
google_project_iam_member.cloud_run_sa_roles
        ↓
google_firestore_database.database
        ↓
google_cloud_run_v2_service.microservices
        ↓
google_cloud_run_service_iam_policy.noauth
```

#### **Example from `services.tf`:**

```hcl
resource "google_cloud_run_v2_service" "microservices" {
  # ...
  
  template {
    service_account = google_service_account.cloud_run_sa.email  ← Dependency!
  }
  
  depends_on = [google_project_service.required_apis]  ← Explicit dependency!
}
```

**Terraform knows:**
1. Create APIs first (explicit `depends_on`)
2. Create service account (referenced in `service_account`)
3. Then create Cloud Run services

#### **Visualize Dependencies:**

```bash
$ terraform graph | dot -Tpng > graph.png
```

This generates an image showing all dependencies.

---

## Common Scenarios

### **Scenario 1: Fresh Deployment**

```bash
$ terraform apply

Plan: 20 to add, 0 to change, 0 to destroy.
```

**Terraform creates everything in order:**
1. 9 API enablements
2. 2 service accounts
3. 7 IAM role bindings
4. 1 Firestore database
5. 4 Cloud Run services
6. 4 IAM policies

**Time:** ~5-10 minutes

---

### **Scenario 2: Update Environment Variable**

Edit `services.tf`:
```hcl
env {
  name  = "LOG_LEVEL"  # NEW!
  value = "debug"
}
```

```bash
$ terraform apply

Plan: 0 to add, 4 to change, 0 to destroy.
```

**Terraform updates all 4 services:**
- No downtime (rolling update)
- New revisions deployed
- Traffic shifted automatically

**Time:** ~2-3 minutes

---

### **Scenario 3: Add New Service**

Edit `terraform.tfvars`:
```hcl
services = [
  "user-service",
  "post-service",
  "ai-service",
  "interaction-service",
  "notification-service"  # NEW!
]
```

```bash
$ terraform apply

Plan: 2 to add, 0 to change, 0 to destroy.
```

**Terraform creates:**
1. New Cloud Run service
2. New IAM policy

**Existing services:** Not touched

**Time:** ~2 minutes

---

### **Scenario 4: Destroy Everything**

```bash
$ terraform destroy

Plan: 0 to add, 0 to change, 20 to destroy.
```

**Terraform deletes in reverse order:**
1. IAM policies
2. Cloud Run services
3. Firestore database
4. IAM bindings
5. Service accounts
6. API enablements (if configured)

⚠️ **WARNING:** Destructive operation!

---

## 🎯 Key Takeaways

1. **Terraform = Declarative**
   - You describe "what" you want
   - Terraform figures out "how" to create it

2. **State is Critical**
   - Tracks what exists
   - Enables diff calculations
   - Must be protected

3. **Dependencies Matter**
   - Terraform automatically determines order
   - Can be made explicit with `depends_on`

4. **Idempotent**
   - Running `terraform apply` multiple times with no changes = no-op
   - Safe to re-run

5. **Your Project**
   - 20 resources total
   - Fully automated infrastructure
   - Reproducible in any GCP project

---

## 📚 Related Documentation

- **[Terraform README](./README.md)** - Usage guide
- **[Infrastructure Overview](../../docs/04-INFRASTRUCTURE.md)** - High-level architecture
- **[Variables Reference](./variables.tf)** - All configurable values
- **[Outputs Reference](./outputs.tf)** - Generated values

---

**You now understand how Terraform manages your infrastructure!** 🎓

