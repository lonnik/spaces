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

func TestGetAddress(t *testing.T) {
	// create and clean data
	ctx := context.Background()

	helpers.CreateTestUsers(ctx, t, helpers.Tc.Repo)

	t.Cleanup(func() {
		err := helpers.Tc.Repo.DeleteAllKeys()
		if err != nil {
			t.Fatalf("helpers.Tc.Repo.DeleteAllKeys() err = %s; want nil", err)
		}
	})

	// NOTE: tests are order dependent
	tests := []helpers.Test[models.Address, struct {
		address     *models.Address
		calledCount int
	}]{
		{
			Name:            "get address",
			Url:             fmt.Sprintf("%s/address?location=13.419955,52.555098", helpers.Tc.ApiEndpoint),
			CurrentTestUser: helpers.UserFixtures[0],
			Args:            *helpers.AddressFixtures[0],
			WantStatusCode:  http.StatusOK,
			WantData: struct {
				address     *models.Address
				calledCount int
			}{address: helpers.AddressFixtures[0], calledCount: 1},
		},
		{
			Name:            "get cached address again",
			Url:             fmt.Sprintf("%s/address?location=13.419955,52.555098", helpers.Tc.ApiEndpoint),
			CurrentTestUser: helpers.UserFixtures[0],
			Args:            *helpers.AddressFixtures[0],
			WantStatusCode:  http.StatusOK,
			WantData: struct {
				address     *models.Address
				calledCount int
			}{address: helpers.AddressFixtures[0], calledCount: 0},
		},
		{
			Name:            "get address 2",
			Url:             fmt.Sprintf("%s/address?location=13.422442,52.555113", helpers.Tc.ApiEndpoint),
			CurrentTestUser: helpers.UserFixtures[0],
			Args:            *helpers.AddressFixtures[1],
			WantStatusCode:  http.StatusOK,
			WantData: struct {
				address     *models.Address
				calledCount int
			}{address: helpers.AddressFixtures[1], calledCount: 1},
		},
		{
			Name:            "get address with invalid location",
			Url:             fmt.Sprintf("%s/address?location=-13.422442,91.555113", helpers.Tc.ApiEndpoint),
			CurrentTestUser: helpers.UserFixtures[0],
			Args:            *helpers.AddressFixtures[0],
			WantStatusCode:  http.StatusBadRequest,
			WantData: struct {
				address     *models.Address
				calledCount int
			}{},
		},
		{
			Name:            "get address with missing location",
			Url:             fmt.Sprintf("%s/address", helpers.Tc.ApiEndpoint),
			CurrentTestUser: helpers.UserFixtures[0],
			Args:            *helpers.AddressFixtures[0],
			WantStatusCode:  http.StatusBadRequest,
			WantData: struct {
				address     *models.Address
				calledCount int
			}{},
		},
	}

	httpClient := http.Client{}
	for _, test := range tests {
		t.Run(test.Name, func(t *testing.T) {
			helpers.Tc.GeocodeRepo.SetTestAddress(test.Args, nil)
			t.Cleanup(func() {
				helpers.Tc.GeocodeRepo.Reset()
			})
			addressResp, teardownFunc := helpers.MakeRequest[map[string]*models.Address](
				t,
				httpClient,
				http.MethodGet,
				test.Url,
				nil,
				test.WantStatusCode,
				test.CurrentTestUser,
				helpers.Tc.AuthClient,
			)
			t.Cleanup(teardownFunc)
			if addressResp == nil {
				return
			}

			address, ok := (*addressResp)["data"]
			if !ok {
				t.Fatalf("addressResp[\"data\"] ok = %t; want true", ok)
			}
			assert.Equal(t, test.WantData.calledCount, helpers.Tc.GeocodeRepo.Count())
			assert.Equal(t, test.WantData.address, address)
		})
	}
}
