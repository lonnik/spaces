package redis_repo

import (
	"context"
	"spaces-p/errors"
	"spaces-p/models"
	"spaces-p/utils"
	"spaces-p/uuid"
	"strconv"
	"time"

	"github.com/redis/go-redis/v9"
)

func parseSpaceFromSpaceMap(spaceMap map[string]string) (*models.Space, error) {
	const op errors.Op = "redis_repo.parseSpaceFromSpaceMap"

	radiusStr := spaceMap[spaceFields.radiusField]
	name := spaceMap[spaceFields.nameField]
	themeColor := spaceMap[spaceFields.themeColorHexaCodeField]
	createdAtStr := spaceMap[spaceFields.createdAtField]
	adminIdStr := spaceMap[spaceFields.adminIdField]
	locationStr := spaceMap[spaceFields.locationField]

	var location models.Location
	if err := location.ParseString(locationStr); err != nil {
		return nil, errors.E(op, err)
	}
	radius, err := strconv.ParseFloat(radiusStr, 64)
	if err != nil {
		return nil, errors.E(op, err)
	}
	createdAt, err := utils.StringToTime(createdAtStr)
	if err != nil {
		return nil, errors.E(op, err)
	}
	adminId := models.UserUid(adminIdStr)

	return &models.Space{
		ID:        uuid.Nil,
		CreatedAt: createdAt,
		BaseSpace: models.BaseSpace{
			Name:               name,
			ThemeColorHexaCode: themeColor,
			Radius:             radius,
			Location:           location,
			AdminId:            adminId,
		},
	}, nil
}

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

func getTimeStampString() string {
	return strconv.FormatInt(time.Now().UnixMilli(), 10)
}
