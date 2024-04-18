package controllers

import (
	"net/http"
	"spaces-p/common"
	"spaces-p/errors"
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
	const op errors.Op = "controllers.HealthController.HealthCheck"

	if err := hs.healthService.GetDbHealth(c); err != nil {
		hs.logger.Error(errors.E(op, err))

		c.JSON(http.StatusOK, gin.H{"message": "OK", "db": "ERROR"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "OK", "db": "OK"})
}
