# Firebase Project - Enable Firebase manually via console
# Firebase can be enabled at: https://console.firebase.google.com/
# Or via: gcloud firebase projects:create PROJECT_ID

locals {
  github_actions_roles_set = toset(var.github_actions_roles)
}

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
  for_each = toset(var.github_actions_roles)
  project = var.project_id
  role    = each.value
  member  = "serviceAccount:${google_service_account.github_actions_sa.email}"
}