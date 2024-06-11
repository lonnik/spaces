package helpers

import (
	"bytes"
	"context"
	"fmt"
	"log"
	"net"
	"net/url"
	"os"
	"spaces-p/pkg/common"
	"spaces-p/pkg/redis"
	"spaces-p/pkg/repositories/redis_repo"
	"spaces-p/pkg/server"
	"spaces-p/pkg/utils"
	"spaces-p/pkg/zerologger"
	"testing"
	"time"

	"github.com/rs/zerolog"
	"github.com/testcontainers/testcontainers-go"
	"github.com/testcontainers/testcontainers-go/wait"
)

func SetupE2EEnv(apiVersion, serverPort string) (func(), error) {
	ctx := context.Background()

	redisHost, redisPort, redisRepo, teardownRedisFunc, err := setupRedis(ctx)
	if err != nil {
		return nil, err
	}

	Tc.Repo = redisRepo

	var getEnv server.EnvVarGetter = func(key string) (string, error) {
		switch key {
		case "REDIS_PORT":
			return redisPort, nil
		case "REDIS_HOST":
			return redisHost, nil
		case "API_VERSION":
			return apiVersion, nil
		case "GOOGLE_GEOCODE_API_KEY":
			return "1234", nil
		case "HOST":
			return "localhost", nil
		case "PORT":
			return serverPort, nil
		default:
			return "", fmt.Errorf("no value found for key: %s", key)
		}
	}

	ctx, cancel := context.WithCancel(ctx)

	Tc.AuthClient = &StubAuthClient{}
	Tc.GeocodeRepo = &SpyGeocodeRepository{}

	os.Setenv("ENVIRONMENT", "test")
	os.Setenv("GIN_MODE", "test")

	teardownFunc := func() {
		teardownRedisFunc()
		cancel()
		os.Unsetenv("ENVIRONMENT")
		os.Unsetenv("GIN_MODE")
	}

	Tc.ApiEndpoint, err = runServer(ctx, getEnv, Tc.AuthClient, apiVersion, serverPort, Tc.GeocodeRepo)
	if err != nil {
		teardownFunc()
		return nil, err
	}

	return teardownFunc, nil
}

func setupRedis(ctx context.Context) (redisHost, redisPort string, redisRepo *redis_repo.RedisRepository, teardownFunc func(), err error) {
	redisEndpoint, teardownFunc, err := setupRedisContainer(ctx)
	if err != nil {
		return "", "", nil, nil, err
	}

	redisHost, redisPort, err = net.SplitHostPort(redisEndpoint)
	if err != nil {
		return "", "", nil, nil, err
	}

	redisClient := redis.GetRedisClient(redisHost, redisPort)
	redisRepo = redis_repo.NewRedisRepository(redisClient)

	return redisHost, redisPort, redisRepo, teardownFunc, nil
}

func runServer(
	ctx context.Context,
	getEnv server.EnvVarGetter,
	authClient common.AuthClient,
	apiVersion, port string,
	geoCodeRepo common.GeocodeRepository,
) (apiEndpoint string, err error) {
	var logger common.Logger
	if testing.Verbose() {
		consoleWriter := zerolog.ConsoleWriter{
			Out:        os.Stdout,
			TimeFormat: time.RFC3339,
		}
		logger = zerologger.New(consoleWriter)
	} else {
		logger = &NoopLogger{}
	}

	go func() {
		if err := server.Run(ctx, logger, getEnv, authClient, geoCodeRepo); err != nil {
			fmt.Fprintf(os.Stderr, "%v\n", err)
		}
	}()

	apiEndpoint = (&url.URL{
		Scheme: "http",
		Host:   net.JoinHostPort("localhost", port),
		Path:   "/" + apiVersion,
	}).String()

	healthEndpoint := apiEndpoint + "/healthz"

	utils.WaitForReady(ctx, 500*time.Millisecond, healthEndpoint)

	return apiEndpoint, nil
}

func setupRedisContainer(ctx context.Context) (endpoint string, teardownFunc func(), err error) {
	var logger = testcontainers.Logger
	if !testing.Verbose() {
		buf := &bytes.Buffer{}
		logger = log.New(buf, "", log.LstdFlags)
	}

	req := testcontainers.ContainerRequest{
		Image:        "redis:latest",
		ExposedPorts: []string{"6379/tcp"},
		WaitingFor:   wait.ForLog("Ready to accept connections"),
	}

	redisC, err := testcontainers.GenericContainer(ctx, testcontainers.GenericContainerRequest{
		ContainerRequest: req,
		Started:          true,
		Logger:           logger,
	})
	if err != nil {
		err = fmt.Errorf("could not start redis: %s", err)
		return "", nil, err
	}

	teardownFunc = func() {
		if err := redisC.Terminate(ctx); err != nil {
			fmt.Fprintf(os.Stderr, "could not stop redis: %s", err)
		}
	}

	endpoint, err = redisC.Endpoint(ctx, "")
	if err != nil {
		teardownFunc()
		return "", nil, fmt.Errorf("could not get redis endpoint: %s", err)
	}

	return endpoint, teardownFunc, nil
}
