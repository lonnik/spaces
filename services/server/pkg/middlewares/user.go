package middlewares

import (
	"fmt"
	"net/http"
	"spaces-p/pkg/common"
	"spaces-p/pkg/errors"
	"spaces-p/pkg/utils"

	"github.com/gin-gonic/gin"
)

func EnsureAuthenticated(
	logger common.Logger,
	authClient common.AuthClient,
	cacheRepo common.CacheRepository,
	emailIsVerified, isSignedUp bool,
) gin.HandlerFunc {
	const op errors.Op = "middlewares.EnsureAuthenticated"

	return func(c *gin.Context) {
		var ctx = c.Request.Context()

		bearerToken, err := extractBearerToken(c)
		if err != nil {
			abortAndWriteError(c, errors.E(op, err, http.StatusBadRequest), logger)
			return
		}

		userTokenData, err := authClient.VerifyToken(ctx, bearerToken)
		switch {
		case err != nil:
			abortAndWriteError(c, errors.E(op, err, http.StatusUnauthorized), logger)
			return
		case !userTokenData.EmailIsVerified:
			err := fmt.Errorf("email is not verified")
			abortAndWriteError(c, errors.E(op, err, http.StatusUnauthorized), logger)
			return
		}

		// verify that user exists
		user, err := cacheRepo.GetUserById(ctx, userTokenData.UserId)
		switch {
		case errors.Is(err, common.ErrNotFound):
			abortAndWriteError(c, errors.E(op, err, http.StatusUnauthorized), logger)
			return
		case err != nil:
			abortAndWriteError(c, errors.E(op, err, http.StatusInternalServerError), logger)
			return
		}

		// verify that user is signed up
		if isSignedUp && !user.IsSignedUp {
			abortAndWriteError(c, errors.E(op, common.ErrUserNotSignedUp, http.StatusUnauthorized), logger)
			return
		}

		c.Set("user", user)

		c.Next()
	}
}

func IsSpaceSubscriber(
	logger common.Logger,
	cacheRepo common.CacheRepository,
) gin.HandlerFunc {
	const op errors.Op = "middlewares.IsSpaceSubscriber"

	return func(c *gin.Context) {
		var ctx = c.Request.Context()

		spaceId, err := utils.GetSpaceIdFromPath(c)
		if err != nil {
			abortAndWriteError(c, errors.E(op, err, http.StatusInternalServerError), logger)
			return
		}

		user, err := utils.GetUserFromContext(c)
		if err != nil {
			abortAndWriteError(c, errors.E(op, err, http.StatusInternalServerError), logger)
			return
		}

		isSpaceSubscriber, err := cacheRepo.HasSpaceSubscriber(ctx, spaceId, user.ID)
		switch {
		case err != nil:
			abortAndWriteError(c, errors.E(op, err, http.StatusInternalServerError), logger)
			return
		case !isSpaceSubscriber:
			abortAndWriteError(c, errors.E(op, err, http.StatusForbidden), logger)
			return
		}

		c.Next()
	}
}
