package e2e

import (
	"context"
	"encoding/json"
	"io"
	"net/http"
	"spaces-p/common"
	"spaces-p/models"
	"testing"
)

func isSuccessStatusCode(t *testing.T, statusCode int) bool {
	t.Helper()

	return statusCode >= http.StatusOK && statusCode <= http.StatusIMUsed
}

func createTestUsers(ctx context.Context, t *testing.T, repo common.CacheRepository) []models.BaseUser {
	// set up all users
	for _, user := range TestUsers {
		if err := repo.SetUser(ctx, models.NewUser(user)); err != nil {
			t.Fatalf("redisRepo.SetUser() err = %s; want nil", err)
		}
	}

	return TestUsers
}

func createTestSpaces(ctx context.Context, t *testing.T, repo common.CacheRepository) []*models.Space {
	createdTestSpaces := make([]*models.Space, len(testSpaces))

	for i, testSpace := range testSpaces {
		spaceId, err := repo.SetSpace(ctx, models.NewSpace{BaseSpace: testSpace.BaseSpace, AdminId: testSpace.AdminId})
		if err != nil {
			t.Fatalf("repo.SetSpace() err = %s; want nil", err)
		}

		copiedTestSpace := *testSpace
		createdTestSpaces[i] = &copiedTestSpace
		createdTestSpaces[i].ID = spaceId
	}

	return createdTestSpaces
}

// makes a request and when the status code of the response is in the 200er range, then it parses the response body and returns it.
// If the response status code is not in the 200er range, it returns nil as the first return value.
func makeRequest[T any](
	t *testing.T,
	httpClient http.Client,
	method, url string,
	requestBody io.Reader,
	wantStatusCode int,
	asUser models.BaseUser,
	authClient *EmptyAuthClient,
) (*T, func()) {
	t.Helper()

	authClient.setCurrentTestUser(asUser)
	defer authClient.setCurrentTestUser(models.BaseUser{})

	req, err := http.NewRequest(method, url, requestBody)
	if err != nil {
		t.Fatalf("http.NewRequest() err = %s; want nil", err)
	}
	req.Header.Add("Authorization", "Bearer fake_bearer_token")

	resp, err := httpClient.Do(req)
	if err != nil {
		t.Fatalf("client.Do() err = %s; want nil", err)
	}

	teardownFunc := func() {
		resp.Body.Close()
	}

	if resp.StatusCode != wantStatusCode {
		t.Errorf("resp.StatusCode got = %d; want = %d", resp.StatusCode, wantStatusCode)
	}

	if !isSuccessStatusCode(t, resp.StatusCode) {
		return nil, teardownFunc
	}

	responseBody, err := io.ReadAll(resp.Body)
	if err != nil {
		t.Fatalf("io.ReadAll err = %s; want nil", err)
	}

	var spaceResponse T
	err = json.Unmarshal(responseBody, &spaceResponse)
	if err != nil {
		t.Fatalf("json.Unmarshal() err = %s; want nil", err)
	}

	return &spaceResponse, teardownFunc
}
