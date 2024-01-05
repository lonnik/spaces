package redis_repo

import (
	"context"
	"spaces-p/common"
	"spaces-p/errors"
	"spaces-p/models"
	"spaces-p/utils"
	"spaces-p/uuid"
	"strconv"
	"time"

	"github.com/redis/go-redis/v9"
)

func (repo *RedisRepository) GetSpace(ctx context.Context, spaceid uuid.Uuid) (*models.Space, error) {
	const op errors.Op = "redis_repo.RedisRepository.GetSpace"
	var spaceKey = getSpaceKey(spaceid)

	r, err := repo.redisClient.HGetAll(ctx, spaceKey).Result()
	switch {
	case err != nil:
		return nil, err
	case len(r) == 0:
		return nil, errors.E(op, common.ErrNotFound)
	}

	space, err := repo.parseSpace(r)
	if err != nil {
		return nil, errors.E(op, err)
	}
	space.ID = spaceid

	return space, nil
}

func (repo *RedisRepository) GetSpacesByUserId(ctx context.Context, userId models.UserUid, count, offset int64) ([]models.Space, error) {
	const op errors.Op = "redis_repo.RedisRepository.GetSpacesByUserId"
	var userSpacesKey = getUserSpacesKey(userId)

	spaceMaps, spaceIds, err := getCollectionValues(ctx, repo, userSpacesKey, offset, count, getSpaceKey)
	if err != nil {
		return nil, errors.E(op, err)
	}

	var spaces = make([]models.Space, 0, len(spaceMaps))
	for i, spaceMap := range spaceMaps {
		space, err := repo.parseSpace(spaceMap)
		if err != nil {
			return nil, errors.E(op, err)
		}

		space.ID = spaceIds[i]

		spaces = append(spaces, *space)
	}

	return spaces, nil
}

