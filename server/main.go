package main

import (
	"os"
	"runtime"
	"spaces-p/controllers"
	"spaces-p/firebase"
	"spaces-p/middlewares"
	"spaces-p/redis"
	googlegeocode "spaces-p/repositories/google_geocode"
	localmemory "spaces-p/repositories/local_memory"
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
	if os.Getenv("ENVIRONMENT") == "development" {
		err := godotenv.Load(".env")
		if err != nil {
			panic("Error loading .env file")
		}
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

	// set repos
	redisRepo := redis_repo.NewRedisRepository(redis.RedisClient)
	googleGeocodeRepo := googlegeocode.NewGoogleGeocodeRepo(os.Getenv("GOOGLE_GEOCODE_API_KEY"))
	localMemoryRepo := localmemory.NewLocalMemoryRepo()

	// set up services
	userService := services.NewUserService(logger, redisRepo)
	spaceService := services.NewSpaceService(logger, redisRepo, localMemoryRepo)
	spaceNotificationService := services.NewSpaceNotificationsService(logger, redisRepo, localMemoryRepo)
	threadService := services.NewThreadService(logger, redisRepo, localMemoryRepo)
	messageService := services.NewMessageService(logger, redisRepo, localMemoryRepo)
	addressService := services.NewAddressService(logger, redisRepo, googleGeocodeRepo)

	// set up controllers
	userController := controllers.NewUserController(logger, userService)
	spaceController := controllers.NewSpaceController(logger, spaceService, spaceNotificationService, threadService, messageService)
	addressController := controllers.NewAddressController(logger, addressService)
	healthController := controllers.NewHealthController()

	router := gin.New()
	router.Use(middlewares.GinZerologLogger(logger), gin.Recovery(), cors)
	api := router.Group("/api")

	// middleware functions
	validateThreadInSpaceMiddleware := middlewares.ValidateThreadInSpace(logger, redisRepo)
	validateMessageInThreadMiddleware := middlewares.ValidateMessageInThread(logger, redisRepo)
	isSpaceSubscriberMiddleware := middlewares.IsSpaceSubscriber(logger, redisRepo)

	// USERS
	api.POST("/users", userController.CreateUserFromIdToken)
	api.GET("/users/:userid", middlewares.EnsureAuthenticated(logger, redisRepo, true, false), userController.GetUser)

	// AUTHENTICATED USER
	api.GET("/user",
		middlewares.EnsureAuthenticated(logger, redisRepo, false, false),
		userController.GetAuthedUser,
	)
	api.PUT("/user", middlewares.EnsureAuthenticated(logger, redisRepo, true, false)) // TODO
	api.DELETE("/user")                                                               // TODO

	// SPACES
	api.GET("/spaces", middlewares.EnsureAuthenticated(logger, redisRepo, true, false), spaceController.GetSpaces)
	api.POST("/spaces", middlewares.EnsureAuthenticated(logger, redisRepo, true, false), spaceController.CreateSpace)
	api.GET("/spaces/:spaceid", spaceController.GetSpace)
	api.GET("/spaces/:spaceid/updates/ws",
		middlewares.EnsureAuthenticated(logger, redisRepo, true, true),
		isSpaceSubscriberMiddleware,
		spaceController.SpaceConnect,
	)
	api.GET("/spaces/:spaceid/subscribers",
		spaceController.GetSpaceSubscribers,
	)
	api.POST("/spaces/:spaceid/subscribers",
		middlewares.EnsureAuthenticated(logger, redisRepo, true, false),
		spaceController.AddSpaceSubscriber,
	)
	api.GET("/spaces/:spaceid/toplevel-threads",
		middlewares.EnsureAuthenticated(logger, redisRepo, true, false),
		spaceController.GetTopLevelThreads,
	)
	api.POST("/spaces/:spaceid/toplevel-threads",
		middlewares.EnsureAuthenticated(logger, redisRepo, true, false),
		isSpaceSubscriberMiddleware,
		spaceController.CreateTopLevelThread,
	)
	api.GET("/spaces/:spaceid/threads/:threadid",
		validateThreadInSpaceMiddleware,
		spaceController.GetThreadWithMessages,
	)
	api.POST("/spaces/:spaceid/threads/:threadid/messages",
		middlewares.EnsureAuthenticated(logger, redisRepo, true, false),
		validateThreadInSpaceMiddleware,
		isSpaceSubscriberMiddleware,
		spaceController.CreateMessage,
	)
	api.GET("/spaces/:spaceid/threads/:threadid/messages/:messageid",
		middlewares.EnsureAuthenticated(logger, redisRepo, true, false),
		validateThreadInSpaceMiddleware,
		validateMessageInThreadMiddleware,
		spaceController.GetMessage,
	)
	api.POST("/spaces/:spaceid/threads/:threadid/messages/:messageid/threads",
		middlewares.EnsureAuthenticated(logger, redisRepo, true, false),
		validateThreadInSpaceMiddleware,
		validateMessageInThreadMiddleware,
		spaceController.CreateThread,
	)
	api.POST("/spaces/:spaceid/threads/:threadid/messages/:messageid/likes",
		middlewares.EnsureAuthenticated(logger, redisRepo, true, false),
		validateThreadInSpaceMiddleware,
		validateMessageInThreadMiddleware,
		spaceController.LikeMessage,
	)

	// ADDRESSES
	api.GET("/address", addressController.GetAddress)

	// HEALTH
	api.GET("/health", healthController.HealthCheck)

	router.Run()
}
