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

# See versions at https://registry.terraform.io/providers/hashicorp/google/latest/docs/resources/sql_database_instance#database_version
resource "google_sql_database_instance" "postgres" {
  name             = "postgres"
  project          = var.google_project_id
  region           = "europe-west3"
  database_version = "POSTGRES_15"
  settings {
    tier = "db-f1-micro"
    edition = "ENTERPRISE"
    availability_type = "ZONAL"
    disk_size = 10
    disk_type = "PD_SSD"
    backup_configuration {
      enabled = true
      backup_retention_settings {
        retention_unit = "COUNT"
        retained_backups = 3
      }
    }
    ip_configuration {
      ipv4_enabled = true
      dynamic "authorized_networks" {
        for_each = var.authorized_networks
        content {
          name = authorized_networks.value["name"]
          value = format("%s/32", authorized_networks.value["value"])
        }
      }
    }
  }

  deletion_protection = "false"
}

resource "google_sql_database" "spacesdb" {
  name     = var.db_name
  instance = google_sql_database_instance.postgres.name
  project  = var.google_project_id
}

resource "google_sql_user" "spacesdb_user" {
  name     = var.db_user_name
  instance = google_sql_database_instance.postgres.name
  password = var.db_user_password
  project  = var.google_project_id
}
