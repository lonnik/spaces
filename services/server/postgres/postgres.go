package postgres

import (
	"fmt"
	"sync"

	"github.com/jmoiron/sqlx"
	_ "github.com/lib/pq"
)

var (
	db   *sqlx.DB
	rwmu sync.RWMutex
)

func GetPostgresClient(postgresHost, postgresUser, postgresPassword, postgresDbname string) (*sqlx.DB, error) {
	connectionString := fmt.Sprintf("host=%s user=%s password=%s dbname=%s sslmode=disable", postgresHost, postgresUser, postgresPassword, postgresDbname)

	rwmu.Lock()
	defer rwmu.Unlock()

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
