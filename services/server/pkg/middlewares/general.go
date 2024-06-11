package middlewares

import (
	"fmt"
	"net/http"
	"spaces-p/pkg/common"
	"spaces-p/pkg/errors"
	"spaces-p/pkg/utils"

	"github.com/gin-gonic/gin"
)

func ValidateThreadInSpace(
	logger common.Logger,
	cacheRepo common.CacheRepository,
) gin.HandlerFunc {
	const op errors.Op = "middlewares.ValidateThreadInSpace"

	return func(c *gin.Context) {
		var ctx = c.Request.Context()

		spaceId, err := utils.GetSpaceIdFromPath(c)
		if err != nil {
			abortAndWriteError(c, errors.E(op, err, http.StatusBadRequest), logger)
			return
		}
		threadId, err := utils.GetThreadIdFromPath(c)
		if err != nil {
			abortAndWriteError(c, errors.E(op, err, http.StatusBadRequest), logger)
			return
		}

		hasSpaceThread, err := cacheRepo.HasSpaceThread(ctx, spaceId, threadId)
		switch {
		case err != nil:
			abortAndWriteError(c, errors.E(op, err, http.StatusInternalServerError), logger)
			return
		case !hasSpaceThread:
			err := errors.New(fmt.Sprintf("thread with id %s is not part of space with id %s", threadId.String(), spaceId.String()))
			abortAndWriteError(c, errors.E(op, err, http.StatusBadRequest), logger)
			return
		}

		c.Next()
	}
}

func ValidateMessageInThread(
	logger common.Logger,
	cacheRepo common.CacheRepository,
) gin.HandlerFunc {
	const op errors.Op = "middlewares.ValidateMessageInThread"

	return func(c *gin.Context) {
		var ctx = c.Request.Context()

		threadId, err := utils.GetThreadIdFromPath(c)
		if err != nil {
			abortAndWriteError(c, errors.E(op, err, http.StatusBadRequest), logger)
			return
		}

		messageId, err := utils.GetMessageIdFromPath(c)
		if err != nil {
			abortAndWriteError(c, errors.E(op, err, http.StatusBadRequest), logger)
			return
		}

		hasSpaceThread, err := cacheRepo.HasThreadMessage(ctx, threadId, messageId)
		switch {
		case err != nil:
			abortAndWriteError(c, errors.E(op, err, http.StatusInternalServerError), logger)
			return
		case !hasSpaceThread:
			err := errors.New(fmt.Sprintf("message with id %s is not part of thread with id %s", messageId.String(), threadId.String()))
			abortAndWriteError(c, errors.E(op, err, http.StatusBadRequest), logger)
			return
		}

		c.Next()
	}
}