func (repo *RedisRepository) GetSpacesByLocation(
	ctx context.Context,
	location models.Location,
	searchRadius models.Radius,
	count int,
) ([]models.SpaceWithDistance, error) {
	const op errors.Op = "redis_repo.RedisRepository.GetSpacesByLocation"
	var spaceCoordinatesKey = getSpaceCoordinatesKey()

	geoLocations, err := repo.redisClient.GeoRadius(ctx, spaceCoordinatesKey, location.Long, location.Lat, &redis.GeoRadiusQuery{
		Radius:    float64(searchRadius) + models.MaxSpaceRadiusM,
		Unit:      "m",
		WithDist:  true,
		Sort:      "asc",
		WithCoord: true,
		Count:     count,
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

	var inSpaces = make([]models.SpaceWithDistance, 0, len(geoLocations)/2)
	var closeSpaces = make([]models.SpaceWithDistance, 0, len(geoLocations)/2)
	for i, cmd := range cmds {
		spaceMap := cmd.(*redis.MapStringStringCmd).Val()

		geoLocation := geoLocations[i]
		radius, err := strconv.ParseFloat(spaceMap[spaceFields.radiusField], 64)
		if err != nil {
			return nil, errors.E(op, err)
		}

		space, err := repo.parseSpace(spaceMap)
		if err != nil {
			return nil, errors.E(op, err)
		}

		spaceId, err := uuid.Parse(geoLocation.Name)
		if err != nil {
			return nil, errors.E(op, err)
		}
		space.ID = spaceId

		isIn := geoLocation.Dist-radius < 0
		isClose := geoLocation.Dist-radius < float64(searchRadius)
		switch {
		case isIn:
			spaceWithDistance := models.SpaceWithDistance{
				Distance: 0,
				Space:    *space,
			}

			inSpaces = append(inSpaces, spaceWithDistance)
		case isClose:
			spaceWithDistance := models.SpaceWithDistance{
				Distance: geoLocation.Dist,
				Space:    *space,
			}

			closeSpaces = append(closeSpaces, spaceWithDistance)
		default:
		}
	}

	return append(inSpaces, closeSpaces...), nil
}

func (repo *RedisRepository) GetSpaceSubscribers(ctx context.Context, spaceId uuid.Uuid, offset, count int64) ([]models.User, error) {
	var spaceSubscribersKey = getSpaceSubscribersKey(spaceId)

	return repo.getSpaceSubscribers(ctx, spaceSubscribersKey, offset, count)
}

func (repo *RedisRepository) GetSpaceActiveSubscribers(ctx context.Context, spaceId uuid.Uuid, offset, count int64) ([]models.User, error) {
	var spaceSubscribersKey = getSpaceActiveSubscribers(spaceId)

	return repo.getSpaceSubscribers(ctx, spaceSubscribersKey, offset, count)
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

func (repo *RedisRepository) SetSpaceSubscriber(ctx context.Context, spaceId uuid.Uuid, userUid models.UserUid) error {
	const op errors.Op = "redis_repo.RedisRepository.SetSpaceSubscriber"
	var spaceSubscribersKey = getSpaceSubscribersKey(spaceId)
	var userSpacesKey = getUserSpacesKey(userUid)

	if err := repo.redisClient.ZAdd(ctx, spaceSubscribersKey, redis.Z{
		Score:  float64(time.Now().UnixMilli()),
		Member: string(userUid),
	}).Err(); err != nil {
		return errors.E(op, err)
	}

	if err := repo.redisClient.ZAdd(ctx, userSpacesKey, redis.Z{
		Score:  float64(time.Now().UnixMilli()),
		Member: spaceId.String(),
	}).Err(); err != nil {
		return errors.E(op, err)
	}

	return nil
}

func (repo *RedisRepository) HasSpaceSubscriber(ctx context.Context, spaceId uuid.Uuid, userUid models.UserUid) (bool, error) {
	const op errors.Op = "redis_repo.RedisRepository.HasSpaceSubscriber"
	var spaceSubscribersKey = getSpaceSubscribersKey(spaceId)

	_, err := repo.redisClient.ZScore(ctx, spaceSubscribersKey, string(userUid)).Result()
	switch {
	case errors.Is(err, redis.Nil):
		return false, nil
	case err != nil:
		return false, errors.E(op, err)
	}

	return true, nil
}

func (repo *RedisRepository) getSpaceSubscribers(ctx context.Context, collectionKey string, offset, count int64) ([]models.User, error) {
	const op errors.Op = "redis_repo.RedisRepository.getSpaceSubscribers"

	userIdStrs, err := repo.redisClient.ZRevRangeByScore(ctx, collectionKey, &redis.ZRangeBy{
		Max:    "+inf",
		Min:    "-inf",
		Offset: offset,
		Count:  count,
	}).Result()
	if err != nil {
		return nil, errors.E(op, err)
	}

	pipe := repo.redisClient.Pipeline()
	for _, userIdStr := range userIdStrs {
		userKey := getUserKey(models.UserUid(userIdStr))

		pipe.HGetAll(ctx, userKey)
	}

	cmds, err := pipe.Exec(ctx)
	if err != nil {
		return nil, errors.E(op, err)
	}

	var users = make([]models.User, 0, len(userIdStrs))
	for i, cmd := range cmds {
		userStringMap := cmd.(*redis.MapStringStringCmd).Val()
		user := repo.parseUser(ctx, models.UserUid(userIdStrs[i]), userStringMap)

		users = append(users, *user)
	}

	return users, nil
}

func (repo *RedisRepository) getSpaceTopLevelThreads(ctx context.Context, spaceId uuid.Uuid, collectionKey string, offset, count int64) ([]models.TopLevelThread, error) {
	const op errors.Op = "redis_repo.RedisRepository.getSpaceTopLevelThreads"

	threadMaps, topLevelThreadIds, err := getCollectionValues(ctx, repo, collectionKey, offset, count, getThreadKey)
	if err != nil {
		return nil, errors.E(op, err)
	}

	var firstMessages = make([]models.Message, 0, len(threadMaps))
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

		firstMessages = append(firstMessages, *message)
	}

	var threads = make([]models.TopLevelThread, 0, len(threadMaps))
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

func (repo *RedisRepository) parseSpace(spaceMap map[string]string) (*models.Space, error) {
	const op errors.Op = "redis_repo.RedisRepository.parseSpace"

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
