output "identity_platform_config_authorized_domains" {
  value       = google_identity_platform_config.default.authorized_domains
  description = "The list of authorized domains for the Identity Platform configuration"
}