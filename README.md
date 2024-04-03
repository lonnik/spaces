# Spaces (under development)

## About

"Spaces" is supposed to bring people together that are in physical proximity to each other but have never really interacted. You can create a "space" bound to a physical location and set a specific radius to it. Then, other people who open the app and find themselves within the radius of the space's location can access the space and communicate with other members of the space. Once you have accessed a space "on site", you can access it from anywhere anytime.

One of the many use cases would be to create a space for your neighbors. Another one, to create a space for a Pingpong table in the local park so people who play there Pingpong regularly can meet up without having to know each others Whatsapp numbers. You only must have been there once and have accessed the Pingpong table space. People who regularly go play Pingpong in parks know what I am talking about :)

From a technical viewpoint, the application consists of a Golang backend with a Redis DB connected to it and a React Native frontend. The backend app will be deployed on a Kubernetes cluster (using Linode -> cheapest option) and will be split into microservices. I am aware that this is a **total overkill** but this project is supposed to be a personal learning project, as a functional app at the end. I will soon move most of the DB functionality from Redis to Postgres to take advantage of the benefits a relational database brings to me (foreign keys, schemas, complex queries etc.).

Take into consideration that I worked on this project by myself. So even though things such as maintainability were an important aspect to me, I f.e. didnt see the benefit of using feature branches, but instead pushed everything directly to main.

Also more importantly, I didnt add any tests so far. Although I structured the functions (especially on the backend) in a way to make them easily testable through unit tests, I decided against to write some so far in order to move faster. When splitting up the app into microservices, I will think from the start about integration and E2E tests and add some later, if there will be still time.

As you can see below, I'm about 3/4 through on my way to launch the app.

You are welcome to go through the code as you please. I'm happy about every bit of feedback!

### Main Tasks before launch

* <s>Create backend with Redis as the main DB</s>
* <s>Create designs in Figma</s>
* <s>Implement designs for screen and hook them up to backend</s>
* <s>Create custom navigator for React Navigation to take advantage of gestures</s>
* <s>Create basic CI/CD pipeline</s>
* Split backend into microservices with single API Gateway
* Move to Postgresql
* Add missing functionality for endpoints
* Refine CI/CD pipeline
* Refine custom navigator
* Integrate Sentry
* Submit app to Appstore and Playstore

## Useful Commands

`docker compose --profile dev up --build` to start the developer environment (Firebase service account key must be set)

`docker exec -it server-redis-1 redis-cli` to access the Redis CLI from the Redis server started with the above command

`ngrok http http://localhost:8080` to start a ngrok HTTP tunnel exposing the development server

## Useful Links

`http://localhost:8001/redis-stack/browser`

## Deploy a new instance

### What is needed to get started

* GCP project
* Linode project

### Steps

* create a GCP service account with editor rights
* create a key file for the service account and put it into the `server/terraform` directory
* get Linode API token
* create a `server/terraform/terraform.tfvars` file and populate it with the following values

```properties
google_project_id = <GCP project id>
credentials_file  = ./<name of gcp key file>
linode_token      = <Linode API token>
```

* run `terraform apply` in the `server/terraform` directory
* Go to Firebase console, go to the project that was automatically created by GCP, create a service account key in and save it as `server/firebase_service_account_key.json`
* Populate the Github Action secret `FIREBASE_SERVICE_ACCOUNT_KEY_BASE64`: Run `base64 -i server/firebase_service_account_key.json` (on Macos) and use the ouput for the Github Action secret's value
* Populate the Github Action secret `LINODE_KUBECONFIG`: Copy the base64 kubeconfig value for the Linode Kubernetes cluster from the `server/terraform/terraform.tfstate` file (`cat server/terraform/terraform.tfstate | jq -r ' .resources[1] | .instances[0] | attributes |.kubeconfig '`) and run `echo \<value\> | base64 -d` and use the ouput for the Github Action secret's value
* Populate the rest of the Githut Action secrets and variables:

### Github Action Variables

* `DOCKERHUB_USERNAME` (f.e. `nteeeeed`)
* `DOCKERHUB_REPO` (f.e. `spaces`)

### Github Action Secrets

* `DOCKERHUB_TOKEN`
* `FIREBASE_SERVICE_ACCOUNT_KEY_BASE64`
* `LINODE_KUBECONFIG`
