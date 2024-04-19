module "linode" {
  source = "./modules/linode"

  linode_token    = var.linode_token
  min_nodes       = 1
  max_nodes       = 3
  kubeconfig_path = var.kubeconfig_path
}

module "firebase" {
  source = "./modules/firebase"

  google_project_id = var.google_project_id
  credentials_file  = var.credentials_file
}

module "gcp_postgres" {
  source = "./modules/gcp_postgres"

  credentials_file    = var.credentials_file
  db_user_name        = var.db_user_name
  db_user_password    = var.db_user_password
  google_project_id   = var.google_project_id
  db_name             = var.db_name
  authorized_networks = var.authorized_networks
}

output "db_connection_name" {
  value = module.gcp_postgres.instance_connection_name
}

output "ip_address" {
  value = module.gcp_postgres.instance_ip_address
}
