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
)

func TestGetSpace(t *testing.T) {
	// create and clean data
	ctx := context.Background()

	helpers.CreateTestUsers(ctx, t, helpers.Tc.Repo)

	createdTestSpaces := helpers.CreateTestSpaces(ctx, t, helpers.Tc.Repo)

	t.Cleanup(func() {
		err := helpers.Tc.Repo.DeleteAllKeys()
		if err != nil {
			t.Fatalf("helpers.Tc.Repo.DeleteAllKeys() err = %s; want nil", err)
		}
	})

	url := helpers.Tc.ApiEndpoint + "/spaces"

	tests := []helpers.Test[string, models.BaseSpace]{
		{
			Name:            "get space 1",
			Url:             url,
			CurrentTestUser: *helpers.GetUser(t, 0),
			Args:            createdTestSpaces[0].ID.String(),
			WantStatusCode:  http.StatusOK,
			WantData:        createdTestSpaces[0].BaseSpace,
		},
		{
			Name:            "get space 2",
			Url:             url,
			CurrentTestUser: *helpers.GetUser(t, 0),
			Args:            createdTestSpaces[1].ID.String(),
			WantStatusCode:  http.StatusOK,
			WantData:        createdTestSpaces[1].BaseSpace,
		},
		{
			Name:            "get space by fake space ID",
			Url:             url,
			CurrentTestUser: *helpers.GetUser(t, 0),
			Args:            uuid.New().String(),
			WantStatusCode:  http.StatusNotFound,
			WantData:        models.BaseSpace{},
		},
		{
			Name:            "get space by invalid space ID",
			Url:             url,
			CurrentTestUser: *helpers.GetUser(t, 0),
			Args:            "lkj",
			WantStatusCode:  http.StatusBadRequest,
			WantData:        models.BaseSpace{},
		},
	}

	client := http.Client{}

	for _, test := range tests {
		t.Run(test.Name, func(t *testing.T) {
			url := fmt.Sprintf("%s/%s", test.Url, test.Args)

			spaceResponse, teardownFunc := helpers.MakeRequest[map[string]models.Space](t, client, http.MethodGet, url, nil, test.WantStatusCode, test.CurrentTestUser, helpers.Tc.AuthClient)
			t.Cleanup(teardownFunc)
			if spaceResponse == nil {
				return
			}

			gotSpace, ok := (*spaceResponse)["data"]
			if !ok {
				t.Fatalf("spaceResponse[\"data\"] ok = %v; want = true", ok)
			}

			assert.Equal(t, gotSpace.BaseSpace, test.WantData)
			assert.Equal(t, gotSpace.ID.String(), test.Args)
		})
	}
}
