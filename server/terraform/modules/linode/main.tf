terraform {
  required_providers {
    linode = {
      source  = "linode/linode"
      version = "2.16.0"
    }
  }
  required_version = ">= 0.13"
}

provider "linode" {
  token = var.linode_token
}

resource "linode_lke_cluster" "default" {
  label       = "default"
  k8s_version = var.k8s_version
  region      = var.linode_region

  pool {
    type = var.node_type

    autoscaler {
      min = var.min_nodes
      max = var.max_nodes
    }
  }
}