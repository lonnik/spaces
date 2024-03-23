# README

## Start a new project
* create new GCP project 
* create service account with editor rights 
* copy project id and use in tfvars file
* create service account key and put into server/terraform directory
* use file path in tfvars
* create firebase key -> echo <key> | base64 -> put into github secret
* terraform apply
* take kubeconfig value from tfstate file -> echo <key> | base64 -d -> put into github secret


docker exec -it server-redis-1 redis-cli

http://localhost:8001/redis-stack/browser

docker compose --profile dev up --build

ngrok http http://localhost:8080