package utils

import (
	"net/http"
	"spaces-p/common"
	"spaces-p/errors"

	"github.com/gin-gonic/gin"
)

func WriteError(c *gin.Context, err error, logger common.Logger) {
	logger.Error(err)

	if cr, ok := err.(interface {
		Message() errors.Messages
		Status() int
	}); ok {
		status := cr.Status()
		message := cr.Message()

		c.JSON(status, message)
		return
	}

	c.JSON(http.StatusInternalServerError, gin.H{"message": "Something went wrong"})
}
