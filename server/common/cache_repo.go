package common

import (
	"context"
	"spaces-p/models"

	"github.com/google/uuid"
)

type CacheRepository interface {
	DeleteAllKeys() error
	UserCacheRepository
	SpaceCacheRepository
}

type UserCacheRepository interface {
	GetUserById(ctx context.Context, uid string) (*models.User, error)
	SetUser(ctx context.Context, newUser models.NewUser) error
}

type SpaceCacheRepository interface {
	GetSpacesByLocation(ctx context.Context, location models.Location, radius models.Radius) ([]models.SpaceWithDistance, error)
	SetSpace(ctx context.Context, newSpace models.NewSpace) (uuid.UUID, error)
}
