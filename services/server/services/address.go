package services

import (
	"context"
	"fmt"
	"net/http"
	"spaces-p/common"
	"spaces-p/errors"
	"spaces-p/models"
	googlegeocode "spaces-p/repositories/google_geocode"
)

type AddressService struct {
	logger      common.Logger
	cacheRepo   common.CacheRepository
	geoCodeRepo common.GeocodeRepository
}

func NewAddressService(logger common.Logger, cacheRepo common.CacheRepository, geoCodeRepo common.GeocodeRepository) *AddressService {
	return &AddressService{logger, cacheRepo, geoCodeRepo}
}

func (ts *AddressService) GetAddress(ctx context.Context, location models.Location) (*models.Address, error) {
	const op errors.Op = "services.AddressService.GetAddress"

	geoHash := location.GeoHash(8)
	address, err := ts.cacheRepo.GetAddress(ctx, geoHash)
	switch {
	case errors.Is(err, common.ErrNotFound):
		ts.logger.Info(fmt.Sprintf("address cache miss for geohash %s", geoHash))
	case err != nil:
		return &models.Address{}, errors.E(op, err)
	default:
		return address, nil
	}

	location.ParseGeoHash(geoHash)

	address, err = ts.geoCodeRepo.GetAddress(ctx, location)
	switch {
	case errors.Is(err, googlegeocode.ErrZeroResults):
		return &models.Address{}, errors.E(op, err, http.StatusNotFound)
	case err != nil:
		return &models.Address{}, errors.E(op, err, http.StatusInternalServerError)
	}

	address.GeoHash = geoHash

	if err := ts.cacheRepo.SetAddress(ctx, *address); err != nil {
		return &models.Address{}, errors.E(op, err)
	}

	return address, nil
}
