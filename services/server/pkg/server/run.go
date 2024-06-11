package server

import (
	"context"
	"fmt"
	"net"
	"net/http"
	"os"
	"os/signal"
	"runtime"
	"spaces-p/pkg/common"
	"spaces-p/pkg/errors"
	"spaces-p/pkg/redis"
	"time"

	"github.com/gin-contrib/cors"
)

type EnvVarGetter func(string) (string, error)

func Run(
	ctx context.Context,
	logger common.Logger,
	getenv EnvVarGetter,
	authClient common.AuthClient,
	geoCodeRepo common.GeocodeRepository,
) error {
	var op errors.Op = "main.run"
	ctx, cancel := signal.NotifyContext(ctx, os.Interrupt)
	defer cancel()

	logger.Info("GOMAXPROCS: >> ", runtime.GOMAXPROCS(0))

	cors := cors.New(cors.Config{
		// TODO: AllowOrigins based on production or development environment
		AllowOrigins:     []string{"http://localhost:3000"},
		AllowMethods:     []string{"GET", "POST", "PUT", "DELETE"},
		AllowCredentials: true,
		MaxAge:           12 * time.Hour,
	})

	redisPort, err := getenv("REDIS_PORT")
	if err != nil {
		return errors.E(op, err)
	}

	redisHost, err := getenv("REDIS_HOST")
	if err != nil {
		return errors.E(op, err)
	}

	// initialize redis client
	redisClient := redis.GetRedisClient(redisHost, redisPort)

	// initialize postgres client
	// postgresClient, err := postgres.GetPostgresClient()
	// if err != nil {
	// 	return errors.E(op, err)
	// }

	apiVersion, err := getenv("API_VERSION")
	if err != nil {
		return errors.E(op, err)
	}

	port, err := getenv("PORT")
	if err != nil {
		return errors.E(op, err)
	}

	host, err := getenv("HOST")
	if err != nil {
		return errors.E(op, err)
	}

	srv := NewServer(apiVersion, logger, cors, redisClient, nil, authClient, geoCodeRepo)

	httpServer := &http.Server{
		Addr:    net.JoinHostPort(host, port),
		Handler: srv,
	}

	go func() {
		logger.Info("listening on ", httpServer.Addr)
		if err = httpServer.ListenAndServe(); err != nil && err != http.ErrServerClosed {
			fmt.Fprintf(os.Stderr, "error listening and serving: %s\n", err)
		}
	}()

	<-ctx.Done()
	shutdownCtx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()
	if err := httpServer.Shutdown(shutdownCtx); err != nil {
		return errors.E(op, err)
	}

	return nil
}
