package redis_repo

import (
	"context"
	"spaces-p/errors"
	"spaces-p/models"
	"strconv"
	"time"

	"github.com/google/uuid"
	"github.com/redis/go-redis/v9"
)

func (repo *RedisRepository) GetSpacesByLocation(
	ctx context.Context,
	location models.Location,
	searchRadius models.Radius,
) ([]models.SpaceWithDistance, error) {
	const op errors.Op = "redis_repo.RedisRepository.GetUserById"
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

func (repo *RedisRepository) SetSpace(ctx context.Context, newSpace models.NewSpace) (uuid.UUID, error) {
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
