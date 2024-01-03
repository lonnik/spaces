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
	"github.com/joho/godotenv"
	"github.com/rs/zerolog"
)

func main() {
	err := godotenv.Load(".env")
	if err != nil {
		panic("Error loading .env file")
	}

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
	spaceService := services.NewSpaceService(logger, redisRepo)
	threadService := services.NewThreadService(logger, redisRepo)
	messageService := services.NewMessageService(logger, redisRepo)

	// set up controllers
	userController := controllers.NewUserController(logger, userService)
	spaceController := controllers.NewSpaceController(logger, spaceService, threadService, messageService)

	router := gin.New()
	router.Use(middlewares.GinZerologLogger(logger), gin.Recovery(), cors)
	api := router.Group("/api")

	// middleware functions
	validateThreadInSpaceMiddleware := middlewares.ValidateThreadInSpace(logger, redisRepo)
	validateMessageInThreadMiddleware := middlewares.ValidateMessageInThread(logger, redisRepo)

	// USERS
	api.POST("/users", userController.CreateUserFromIdToken)
	api.GET("/users/:userid", middlewares.EnsureAuthenticated(logger, redisRepo, true, true), userController.GetUser)

	// AUTHENTICATED USER
	api.GET("/user", middlewares.EnsureAuthenticated(logger, redisRepo, false, false), userController.GetAuthedUser)
	api.PUT("/user", middlewares.EnsureAuthenticated(logger, redisRepo, true, false)) // TODO
	api.DELETE("/user")                                                               // TODO

	// SPACES
	api.GET("/spaces", spaceController.GetSpaces)
	api.POST("/spaces", spaceController.CreateSpace)
	api.GET("/spaces/:spaceid")             // TODO NEXT: space
	api.GET("/spaces/:spaceid/subscribers") // TODO NEXT: space, subscribers, active subscribers, toplevel threads with 5 recent and 5 most popular messages
	api.GET("/spaces/:spaceid/toplevel-threads",
		spaceController.GetTopLevelThreads,
	)
	api.POST("/spaces/:spaceid/toplevel-threads",
		middlewares.EnsureAuthenticated(logger, redisRepo, true, false),
		spaceController.CreateTopLevelThread,
	)
	api.POST("/spaces/:spaceid/threads/:threadid/messages/:messageid/threads",
		validateThreadInSpaceMiddleware,
		validateMessageInThreadMiddleware,
		spaceController.CreateThread,
	)
	api.GET("/spaces/:spaceid/threads/:threadid",
		validateThreadInSpaceMiddleware,
		spaceController.GetThreadWithMessages,
	)
	api.POST("/spaces/:spaceid/threads/:threadid/messages",
		validateThreadInSpaceMiddleware,
		middlewares.EnsureAuthenticated(logger, redisRepo, true, false),
		spaceController.CreateMessage,
	)
	api.POST("/spaces/:spaceid/threads/:threadid/messages/:messageid/like",
		validateThreadInSpaceMiddleware,
		validateMessageInThreadMiddleware,
		spaceController.LikeMessage,
	)

	router.Run()
}
