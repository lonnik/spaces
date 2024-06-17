package main

import (
	"context"
	"fmt"
	"os"
	"spaces-p/pkg/firebase"
	googlegeocode "spaces-p/pkg/repositories/google_geocode"
	"spaces-p/pkg/server"
	"spaces-p/pkg/utils"
	"spaces-p/pkg/zerologger"
	"time"

	"github.com/joho/godotenv"
	"github.com/rs/zerolog"
)

var (
	firebaseCredentialsFilename = "./secrets/firebase_service_account_key.json"
)

func main() {
	ctx := context.Background()

	if os.Getenv("ENVIRONMENT") == "development" {
		err := godotenv.Load(".env")
		exitOnError(err)
	}

	firebaseAuthClient, err := firebase.NewFirebaseAuthClient(context.Background(), firebaseCredentialsFilename)
	exitOnError(err)

	googleGeocodeApiKey, err := utils.GetEnv("GOOGLE_GEOCODE_API_KEY")
	exitOnError(err)

	googleGeocodeRepo := googlegeocode.NewGoogleGeocodeRepo(googleGeocodeApiKey)

	// logger configuration
	logFile, err := os.Create("logfile.log")
	exitOnError(err)
	defer logFile.Close()

	consoleWriter := zerolog.ConsoleWriter{
		Out:        os.Stdout,
		TimeFormat: time.RFC3339,
	}
	multi := zerolog.MultiLevelWriter(consoleWriter, logFile)
	logger := zerologger.New(multi)

	err = server.Run(ctx, logger, utils.GetEnv, firebaseAuthClient, googleGeocodeRepo)
	exitOnError(err)
}

func exitOnError(err error) {
	if err != nil {
		fmt.Fprintf(os.Stderr, "%s\n", err)
		os.Exit(1)
	}
}
