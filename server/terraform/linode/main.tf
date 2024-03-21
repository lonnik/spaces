terraform {
  required_providers {
    linode = {
      source = "linode/linode"
      version = "2.16.0"
    }
  }
  required_version = ">= 0.13"
}

provider "linode" {
  token = var.linode_token
}

resource "linode_lke_cluster" "tryout" {
  label = "tryout"
  k8s_version = var.k8s_version
  region = var.linode_region
  
  pool {
    type = "g6-standard-1"
    
    autoscaler {
      min = 1
      max = 3
    }
  }  
}

output id {
  value       = linode_lke_cluster.tryout.id
}

output status {
  value       = linode_lke_cluster.tryout.status
}

output api_endpoints {
  value       = linode_lke_cluster.tryout.api_endpoints
}

output kubeconfig {
  value       = linode_lke_cluster.tryout.kubeconfig
  sensitive   = true
}

output base64_encoded_kubeconfig {
  value       = base64encode(linode_lke_cluster.tryout.kubeconfig)
  sensitive   = true
}

output pool {
  value       = linode_lke_cluster.tryout.pool
}
