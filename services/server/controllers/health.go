package controllers

import (
	"spaces-p/common"
	"spaces-p/services"

	"github.com/gin-gonic/gin"
)

type HealthController struct {
	logger        common.Logger
	healthService *services.HealthService
}

func NewHealthController(logger common.Logger, healthService *services.HealthService) *HealthController {
	return &HealthController{logger, healthService}
}
func (hs *HealthController) HealthCheck(c *gin.Context) {
	c.JSON(200, gin.H{"message": "OK", "db": "OK"})
}
