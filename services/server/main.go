package main

import (
	"context"
	"fmt"
	"io"
	"net"
	"net/http"
	"os"
	"os/signal"
	"runtime"
	"spaces-p/errors"
	"spaces-p/firebase"
	"spaces-p/redis"
	"spaces-p/zerologger"
	"time"

	"github.com/gin-contrib/cors"
	"github.com/joho/godotenv"
	"github.com/rs/zerolog"
)

func run(ctx context.Context, stdout io.Writer, logfileName string, getenv func(string) (string, error)) error {
	var op errors.Op = "main.run"
	ctx, cancel := signal.NotifyContext(ctx, os.Interrupt)
	defer cancel()

	// Zerolog configuration
	logFile, err := os.Create(logfileName)
	if err != nil {
		return errors.E(op, err)
	}
	defer logFile.Close()

	consoleWriter := zerolog.ConsoleWriter{
		Out:        stdout,
		TimeFormat: time.RFC3339,
	}
	multi := zerolog.MultiLevelWriter(consoleWriter, logFile)
	logger := zerologger.New(multi)
	logger.Info("GOMAXPROCS: >> ", runtime.GOMAXPROCS(0))

	// initialize firebase auth client
	if err := firebase.InitAuthClient(); err != nil {
		return errors.E(op, err)
	}

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

	// initialize redis client
	redisClient := redis.GetRedisClient(redisPort)

	// initialize postgres client
	// postgresClient, err := postgres.GetPostgresClient()
	// if err != nil {
	// 	return errors.E(op, err)
	// }

	// TODO: find way how handle config/env vars suitable with running tests

	apiVersion, err := getenv("API_VERSION")
	if err != nil {
		return errors.E(op, err)
	}

	googleGeocodeApiKey, err := getenv("GOOGLE_GEOCODE_API_KEY")
	if err != nil {
		return errors.E(op, err)
	}

	port, err := getenv("PORT")
	if err != nil {
		return errors.E(op, err)
	}

	srv := NewServer(apiVersion, logger, cors, redisClient, nil, googleGeocodeApiKey)

	httpServer := &http.Server{
		Addr:    net.JoinHostPort("localhost", port),
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

func main() {
	ctx := context.Background()

	if os.Getenv("ENVIRONMENT") == "development" {
		err := godotenv.Load(".env")
		if err != nil {
			fmt.Fprintf(os.Stderr, "%s\n", err)
			os.Exit(1)
		}
	}

	port := "8080"
	if os.Getenv("PORT") != "" {
		port = os.Getenv("PORT")
	}

	envVars := map[string]string{
		"DB_HOST":                os.Getenv("DB_HOST"),
		"DB_USER":                os.Getenv("DB_USER"),
		"DB_PASSWORD":            os.Getenv("DB_PASSWORD"),
		"DB_NAME":                os.Getenv("DB_NAME"),
		"ENVIRONMENT":            os.Getenv("ENVIRONMENT"),
		"API_VERSION":            os.Getenv("API_VERSION"),
		"REDIS_PORT":             os.Getenv("REDIS_PORT"),
		"GOOGLE_GEOCODE_API_KEY": os.Getenv("GOOGLE_GEOCODE_API_KEY"),
		"PORT":                   port,
	}

	getEnv := func(key string) (string, error) {
		val, ok := envVars[key]
		if val == "" || !ok {
			err := fmt.Errorf("no value found for key: %s", key)
			return "", err
		}

		return val, nil
	}

	if err := run(ctx, os.Stdout, "logfile.log", getEnv); err != nil {
		fmt.Fprintf(os.Stderr, "%s\n", err)
		os.Exit(1)
	}
}
