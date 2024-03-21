output "id" {
  value = linode_lke_cluster.default.id
}

output "status" {
  value = linode_lke_cluster.default.status
}

output "api_endpoints" {
  value = linode_lke_cluster.default.api_endpoints
}

output "kubeconfig" {
  value     = linode_lke_cluster.default.kubeconfig
  sensitive = true
}

output "base64_encoded_kubeconfig" {
  value     = base64encode(linode_lke_cluster.default.kubeconfig)
  sensitive = true
}

output "pool" {
  value = linode_lke_cluster.default.pool
}
