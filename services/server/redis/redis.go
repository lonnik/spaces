package redis

import (
	"fmt"
	"sync"
	"time"

	"github.com/redis/go-redis/v9"
)

const (
	redisHost     = "redis"
	redisPassword = ""
	redisDbname   = 0
	redisPort     = "6379"
)

var (
	redisClient *redis.Client
	once        sync.Once
)

func GetRedisClient() *redis.Client {
	once.Do(func() {
		fmt.Println("Connecting to Redis ...")

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
