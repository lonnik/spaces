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

func TestGetAddress(
	ctx context.Context,
	t *testing.T,
	apiEndpoint string,
	repo common.CacheRepository,
	authClient *EmptyAuthClient,
	geocodeRepo *SpyGeocodeRepository,
) {
	// create and clean data
	createTestUsers(ctx, t, repo)

	t.Cleanup(func() {
		err := repo.DeleteAllKeys()
		if err != nil {
			t.Fatalf("repo.DeleteAllKeys() err = %s; want nil", err)
		}
	})

	// tests are order dependent
	tests := []test[models.Address, struct {
		address     *models.Address
		calledCount int
	}]{
		{
			name:            "get address",
			url:             fmt.Sprintf("%s/address?location=13.419955,52.555098", apiEndpoint),
			currentTestUser: TestUsers[0],
			args:            *testAddresses[0],
			wantStatusCode:  http.StatusOK,
			wantData: struct {
				address     *models.Address
				calledCount int
			}{address: testAddresses[0], calledCount: 1},
		},
		{
			name:            "get cached address again",
			url:             fmt.Sprintf("%s/address?location=13.419955,52.555098", apiEndpoint),
			currentTestUser: TestUsers[0],
			args:            *testAddresses[0],
			wantStatusCode:  http.StatusOK,
			wantData: struct {
				address     *models.Address
				calledCount int
			}{address: testAddresses[0], calledCount: 0},
		},
		{
			name:            "get address 2",
			url:             fmt.Sprintf("%s/address?location=13.422442,52.555113", apiEndpoint),
			currentTestUser: TestUsers[0],
			args:            *testAddresses[1],
			wantStatusCode:  http.StatusOK,
			wantData: struct {
				address     *models.Address
				calledCount int
			}{address: testAddresses[1], calledCount: 1},
		},
		{
			name:            "get address with invalid location",
			url:             fmt.Sprintf("%s/address?location=-13.422442,91.555113", apiEndpoint),
			currentTestUser: TestUsers[0],
			args:            *testAddresses[0],
			wantStatusCode:  http.StatusBadRequest,
			wantData: struct {
				address     *models.Address
				calledCount int
			}{},
		},
		{
			name:            "get address with missing location",
			url:             fmt.Sprintf("%s/address", apiEndpoint),
			currentTestUser: TestUsers[0],
			args:            *testAddresses[0],
			wantStatusCode:  http.StatusBadRequest,
			wantData: struct {
				address     *models.Address
				calledCount int
			}{},
		},
	}

	httpClient := http.Client{}
	for _, test := range tests {
		t.Run(test.name, func(t *testing.T) {
			geocodeRepo.setTestAddress(test.args, nil)
			t.Cleanup(func() {
				geocodeRepo.reset()
			})
			addressResp, teardownFunc := makeRequest[map[string]*models.Address](
				t,
				httpClient,
				http.MethodGet,
				test.url,
				nil,
				test.wantStatusCode,
				test.currentTestUser,
				authClient,
			)
			t.Cleanup(teardownFunc)
			if addressResp == nil {
				return
			}

			address, ok := (*addressResp)["data"]
			if !ok {
				t.Fatalf("addressResp[\"data\"] ok = %t; want true", ok)
			}
			assert.Equal(t, test.wantData.calledCount, geocodeRepo.calledCount)
			assert.Equal(t, test.wantData.address, address)
		})
	}
}
