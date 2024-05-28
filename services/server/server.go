package main

import (
	"net/http"
	"os"
	"spaces-p/common"
	"spaces-p/middlewares"

	"github.com/gin-gonic/gin"
	"github.com/jmoiron/sqlx"
	"github.com/redis/go-redis/v9"
)

// top-level HTTP stuff that applies to all endpoints
func NewServer(
	logger common.Logger,
	cors gin.HandlerFunc,
	redisClient *redis.Client,
	postgresClient *sqlx.DB,
) http.Handler {
	var router = gin.New()

	router.Use(middlewares.GinZerologLogger(logger), gin.Recovery(), cors)

	apiVersion := os.Getenv("API_VERSION")
	addRoutes(apiVersion, router, logger, redisClient, postgresClient)

	return router.Handler()
}
