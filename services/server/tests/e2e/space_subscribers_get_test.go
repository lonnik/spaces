//go:build e2e
// +build e2e

package e2e

import (
	"context"
	"fmt"
	"net/http"
	"spaces-p/pkg/models"
	"spaces-p/pkg/uuid"
	"spaces-p/tests/e2e/helpers"
	"testing"

	"github.com/stretchr/testify/assert"
	"nhooyr.io/websocket"
)

func TestGetSpaceSubscribers(t *testing.T) {
	ctx := context.Background()
	helpers.CreateTestUsers(ctx, t, helpers.Tc.Repo)

	createdTestSpaces := helpers.CreateTestSpaces(ctx, t, helpers.Tc.Repo)

	for _, user := range helpers.GetUsers(t) {
		if err := helpers.Tc.Repo.SetSpaceSubscriber(ctx, createdTestSpaces[0].ID, user.ID); err != nil {
			t.Fatalf("helpers.Tc.Repo.SetSpaceSubscriber() err = %s; want nil", err)
		}
	}

	t.Cleanup(func() {
		err := helpers.Tc.Repo.DeleteAllKeys()
		if err != nil {
			t.Fatalf("helpers.Tc.Repo.DeleteAllKeys() err = %s; want nil", err)
		}
	})

	teardownFunc := connectUserToSpace(ctx, t, helpers.Tc.ApiEndpoint, helpers.Tc.AuthClient, *createdTestSpaces[0], *helpers.GetUser(t, 0))
	t.Cleanup(teardownFunc)
	teardownFunc = connectUserToSpace(ctx, t, helpers.Tc.ApiEndpoint, helpers.Tc.AuthClient, *createdTestSpaces[0], *helpers.GetUser(t, 1))
	t.Cleanup(teardownFunc)

	tests := []helpers.Test[*struct{}, []string]{
		{
			Name:            "get all active space subscribers",
			Url:             fmt.Sprintf("%s/spaces/%s/subscribers?active=true", helpers.Tc.ApiEndpoint, createdTestSpaces[0].ID),
			CurrentTestUser: *helpers.GetUser(t, 1),
			WantStatusCode:  http.StatusOK,
			WantData:        []string{(*helpers.GetUser(t, 1)).Username, (*helpers.GetUser(t, 0)).Username},
		},
		{
			Name:            "get all space subscribers",
			Url:             fmt.Sprintf("%s/spaces/%s/subscribers", helpers.Tc.ApiEndpoint, createdTestSpaces[0].ID),
			CurrentTestUser: *helpers.GetUser(t, 0),
			WantStatusCode:  http.StatusOK,
			WantData:        []string{(*helpers.GetUser(t, 2)).Username, (*helpers.GetUser(t, 1)).Username, (*helpers.GetUser(t, 0)).Username}, // ordered in joined space descending
		},
		{
			Name:            "get all space subscribers with offset 1",
			Url:             fmt.Sprintf("%s/spaces/%s/subscribers?offset=1", helpers.Tc.ApiEndpoint, createdTestSpaces[0].ID),
			CurrentTestUser: *helpers.GetUser(t, 0),
			WantStatusCode:  http.StatusOK,
			WantData:        []string{(*helpers.GetUser(t, 1)).Username, (*helpers.GetUser(t, 0)).Username}, // ordered in joined space descending
		},
		{
			Name:            "get all space subscribers with offset 1 and count 1",
			Url:             fmt.Sprintf("%s/spaces/%s/subscribers?offset=1&count=1", helpers.Tc.ApiEndpoint, createdTestSpaces[0].ID),
			CurrentTestUser: *helpers.GetUser(t, 0),
			WantStatusCode:  http.StatusOK,
			WantData:        []string{(*helpers.GetUser(t, 1)).Username}, // ordered in joined space descending
		},
		{
			Name:            "get all active space subscribers with offset 1",
			Url:             fmt.Sprintf("%s/spaces/%s/subscribers?active=true&offset=1&count=1", helpers.Tc.ApiEndpoint, createdTestSpaces[0].ID),
			CurrentTestUser: *helpers.GetUser(t, 0),
			WantStatusCode:  http.StatusOK,
			WantData:        []string{(*helpers.GetUser(t, 0)).Username}, // ordered in joined space descending
		},
		{
			Name:            "get all active space subscribers with invalid space ID",
			Url:             fmt.Sprintf("%s/spaces/%s/subscribers", helpers.Tc.ApiEndpoint, ""),
			CurrentTestUser: *helpers.GetUser(t, 0),
			WantStatusCode:  http.StatusBadRequest,
			WantData:        []string{}, // ordered in joined space descending
		},
		{
			Name:            "get all active space subscribers with non existing space ID",
			Url:             fmt.Sprintf("%s/spaces/%s/subscribers", helpers.Tc.ApiEndpoint, uuid.New()),
			CurrentTestUser: *helpers.GetUser(t, 0),
			WantStatusCode:  http.StatusNotFound,
			WantData:        []string{}, // ordered in joined space descending
		},
	}

	client := http.Client{}
	for _, test := range tests {
		t.Run(test.Name, func(t *testing.T) {
			spacesResponse, teardown := helpers.MakeRequest[map[string][]models.User](t, client, http.MethodGet, test.Url, nil, test.WantStatusCode, test.CurrentTestUser, helpers.Tc.AuthClient)
			t.Cleanup(teardown)
			if spacesResponse == nil {
				return
			}

			users, ok := (*spacesResponse)["data"]
			if !ok {
				t.Fatalf("(*spacesResponse)[\"data\"]() ok = %v; want true", ok)
			}

			assert.Equal(t, test.WantData, getUserUsernames(t, users))
		})
	}
}

func getUserUsernames(t *testing.T, users []models.User) []string {
	t.Helper()

	userNames := make([]string, len(users))
	for i, user := range users {
		userNames[i] = user.Username
	}

	return userNames
}

func connectUserToSpace(ctx context.Context, t *testing.T, apiEndpoint string, authClient *helpers.StubAuthClient, space models.Space, user models.BaseUser) func() {
	authClient.SetCurrentTestUser(user.ID)

	ctx, cancel := context.WithCancel(ctx)

	connectToSpaceURL := fmt.Sprintf("%s/spaces/%s/updates/ws", apiEndpoint, space.ID)
	_, _, err := websocket.Dial(ctx, connectToSpaceURL, &websocket.DialOptions{
		HTTPHeader: http.Header{"Authorization": []string{"Bearer fake_bearer_token"}},
	})
	if err != nil {
		t.Fatalf("websocket.Dial() err = %s; want nil", err)
	}

	return func() {
		cancel()
		authClient.SetCurrentTestUser("")
	}
}
