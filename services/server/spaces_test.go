package main

import (
	"context"
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"spaces-p/models"
	"spaces-p/repositories/redis_repo"
	"testing"
)

func testGetSpaces(
	ctx context.Context,
	t *testing.T,
	apiEndpoint string,
	redisRepo *redis_repo.RedisRepository,
	authClient *emptyAuthClient,
) {
	// arrange
	newSpace := models.NewSpace{
		BaseSpace: models.BaseSpace{
			Name:               "space",
			ThemeColorHexaCode: "#000000",
			Radius:             1000,
			Location:           models.Location{Long: 13.404954, Lat: 52.520008},
		},
		AdminId: "",
	}

	newSpaceId, err := redisRepo.SetSpace(ctx, newSpace)
	if err != nil {
		t.Fatalf("redisRepo.SetSpace() err = %s; want nil", err)
	}

	// TODO: deferred delete space function call

	client := http.Client{}

	// act
	// TODO: use table-driven tests here
	url := fmt.Sprintf("%s/spaces?location=%s&radius=100", apiEndpoint, newSpace.BaseSpace.Location.String())

	req, err := http.NewRequest(http.MethodGet, url, nil)
	if err != nil {
		t.Fatalf("http.NewRequest() err = %s; want nil", err)
	}
	req.Header.Add("Authorization", "Bearer fake_bearer_token")

	authClient.setCurrentTestUser(users["userA"])

	resp, err := client.Do(req)
	if err != nil {
		t.Fatalf("http.Get() err = %s; want nil", err)
	}
	defer resp.Body.Close()

	body, err := io.ReadAll(resp.Body)
	if err != nil {
		t.Fatalf("io.ReadAll err = %s; want nil", err)
	}

	var spacesResponse map[string][]models.SpaceWithDistance
	err = json.Unmarshal(body, &spacesResponse)
	if err != nil {
		t.Fatalf("json.Unmarshal() err = %s; want nil", err)
	}

	// assert
	if resp.StatusCode != http.StatusOK {
		t.Errorf("resp.StatusCode got = %d; want = 200", resp.StatusCode)
	}

	if spacesResponse["data"][0].ID != newSpaceId {
		t.Errorf("spaceId = %s; want %s", spacesResponse["data"][0].ID, newSpaceId)
	}
}
