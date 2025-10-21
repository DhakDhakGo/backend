# Project Configuration
variable "project_id" {
  description = "The GCP project ID"
  type        = string
}

variable "region" {
  description = "The GCP region"
  type        = string
  default     = "asia-south1"
}

variable "zone" {
  description = "The GCP zone"
  type        = string
  default     = "asia-south1-a"
}

variable "environment" {
  description = "Environment (dev, staging, prod)"
  type        = string
  default     = "dev"
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
    max_instances = 10
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
    region     = "asia-south1"
  }
}
