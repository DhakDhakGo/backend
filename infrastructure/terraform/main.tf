# Configure the Google Cloud Provider
terraform {
  required_version = ">= 1.0"
  required_providers {
    google = {
      source  = "hashicorp/google"
      version = "~> 5.0"
    }
    archive = {
      source  = "hashicorp/archive"
      version = "~> 2.4"
    }
  }
  
  # Optional: Store state in Google Cloud Storage
  # Uncomment and configure when you have a GCS bucket
  # backend "gcs" {
  #   bucket = "${var.project_id}-terraform-state"
  #   prefix = "dhakdhakgo-backend"
  # }
}

provider "google" {
  project = var.project_id
  region  = var.region
}

