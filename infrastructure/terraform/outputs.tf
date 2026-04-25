# Cloud Run Service URLs
output "cloud_run_urls" {
  description = "URLs of the deployed Cloud Run services"
  value = {
    for service_name, service in google_cloud_run_v2_service.microservices :
    service_name => service.uri
  }
}

# Service Account Emails
output "ai_cloud_run_service_account_email" {
  description = "Email of the AI service account for Cloud Run"
  value       = google_service_account.ai_cloud_run_sa.email
}

# Service Account Emails
output "user_cloud_run_service_account_email" {
  description = "Email of the user service account for Cloud Run"
  value       = google_service_account.user_cloud_run_sa.email
}

# Service Account Emails
output "post_cloud_run_service_account_email" {
  description = "Email of the post service account for Cloud Run"
  value       = google_service_account.post_cloud_run_sa.email
}

# Service Account Emails
output "interaction_cloud_run_service_account_email" {
  description = "Email of the interaction service account for Cloud Run"
  value       = google_service_account.interaction_cloud_run_sa.email
}

output "github_actions_service_account_email" {
  description = "Email of the service account for GitHub Actions"
  value       = google_service_account.github_actions_sa.email
}

output "github_actions_setup_commands" {
  description = "Commands to create and download GitHub Actions service account key"
  value = <<-EOT
    # Create service account key for GitHub Actions:
    gcloud iam service-accounts keys create github-actions-key.json \
      --iam-account=${google_service_account.github_actions_sa.email}
    
    # View the key (copy this entire JSON for GitHub secret GCP_SA_KEY):
    cat github-actions-key.json
    
    # IMPORTANT: Delete the key file after copying to GitHub:
    rm github-actions-key.json
  EOT
}

# Project Information
output "project_id" {
  description = "The GCP project ID"
  value       = var.project_id
}

output "project_number" {
  description = "The GCP project number"
  value       = data.google_project.project.number
}

output "region" {
  description = "The GCP region"
  value       = var.region
}

# Firebase Information
output "firebase_project_id" {
  description = "Firebase project ID (same as GCP project)"
  value       = var.project_id
}

output "firestore_database_id" {
  description = "Firestore database ID"
  value       = google_firestore_database.database.name
}
