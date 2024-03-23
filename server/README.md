# README

## Start a new project

* create new GCP project
* create service account with editor rights
* create service account key file and put into server/terraform directory
* get Linode API token
* create server/terraform/terraform.tfvars file and fill it with the following values

```
google_project_id = <GCP project id>
credentials_file  = ./<name of gcp key file>
linode_token      = <Linode API token>
```

* copy project id and use in tfvars file
* use file path in tfvars
* create firebase key -> echo *\<key\>* | base64 -> put into github secret
* terraform apply
* take kubeconfig value from tfstate file -> echo *\<key\>* | base64 -d -> put into github secret


docker exec -it server-redis-1 redis-cli

http://localhost:8001/redis-stack/browser

docker compose --profile dev up --build

ngrok http http://localhost:8080