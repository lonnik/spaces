package controllers

import (
	"github.com/gin-gonic/gin"
)

type HealthController struct {
}

func NewHealthController() *HealthController {
	return &HealthController{}
}
func (hs *HealthController) HealthCheck(c *gin.Context) {
	c.JSON(200, gin.H{"message": "OK"})
}
