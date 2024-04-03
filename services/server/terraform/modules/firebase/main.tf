terraform {
  required_providers {
    google = {
      source  = "hashicorp/google"
      version = "5.21.0"
    }
  }
}

provider "google" {
  credentials = file(var.credentials_file)
}

resource "google_identity_platform_config" "default" {
  project = var.google_project_id
  sign_in {
    allow_duplicate_emails = false

    email {
      enabled           = true
      password_required = true
    }
  }
}
