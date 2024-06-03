package e2e

import (
	"context"
	"net/http"
	"spaces-p/common"
	"spaces-p/models"
	"testing"
)

func isSuccessStatusCode(t *testing.T, statusCode int) bool {
	t.Helper()

	return statusCode >= http.StatusOK && statusCode <= http.StatusIMUsed
}

func createTestUsers(ctx context.Context, t *testing.T, repo common.CacheRepository) {
	// set up all users
	for _, user := range TestUsers {
		if err := repo.SetUser(ctx, models.NewUser(user)); err != nil {
			t.Fatalf("redisRepo.SetUser() err = %s; want nil", err)
		}
	}
}
