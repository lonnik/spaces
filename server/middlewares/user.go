package middlewares

import (
	"net/http"
	"spaces-p/common"
	"spaces-p/errors"
	"spaces-p/firebase"
	"strings"

	"github.com/gin-gonic/gin"
)

func EnsureAuthenticatedAndSignedUp(logger common.Logger, cacheRepo common.CacheRepository) gin.HandlerFunc {
	const op errors.Op = "middlewares.EnsureAuthenticatedAndSignedUp"

	return func(c *gin.Context) {
		var ctx = c.Request.Context()

		// validate bearer token
		const bearerPrefix = "Bearer "
		authHeaderValue := c.Request.Header.Get("Authorization")
		if !strings.HasPrefix(authHeaderValue, bearerPrefix) {
			errNoBearerPrefix := errors.New("no bearer prefix")
			abortAndWriteError(c, errors.E(op, errNoBearerPrefix, http.StatusBadRequest), logger)
			return
		}

		bearerToken := authHeaderValue[len(bearerPrefix):]

		token, err := firebase.AuthClient.VerifyIDToken(ctx, bearerToken)
		if err != nil {
			abortAndWriteError(c, errors.E(op, err, http.StatusUnauthorized), logger)
			return
		}

		// verify that user's email is verified
		isVerified, ok := token.Claims["email_verified"].(bool)
		switch {
		case !ok:
			errNoVerifiedClaim := errors.New("there is no is_verified claim with bool value")
			abortAndWriteError(c, errors.E(op, errNoVerifiedClaim, http.StatusBadRequest), logger)
			return
		case !isVerified:
			errNotVerified := errors.New("email is not verified")
			abortAndWriteError(c, errors.E(op, errNotVerified, http.StatusUnauthorized), logger)
			return
		}

		// verify that user exists and is signed up
		user, err := cacheRepo.GetUserById(ctx, token.UID)
		switch {
		case errors.Is(err, common.ErrNotFound):
			abortAndWriteError(c, errors.E(op, err, http.StatusUnauthorized), logger)
			return
		case err != nil:
			abortAndWriteError(c, errors.E(op, err, http.StatusInternalServerError), logger)
			return
		case !user.IsSignedUp:
			errNotSignedUp := errors.New("user is not fully signed up yet")
			abortAndWriteError(c, errors.E(op, errNotSignedUp, http.StatusUnauthorized), logger)
			return
		}

		c.Set("user", user)

		c.Next()
	}
}
