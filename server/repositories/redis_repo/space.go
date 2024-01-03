package redis_repo

import (
	"context"
	"spaces-p/errors"
	"spaces-p/models"
	"spaces-p/uuid"
	"strconv"
	"time"

	"github.com/redis/go-redis/v9"
)

func (repo *RedisRepository) GetSpacesByLocation(
	ctx context.Context,
	location models.Location,
	searchRadius models.Radius,
) ([]models.SpaceWithDistance, error) {
	const op errors.Op = "redis_repo.RedisRepository.GetSpacesByLocation"
	var spaceCoordinatesKey = getSpaceCoordinatesKey()

	geoLocations, err := repo.redisClient.GeoRadius(ctx, spaceCoordinatesKey, location.Long, location.Lat, &redis.GeoRadiusQuery{
		Radius:    float64(searchRadius) + models.MaxSpaceRadiusM,
		Unit:      "m",
		WithDist:  true,
		Sort:      "asc",
		WithCoord: true,
	}).Result()
	if err != nil {
		return nil, errors.E(op, err)
	}

	pipe := repo.redisClient.Pipeline()
	for _, geoLocation := range geoLocations {
		spaceId, err := uuid.Parse(geoLocation.Name)
		if err != nil {
			return nil, errors.E(op, err)
		}

		var spaceKey = getSpaceKey(spaceId)
		pipe.HGetAll(ctx, spaceKey)
	}

	cmds, err := pipe.Exec(ctx)
	if err != nil {
		return nil, errors.E(op, err)
	}

	var spacesWithDistance = make([]models.SpaceWithDistance, 0, len(geoLocations)/2)
	for i, cmd := range cmds {
		spaceMap := cmd.(*redis.MapStringStringCmd).Val()

		geoLocation := geoLocations[i]
		radius, err := strconv.ParseFloat(spaceMap[spaceFields.radiusField], 64)
		if err != nil {
			return nil, errors.E(op, err)
		}

		isIn := geoLocation.Dist-radius < 0
		isClose := geoLocation.Dist-radius < float64(searchRadius)
		switch {
		case isIn:
			space, err := constructSpaceFromGeolocationAndSpaceMap(geoLocation, spaceMap)
			if err != nil {
				return nil, errors.E(op, err)
			}

			spaceWithDistance := models.SpaceWithDistance{
				Distance: 0,
				Space:    *space,
			}

			spacesWithDistance = append(spacesWithDistance, spaceWithDistance)
		case isClose:
			space, err := constructSpaceFromGeolocationAndSpaceMap(geoLocation, spaceMap)
			if err != nil {
				return nil, errors.E(op, err)
			}

			spaceWithDistance := models.SpaceWithDistance{
				Distance: geoLocation.Dist,
				Space:    *space,
			}

			spacesWithDistance = append(spacesWithDistance, spaceWithDistance)
		default:
		}
	}

	return spacesWithDistance, nil
}

func (repo *RedisRepository) GetSpaceSubscribers(ctx context.Context, spaceId uuid.Uuid) ([]models.User, error) {
	return []models.User{{}}, nil
}

func (repo *RedisRepository) GetSpaceActiveSubscribers(ctx context.Context, spaceId uuid.Uuid) ([]models.User, error) {
	return []models.User{{}}, nil
}

// from is including
func (repo *RedisRepository) GetSpaceTopLevelThreadsByTime(ctx context.Context, spaceId uuid.Uuid, offset, count int64) ([]models.TopLevelThread, error) {
	const op errors.Op = "redis_repo.RedisRepository.GetSpaceTopLevelThreadsByTime"
	var spaceToplevelThreadsByTimeKey = getSpaceToplevelThreadsByTimeKey(spaceId)

	threads, err := repo.getSpaceTopLevelThreads(ctx, spaceId, spaceToplevelThreadsByTimeKey, offset, count)
	if err != nil {
		return nil, errors.E(op, err)
	}

	return threads, nil
}

func (repo *RedisRepository) GetSpaceTopLevelThreadsByPopularity(ctx context.Context, spaceId uuid.Uuid, offset, count int64) ([]models.TopLevelThread, error) {
	const op errors.Op = "redis_repo.RedisRepository.GetSpaceTopLevelThreadsByPopularity"
	var spaceToplevelThreadsByPopularityKey = getSpaceToplevelThreadsByPopularityKey(spaceId)

	threads, err := repo.getSpaceTopLevelThreads(ctx, spaceId, spaceToplevelThreadsByPopularityKey, offset, count)
	if err != nil {
		return nil, errors.E(op, err)
	}

	return threads, nil
}

