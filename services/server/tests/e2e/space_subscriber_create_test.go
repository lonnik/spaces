package e2e

import (
	"bytes"
	"context"
	"fmt"
	"net/http"
	"spaces-p/pkg/models"
	"spaces-p/pkg/uuid"
	"spaces-p/tests/e2e/helpers"
	"testing"

	"github.com/stretchr/testify/assert"
)

func TestCreateSpaceSubscriber(t *testing.T) {
	ctx := context.Background()
	testUsers := helpers.CreateTestUsers(ctx, t, helpers.Tc.Repo)
	createdTestSpaces := helpers.CreateTestSpaces(ctx, t, helpers.Tc.Repo)
	tests := []helpers.Test[string, models.BaseUser]{
		{
			Name:            "create test subscriber",
			Url:             fmt.Sprintf("%s/spaces/%s/subscribers", helpers.Tc.ApiEndpoint, createdTestSpaces[0].ID),
			CurrentTestUser: testUsers[0],
			Args:            "",
			WantStatusCode:  http.StatusOK,
			WantData:        testUsers[0],
		},
		{
			Name:            "create test subscriber with invalid space id",
			Url:             fmt.Sprintf("%s/spaces/%s/subscribers", helpers.Tc.ApiEndpoint, "lkj"),
			CurrentTestUser: testUsers[0],
			Args:            "",
			WantStatusCode:  http.StatusBadRequest,
			WantData:        models.BaseUser{},
		},
		{
			Name:            "create test subscriber with non-existent space id",
			Url:             fmt.Sprintf("%s/spaces/%s/subscribers", helpers.Tc.ApiEndpoint, uuid.New().String()),
			CurrentTestUser: testUsers[0],
			Args:            "",
			WantStatusCode:  http.StatusNotFound,
			WantData:        models.BaseUser{},
		},
		{
			Name:            "create test subscriber with non-existent user id",
			Url:             fmt.Sprintf("%s/spaces/%s/subscribers", helpers.Tc.ApiEndpoint, uuid.New().String()),
			CurrentTestUser: models.BaseUser{},
			Args:            "",
			WantStatusCode:  http.StatusUnauthorized,
			WantData:        models.BaseUser{},
		},
	}

	client := http.Client{}
	for _, test := range tests {
		t.Run(test.Name, func(t *testing.T) {
			helpers.CreateTestUsers(ctx, t, helpers.Tc.Repo)
			t.Cleanup(func() {
				err := helpers.Tc.Repo.DeleteAllKeys()
				if err != nil {
					t.Fatalf("helpers.Tc.Repo.DeleteAllKeys() err = %s; want nil", err)
				}
			})

			// act
			createSpaceSubscriberResponse, teardownFunc := helpers.MakeRequest[map[string]string](t, client, http.MethodPost, test.Url, bytes.NewReader([]byte(test.Args)), test.WantStatusCode, test.CurrentTestUser, helpers.Tc.AuthClient)
			t.Cleanup(teardownFunc)
			if createSpaceSubscriberResponse == nil {
				return
			}

			spaceSubscribers, teardownFunc := helpers.MakeRequest[map[string][]models.User](t, client, http.MethodGet, test.Url, nil, http.StatusOK, test.CurrentTestUser, helpers.Tc.AuthClient)
			t.Cleanup(teardownFunc)

			assert.Equal(t, test.WantData, (*spaceSubscribers)["data"][0].BaseUser)
		})
	}
}
