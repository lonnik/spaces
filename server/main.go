package main

import (
	"os"
	"runtime"
	"spaces-p/controllers"
	"spaces-p/firebase"
	"spaces-p/middlewares"
	"spaces-p/redis"
	"spaces-p/repositories/redis_repo"
	"spaces-p/services"
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

	// initialize firebase auth client
	if err := firebase.InitAuthClient(); err != nil {
		panic(err)
	}

	cors := cors.New(cors.Config{
		// todo AllowOrigins based on production or development environment
		AllowOrigins:     []string{"http://localhost:3000"},
		AllowMethods:     []string{"GET", "POST", "PUT", "DELETE"},
		AllowCredentials: true,
		MaxAge:           12 * time.Hour,
	})

	// initialize redis client
	redis.ConnectRedis()

	// set up cache repo
	redisRepo := redis_repo.NewRedisRepository(redis.RedisClient)

	// set up services
	userService := services.NewUserService(logger, redisRepo)

	// set up controllers
	userController := controllers.NewUserController(logger, userService)

	router := gin.New()
	router.Use(middlewares.GinZerologLogger(logger), gin.Recovery(), cors)
	api := router.Group("/api")

	api.POST("/users", userController.CreateUser)
	api.GET("/users/:userid", middlewares.EnsureAuthenticated(logger, redisRepo, true, true), userController.GetUser)
	api.GET("/user", middlewares.EnsureAuthenticated(logger, redisRepo, false, false), userController.GetAuthedUser)

	router.Run()
}
