# Project Configuration
variable "project_id" {
  description = "The GCP project ID"
  type        = string
}

variable "region" {
  description = "The GCP region"
  type        = string
  default     = "us-central1"
}

variable "storage_class" {
  description = "Storage class for GCS buckets"
  type        = string
  default     = "STANDARD"
}

variable "zone" {
  description = "The GCP zone"
  type        = string
  default     = "us-central1-a"
}

variable "environment" {
  description = "Environment (dev, staging, prod)"
  type        = string
  default     = "dev"
}

variable "gemini_api_key" {
  description = "API key for Gemini AI (optional)"
  type        = string
  default     = "AIzaSyCU-hFVETHPwqQdFcAArd2EuIG04lbzUIs"
}

# Service Configuration
variable "services" {
  description = "List of microservices"
  type        = list(string)
  default     = ["user-service", "post-service", "ai-service", "interaction-service"]
}

# Cloud Run Configuration
variable "cloud_run_config" {
  description = "Cloud Run service configuration"
  type = object({
    memory    = string
    cpu       = string
    min_instances = number
    max_instances = number
    timeout   = string
  })
  default = {
    memory    = "512Mi"
    cpu       = "1"
    min_instances = 0
    max_instances = 3
    timeout   = "300s"
  }
}

# Firebase Configuration
variable "firebase_config" {
  description = "Firebase configuration"
  type = object({
    project_id = string
    region     = string
  })
  default = {
    project_id = ""
    region     = "us-central1"
  }
}

variable "service_role_mapping" {
  type = map(list(string))
  default = {
    "ai-service"          = ["roles/pubsub.publisher", "roles/datastore.user"]
    "user-service"        = ["roles/datastore.user"]
    "interaction-service" = ["roles/datastore.user"]
    "post-service"        = ["roles/datastore.user"]
  }
}

variable "api_gateway_roles" {
  type = list(string)
  default = ["roles/run.invoker"]
}

variable "github_actions_roles" {
  type = list(string)
}

variable "cloud_function_build_roles" {
  type = list(string)
}