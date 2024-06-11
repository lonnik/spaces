package common

import (
	"context"
	"spaces-p/pkg/models"
)

type GeocodeRepository interface {
	GetAddress(ctx context.Context, location models.Location) (*models.Address, error)
}
