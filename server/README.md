# README

## Start a new project

* create new GCP project
* create service account with editor rights
* create service account key file and put it into the `server/terraform` directory
* get Linode API token
* create `server/terraform/terraform.tfvars` file and populate it with the following values

```properties
google_project_id = <GCP project id>
credentials_file  = ./<name of gcp key file>
linode_token      = <Linode API token>
```

* run `terraform apply` in the `server/terraform` directory
* Go to Firebase console, go to the project that was automatically created by GCP, create a service account key in and save it as `server/firebase_service_account_key.json`
* Populate the Github Action secret `FIREBASE_SERVICE_ACCOUNT_KEY_BASE64`: Run `base64 -i server/firebase_service_account_key.json` and use the ouput for the Github Action secret's value
* Populate the Github Action secret `LINODE_KUBECONFIG`: Copy the base64 kubeconfig value for the Linode Kubernetes cluster from the `server/terraform/terraform.tfstate` file (`cat server/terraform/terraform.tfstate | jq -r ' .resources[1] | .instances[0] | attributes |.kubeconfig '`) and run `echo \<value\> | base64 -d` and use the ouput for the Github Action secret's value
* Populate the rest of the Githut Action secrets and variables:

### Github Action Variables

* `DOCKERHUB_USERNAME` (f.e. `nteeeeed`)
* `DOCKERHUB_REPO` (f.e. `spaces`)

### Github Action Secrets

* `DOCKERHUB_TOKEN`
* `FIREBASE_SERVICE_ACCOUNT_KEY_BASE64`
* `LINODE_KUBECONFIG`

## Useful Commands

docker exec -it server-redis-1 redis-cli

`http://localhost:8001/redis-stack/browser`

docker compose --profile dev up --build

ngrok http `http://localhost:8080`
