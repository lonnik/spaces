output "instance_connection_name" {
  value = google_sql_database_instance.postgres.connection_name
}

output "instance_ip_address" {
  value = google_sql_database_instance.postgres.public_ip_address
}