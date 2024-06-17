package helpers

import (
	"context"
	"spaces-p/pkg/common"
	"spaces-p/pkg/models"
	"testing"
)

func CreateTestUsers(ctx context.Context, t *testing.T, repo common.CacheRepository) []models.BaseUser {
	for _, user := range GetUsers(t) {
		if err := repo.SetUser(ctx, models.NewUser(user)); err != nil {
			t.Fatalf("redisRepo.SetUser() err = %s; want nil", err)
		}
	}

	return GetUsers(t)
}
