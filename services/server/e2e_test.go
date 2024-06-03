package main

import (
	"context"
	"flag"
	"fmt"
	"spaces-p/e2e"
	"testing"
)

var isE2Etest = flag.Bool("e2e", false, "use E2E tests")

func TestApi(t *testing.T) {
	if !*isE2Etest {
		t.Skip()
	}

	var ctx = context.Background()

	redisHost, redisPort, redisRepo, teardownFunc := setupTestEnv(ctx, t)
	t.Cleanup(teardownFunc)

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

	authClient := &e2e.EmptyAuthClient{}

	apiEndpoint := runServer(ctx, t, getEnv, authClient, apiVersion, serverPort)

	t.Setenv("ENVIRONMENT", "test")

	t.Run("GET /spaces", func(t *testing.T) {
		e2e.TestGetSpaces(ctx, t, apiEndpoint, redisRepo, authClient)
	})
	t.Run("POST /spaces", func(t *testing.T) {
		e2e.TestCreateSpace(ctx, t, apiEndpoint, redisRepo, authClient)
	})
	t.Run("GET /space", func(t *testing.T) {
		e2e.TestGetSpace(ctx, t, apiEndpoint, redisRepo, authClient)
	})
}
