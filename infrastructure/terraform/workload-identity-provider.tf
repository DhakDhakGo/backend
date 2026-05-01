resource "google_iam_workload_identity_pool" "github_pool" {
  workload_identity_pool_id = "github-actions-ci-cd"
  display_name              = "github-actions-ci-cd"
  description               = "Github Actions CI/CD"
}

resource "google_iam_workload_identity_pool_provider" "github_provider" {
  workload_identity_pool_id          = google_iam_workload_identity_pool.github_pool.workload_identity_pool_id
  workload_identity_pool_provider_id = "github-provider"
  display_name                       = "Github Provider"
  
  attribute_mapping = {
    "google.subject"       = "assertion.sub"
    "attribute.actor"      = "assertion.actor"
    "attribute.repository" = "assertion.repository"
  }
  
  attribute_condition = "assertion.repository==\"DhakDhakGo/backend\""
  
  oidc {
    issuer_uri = "https://token.actions.githubusercontent.com"
  }
}

# Allow the GitHub Actions service account to impersonate the workload identity provider
resource "google_service_account_iam_member" "github_impersonation" {
  for_each = toset(["roles/iam.workloadIdentityUser", "roles/iam.serviceAccountTokenCreator"])
  service_account_id = "projects/${var.project_id}/serviceAccounts/${google_service_account.github_actions_sa.email}"
  role               = each.value
  member             = "principalSet://iam.googleapis.com/${google_iam_workload_identity_pool.github_pool.name}/attribute.repository/DhakDhakGo/backend"
}
