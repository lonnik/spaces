module "linode" {
  source = "./modules/linode"

  linode_token = var.linode_token
  min_nodes    = 1
  max_nodes    = 3
}

module "firebase" {
  source = "./modules/firebase"

  google_project_id = var.google_project_id
  credentials_file  = var.credentials_file
}
