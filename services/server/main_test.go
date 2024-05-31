package main

import (
	"context"
	"fmt"
	"spaces-p/common"
	"spaces-p/models"
	"testing"
)

var users = map[string]models.BaseUser{
	"user1": {
		ID:        models.UserUid("user1"),
		Username:  "niko",
		FirstName: "Nikolas",
		LastName:  "Heidner",
		AvatarUrl: "https://www.avatars.com/niko",
	},
	"user2": {
		ID:        models.UserUid("user2"),
		Username:  "luka",
		FirstName: "Luka",
		LastName:  "Stärk",
		AvatarUrl: "https://www.avatars.com/luka",
	},
	"user3": {
		ID:        models.UserUid("user3"),
		Username:  "przemi",
		FirstName: "Przemek",
		LastName:  "Borucki",
		AvatarUrl: "https://www.avatars.com/przemi",
	},
}

type emptyAuthClient struct {
	currentTestUser *models.BaseUser
}

func (tac *emptyAuthClient) VerifyToken(ctx context.Context, idToken string) (*common.UserTokenData, error) {
	return &common.UserTokenData{
		SignInProvider:  "email",
		EmailIsVerified: true,
		BaseUser:        *tac.getCurrentTestUser(),
	}, nil
}

func (tac *emptyAuthClient) CreateUser(ctx context.Context, email, password string, emailIsVerified bool) (models.UserUid, error) {
	return "", nil
}

func (tac *emptyAuthClient) getCurrentTestUser() *models.BaseUser {
	return tac.currentTestUser
}

func (tac *emptyAuthClient) setCurrentTestUser(newCurrentTestUser models.BaseUser) {
	tac.currentTestUser = &newCurrentTestUser
}

func TestApi(t *testing.T) {
	var ctx = context.Background()

	redisHost, redisPort, redisRepo, teardownFunc := setupTestEnv(ctx, t, users)
	defer t.Cleanup(teardownFunc)

	apiVersion := "v1"
	serverPort := "8081"

	getEnv := func(key string) (string, error) {
		switch key {
		case "REDIS_PORT":
			return redisPort, nil
		case "REDIS_HOST":
			return redisHost, nil
		case "API_VERSION":
			return apiVersion, nil
		case "GOOGLE_GEOCODE_API_KEY":
			return "1234", nil
		case "PORT":
			return serverPort, nil
		default:
			return "", fmt.Errorf("no value found for key: %s", key)
		}
	}

	ctx, cancel := context.WithCancel(ctx)
	t.Cleanup(cancel)

	authClient := &emptyAuthClient{}

	apiEndpoint := runServer(ctx, t, getEnv, authClient, apiVersion, serverPort)

	t.Run("GET /spaces", func(t *testing.T) {
		testGetSpaces(ctx, t, apiEndpoint, redisRepo, authClient)
	})
}
