package redis_repo

import (
	"context"
	"spaces-p/pkg/errors"
	"spaces-p/pkg/uuid"

	"github.com/redis/go-redis/v9"
)

func getCollectionValues(ctx context.Context, repo *RedisRepository, collectionKey string, offset, count int64, getValueKeyFn func(uuid.Uuid) string) ([]map[string]string, []uuid.Uuid, error) {
	const op errors.Op = "redis_repo.getCollectionValues"

	collectionValueIdStrs, err := repo.redisClient.ZRevRangeByScore(ctx, collectionKey, &redis.ZRangeBy{
		Max:    "+inf",
		Min:    "-inf",
		Offset: offset,
		Count:  count,
	}).Result()
	if err != nil {
		return nil, nil, errors.E(op, err)
	}

	var collectionValueIds = make([]uuid.Uuid, 0, len(collectionValueIdStrs))
	pipe := repo.redisClient.Pipeline()
	for _, collectionValueIdStr := range collectionValueIdStrs {
		collectionValueId, err := uuid.Parse(collectionValueIdStr)
		if err != nil {
			return nil, nil, errors.E(op, err)
		}

		collectionValueIds = append(collectionValueIds, collectionValueId)

		var valueKey = getValueKeyFn(collectionValueId)
		pipe.HGetAll(ctx, valueKey)
	}

	cmds, err := pipe.Exec(ctx)
	if err != nil {
		return nil, nil, errors.E(op, err)
	}

	var threadMaps = make([]map[string]string, 0, len(cmds))
	for _, cmd := range cmds {
		threadMap := cmd.(*redis.MapStringStringCmd).Val()
		threadMaps = append(threadMaps, threadMap)
	}

	return threadMaps, collectionValueIds, nil
}
