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
	"nhooyr.io/websocket"
)

func TestGetSpaceSubscribers(
	ctx context.Context,
	t *testing.T,
	apiEndpoint string,
	repo common.CacheRepository,
	authClient *EmptyAuthClient,
) {
	createTestUsers(ctx, t, repo)

	createdTestSpaces := createTestSpaces(ctx, t, repo)

	for _, user := range TestUsers {
		if err := repo.SetSpaceSubscriber(ctx, createdTestSpaces[0].ID, user.ID); err != nil {
			t.Fatalf("repo.SetSpaceSubscriber() err = %s; want nil", err)
		}
	}

	t.Cleanup(func() {
		err := repo.DeleteAllKeys()
		if err != nil {
			t.Fatalf("repo.DeleteAllKeys() err = %s; want nil", err)
		}
	})

	teardownFunc := connectUserToSpace(ctx, t, apiEndpoint, authClient, *createdTestSpaces[0], TestUsers[0])
	t.Cleanup(teardownFunc)
	teardownFunc = connectUserToSpace(ctx, t, apiEndpoint, authClient, *createdTestSpaces[0], TestUsers[1])
	t.Cleanup(teardownFunc)

	tests := []test[*struct{}, []string]{
		{
			name:            "get all active space subscribers",
			url:             fmt.Sprintf("%s/spaces/%s/subscribers?active=true", apiEndpoint, createdTestSpaces[0].ID),
			currentTestUser: TestUsers[1],
			wantStatusCode:  http.StatusOK,
			wantData:        []string{TestUsers[1].Username, TestUsers[0].Username},
		},
		{
			name:            "get all space subscribers",
			url:             fmt.Sprintf("%s/spaces/%s/subscribers", apiEndpoint, createdTestSpaces[0].ID),
			currentTestUser: TestUsers[0],
			wantStatusCode:  http.StatusOK,
			wantData:        []string{TestUsers[2].Username, TestUsers[1].Username, TestUsers[0].Username}, // ordered in joined space descending
		},
		{
			name:            "get all space subscribers with offset 1",
			url:             fmt.Sprintf("%s/spaces/%s/subscribers?offset=1", apiEndpoint, createdTestSpaces[0].ID),
			currentTestUser: TestUsers[0],
			wantStatusCode:  http.StatusOK,
			wantData:        []string{TestUsers[1].Username, TestUsers[0].Username}, // ordered in joined space descending
		},
		{
			name:            "get all space subscribers with offset 1 and count 1",
			url:             fmt.Sprintf("%s/spaces/%s/subscribers?offset=1&count=1", apiEndpoint, createdTestSpaces[0].ID),
			currentTestUser: TestUsers[0],
			wantStatusCode:  http.StatusOK,
			wantData:        []string{TestUsers[1].Username}, // ordered in joined space descending
		},
		{
			name:            "get all active space subscribers with offset 1",
			url:             fmt.Sprintf("%s/spaces/%s/subscribers?active=true&offset=1&count=1", apiEndpoint, createdTestSpaces[0].ID),
			currentTestUser: TestUsers[0],
			wantStatusCode:  http.StatusOK,
			wantData:        []string{TestUsers[0].Username}, // ordered in joined space descending
		},
		{
			name:            "get all active space subscribers with invalid space ID",
			url:             fmt.Sprintf("%s/spaces/%s/subscribers", apiEndpoint, ""),
			currentTestUser: TestUsers[0],
			wantStatusCode:  http.StatusBadRequest,
			wantData:        []string{}, // ordered in joined space descending
		},
		{
			name:            "get all active space subscribers with non existing space ID",
			url:             fmt.Sprintf("%s/spaces/%s/subscribers", apiEndpoint, uuid.New()),
			currentTestUser: TestUsers[0],
			wantStatusCode:  http.StatusNotFound,
			wantData:        []string{}, // ordered in joined space descending
		},
	}

	client := http.Client{}
	for _, test := range tests {
		t.Run(test.name, func(t *testing.T) {
			spacesResponse, teardown := makeRequest[map[string][]models.User](t, client, http.MethodGet, test.url, nil, test.wantStatusCode, test.currentTestUser, authClient)
			t.Cleanup(teardown)
			if spacesResponse == nil {
				return
			}

			users, ok := (*spacesResponse)["data"]
			if !ok {
				t.Fatalf("(*spacesResponse)[\"data\"]() ok = %v; want true", ok)
			}

			assert.Equal(t, test.wantData, getUserUsernames(t, users))
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

func connectUserToSpace(ctx context.Context, t *testing.T, apiEndpoint string, authClient *EmptyAuthClient, space models.Space, user models.BaseUser) func() {
	authClient.setCurrentTestUser(user)

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
		authClient.setCurrentTestUser(models.BaseUser{})
	}
}
