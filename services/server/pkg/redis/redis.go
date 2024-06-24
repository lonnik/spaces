package redis

import (
	"sync"
	"time"

	"github.com/redis/go-redis/v9"
)

const (
	redisPassword = ""
	redisDbname   = 0
)

var (
	redisClient *redis.Client
	once        sync.Once
)

// TODO: is this logical passing in arguments with the singleton pattern?
func GetRedisClient(redisHost, redisPort string) *redis.Client {
	once.Do(func() {
		redisClient = redis.NewClient(&redis.Options{
			Addr:         redisHost + ":" + redisPort,
			Password:     redisPassword,
			DB:           redisDbname,
			ReadTimeout:  20 * time.Second,
			WriteTimeout: 20 * time.Second,
		})
	})

	return redisClient
}
