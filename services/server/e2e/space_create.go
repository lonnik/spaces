package e2e

import (
	"bytes"
	"context"
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"spaces-p/models"
	"spaces-p/repositories/redis_repo"
	"spaces-p/uuid"
	"testing"

	"github.com/stretchr/testify/assert"
)

func getCreateSpaceTests(url string) []test[models.BaseSpace, models.BaseSpace] {
	return []test[models.BaseSpace, models.BaseSpace]{
		{
			name:            "create space",
			url:             url,
			currentTestUser: TestUsers["user1"],
			args:            (*testSpaces["space1"]).BaseSpace,
			wantStatusCode:  http.StatusOK,
			wantData:        (*testSpaces["space1"]).BaseSpace,
		},
	}
}

func TestCreateSpace(
	ctx context.Context,
	t *testing.T,
	apiEndpoint string,
	redisRepo *redis_repo.RedisRepository,
	authClient *EmptyAuthClient,
) {
	// arrange
	url := fmt.Sprintf("%s/spaces", apiEndpoint)
	tests := getCreateSpaceTests(url)

	for _, test := range tests {
		t.Run(test.name, func(t *testing.T) {
			authClient.setCurrentTestUser(test.currentTestUser) // this user is used as admin id

			client := http.Client{}

			// act
			newSpaceJSON, err := json.Marshal(test.args)
			if err != nil {
				t.Fatalf("json.Marshal() err = %s; want nil", err)
			}

			req, err := http.NewRequest(http.MethodPost, url, bytes.NewReader(newSpaceJSON))
			if err != nil {
				t.Fatalf("http.NewRequest() err = %s; want nil", err)
			}
			req.Header.Add("Authorization", "Bearer fake_bearer_token")

			resp, err := client.Do(req)
			if err != nil {
				t.Fatalf("client.Do() err = %s; want nil", err)
			}
			defer resp.Body.Close()

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

			createdSpace, err := redisRepo.GetSpace(ctx, spaceId)
			if err != nil {
				t.Fatalf("redisRepo.GetSpace() err = %s; want nil", err)
			}

			assert.Equal(t, test.currentTestUser.ID, createdSpace.AdminId)
			assert.Equal(t, test.wantData, createdSpace.BaseSpace)
		})
	}
}
