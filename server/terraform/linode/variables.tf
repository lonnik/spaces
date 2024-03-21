variable linode_token {
  type        = string
}

variable linode_region {
  type        = string
  default = "eu-central"
}

variable k8s_version {
  type        = string
  default = "1.28"
}