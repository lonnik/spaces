package main

import (
	"context"
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"reflect"
	"spaces-p/models"
	"spaces-p/repositories/redis_repo"
	"testing"
)

var thulestr32Location = models.Location{Long: 13.419932, Lat: 52.554956}

var spaces = map[string]*models.Space{
	"space1": {
		BaseSpace: models.BaseSpace{
			Name:               "Thulestraße 31",
			ThemeColorHexaCode: "#A1BA6D",
			Radius:             68,
			Location:           models.Location{Long: 13.420215, Lat: 52.555241},
		},
	},
	"space2": {
		BaseSpace: models.BaseSpace{
			Name:               "Lunderstr 2",
			ThemeColorHexaCode: "#9AE174",
			Radius:             50,
			Location:           models.Location{Long: 13.419568, Lat: 52.555263},
		},
	},
	"space3": {
		BaseSpace: models.BaseSpace{
			Name:               "Haus am Park",
			ThemeColorHexaCode: "#86EB4F",
			Radius:             70,
			Location:           models.Location{Long: 13.420848, Lat: 52.554357},
		},
	},
	"space4": {
		BaseSpace: models.BaseSpace{
			Name:               "Trelleborger Str. 6",
			ThemeColorHexaCode: "#230EE7",
			Radius:             50,
			Location:           models.Location{Long: 13.418482, Lat: 52.554775},
		},
	},
}

func getTests(apiEndpoint string) []test[[]string] {
	return []test[[]string]{
		{
			name:            "by location with maximum radius",
			url:             fmt.Sprintf("%s/spaces?location=%s&radius=1000", apiEndpoint, thulestr32Location.String()),
			currentTestUser: users["user3"],
			wantStatusCode:  http.StatusOK,
			wantData:        []string{"Thulestraße 31", "Lunderstr 2", "Haus am Park", "Trelleborger Str. 6"},
		},
		{
			name:            "by location with 2 offset",
			url:             fmt.Sprintf("%s/spaces?location=%s&radius=1000&offset=2", apiEndpoint, thulestr32Location.String()),
			currentTestUser: users["user1"],
			wantStatusCode:  http.StatusOK,
			wantData:        []string{"Haus am Park", "Trelleborger Str. 6"},
		},
		{
			name:            "by location with 2 offset and 1 count",
			url:             fmt.Sprintf("%s/spaces?location=%s&radius=1000&offset=2&count=1", apiEndpoint, thulestr32Location.String()),
			currentTestUser: users["user3"],
			wantStatusCode:  http.StatusOK,
			wantData:        []string{"Haus am Park"},
		},
		{
			name:            "by location with small radius",
			url:             fmt.Sprintf("%s/spaces?location=%s&radius=1", apiEndpoint, thulestr32Location.String()),
			currentTestUser: users["user1"],
			wantStatusCode:  http.StatusOK,
			wantData:        []string{"Thulestraße 31", "Lunderstr 2"},
		},
		{
			name:            "by location without radius",
			url:             fmt.Sprintf("%s/spaces?location=%s", apiEndpoint, thulestr32Location.String()),
			currentTestUser: users["user2"],
			wantStatusCode:  http.StatusBadRequest,
			wantData:        []string{},
		},
		{
			name:            "by user id",
			url:             fmt.Sprintf("%s/spaces?user_id=%s", apiEndpoint, users["user1"].ID),
			currentTestUser: users["user2"],
			wantStatusCode:  http.StatusOK,
			wantData:        []string{"Lunderstr 2", "Thulestraße 31"}, // sorted by joining time descending
		},
		{
			name:            "by user id with offset",
			url:             fmt.Sprintf("%s/spaces?user_id=%s&offset=1", apiEndpoint, users["user1"].ID),
			currentTestUser: users["user2"],
			wantStatusCode:  http.StatusOK,
			wantData:        []string{"Thulestraße 31"},
		},
		{
			name:            "by user id that doesn't exist",
			url:             fmt.Sprintf("%s/spaces?user_id=nonexistent", apiEndpoint),
			currentTestUser: users["user2"],
			wantStatusCode:  http.StatusBadRequest,
			wantData:        []string{},
		},
		{
			name:            "by neither location nor user",
			url:             fmt.Sprintf("%s/spaces", apiEndpoint),
			currentTestUser: users["user2"],
			wantStatusCode:  http.StatusBadRequest,
			wantData:        []string{},
		},
	}
}

func testGetSpaces(
	ctx context.Context,
	t *testing.T,
	apiEndpoint string,
	redisRepo *redis_repo.RedisRepository,
	authClient *emptyAuthClient,
) {
	for spaceName, space := range spaces {
		spaceId, err := redisRepo.SetSpace(ctx, models.NewSpace{BaseSpace: space.BaseSpace, AdminId: space.AdminId})
		if err != nil {
			t.Fatalf("redisRepo.SetSpace() err = %s; want nil", err)
		}

		spaces[spaceName].ID = spaceId
	}

	redisRepo.SetSpaceSubscriber(ctx, spaces["space1"].ID, users["user1"].ID)
	redisRepo.SetSpaceSubscriber(ctx, spaces["space2"].ID, users["user1"].ID)

	// TODO: deferred delete space and space subscriber function calls
	// TODO: implement DeleteSpace function
	// TODO: implement DeleteSpaceSubscriber function

	client := http.Client{}
	tests := getTests(apiEndpoint)

	for _, test := range tests {
		t.Run(test.name, func(t *testing.T) {
			req, err := http.NewRequest(http.MethodGet, test.url, nil)
			if err != nil {
				t.Fatalf("http.NewRequest() err = %s; want nil", err)
			}
			req.Header.Add("Authorization", "Bearer fake_bearer_token")

			authClient.setCurrentTestUser(test.currentTestUser)

			resp, err := client.Do(req)
			if err != nil {
				t.Fatalf("http.Get() err = %s; want nil", err)
			}
			defer resp.Body.Close()

			assertSpacesResponse(t, resp, test.wantStatusCode, test.wantData)
		})
	}
}

func assertSpacesResponse(t *testing.T, response *http.Response, wantStatusCode int, wantData []string) {
	t.Helper()

	if response.StatusCode != wantStatusCode {
		t.Errorf("resp.StatusCode got = %d; want = %d", response.StatusCode, wantStatusCode)
	}

	if !isSuccessStatusCode(t, response.StatusCode) {
		return
	}

	body, err := io.ReadAll(response.Body)
	if err != nil {
		t.Fatalf("io.ReadAll err = %s; want nil", err)
	}

	var spacesResponse map[string][]models.SpaceWithDistance
	err = json.Unmarshal(body, &spacesResponse)
	if err != nil {
		t.Fatalf("json.Unmarshal() err = %s; want nil", err)
	}

	gotSpaceNames := getSpaceNames(t, spacesResponse["data"])

	if !reflect.DeepEqual(gotSpaceNames, wantData) {
		t.Errorf("got = %v; want %v", gotSpaceNames, wantData)
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

func isSuccessStatusCode(t *testing.T, statusCode int) bool {
	t.Helper()

	return statusCode >= http.StatusOK && statusCode <= http.StatusIMUsed
}
