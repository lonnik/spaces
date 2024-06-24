//go:build e2e
// +build e2e

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

func getCreateSpaceTests(t *testing.T, url string) []helpers.Test[string, models.BaseSpace] {
	return []helpers.Test[string, models.BaseSpace]{
		{
			Name:            "create space",
			Url:             url,
			CurrentTestUser: *helpers.GetUser(t, 0),
			Args:            `{"name":"Thulestraße 31","themeColorHexaCode":"#A1BA6D","radius":68,"location":{"longitude":13.420215,"latitude":52.555241}}`,
			WantStatusCode:  http.StatusOK,
			WantData:        (*helpers.SpaceFixtures[0]).BaseSpace,
		},
		{
			Name:            "create space without name",
			Url:             url,
			CurrentTestUser: *helpers.GetUser(t, 0),
			Args:            `{"themeColorHexaCode":"#A1BA6D","radius":68,"location":{"longitude":13.420215,"latitude":52.555241}}`,
			WantStatusCode:  http.StatusBadRequest,
			WantData:        models.BaseSpace{},
		},
		{
			Name:            "create space without color hexa code",
			Url:             url,
			CurrentTestUser: *helpers.GetUser(t, 0),
			Args:            `{"name":"Thulestraße 31","radius":68,"location":{"longitude":13.420215,"latitude":52.555241}}`,
			WantStatusCode:  http.StatusBadRequest,
			WantData:        models.BaseSpace{},
		},
		{
			Name:            "create space with invalid color hexa code",
			Url:             url,
			CurrentTestUser: *helpers.GetUser(t, 0),
			Args:            `{"name":"Thulestraße 31","themeColorHexaCode":"A1BA6D","radius":68,"location":{"longitude":13.420215,"latitude":52.555241}}`,
			WantStatusCode:  http.StatusBadRequest,
			WantData:        models.BaseSpace{},
		},
		{
			Name:            "create space without radius",
			Url:             url,
			CurrentTestUser: *helpers.GetUser(t, 0),
			Args:            `{"name":"Thulestraße 31","themeColorHexaCode":"#A1BA6D","location":{"longitude":13.420215,"latitude":52.555241}}`,
			WantStatusCode:  http.StatusBadRequest,
			WantData:        models.BaseSpace{},
		},
		{
			Name:            "create space with radius of 999",
			Url:             url,
			CurrentTestUser: *helpers.GetUser(t, 0),
			Args:            `{"name":"Thulestraße 31","themeColorHexaCode":"#A1BA6D","radius":999,"location":{"longitude":13.420215,"latitude":52.555241}}`,
			WantStatusCode:  http.StatusBadRequest,
			WantData:        models.BaseSpace{},
		},
		{
			Name:            "create space without location",
			Url:             url,
			CurrentTestUser: *helpers.GetUser(t, 0),
			Args:            `{"name":"Thulestraße 31","themeColorHexaCode":"#A1BA6D","radius":68}`,
			WantStatusCode:  http.StatusBadRequest,
			WantData:        models.BaseSpace{},
		},
		{
			Name:            "create space with invalid location (longitude)",
			Url:             url,
			CurrentTestUser: *helpers.GetUser(t, 0),
			Args:            `{"name":"Thulestraße 31","themeColorHexaCode":"#A1BA6D","radius":68,"location":{"longitude":-189.20215,"latitude":52.555241}}`,
			WantStatusCode:  http.StatusBadRequest,
			WantData:        models.BaseSpace{},
		},
		{
			Name:            "create space with invalid location (latitude)",
			Url:             url,
			CurrentTestUser: *helpers.GetUser(t, 0),
			Args:            `{"name":"Thulestraße 31","themeColorHexaCode":"#A1BA6D","radius":68,"location":{"longitude":13.420215,"latitude":91.5835}}`,
			WantStatusCode:  http.StatusBadRequest,
			WantData:        models.BaseSpace{},
		},
	}
}

func TestCreateSpace(t *testing.T) {
	url := fmt.Sprintf("%s/spaces", helpers.Tc.ApiEndpoint)
	client := http.Client{}
	tests := getCreateSpaceTests(t, url)
	ctx := context.Background()

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
			spaceCreatedResp, teardown := helpers.MakeRequest[map[string]map[string]uuid.Uuid](t, client, http.MethodPost, test.Url, bytes.NewReader([]byte(test.Args)), test.WantStatusCode, test.CurrentTestUser, helpers.Tc.AuthClient)
			t.Cleanup(teardown)
			if spaceCreatedResp == nil {
				return
			}

			spaceId, ok := (*spaceCreatedResp)["data"]["spaceId"]
			if !ok {
				t.Fatalf("spaceCreatedResp[\"data\"][\"spaceId\"] ok = %v; want = true", ok)
			}

			createdSpace, err := helpers.Tc.Repo.GetSpace(ctx, spaceId)
			if err != nil {
				t.Fatalf("helpers.Tc.Repo.GetSpace() err = %s; want nil", err)
			}

			assert.Equal(t, test.CurrentTestUser.ID, createdSpace.AdminId)
			assert.Equal(t, test.WantData, createdSpace.BaseSpace)
		})
	}
}
