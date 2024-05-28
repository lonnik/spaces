package postgres

import (
	"fmt"
	"os"
	"sync"

	"github.com/jmoiron/sqlx"
	_ "github.com/lib/pq"
)

var (
	postgresHost     = os.Getenv("DB_HOST")
	postgresUser     = os.Getenv("DB_USER")
	postgresPassword = os.Getenv("DB_PASSWORD")
	postgresDbname   = os.Getenv("DB_NAME")
	connectionString = fmt.Sprintf("host=%s user=%s password=%s dbname=%s sslmode=disable", postgresHost, postgresUser, postgresPassword, postgresDbname)
	db               *sqlx.DB
	mu               sync.Mutex
)

func GetPostgresClient() (*sqlx.DB, error) {
	mu.Lock()
	defer mu.Unlock()

	if db != nil {
		return db, nil
	}

	var err error
	db, err = sqlx.Open("postgres", connectionString)
	if err != nil {
		return nil, err
	}

	err = db.Ping()
	if err != nil {
		db.Close()
		db = nil
		return nil, err
	}

	return db, err
}
