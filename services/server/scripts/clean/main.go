package main

import (
	"os"
	"spaces-p/redis"
	"spaces-p/repositories/redis_repo"
	"spaces-p/zerologger"
	"time"

	"github.com/rs/zerolog"
)

func main() {
	redisClient := redis.GetRedisClient()
	redisRepo := redis_repo.NewRedisRepository(redisClient)

	// TODO: delete all users

	zl := zerolog.New(zerolog.ConsoleWriter{Out: os.Stderr, TimeFormat: time.RFC3339}).With().Timestamp().Logger()
	logger := zerologger.New(zl)

	if err := redisRepo.DeleteAllKeys(); err != nil {
		logger.Error(err)
		os.Exit(1)
	}
}
