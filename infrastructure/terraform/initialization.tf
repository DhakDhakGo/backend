# Firebase Project - Enable Firebase manually via console
# Firebase can be enabled at: https://console.firebase.google.com/
# Or via: gcloud firebase projects:create PROJECT_ID

# Firestore Database
resource "google_firestore_database" "database" {
  project     = var.project_id
  name        = "dhakdhakgo-firestore-db"
  location_id = var.region
  type        = "FIRESTORE_NATIVE"

  depends_on = [google_project_service.required_apis]
}

# Firebase Authentication - Set up manually via Google Cloud Console
# resource "google_identity_platform_config" "auth" {
#   project = var.project_id

#   sign_in {
#     allow_duplicate_emails = false
#   }

#   depends_on = [google_project_service.required_apis]
# }

# Service Account for GitHub Actions CI/CD
resource "google_service_account" "github_actions_sa" {
  project      = var.project_id
  account_id   = "github-actions"
  display_name = "GitHub Actions CI/CD"
  description  = "Service account for GitHub Actions to deploy services"
}

# IAM roles for GitHub Actions service account
resource "google_project_iam_member" "github_actions_roles" {
  for_each = toset([
    "roles/run.admin",                    # Deploy and manage Cloud Run services
    "roles/storage.admin",                # Access to GCS buckets (for GCR backend)
    "roles/artifactregistry.writer",      # Push images to Artifact Registry/GCR
    "roles/iam.serviceAccountUser"        # Use Cloud Run service account
  ])

  project = var.project_id
  role    = each.value
  member  = "serviceAccount:${google_service_account.github_actions_sa.email}"
}
