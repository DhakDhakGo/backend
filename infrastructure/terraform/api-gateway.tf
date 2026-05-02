provider "google-beta" {
  project = var.project_id
  region  = var.region
}

# 1. Dedicated Service Account for the Gateway
resource "google_service_account" "api_gw_sa" {
  provider     = google-beta
  account_id   = "dhakdhakgo-api-gateway-sa"
  display_name = "API Gateway Logic Identity"
}

resource "google_project_iam_member" "gw_role_settings" {
  project = var.project_id
  for_each = toset(var.api_gateway_roles)
  role    = each.value
  member  = "serviceAccount:${google_service_account.api_gw_sa.email}"
}


# 3. The API Container
resource "google_api_gateway_api" "main_api" {
  provider = google-beta
  api_id   = "dhakdhakgo-api"
}

# 4. The API Config (The logic layer)
resource "google_api_gateway_api_config" "main_cfg" {
  provider      = google-beta
  api           = google_api_gateway_api.main_api.api_id
  api_config_id = "v1-config-${formatdate("YYYYMMDDhhmmss", timestamp())}"
  #api_config_id        = "v1-config-20260501132851"

  openapi_documents {
    document {
      path = "openapi.yml"
      contents = base64encode(templatefile("openapi.yml", {
        project_id = var.project_id
      }))
    }
  }

  gateway_config {
    backend_config {
      google_service_account = google_service_account.api_gw_sa.email
    }
  }

  lifecycle {
    
    create_before_destroy = true
  }
}

# 5. The Actual Gateway
resource "google_api_gateway_gateway" "main_gw" {
  provider   = google-beta
  region     = var.region
  gateway_id = "dhakdhakgo-gateway"
  api_config = google_api_gateway_api_config.main_cfg.id
}

output "gateway_url" {
  value = google_api_gateway_gateway.main_gw.default_hostname
}