func (repo *RedisRepository) SetSpace(ctx context.Context, newSpace models.NewSpace) (uuid.Uuid, error) {
	const op errors.Op = "redis_repo.RedisRepository.SetSpace"
	var spaceId = uuid.New()
	var spaceCoordinatesKey = getSpaceCoordinatesKey()
	var spaceKey = getSpaceKey(spaceId)

	unixTimeStamp := time.Now().UnixMilli()
	unixTimeStampStr := strconv.FormatInt(unixTimeStamp, 10)
	locationStr := newSpace.Location.String()
	if err := repo.redisClient.HSet(ctx, spaceKey, map[string]any{
		spaceFields.nameField:               newSpace.Name,
		spaceFields.radiusField:             newSpace.Radius,
		spaceFields.locationField:           locationStr,
		spaceFields.themeColorHexaCodeField: newSpace.ThemeColorHexaCode,
		spaceFields.createdAtField:          unixTimeStampStr,
		spaceFields.adminIdField:            newSpace.AdminId,
	}).Err(); err != nil {
		return uuid.Nil, errors.E(op, err)
	}

	if err := repo.redisClient.GeoAdd(ctx, spaceCoordinatesKey, &redis.GeoLocation{
		Name:      spaceId.String(),
		Longitude: newSpace.Location.Long,
		Latitude:  newSpace.Location.Lat,
	}).Err(); err != nil {
		return uuid.Nil, errors.E(op, err)
	}

	return spaceId, nil
}

func (repo *RedisRepository) HasSpaceThread(ctx context.Context, spaceId, threadId uuid.Uuid) (bool, error) {
	const op errors.Op = "redis_repo.RedisRepository.HasSpaceThread"

	thread, err := repo.GetThread(ctx, threadId)
	if err != nil {
		return false, errors.E(op, err)
	}

	return thread.SpaceId == spaceId, nil
}

func (repo *RedisRepository) getSpaceTopLevelThreads(ctx context.Context, spaceId uuid.Uuid, collectionKey string, offset, count int64) ([]models.TopLevelThread, error) {
	const op errors.Op = "redis_repo.RedisRepository.getSpaceTopLevelThreads"

	cmds, topLevelThreadIds, err := getCollectionCmds(ctx, repo, collectionKey, offset, count, getThreadKey)
	if err != nil {
		return nil, errors.E(op, err)
	}

	var threadMaps = make([]map[string]string, 0, len(cmds))
	for _, cmd := range cmds {
		threadMap := cmd.(*redis.MapStringStringCmd).Val()
		threadMaps = append(threadMaps, threadMap)
	}

	var firstMessages = make([]models.Message, 0, len(cmds))
	for _, threadMap := range threadMaps {
		firstMessageIdStr := threadMap[threadFields.firstMessageIdField]
		firstMessageId, err := uuid.Parse(firstMessageIdStr)
		if err != nil {
			return nil, errors.E(op, err)
		}

		// TODO: use pipelining
		message, err := repo.GetMessage(ctx, firstMessageId)
		if err != nil {
			return nil, errors.E(op, err)
		}

		firstMessages = append(firstMessages, message)
	}

	var threads = make([]models.TopLevelThread, 0, len(cmds))
	for i, threadMap := range threadMaps {
		likesStr := threadMap[threadFields.likesField]
		messagesCountStr := threadMap[threadFields.messagesCountField]
		spaceIdStr := threadMap[threadFields.spaceIdField]

		likes, err := strconv.Atoi(likesStr)
		if err != nil {
			return nil, errors.E(op, err)
		}
		messagesCount, err := strconv.Atoi(messagesCountStr)
		if err != nil {
			return nil, errors.E(op, err)
		}
		spaceId, err := uuid.Parse(spaceIdStr)
		if err != nil {
			return nil, errors.E(op, err)
		}
		threadId := topLevelThreadIds[i]

		threads = append(threads, models.TopLevelThread{
			BaseThread: models.BaseThread{
				SpaceId:       spaceId,
				ID:            threadId,
				Likes:         likes,
				MessagesCount: messagesCount,
			},
			FirstMessage: firstMessages[i],
		})
	}

	return threads, nil
}
