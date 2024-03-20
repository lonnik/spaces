package redis

import (
	"spaces-p/common"
	"time"

	"github.com/redis/go-redis/v9"
)

const (
	redisHost     = "redis"
	redisPassword = ""
	redisDbname   = 0
	redisPort     = "6379"
)

var RedisClient *redis.Client

func ConnectRedis(logger common.Logger) {
	logger.Info("Connecting to Redis ...")

	RedisClient = redis.NewClient(&redis.Options{
		Addr:         redisHost + ":" + redisPort,
		Password:     redisPassword,
		DB:           redisDbname,
		ReadTimeout:  20 * time.Second,
		WriteTimeout: 20 * time.Second,
	})
}
