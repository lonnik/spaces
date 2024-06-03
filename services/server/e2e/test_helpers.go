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

func createTestSpaces(ctx context.Context, t *testing.T, repo common.CacheRepository) []*models.Space {
	createdTestSpaces := make([]*models.Space, len(testSpaces))

	for i, testSpace := range testSpaces {
		spaceId, err := repo.SetSpace(ctx, models.NewSpace{BaseSpace: testSpace.BaseSpace, AdminId: testSpace.AdminId})
		if err != nil {
			t.Fatalf("repo.SetSpace() err = %s; want nil", err)
		}

		copiedTestSpace := *testSpace
		createdTestSpaces[i] = &copiedTestSpace
		createdTestSpaces[i].ID = spaceId
	}

	return createdTestSpaces
}
