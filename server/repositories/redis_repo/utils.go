package redis_repo

import (
	"spaces-p/errors"
	"spaces-p/models"
	"spaces-p/utils"
	"strconv"

	"github.com/google/uuid"
	"github.com/redis/go-redis/v9"
)

func constructSpaceFromGeolocationAndSpaceMap(geoLocation redis.GeoLocation, spaceMap map[string]string) (*models.Space, error) {
	const op errors.Op = "getSpaceWithDistance"

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
			AdminId:            adminId,
		},
	}, nil
}
