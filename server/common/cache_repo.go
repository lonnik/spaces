package common

import (
	"context"
	"spaces-p/models"
)

type CacheRepository interface {
	UserCacheRepository
}

type UserCacheRepository interface {
	GetUserById(ctx context.Context, uid string) (*models.User, error)
	SetUser(ctx context.Context, newUser models.NewUser) error
}
