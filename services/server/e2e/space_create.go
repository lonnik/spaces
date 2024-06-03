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

func getCreateSpaceTests(url string) []test[string, models.BaseSpace] {
	return []test[string, models.BaseSpace]{
		{
			name:            "create space",
			url:             url,
			currentTestUser: TestUsers[0],
			args:            `{"name":"Thulestraße 31","themeColorHexaCode":"#A1BA6D","radius":68,"location":{"longitude":13.420215,"latitude":52.555241}}`,
			wantStatusCode:  http.StatusOK,
			wantData:        (*testSpaces[0]).BaseSpace,
		},
		{
			name:            "create space without name",
			url:             url,
			currentTestUser: TestUsers[0],
			args:            `{"themeColorHexaCode":"#A1BA6D","radius":68,"location":{"longitude":13.420215,"latitude":52.555241}}`,
			wantStatusCode:  http.StatusBadRequest,
			wantData:        models.BaseSpace{},
		},
		{
			name:            "create space without color hexa code",
			url:             url,
			currentTestUser: TestUsers[0],
			args:            `{"name":"Thulestraße 31","radius":68,"location":{"longitude":13.420215,"latitude":52.555241}}`,
			wantStatusCode:  http.StatusBadRequest,
			wantData:        models.BaseSpace{},
		},
		{
			name:            "create space with invalid color hexa code",
			url:             url,
			currentTestUser: TestUsers[0],
			args:            `{"name":"Thulestraße 31","themeColorHexaCode":"A1BA6D","radius":68,"location":{"longitude":13.420215,"latitude":52.555241}}`,
			wantStatusCode:  http.StatusBadRequest,
			wantData:        models.BaseSpace{},
		},
		{
			name:            "create space without radius",
			url:             url,
			currentTestUser: TestUsers[0],
			args:            `{"name":"Thulestraße 31","themeColorHexaCode":"#A1BA6D","location":{"longitude":13.420215,"latitude":52.555241}}`,
			wantStatusCode:  http.StatusBadRequest,
			wantData:        models.BaseSpace{},
		},
		{
			name:            "create space with radius of 999",
			url:             url,
			currentTestUser: TestUsers[0],
			args:            `{"name":"Thulestraße 31","themeColorHexaCode":"#A1BA6D","radius":999,"location":{"longitude":13.420215,"latitude":52.555241}}`,
			wantStatusCode:  http.StatusBadRequest,
			wantData:        models.BaseSpace{},
		},
		{
			name:            "create space without location",
			url:             url,
			currentTestUser: TestUsers[0],
			args:            `{"name":"Thulestraße 31","themeColorHexaCode":"#A1BA6D","radius":68}`,
			wantStatusCode:  http.StatusBadRequest,
			wantData:        models.BaseSpace{},
		},
		{
			name:            "create space with invalid location (longitude)",
			url:             url,
			currentTestUser: TestUsers[0],
			args:            `{"name":"Thulestraße 31","themeColorHexaCode":"#A1BA6D","radius":68,"location":{"longitude":-189.20215,"latitude":52.555241}}`,
			wantStatusCode:  http.StatusBadRequest,
			wantData:        models.BaseSpace{},
		},
		{
			name:            "create space with invalid location (latitude)",
			url:             url,
			currentTestUser: TestUsers[0],
			args:            `{"name":"Thulestraße 31","themeColorHexaCode":"#A1BA6D","radius":68,"location":{"longitude":13.420215,"latitude":91.5835}}`,
			wantStatusCode:  http.StatusBadRequest,
			wantData:        models.BaseSpace{},
		},
	}
}

func TestCreateSpace(
	ctx context.Context,
	t *testing.T,
	apiEndpoint string,
	repo common.CacheRepository,
	authClient *EmptyAuthClient,
) {
	url := fmt.Sprintf("%s/spaces", apiEndpoint)
	client := http.Client{}
	tests := getCreateSpaceTests(url)

	for _, test := range tests {
		t.Run(test.name, func(t *testing.T) {
			createTestUsers(ctx, t, repo)
			t.Cleanup(func() {
				err := repo.DeleteAllKeys()
				if err != nil {
					t.Fatalf("repo.DeleteAllKeys() err = %s; want nil", err)
				}
			})

			authClient.setCurrentTestUser(test.currentTestUser) // this user is used as admin id

			// act
			spaceCreatedResp, teardown := makeRequest[map[string]map[string]uuid.Uuid](t, client, http.MethodPost, url, bytes.NewReader([]byte(test.args)), test.wantStatusCode)
			t.Cleanup(teardown)
			if spaceCreatedResp == nil {
				return
			}

			spaceId, ok := (*spaceCreatedResp)["data"]["spaceId"]
			if !ok {
				t.Fatalf("spaceCreatedResp[\"data\"][\"spaceId\"] ok = %v; want = true", ok)
			}

			createdSpace, err := repo.GetSpace(ctx, spaceId)
			if err != nil {
				t.Fatalf("repo.GetSpace() err = %s; want nil", err)
			}

			assert.Equal(t, test.currentTestUser.ID, createdSpace.AdminId)
			assert.Equal(t, test.wantData, createdSpace.BaseSpace)
		})
	}
}
