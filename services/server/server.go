package main

import (
	"net/http"
	"spaces-p/common"
	"spaces-p/middlewares"

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
	googleGeocodeApiKey string,
	authClient common.AuthClient,
) http.Handler {
	var router = gin.New()

	router.Use(middlewares.GinZerologLogger(logger), gin.Recovery(), cors)

	addRoutes(apiVersion, router, logger, redisClient, postgresClient, googleGeocodeApiKey, authClient)

	return router.Handler()
}
