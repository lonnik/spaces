package e2e

import (
	"context"
	"fmt"
	"net/http"
	"spaces-p/common"
	"spaces-p/models"
	"testing"

	"github.com/stretchr/testify/assert"
)

var thulestr32Location = models.Location{Long: 13.419932, Lat: 52.554956}

func getGetSpacesTests(apiEndpoint string) []test[*struct{}, []string] {
	return []test[*struct{}, []string]{
		{
			name:            "by location with maximum radius",
			url:             fmt.Sprintf("%s/spaces?location=%s&radius=1000", apiEndpoint, thulestr32Location.String()),
			currentTestUser: TestUsers[2],
			wantStatusCode:  http.StatusOK,
			wantData:        []string{testSpaces[0].Name, testSpaces[1].Name, testSpaces[2].Name, testSpaces[3].Name},
		},
		{
			name:            "by location with 2 offset",
			url:             fmt.Sprintf("%s/spaces?location=%s&radius=1000&offset=2", apiEndpoint, thulestr32Location.String()),
			currentTestUser: TestUsers[0],
			wantStatusCode:  http.StatusOK,
			wantData:        []string{testSpaces[2].Name, testSpaces[3].Name},
		},
		{
			name:            "by location with 2 offset and 1 count",
			url:             fmt.Sprintf("%s/spaces?location=%s&radius=1000&offset=2&count=1", apiEndpoint, thulestr32Location.String()),
			currentTestUser: TestUsers[2],
			wantStatusCode:  http.StatusOK,
			wantData:        []string{testSpaces[2].Name},
		},
		{
			name:            "by location with small radius",
			url:             fmt.Sprintf("%s/spaces?location=%s&radius=1", apiEndpoint, thulestr32Location.String()),
			currentTestUser: TestUsers[0],
			wantStatusCode:  http.StatusOK,
			wantData:        []string{testSpaces[0].Name, testSpaces[1].Name},
		},
		{
			name:            "by location without radius",
			url:             fmt.Sprintf("%s/spaces?location=%s", apiEndpoint, thulestr32Location.String()),
			currentTestUser: TestUsers[1],
			wantStatusCode:  http.StatusBadRequest,
			wantData:        []string{},
		},
		{
			name:            "by user id",
			url:             fmt.Sprintf("%s/spaces?user_id=%s", apiEndpoint, TestUsers[0].ID),
			currentTestUser: TestUsers[1],
			wantStatusCode:  http.StatusOK,
			wantData:        []string{testSpaces[1].Name, testSpaces[0].Name}, // sorted by joining time descending
		},
		{
			name:            "by user id with offset",
			url:             fmt.Sprintf("%s/spaces?user_id=%s&offset=1", apiEndpoint, TestUsers[0].ID),
			currentTestUser: TestUsers[1],
			wantStatusCode:  http.StatusOK,
			wantData:        []string{testSpaces[0].Name},
		},
		{
			name:            "by user id that doesn't exist",
			url:             fmt.Sprintf("%s/spaces?user_id=nonexistent", apiEndpoint),
			currentTestUser: TestUsers[1],
			wantStatusCode:  http.StatusBadRequest,
			wantData:        []string{},
		},
		{
			name:            "by neither location nor user",
			url:             fmt.Sprintf("%s/spaces", apiEndpoint),
			currentTestUser: TestUsers[1],
			wantStatusCode:  http.StatusBadRequest,
			wantData:        []string{},
		},
		// test validation
	}
}

func TestGetSpaces(
	ctx context.Context,
	t *testing.T,
	apiEndpoint string,
	repo common.CacheRepository,
	authClient *EmptyAuthClient,
) {
	createTestUsers(ctx, t, repo)

	createdTestSpaces := createTestSpaces(ctx, t, repo)

	for _, createdTestSpace := range createdTestSpaces[:2] {
		if err := repo.SetSpaceSubscriber(ctx, createdTestSpace.ID, TestUsers[0].ID); err != nil {
			t.Fatalf("repo.SetSpaceSubscriber() err = %s; want nil", err)
		}
	}

	t.Cleanup(func() {
		err := repo.DeleteAllKeys()
		if err != nil {
			t.Fatalf("repo.DeleteAllKeys() err = %s; want nil", err)
		}
	})

	client := http.Client{}
	tests := getGetSpacesTests(apiEndpoint)

	for _, test := range tests {
		t.Run(test.name, func(t *testing.T) {
			authClient.setCurrentTestUser(test.currentTestUser)

			spacesResponse, teardown := makeRequest[map[string][]models.SpaceWithDistance](t, client, http.MethodGet, test.url, nil, test.wantStatusCode)
			t.Cleanup(teardown)
			if spacesResponse == nil {
				return
			}

			gotSpaceNames := getSpaceNames(t, (*spacesResponse)["data"])

			assert.Equal(t, test.wantData, gotSpaceNames)
		})
	}
}

func getSpaceNames(t *testing.T, spaces []models.SpaceWithDistance) []string {
	t.Helper()

	spaceNames := make([]string, len(spaces))
	for i, space := range spaces {
		spaceNames[i] = space.Name
	}

	return spaceNames
}
