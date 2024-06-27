# Spaces (under development)

<img src="https://github.com/lonnik/spaces/assets/16211241/583e057e-f667-47bb-a789-649cc61bc7ae" alt="Screenshot of the application" style="width: 160px; margin-right: 10px; margin-bottom: 20px;"/>
<img src="https://github.com/lonnik/spaces/assets/16211241/37f1e8a6-f02b-47f4-bd45-f3c86de0ad8c" alt="Screenshot of the application" style="width: 160px; margin-right: 10px; margin-bottom: 20px;"/>
<img src="https://github.com/lonnik/spaces/assets/16211241/a4934596-fb74-4571-af52-12385c2f539b" alt="Screenshot of the application" style="width: 160px; margin-right: 10px; margin-bottom: 20px;"/>
<img src="https://github.com/lonnik/spaces/assets/16211241/df4dfbc1-ab61-472a-aa80-a95842b45dfb" alt="Screenshot of the application" style="width: 160px; margin-right: 10px; margin-bottom: 20px;"/>
<img src="https://github.com/lonnik/spaces/assets/16211241/7138e5f5-1694-4777-821b-1f0b0959802f" alt="Screenshot of the application" style="width: 160px; margin-right: 10px; margin-bottom: 20px;"/>
<img src="https://github.com/lonnik/spaces/assets/16211241/3b9f0575-d235-4d81-bca6-a54ec7a9ba3a" alt="Screenshot of the application" style="width: 160px; margin-right: 10px; margin-bottom: 20px;"/>
<img src="https://github.com/lonnik/spaces/assets/16211241/5b02e446-b8ab-43b6-9adf-185691372638" alt="Screenshot of the application" style="width: 160px; margin-right: 10px; margin-bottom: 20px;"/>
<img src="https://github.com/lonnik/spaces/assets/16211241/917b32c9-279e-4e79-93f3-5bce8e259581" alt="Screenshot of the application" style="width: 160px; margin-right: 10px; margin-bottom: 20px;"/>
<img src="https://github.com/lonnik/spaces/assets/16211241/6f8f2f7c-dc41-4e20-b052-d5fec0935cc7" alt="Screenshot of the application" style="width: 160px; margin-right: 10px; margin-bottom: 20px;"/>

## About "Spaces"

"Spaces" is supposed to bring people together that are in physical proximity to each other but have never really interacted. You can create a "space" bound to a physical location and set a specific radius to it. Then, other people who open the app and find themselves within the radius of the space's location can access the space and communicate with other members of the space. Once you have accessed a space "on site", you can access it from anywhere anytime.

### Use cases

One of the many use cases would be to create a space for your neighborhood. Another one is to create a space that is bound to a Pingpong table in the local park so people who play Pingpong there regularly can meet up without having to know each other's Whatsapp numbers. You only must have been there once and have accessed the space for the Pingpong table to be able to use the Pingpong table space from anywhere you want.

### Techstack

From a technical viewpoint, the application consists of a Golang backend with a Redis instance connected to it (that acts as the central data store) and a React Native frontend. The backend app will be deployed on a Kubernetes cluster (using Linode -> cheapest option) and split into microservices. I know this is a **total overkill** but this project is supposed to be a personal learning project, as a functional app at the end.

I will soon move most of the DB functionality from Redis to Postgres to take advantage of a relational database's benefits (foreign keys, schemas, complex queries, etc.).

### Testing

My testing strategy for the backend service puts an emphasis on end-to-end tests to avoid having brittle tests. This way, I can have fast running tests that cover the whole API from authentication to the DB layer implementation. External APIs (eg Firebase) are mocked and tested using separate integration tests. Critical (util) functions are additionally tested using classic unit tests.

The E2E tests reflect a fail in around 20% percent of the cases due to an incorrect implementation of the DB layer using Redis. This will be fixed soon when replacing most of the Redis implementation with PostgreSQL.

The E2E tests reflect an incorrect implementation of the Redis DB layer. This is why the E2E tests fail in around 20% of the cases. This will be fixed soon when replacing most of the Redis implementation with PostgreSQL.

#### How to run the backend service tests?

In the `services/server` directory, run:

* `make e2e` to run the E2E test
* `make integration` to run the integration tests (The value of the TEST_FIREBASE_API_KEY environment variable must be set in the `services/server/.env.test` file and the Firebase service account key must be stored as a JSON file named `services/server/firebase_service_account_key.json`)
* `make unit` to run all unit tests
* `make test` to run all tests

You are welcome to go through the code as you please. I'm happy about every bit of feedback!

## Main Tasks before launch

* <s>Create backend with Redis as the main DB</s>
* <s>Create screen designs in Figma</s>
* <s>Implement screen designs</s>
* <s>Hook up screens to backend</s>
* <s>Create custom navigator for React Navigation to take advantage of gestures</s>
* <s>Create CI/CD pipeline</s>
* Split backend into microservices with single API Gateway
* Move from Redis to Postgresql as main DB
* Add missing backend API functionality
* Integrate Sentry
* Submit app to Appstore and Playstore

## Migrations

([golang-migrate](https://github.com/golang-migrate/migrate) must be installed locally)

`migrate create -ext sql -dir services/server/postgres/migrations -seq <migration name>` to create a migration

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
* `HELM_VERSION` (f.e. `3.14.3`)

### Github Action Secrets

* `DOCKERHUB_TOKEN`
* `FIREBASE_SERVICE_ACCOUNT_KEY_BASE64`
* `LINODE_KUBECONFIG`
* `POSTGRES_HOST`
* `POSTGRES_PASSWORD`
* `TEST_FIREBASE_API_KEY`
* `TEST_FIREBASE_SERVICE_ACCOUNT_KEY_BASE64`
