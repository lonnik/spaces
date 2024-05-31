package main

import (
	"context"
	"os"
	"spaces-p/firebase"
	"spaces-p/redis"
	"spaces-p/repositories/redis_repo"
	"spaces-p/zerologger"
	"time"

	"github.com/rs/zerolog"
)

func main() {
	var ctx = context.Background()

	redisPort := os.Getenv("REDIS_PORT")
	redisHost := os.Getenv("REDIS_HOST")

	redisClient := redis.GetRedisClient(redisHost, redisPort)
	redisRepo := redis_repo.NewRedisRepository(redisClient)

	zl := zerolog.New(zerolog.ConsoleWriter{Out: os.Stderr, TimeFormat: time.RFC3339}).With().Timestamp().Logger()
	logger := zerologger.New(zl)

	firebaseAuthClient, err := firebase.NewFirebaseAuthClient(ctx)
	if err != nil {
		logger.Error(err)
		os.Exit(1)
	}

	if err := firebaseAuthClient.DeleteAllUsers(ctx); err != nil {
		logger.Error(err)
		os.Exit(1)
	}

	if err := redisRepo.DeleteAllKeys(); err != nil {
		logger.Error(err)
		os.Exit(1)
	}
}
