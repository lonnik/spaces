package common

import (
	"context"
	"spaces-p/models"
)

type GeocodeRepository interface {
	GetAddress(ctx context.Context, location models.Location) (*models.Address, error)
}
