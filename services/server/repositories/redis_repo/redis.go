package redis_repo

import (
	"context"
	"os"
	"spaces-p/common"
	"spaces-p/errors"

	"github.com/redis/go-redis/v9"
)

const txRetries = 10

type RedisRepository struct {
	redisClient *redis.Client
}

func NewRedisRepository(redisClient *redis.Client) *RedisRepository {
	return &RedisRepository{redisClient}
}

func (repo *RedisRepository) DeleteAllKeys() error {
	const op errors.Op = "redis_repo.RedisRepository.DeleteAllKeys"
	isDevelopmentEnv := os.Getenv("ENVIRONMENT") == "development"

	if !isDevelopmentEnv {
		return errors.E(op, common.ErrOnlyAllowedInDevEnv)
	}

	if err := repo.redisClient.FlushAll(context.Background()).Err(); err != nil {
		return errors.E(op, err)
	}

	return nil
}
