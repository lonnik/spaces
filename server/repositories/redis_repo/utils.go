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

func constructSpaceFromGeolocationAndSpaceMap(geoLocation redis.GeoLocation, spaceMap map[string]string) (*models.Space, error) {
	const op errors.Op = "redis_repo.constructSpaceFromGeolocationAndSpaceMap"

	radiusStr := spaceMap[spaceFields.radiusField]
	radius, err := strconv.ParseFloat(radiusStr, 64)
	if err != nil {
		return nil, errors.E(op, err)
	}
	name := spaceMap[spaceFields.nameField]
	themeColor := spaceMap[spaceFields.themeColorHexaCodeField]
	createdAtStr := spaceMap[spaceFields.createdAtField]
	adminId := spaceMap[spaceFields.adminIdField]
	location := models.Location{
		Long: geoLocation.Longitude,
		Lat:  geoLocation.Latitude,
	}

	spaceId, err := uuid.Parse(geoLocation.Name)
	if err != nil {
		return nil, errors.E(op, err)
	}
	createdAt, err := utils.StringToTime(createdAtStr)
	if err != nil {
		return nil, errors.E(op, err)
	}

	return &models.Space{
		ID:        spaceId,
		CreatedAt: createdAt,
		BaseSpace: models.BaseSpace{
			Name:               name,
			ThemeColorHexaCode: themeColor,
			Radius:             radius,
			Location:           location,
			AdminId:            models.UserUid(adminId),
		},
	}, nil
}

func getCollectionCmds(ctx context.Context, repo *RedisRepository, collectionKey string, offset, count int64, getValueKeyFn func(uuid.Uuid) string) ([]redis.Cmder, []uuid.Uuid, error) {
	const op errors.Op = "redis_repo.getCollectionCmds"

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

	return cmds, collectionValueIds, nil
}

func getTimeStampString() string {
	return strconv.FormatInt(time.Now().UnixMilli(), 10)
}
