package redis_repo

import (
	"context"
	"encoding/json"
	"spaces-p/pkg/common"
	"spaces-p/pkg/errors"
	"spaces-p/pkg/models"

	"github.com/redis/go-redis/v9"
)

func (repo *RedisRepository) GetAddress(ctx context.Context, geoHash string) (*models.Address, error) {
	const op errors.Op = "redis_repo.RedisRepository.GetAddress"
	var addressKey = getAddressKey(geoHash)

	r, err := repo.redisClient.Get(ctx, addressKey).Result()
	switch {
	case errors.Is(err, redis.Nil):
		return &models.Address{}, errors.E(op, common.ErrNotFound)
	case err != nil:
		return &models.Address{}, errors.E(op, err)
	}

	var address models.Address
	if err := json.Unmarshal([]byte(r), &address); err != nil {
		return &models.Address{}, errors.E(op, err)
	}

	return &address, nil
}

func (repo *RedisRepository) SetAddress(ctx context.Context, newAddress models.Address) error {
	const op errors.Op = "redis_repo.RedisRepository.SetAddress"
	var addressKey = getAddressKey(newAddress.GeoHash)

	newAddressJson, err := json.Marshal(newAddress)
	if err != nil {
		return errors.E(op, err)
	}

	if err := repo.redisClient.Set(ctx, addressKey, newAddressJson, 0).Err(); err != nil {
		return errors.E(op, err)
	}

	return nil
}
