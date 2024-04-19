seed:
	go run scripts/seed/main.go

clean:
	go run scripts/clean/main.go

build:
	go build -o ./tmp/main .

develop:
	air

migrate:
	migrate -path=./postgres/migrations/ -database "postgres://${DB_USER}:${DB_PASSWORD}@${DB_HOST}:5432/${DB_NAME}?sslmode=disable" up

.PHONY: seed clean build develop migrate
