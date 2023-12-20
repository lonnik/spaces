package middlewares

import (
	"spaces-p/common"
	"spaces-p/utils"

	"github.com/gin-gonic/gin"
)

func abortAndWriteError(c *gin.Context, err error, logger common.Logger) {
	c.Abort()
	utils.WriteError(c, err, logger)
}
