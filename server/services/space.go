package services

import (
	"context"
	"fmt"
	"net/http"
	"spaces-p/common"
	"spaces-p/errors"
	"spaces-p/models"

	"github.com/google/uuid"
)

type SpaceService struct {
	logger    common.Logger
	cacheRepo common.CacheRepository
}

func NewSpaceService(logger common.Logger, cacheRepo common.CacheRepository) *SpaceService {
	return &SpaceService{logger, cacheRepo}
}

func (ss *SpaceService) GetSpacesByLocation(ctx context.Context, location models.Location, radius models.Radius) ([]models.SpaceWithDistance, error) {
	const op errors.Op = "services.SpaceService.GetSpacesByLocation"

	spaces, err := ss.cacheRepo.GetSpacesByLocation(ctx, location, radius)
	if err != nil {
		return nil, errors.E(op, err)
	}

	fmt.Printf("spaces :>> %+v\n", spaces)

	return spaces, nil
}

func (ss *SpaceService) CreateSpace(ctx context.Context, newSpace models.NewSpace) (uuid.UUID, error) {
	const op errors.Op = "services.SpaceService.CreateSpace"

	// verify that user with id == newSpace.AdminId exists
	_, err := ss.cacheRepo.GetUserById(ctx, newSpace.AdminId)
	switch {
	case errors.Is(err, common.ErrNotFound):
		err := errors.New("admin id does not belong to existing user")
		return uuid.Nil, errors.E(op, err, http.StatusBadRequest)
	case err != nil:
		return uuid.Nil, errors.E(op, err, http.StatusInternalServerError)
	}

	spaceId, err := ss.cacheRepo.SetSpace(ctx, newSpace)
	if err != nil {
		return uuid.Nil, errors.E(op, err, http.StatusInternalServerError)
	}

	return spaceId, nil
}
