package middlewares

import (
	"spaces-p/pkg/common"
	"spaces-p/pkg/errors"
	"spaces-p/pkg/utils"
	"strings"

	"github.com/gin-gonic/gin"
)

func abortAndWriteError(c *gin.Context, err error, logger common.Logger) {
	c.Abort()
	utils.WriteError(c, err, logger)
}

func extractBearerToken(c *gin.Context) (string, error) {
	const op errors.Op = "middlewares.extractBearerToken"

	const bearerPrefix = "Bearer "
	authHeaderValue := c.Request.Header.Get("Authorization")
	if !strings.HasPrefix(authHeaderValue, bearerPrefix) {
		errNoBearerPrefix := errors.New("no bearer prefix")
		return "", errors.E(op, errNoBearerPrefix)
	}

	return authHeaderValue[len(bearerPrefix):], nil
}
