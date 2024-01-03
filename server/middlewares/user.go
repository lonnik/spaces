package middlewares

import (
	"net/http"
	"spaces-p/common"
	"spaces-p/errors"
	"spaces-p/firebase"
	"spaces-p/models"

	"github.com/gin-gonic/gin"
)

func EnsureAuthenticated(
	logger common.Logger,
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

		token, err := firebase.AuthClient.VerifyIDToken(ctx, bearerToken)
		if err != nil {
			abortAndWriteError(c, errors.E(op, err, http.StatusUnauthorized), logger)
			return
		}

		// verify that user's email is verified
		if emailIsVerified {
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
		}

		// verify that user exists
		user, err := cacheRepo.GetUserById(ctx, models.UserUid(token.UID))
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
