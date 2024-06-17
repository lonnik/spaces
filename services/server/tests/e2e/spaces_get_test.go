package e2e

import (
	"context"
	"fmt"
	"net/http"
	"spaces-p/pkg/models"
	"spaces-p/tests/e2e/helpers"
	"testing"

	"github.com/stretchr/testify/assert"
)

var thulestr32Location = models.Location{Long: 13.419932, Lat: 52.554956}

func getGetSpacesTests(t *testing.T, apiEndpoint string) []helpers.Test[*struct{}, []string] {
	return []helpers.Test[*struct{}, []string]{
		{
			Name:            "by location with maximum radius",
			Url:             fmt.Sprintf("%s/spaces?location=%s&radius=1000", apiEndpoint, thulestr32Location.String()),
			CurrentTestUser: *helpers.GetUser(t, 2),
			WantStatusCode:  http.StatusOK,
			WantData:        []string{helpers.SpaceFixtures[0].Name, helpers.SpaceFixtures[1].Name, helpers.SpaceFixtures[2].Name, helpers.SpaceFixtures[3].Name},
		},
		{
			Name:            "by location with 2 offset",
			Url:             fmt.Sprintf("%s/spaces?location=%s&radius=1000&offset=2", apiEndpoint, thulestr32Location.String()),
			CurrentTestUser: *helpers.GetUser(t, 0),
			WantStatusCode:  http.StatusOK,
			WantData:        []string{helpers.SpaceFixtures[2].Name, helpers.SpaceFixtures[3].Name},
		},
		{
			Name:            "by location with 2 offset and 1 count",
			Url:             fmt.Sprintf("%s/spaces?location=%s&radius=1000&offset=2&count=1", apiEndpoint, thulestr32Location.String()),
			CurrentTestUser: *helpers.GetUser(t, 2),
			WantStatusCode:  http.StatusOK,
			WantData:        []string{helpers.SpaceFixtures[2].Name},
		},
		{
			Name:            "by location with small radius",
			Url:             fmt.Sprintf("%s/spaces?location=%s&radius=1", apiEndpoint, thulestr32Location.String()),
			CurrentTestUser: *helpers.GetUser(t, 0),
			WantStatusCode:  http.StatusOK,
			WantData:        []string{helpers.SpaceFixtures[0].Name, helpers.SpaceFixtures[1].Name},
		},
		{
			Name:            "by location without radius",
			Url:             fmt.Sprintf("%s/spaces?location=%s", apiEndpoint, thulestr32Location.String()),
			CurrentTestUser: *helpers.GetUser(t, 1),
			WantStatusCode:  http.StatusBadRequest,
			WantData:        []string{},
		},
		{
			Name:            "by user id",
			Url:             fmt.Sprintf("%s/spaces?user_id=%s", apiEndpoint, (*helpers.GetUser(t, 0)).ID),
			CurrentTestUser: *helpers.GetUser(t, 1),
			WantStatusCode:  http.StatusOK,
			WantData:        []string{helpers.SpaceFixtures[1].Name, helpers.SpaceFixtures[0].Name}, // sorted by joining time descending
		},
		{
			Name:            "by user id with offset",
			Url:             fmt.Sprintf("%s/spaces?user_id=%s&offset=1", apiEndpoint, (*helpers.GetUser(t, 0)).ID),
			CurrentTestUser: *helpers.GetUser(t, 1),
			WantStatusCode:  http.StatusOK,
			WantData:        []string{helpers.SpaceFixtures[0].Name},
		},
		{
			Name:            "by user id that doesn't exist",
			Url:             fmt.Sprintf("%s/spaces?user_id=nonexistent", apiEndpoint),
			CurrentTestUser: *helpers.GetUser(t, 1),
			WantStatusCode:  http.StatusBadRequest,
			WantData:        []string{},
		},
		{
			Name:            "by neither location nor user",
			Url:             fmt.Sprintf("%s/spaces", apiEndpoint),
			CurrentTestUser: *helpers.GetUser(t, 1),
			WantStatusCode:  http.StatusBadRequest,
			WantData:        []string{},
		},
		// TODO: test validation
	}
}

func TestGetSpaces(t *testing.T) {
	ctx := context.Background()
	helpers.CreateTestUsers(ctx, t, helpers.Tc.Repo)

	createdTestSpaces := helpers.CreateTestSpaces(ctx, t, helpers.Tc.Repo)

	for _, createdTestSpace := range createdTestSpaces[:2] {
		if err := helpers.Tc.Repo.SetSpaceSubscriber(ctx, createdTestSpace.ID, (*helpers.GetUser(t, 0)).ID); err != nil {
			t.Fatalf("helpers.Tc.Repo.SetSpaceSubscriber() err = %s; want nil", err)
		}
	}

	t.Cleanup(func() {
		err := helpers.Tc.Repo.DeleteAllKeys()
		if err != nil {
			t.Fatalf("helpers.Tc.Repo.DeleteAllKeys() err = %s; want nil", err)
		}
	})

	client := http.Client{}
	tests := getGetSpacesTests(t, helpers.Tc.ApiEndpoint)

	for _, test := range tests {
		t.Run(test.Name, func(t *testing.T) {
			spacesResponse, teardown := helpers.MakeRequest[map[string][]models.SpaceWithDistance](t, client, http.MethodGet, test.Url, nil, test.WantStatusCode, test.CurrentTestUser, helpers.Tc.AuthClient)
			t.Cleanup(teardown)
			if spacesResponse == nil {
				return
			}

			gotSpaceNames := getSpaceNames(t, (*spacesResponse)["data"])

			assert.Equal(t, test.WantData, gotSpaceNames)
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
