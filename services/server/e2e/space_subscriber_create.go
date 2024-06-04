package e2e

import (
	"bytes"
	"context"
	"fmt"
	"net/http"
	"spaces-p/common"
	"spaces-p/models"
	"spaces-p/uuid"
	"testing"

	"github.com/stretchr/testify/assert"
)

func TestCreateSpaceSubscriber(
	ctx context.Context,
	t *testing.T,
	apiEndpoint string,
	repo common.CacheRepository,
	authClient *EmptyAuthClient,
) {
	testUsers := createTestUsers(ctx, t, repo)
	createdTestSpaces := createTestSpaces(ctx, t, repo)
	tests := []test[string, models.BaseUser]{
		{
			name:            "create test subscriber",
			url:             fmt.Sprintf("%s/spaces/%s/subscribers", apiEndpoint, createdTestSpaces[0].ID),
			currentTestUser: testUsers[0],
			args:            "",
			wantStatusCode:  http.StatusOK,
			wantData:        testUsers[0],
		},
		{
			name:            "create test subscriber with invalid space id",
			url:             fmt.Sprintf("%s/spaces/%s/subscribers", apiEndpoint, "lkj"),
			currentTestUser: testUsers[0],
			args:            "",
			wantStatusCode:  http.StatusBadRequest,
			wantData:        models.BaseUser{},
		},
		{
			name:            "create test subscriber with non-existent space id",
			url:             fmt.Sprintf("%s/spaces/%s/subscribers", apiEndpoint, uuid.New().String()),
			currentTestUser: testUsers[0],
			args:            "",
			wantStatusCode:  http.StatusNotFound,
			wantData:        models.BaseUser{},
		},
		{
			name:            "create test subscriber with non-existent user id",
			url:             fmt.Sprintf("%s/spaces/%s/subscribers", apiEndpoint, uuid.New().String()),
			currentTestUser: models.BaseUser{},
			args:            "",
			wantStatusCode:  http.StatusUnauthorized,
			wantData:        models.BaseUser{},
		},
	}

	client := http.Client{}
	for _, test := range tests {
		t.Run(test.name, func(t *testing.T) {
			createTestUsers(ctx, t, repo)
			t.Cleanup(func() {
				err := repo.DeleteAllKeys()
				if err != nil {
					t.Fatalf("repo.DeleteAllKeys() err = %s; want nil", err)
				}
			})

			// act
			createSpaceSubscriberResponse, teardownFunc := makeRequest[map[string]string](t, client, http.MethodPost, test.url, bytes.NewReader([]byte(test.args)), test.wantStatusCode, test.currentTestUser, authClient)
			t.Cleanup(teardownFunc)
			if createSpaceSubscriberResponse == nil {
				return
			}

			spaceSubscribers, teardownFunc := makeRequest[map[string][]models.User](t, client, http.MethodGet, test.url, nil, http.StatusOK, test.currentTestUser, authClient)
			t.Cleanup(teardownFunc)

			assert.Equal(t, test.wantData, (*spaceSubscribers)["data"][0].BaseUser)
		})
	}
}
