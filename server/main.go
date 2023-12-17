package main

import (
	"os"
	"runtime"
	"spaces-p/controllers"
	"spaces-p/middlewares"
	"spaces-p/zerologger"
	"time"

	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
	"github.com/rs/zerolog"
)

func main() {
	// err := godotenv.Load(".env")
	// if err != nil {
	// 	panic("Error loading .env file")
	// }

	// Zerolog configuration
	logFile, err := os.Create("logfile.log")
	if err != nil {
		panic("Error creating logfile.log: >> " + err.Error())
	}
	defer logFile.Close()

	consoleWriter := zerolog.ConsoleWriter{
		Out:        os.Stdout,
		TimeFormat: time.RFC3339,
	}
	multi := zerolog.MultiLevelWriter(consoleWriter, logFile)
	logger := zerologger.New(multi)

	logger.Info("GOMAXPROCS: >> ", runtime.GOMAXPROCS(0))

	cors := cors.New(cors.Config{
		// todo AllowOrigins based on production or development environment
		AllowOrigins:     []string{"http://localhost:3000"},
		AllowMethods:     []string{"GET", "POST", "PUT", "DELETE"},
		AllowCredentials: true,
		MaxAge:           12 * time.Hour,
	})

	userController := controllers.NewUserController(logger)

	router := gin.New()
	router.Use(middlewares.GinZerologLogger(logger), gin.Recovery(), cors)
	api := router.Group("/api")

	api.GET("/google-oauthcallback", userController.GoogleOAuthCallback)

	router.Run()
}
