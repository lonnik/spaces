package main

import (
	"os"
	"spaces-p/common"
	"spaces-p/controllers"
	"spaces-p/middlewares"
	googlegeocode "spaces-p/repositories/google_geocode"
	localmemory "spaces-p/repositories/local_memory"
	"spaces-p/repositories/redis_repo"
	"spaces-p/services"

	"github.com/gin-gonic/gin"
	"github.com/jmoiron/sqlx"
	"github.com/redis/go-redis/v9"
)

// add all routes
func addRoutes(
	apiVersion string,
	router *gin.Engine,
	logger common.Logger,
	redisClient *redis.Client,
	postgresClient *sqlx.DB,
) {
	api := router.Group("/" + apiVersion)

	// set repos
	redisRepo := redis_repo.NewRedisRepository(redisClient)
	googleGeocodeRepo := googlegeocode.NewGoogleGeocodeRepo(os.Getenv("GOOGLE_GEOCODE_API_KEY"))
	localMemoryRepo := localmemory.NewLocalMemoryRepo()

	// set up services
	userService := services.NewUserService(logger, redisRepo)
	spaceService := services.NewSpaceService(logger, redisRepo, localMemoryRepo)
	spaceNotificationService := services.NewSpaceNotificationsService(logger, redisRepo, localMemoryRepo)
	threadService := services.NewThreadService(logger, redisRepo, localMemoryRepo)
	messageService := services.NewMessageService(logger, redisRepo, localMemoryRepo)
	addressService := services.NewAddressService(logger, redisRepo, googleGeocodeRepo)
	healthService := services.NewHealthService(logger, postgresClient)

	// set up controllers
	userController := controllers.NewUserController(logger, userService)
	spaceController := controllers.NewSpaceController(logger, spaceService, spaceNotificationService, threadService, messageService)
	addressController := controllers.NewAddressController(logger, addressService)
	healthController := controllers.NewHealthController(logger, healthService)

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
	api.GET("/healthz", func(ctx *gin.Context) {
		ctx.JSON(200, gin.H{"message": "OK"})
	})
}
