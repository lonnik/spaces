package e2e

import (
	"bytes"
	"context"
	"encoding/json"
	"fmt"
	"io"
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
			currentTestUser: TestUsers["user1"],
			args:            `{"name":"Thulestraße 31","themeColorHexaCode":"#A1BA6D","radius":68,"location":{"longitude":13.420215,"latitude":52.555241}}`,
			wantStatusCode:  http.StatusOK,
			wantData:        (*testSpaces["space1"]).BaseSpace,
		},
		{
			name:            "create space without name",
			url:             url,
			currentTestUser: TestUsers["user1"],
			args:            `{"themeColorHexaCode":"#A1BA6D","radius":68,"location":{"longitude":13.420215,"latitude":52.555241}}`,
			wantStatusCode:  http.StatusBadRequest,
			wantData:        models.BaseSpace{},
		},
		{
			name:            "create space without color hexa code",
			url:             url,
			currentTestUser: TestUsers["user1"],
			args:            `{"name":"Thulestraße 31","radius":68,"location":{"longitude":13.420215,"latitude":52.555241}}`,
			wantStatusCode:  http.StatusBadRequest,
			wantData:        models.BaseSpace{},
		},
		{
			name:            "create space with invalid color hexa code",
			url:             url,
			currentTestUser: TestUsers["user1"],
			args:            `{"name":"Thulestraße 31","themeColorHexaCode":"A1BA6D","radius":68,"location":{"longitude":13.420215,"latitude":52.555241}}`,
			wantStatusCode:  http.StatusBadRequest,
			wantData:        models.BaseSpace{},
		},
		{
			name:            "create space without radius",
			url:             url,
			currentTestUser: TestUsers["user1"],
			args:            `{"name":"Thulestraße 31","themeColorHexaCode":"#A1BA6D","location":{"longitude":13.420215,"latitude":52.555241}}`,
			wantStatusCode:  http.StatusBadRequest,
			wantData:        models.BaseSpace{},
		},
		{
			name:            "create space with radius of 999",
			url:             url,
			currentTestUser: TestUsers["user1"],
			args:            `{"name":"Thulestraße 31","themeColorHexaCode":"#A1BA6D","radius":999,"location":{"longitude":13.420215,"latitude":52.555241}}`,
			wantStatusCode:  http.StatusBadRequest,
			wantData:        models.BaseSpace{},
		},
		{
			name:            "create space without location",
			url:             url,
			currentTestUser: TestUsers["user1"],
			args:            `{"name":"Thulestraße 31","themeColorHexaCode":"#A1BA6D","radius":68}`,
			wantStatusCode:  http.StatusBadRequest,
			wantData:        models.BaseSpace{},
		},
		{
			name:            "create space with invalid location (longitude)",
			url:             url,
			currentTestUser: TestUsers["user1"],
			args:            `{"name":"Thulestraße 31","themeColorHexaCode":"#A1BA6D","radius":68,"location":{"longitude":-189.20215,"latitude":52.555241}}`,
			wantStatusCode:  http.StatusBadRequest,
			wantData:        models.BaseSpace{},
		},
		{
			name:            "create space with invalid location (latitude)",
			url:             url,
			currentTestUser: TestUsers["user1"],
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
	createTestUsers(ctx, t, repo)

	t.Cleanup(func() {
		err := repo.DeleteAllKeys()
		if err != nil {
			t.Fatalf("repo.DeleteAllKeys() err = %s; want nil", err)
		}
	})

	url := fmt.Sprintf("%s/spaces", apiEndpoint)
	client := http.Client{}
	tests := getCreateSpaceTests(url)

	for _, test := range tests {
		t.Run(test.name, func(t *testing.T) {
			authClient.setCurrentTestUser(test.currentTestUser) // this user is used as admin id

			// act
			req, err := http.NewRequest(http.MethodPost, url, bytes.NewReader([]byte(test.args)))
			if err != nil {
				t.Fatalf("http.NewRequest() err = %s; want nil", err)
			}
			req.Header.Add("Authorization", "Bearer fake_bearer_token")

			resp, err := client.Do(req)
			if err != nil {
				t.Fatalf("client.Do() err = %s; want nil", err)
			}
			defer resp.Body.Close()

			// assert
			if resp.StatusCode != test.wantStatusCode {
				t.Fatalf("resp.StatusCode = %d; want %d", resp.StatusCode, test.wantStatusCode)
			}

			if !isSuccessStatusCode(t, resp.StatusCode) {
				return
			}

			body, err := io.ReadAll(resp.Body)
			if err != nil {
				t.Fatalf("io.ReadAll() err = %s; want nil", err)
			}

			var spaceCreatedResp map[string]map[string]uuid.Uuid
			err = json.Unmarshal(body, &spaceCreatedResp)
			if err != nil {
				t.Fatalf("json.Unmarshal() err = %s; want nil", err)
			}

			spaceId, ok := spaceCreatedResp["data"]["spaceId"]
			if !ok {
				t.Fatalf("spaceCreatedResp[\"data\"][\"spaceId\"] ok = %v; want = true", ok)
			}

			t.Cleanup(func() {
				if err := repo.DeleteSpace(ctx, spaceId); err != nil {
					t.Fatalf("repo.DeleteAllKeys() err = %s; want nil", err)
				}
			})

			createdSpace, err := repo.GetSpace(ctx, spaceId)
			if err != nil {
				t.Fatalf("repo.GetSpace() err = %s; want nil", err)
			}

			assert.Equal(t, test.currentTestUser.ID, createdSpace.AdminId)
			assert.Equal(t, test.wantData, createdSpace.BaseSpace)
		})
	}
}
