package main

import (
	"context"
	"net/http"
	"testing"
	"time"

	"github.com/testcontainers/testcontainers-go"
	"github.com/testcontainers/testcontainers-go/wait"
)

func waitForReady(
	ctx context.Context,
	t *testing.T,
	timeoutDuration time.Duration,
	endpoint string,
) {
	t.Helper()

	timeout := time.After(timeoutDuration)

	client := &http.Client{}
	for {
		req, err := http.NewRequestWithContext(ctx, http.MethodGet, endpoint, nil)
		if err != nil {
			t.Fatal(err)
			return
		}
		res, err := client.Do(req)
		switch {
		case err != nil:
			t.Logf("error making request: %s", err.Error())
		case res.StatusCode == http.StatusOK:
			res.Body.Close()
			t.Log("endpoint is ready!")
			return
		default:
			res.Body.Close()
		}

		select {
		case <-ctx.Done():
			t.Fatalf("context cancelled: %s", ctx.Err().Error())
			return
		case <-timeout:
			t.Fatal("timeout reached")
			return
		default:
			time.Sleep(100 * time.Millisecond)
			continue
		}
	}
}

func setupRedis(ctx context.Context, t *testing.T) (endpoint string, teardownFunc func()) {
	t.Helper()

	req := testcontainers.ContainerRequest{
		Image:        "redis:latest",
		ExposedPorts: []string{"6379/tcp"},
		WaitingFor:   wait.ForLog("Ready to accept connections"),
	}
	redisC, err := testcontainers.GenericContainer(ctx, testcontainers.GenericContainerRequest{
		ContainerRequest: req,
		Started:          true,
	})
	if err != nil {
		t.Fatalf("could not start redis: %s", err)
	}

	teardownFunc = func() {
		if err := redisC.Terminate(ctx); err != nil {
			t.Fatalf("could not stop redis: %s", err)
		}
	}

	endpoint, err = redisC.Endpoint(ctx, "")
	if err != nil {
		t.Error(err)
		teardownFunc()
	}

	return endpoint, teardownFunc
}
