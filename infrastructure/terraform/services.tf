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
    "servicecontrol.googleapis.com"
  ])

  service = each.value
  disable_on_destroy = true
}

# Cloud Run Services
resource "google_cloud_run_v2_service" "microservices" {
  for_each = toset(var.services)

  project  = var.project_id
  name     = each.value
  location = var.region

  template {
    service_account = google_service_account.cloud_run_sa.email
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

# IAM policy for Cloud Run services
resource "google_cloud_run_service_iam_policy" "noauth" {
  for_each = toset(var.services)

  location = google_cloud_run_v2_service.microservices[each.value].location
  project  = google_cloud_run_v2_service.microservices[each.value].project
  service  = google_cloud_run_v2_service.microservices[each.value].name

  policy_data = data.google_iam_policy.noauth.policy_data
}

data "google_iam_policy" "noauth" {
  binding {
    role = "roles/run.invoker"
    members = [
      "allUsers",
    ]
  }
}
