variable "google_project_id" {
  type        = string
  description = "description"
}

variable "credentials_file" {
  type        = string
  description = "description"
}

variable "db_user_name" {
  type        = string
  description = "description"
}

variable "db_user_password" {
  type        = string
  description = "description"
  sensitive   = true
}

variable "db_name" {
  type        = string
  description = "description"
}

variable "authorized_networks" {
  type        = list(map(string))
  description = "description"
}