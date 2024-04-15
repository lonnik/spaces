package postgres

import (
	"fmt"
	"os"

	"github.com/jmoiron/sqlx"
	_ "github.com/lib/pq"
)

var (
	postgresHost     = os.Getenv("DB_HOST")
	postgresUser     = os.Getenv("DB_USER")
	postgresPassword = os.Getenv("DB_PASSWORD")
	postgresDbname   = os.Getenv("DB_NAME")
	Db               *sqlx.DB
	connectionString = fmt.Sprintf("host=%s user=%s password=%s dbname=%s sslmode=disable", postgresHost, postgresUser, postgresPassword, postgresDbname)
)

func Connect() {
	var err error

	Db, err = sqlx.Open("postgres", connectionString)
	if err != nil {
		panic(err)
	}
}
