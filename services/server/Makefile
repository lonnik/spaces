seed:
	go run scripts/seed/main.go

clean:
	go run scripts/clean/main.go

build:
	go build -o ./tmp/main ./cmd

e2e:
	go test -v ./tests/e2e -tags=e2e

integration:
	go test -v ./tests/integration -tags=integration

unit:
	go test -v ./pkg/...

test: unit integration e2e

develop:
	docker compose --profile dev up --build

migrate:
	migrate -path=./pkg/postgres/migrations/ -database "postgres://${DB_USER}:${DB_PASSWORD}@${DB_HOST}:5432/${DB_NAME}?sslmode=disable" up

.PHONY: seed clean build e2e integration unit test develop migrate 
