package e2e

import (
	"context"
	"fmt"
	"net/http"
	"spaces-p/common"
	"spaces-p/models"
	"spaces-p/uuid"
	"testing"

	"github.com/stretchr/testify/assert"
)

func TestGetSpace(
	ctx context.Context,
	t *testing.T,
	apiEndpoint string,
	repo common.CacheRepository,
	authClient *EmptyAuthClient,
) {
	// create and clean data
	createTestUsers(ctx, t, repo)

	createdTestSpaces := createTestSpaces(ctx, t, repo)

	t.Cleanup(func() {
		err := repo.DeleteAllKeys()
		if err != nil {
			t.Fatalf("repo.DeleteAllKeys() err = %s; want nil", err)
		}
	})

	url := apiEndpoint + "/spaces"

	tests := []test[string, models.BaseSpace]{
		{
			name:            "get space 1",
			url:             url,
			currentTestUser: TestUsers[0],
			args:            createdTestSpaces[0].ID.String(),
			wantStatusCode:  http.StatusOK,
			wantData:        createdTestSpaces[0].BaseSpace,
		},
		{
			name:            "get space 2",
			url:             url,
			currentTestUser: TestUsers[0],
			args:            createdTestSpaces[1].ID.String(),
			wantStatusCode:  http.StatusOK,
			wantData:        createdTestSpaces[1].BaseSpace,
		},
		{
			name:            "get space by fake space ID",
			url:             url,
			currentTestUser: TestUsers[0],
			args:            uuid.New().String(),
			wantStatusCode:  http.StatusNotFound,
			wantData:        models.BaseSpace{},
		},
		{
			name:            "get space by invalid space ID",
			url:             url,
			currentTestUser: TestUsers[0],
			args:            "lkj",
			wantStatusCode:  http.StatusBadRequest,
			wantData:        models.BaseSpace{},
		},
	}

	client := http.Client{}

	for _, test := range tests {
		t.Run(test.name, func(t *testing.T) {
			url := fmt.Sprintf("%s/%s", test.url, test.args)

			spaceResponse, teardownFunc := makeRequest[map[string]models.Space](t, client, http.MethodGet, url, nil, test.wantStatusCode, test.currentTestUser, authClient)
			t.Cleanup(teardownFunc)
			if spaceResponse == nil {
				return
			}

			gotSpace, ok := (*spaceResponse)["data"]
			if !ok {
				t.Fatalf("spaceResponse[\"data\"] ok = %v; want = true", ok)
			}

			assert.Equal(t, gotSpace.BaseSpace, test.wantData)
			assert.Equal(t, gotSpace.ID.String(), test.args)
		})
	}
}
