# 1. Create a local ZIP file from a source directory

data "archive_file" "function_zip" {
 type        = "zip"
 source_dir  = "${path.module}/../../services/subscriber-fn" # Point to your code folder
 output_path = "${path.module}/tmp/subscriber.zip"
}

resource "google_storage_bucket" "ddg_data_bucket" {
  name          = "${var.project_id}-data-storage"
  location      = var.region
  storage_class = var.storage_class

  # Important for security: ensures all access is managed via IAM
  uniform_bucket_level_access = true

  # Prevents accidental deletion of the bucket if it contains files
  force_destroy = false

  # Lifecycle rule: Automatically delete files older than 30 days
  lifecycle_rule {
    condition {
      age = 30
      
    }
    action {
      type = "Delete"
    }
  }
}

# 2. Upload that ZIP to the GCS Bucket
resource "google_storage_bucket_object" "ddg_data_zip" {
  name   = "source-${data.archive_file.function_zip.output_md5}.zip"
  bucket = google_storage_bucket.ddg_data_bucket.name
  source = data.archive_file.function_zip.output_path
}

# 1. Create the Service Account for the Function
resource "google_service_account" "function_sa" {
  account_id   = "subscriber-function-sa"
  display_name = "Service Account for PubSub Subscriber Function"
}

# Create a service account for cloud build
resource "google_service_account" "cloud_function_build_service_account" {
  account_id   = "cloud-function-build-sa"
  display_name = "Cloud Function Build Service Account"
}

# Create bindings for the cloud build service account with roles necessary for building and deploying cloud functions
resource "google_project_iam_member" "cloud_function_builder" {
  project = var.project_id
  for_each = toset(var.cloud_function_build_roles)
  role    = each.value
  member  = "serviceAccount:${google_service_account.cloud_function_build_service_account.email}"
}



# 2. PERMISSION: Allow the Function to write to Firestore/Datastore
resource "google_project_iam_member" "firestore_writer" {
  project = var.project_id
  role    = "roles/datastore.user" # Provides read/write access to Firestore
  member  = "serviceAccount:${google_service_account.function_sa.email}"
}

# 3. PERMISSION: Allow Pub/Sub Service Agent to create tokens (the "Invoker" bridge)
# This is the "Service Agent" we discussed - it needs to impersonate your SA
resource "google_service_account_iam_member" "pubsub_token_creator" {
  service_account_id = "projects/${var.project_id}/serviceAccounts/${google_service_account.function_sa.email}"
  role               = "roles/iam.serviceAccountTokenCreator"
  member             = "serviceAccount:service-${data.google_project.project.number}@gcp-sa-pubsub.iam.gserviceaccount.com"
}

# 4. The Pub/Sub Topic
resource "google_pubsub_topic" "ai_data_topic" {
  name = "ai-data"
}

# 5. The Cloud Function (Gen 2) with the Trigger
resource "google_cloudfunctions2_function" "subscriber_fn" {
  name        = "subscriber-func"
  location    = var.region
  description = "Consumes Pub/Sub messages and writes to Firestore"

  build_config {
    runtime     = "nodejs22"
    entry_point = "handlePublishedMessage"
    service_account = google_service_account.cloud_function_build_service_account.name
        
    source {
      storage_source {
        bucket = google_storage_bucket.ddg_data_bucket.name
        object = google_storage_bucket_object.ddg_data_zip.name
      }
    }
  }

  service_config {
    max_instance_count    = 3
    available_memory      = "256Mi"
    timeout_seconds       = 60
    service_account_email = google_service_account.function_sa.email
    ingress_settings = "ALLOW_INTERNAL_ONLY"
    
    # Environment variables for your Firestore logic
    environment_variables = {
      PROJECT_ID = var.project_id
    }
  }

  event_trigger {
    trigger_region = var.region
    event_type     = "google.cloud.pubsub.topic.v1.messagePublished"
    pubsub_topic   = google_pubsub_topic.ai_data_topic.id
    
    # Permission for Eventarc to trigger the function
    service_account_email = google_service_account.function_sa.email
    retry_policy          = "RETRY_POLICY_RETRY"
  }
}

# 6. PERMISSION: Allow the Trigger Identity to call the Cloud Run service
resource "google_cloud_run_v2_service_iam_member" "invoker" {
  location = google_cloudfunctions2_function.subscriber_fn.location
  name     = google_cloudfunctions2_function.subscriber_fn.name
  role     = "roles/run.invoker"
  member   = "serviceAccount:${google_service_account.function_sa.email}"
}

resource "google_service_account_iam_member" "github_actions_function_sa_user" {
  service_account_id = "projects/${var.project_id}/serviceAccounts/${google_service_account.function_sa.email}"
  role               = "roles/iam.serviceAccountUser"
  member             = "serviceAccount:${google_service_account.github_actions_sa.email}"
}

resource "google_service_account_iam_member" "github_actions_cloud_function_build_sa_user" {
  service_account_id = "projects/${var.project_id}/serviceAccounts/${google_service_account.cloud_function_build_service_account.email}"
  role               = "roles/iam.serviceAccountUser"
  member             = "serviceAccount:${google_service_account.github_actions_sa.email}"
}