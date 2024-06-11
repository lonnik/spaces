package helpers

import (
	"context"
	"spaces-p/pkg/common"
	"spaces-p/pkg/models"
	"testing"
)

func CreateTestSpaces(ctx context.Context, t *testing.T, repo common.CacheRepository) []*models.Space {
	createdTestSpaces := make([]*models.Space, len(SpaceFixtures))

	for i, testSpace := range SpaceFixtures {
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
