package utils

import (
	"log"
	"net/http"
	"spaces-p/common"
	"spaces-p/errors"

	"github.com/gin-gonic/gin"
)

func WriteError(c *gin.Context, err error, logger common.Logger) {
	if cr, ok := err.(interface {
		Message() errors.Messages
		Status() int
	}); ok {
		status := cr.Status()
		message := cr.Message()
		log.Print(err)

		c.JSON(status, message)
		return
	}

	logger.Error(err)
	c.JSON(http.StatusInternalServerError, gin.H{"message": "Something went wrong"})
}
