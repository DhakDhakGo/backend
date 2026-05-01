# Get project number for Cloud Run URLs

data "google_project" "project" {
  project_id = var.project_id
}

# Enable required APIs
resource "google_project_service" "required_apis" {
  project = var.project_id
  for_each = toset([
    "run.googleapis.com",
    "cloudbuild.googleapis.com",
    "containerregistry.googleapis.com",
    "identitytoolkit.googleapis.com",
    "firestore.googleapis.com",
    "firebase.googleapis.com",
    "endpoints.googleapis.com",
    "servicemanagement.googleapis.com",
    "servicecontrol.googleapis.com",
    "storage.googleapis.com"
  ])

  service = each.value
  disable_on_destroy = true
}

resource "google_service_account" "ai_cloud_run_sa" {
  project       = var.project_id
  account_id   = "ai-cloud-run-sa"
  display_name = "AI Cloud Run Service Account"
  description  = "Service account for AI Cloud Run services"
}

resource "google_service_account" "post_cloud_run_sa" {
  project       = var.project_id
  account_id   = "post-cloud-run-sa"
  display_name = "Post Cloud Run Service Account"
  description  = "Service account for Post Cloud Run services"
}

resource "google_service_account" "interaction_cloud_run_sa" {
  project       = var.project_id
  account_id   = "interaction-cloud-run-sa"
  display_name = "Interaction Cloud Run Service Account"
  description  = "Service account for Interaction Cloud Run services"
}

resource "google_service_account" "user_cloud_run_sa" {
  project       = var.project_id
  account_id   = "user-cloud-run-sa"
  display_name = "User Cloud Run Service Account"
  description  = "Service account for User Cloud Run services"
}

# 2. Map Service Accounts into a local object for easier lookup in loops
locals {
  service_accounts = {
    "ai-service"          = google_service_account.ai_cloud_run_sa.email
    "post-service"        = google_service_account.post_cloud_run_sa.email
    "interaction-service" = google_service_account.interaction_cloud_run_sa.email
    "user-service"        = google_service_account.user_cloud_run_sa.email
  }

  services_to_sa_full_id_mapping = {
    "ai-service"          = "projects/${var.project_id}/serviceAccounts/${google_service_account.ai_cloud_run_sa.email}"
    "post-service"        = "projects/${var.project_id}/serviceAccounts/${google_service_account.post_cloud_run_sa.email}"
    "interaction-service" = "projects/${var.project_id}/serviceAccounts/${google_service_account.interaction_cloud_run_sa.email}"
    "user-service"        = "projects/${var.project_id}/serviceAccounts/${google_service_account.user_cloud_run_sa.email}"
  }
}

# 3. Dynamic IAM Role Assignment based on var.service_role_mapping
# This replaces the old "google_project_iam_member.cloud_run_sa_roles" block
locals {
  # Flatten the map to create a list of service-role pairs
  role_pair_list = flatten([
    for service, roles in var.service_role_mapping : [
      for role in roles : {
        service = service
        role    = role
      }
    ]
  ])
}

# Updated block
resource "google_project_iam_member" "service_specific_roles" {
  for_each = { for idx, pair in local.role_pair_list : "${pair.service}-${pair.role}" => pair }

  project = var.project_id
  role    = each.value.role
  member  = "serviceAccount:${local.service_accounts[each.value.service]}"
}

# 4. Updated Cloud Run Services
resource "google_cloud_run_v2_service" "microservices" {
  for_each = toset(var.services)

  project  = var.project_id
  name     = each.value
  location = var.region
  
  # NEW: Restrict network access to internal traffic and the API Gateway
  ingress = "INGRESS_TRAFFIC_INTERNAL_LOAD_BALANCER"

  # Security options to prevent unauthorized access

  
  
  
  # security_settings {
  #   # This ensures only authenticated requests can reach the service
  #   authentication {
  #     # This is the default, but we explicitly set it for clarity
  #     type = "AUTHENTICATION_TYPE_AUTHENTICATED"
  #   }
  # }

  template {
    service_account = local.service_accounts[each.value]
    containers {
      image = "gcr.io/${var.project_id}/${each.value}:latest"
      
      ports {
        container_port = 8080
      }

      resources {
        limits = {
          cpu    = var.cloud_run_config.cpu
          memory = var.cloud_run_config.memory
        }
      }

      env {
        name  = "NODE_ENV"
        value = var.environment
      }

      env {
        name  = "FIREBASE_PROJECT_ID"
        value = var.project_id
      }

      # Service URLs for inter-service communication
      dynamic "env" {
        for_each = each.value != "user-service" ? [1] : []
        content {
          name  = "USER_SERVICE_URL"
          value = "https://user-service-${data.google_project.project.number}.${var.region}.run.app"
        }
      }

      dynamic "env" {
        for_each = contains(["post-service", "interaction-service"], each.value) ? [1] : []
        content {
          name  = "AI_SERVICE_URL"
          value = "https://ai-service-${data.google_project.project.number}.${var.region}.run.app"
        }
      }

      dynamic "env" {
        for_each = each.value == "interaction-service" ? [1] : []
        content {
          name  = "POST_SERVICE_URL"
          value = "https://post-service-${data.google_project.project.number}.${var.region}.run.app"
        }
      }
    }

    scaling {
      min_instance_count = var.cloud_run_config.min_instances
      max_instance_count = var.cloud_run_config.max_instances
    }

    timeout = var.cloud_run_config.timeout
  }

  depends_on = [google_project_service.required_apis]
}

# This allows ONLY the API Gateway to call these services
resource "google_cloud_run_v2_service_iam_member" "gateway_invoker" {
  for_each = toset(var.services)

  project  = var.project_id
  location = google_cloud_run_v2_service.microservices[each.value].location
  name     = google_cloud_run_v2_service.microservices[each.value].name
  role     = "roles/run.invoker"
  member   = "serviceAccount:${google_service_account.api_gw_sa.email}"
}

# Grant Service account user role to principal (github actions service account) on service accounts of all cloud run services
resource "google_service_account_iam_member" "github_actions_sa_user" {
  for_each =           { for service, full_id in local.services_to_sa_full_id_mapping : service => full_id }
  service_account_id = each.value
  role               = "roles/iam.serviceAccountUser"
  member             = "serviceAccount:${google_service_account.github_actions_sa.email}"
}

