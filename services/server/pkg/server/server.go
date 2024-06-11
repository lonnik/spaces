package server

import (
	"net/http"
	"os"
	"spaces-p/pkg/common"
	"spaces-p/pkg/middlewares"

	"github.com/gin-gonic/gin"
	"github.com/jmoiron/sqlx"
	"github.com/redis/go-redis/v9"
)

// top-level HTTP stuff that applies to all endpoints
func NewServer(
	apiVersion string,
	logger common.Logger,
	cors gin.HandlerFunc,
	redisClient *redis.Client,
	postgresClient *sqlx.DB,
	authClient common.AuthClient,
	geoCodeRepo common.GeocodeRepository,
) http.Handler {
	gin.SetMode(os.Getenv("GIN_MODE"))
	var router = gin.New()

	router.Use(middlewares.GinZerologLogger(logger), gin.Recovery(), cors)

	addRoutes(
		apiVersion,
		router,
		logger,
		redisClient,
		postgresClient,
		authClient,
		geoCodeRepo,
	)

	return router.Handler()
}
