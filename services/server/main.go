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
	"spaces-p/postgres"
	"spaces-p/redis"
	"spaces-p/zerologger"
	"time"

	"github.com/gin-contrib/cors"
	"github.com/joho/godotenv"
	"github.com/rs/zerolog"
)

type config struct {
	Port string
	Host string
}

func run(ctx context.Context, stdout io.Writer, logfileName string) error {
	var op errors.Op = "main.run"
	ctx, cancel := signal.NotifyContext(ctx, os.Interrupt)
	defer cancel()

	if os.Getenv("ENVIRONMENT") == "development" {
		err := godotenv.Load(".env")
		if err != nil {
			return errors.E(op, err)
		}
	}

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

	// initialize redis client
	redisClient := redis.GetRedisClient()

	// initialize postgres client
	postgresClient, err := postgres.GetPostgresClient()
	if err != nil {
		return errors.E(op, err)
	}

	// TODO: find way how handle config/env vars suitable with running tests
	config := config{
		Port: ":8080",
		Host: "localhost",
	}

	srv := NewServer(logger, cors, redisClient, postgresClient)

	httpServer := &http.Server{
		Addr:    net.JoinHostPort(config.Host, config.Port),
		Handler: srv,
	}

	go func() {
		logger.Info("listening on %s\n", httpServer.Addr)
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
	var ctx = context.Background()

	if err := run(ctx, os.Stdout, "logfile.log"); err != nil {
		fmt.Fprintf(os.Stderr, "%s\n", err)
		os.Exit(1)
	}
}
