variable "linode_token" {
  type = string
}

variable "linode_region" {
  type    = string
  default = "eu-central"
}

variable "k8s_version" {
  type    = string
  default = "1.28"
}

variable "min_nodes" {
  type    = number
  default = 1
}

variable "max_nodes" {
  type    = number
  default = 3
}

variable "node_type" {
  type    = string
  default = "g6-standard-1"
}