package main

import (
	"context"
	"net"
	"net/url"
	"os"
	"spaces-p/common"
	"spaces-p/redis"
	"spaces-p/repositories/redis_repo"
	"testing"
	"time"
)

func setupTestEnv(ctx context.Context, t *testing.T) (redisHost, redisPort string, redisRepo *redis_repo.RedisRepository, teardownFunc func()) {
	redisEndpoint, teardownFunc := setupRedis(ctx, t)

	redisHost, redisPort, err := net.SplitHostPort(redisEndpoint)
	if err != nil {
		t.Fatalf("net.SplitHostPort() err = %s; want = nil", err)
	}

	redisClient := redis.GetRedisClient(redisHost, redisPort)
	redisRepo = redis_repo.NewRedisRepository(redisClient)

	return redisHost, redisPort, redisRepo, teardownFunc
}

func runServer(
	ctx context.Context,
	t *testing.T,
	getEnv func(string) (string, error),
	authClient common.AuthClient,
	apiVersion, port string,
	geoCodeRepo common.GeocodeRepository,
) (apiEndpoint string) {
	go func() {
		if err := run(ctx, os.Stdout, "logfile_test.log", getEnv, authClient, geoCodeRepo); err != nil {
			t.Errorf("run(() err = %s; want nil", err)
		}
	}()

	apiEndpoint = (&url.URL{
		Scheme: "http",
		Host:   net.JoinHostPort("localhost", port),
		Path:   "/" + apiVersion,
	}).String()

	healthEndpoint := apiEndpoint + "/healthz"

	waitForReady(ctx, t, 500*time.Millisecond, healthEndpoint)

	return apiEndpoint
}
