package utils

import (
	"fmt"
	"spaces-p/pkg/errors"
	"spaces-p/pkg/models"
	"spaces-p/pkg/uuid"

	"github.com/gin-gonic/gin"
)

func getUuidFromPath(c *gin.Context, segment string) (uuid.Uuid, error) {
	const op errors.Op = "utils.getUuidFromPath"

	segmentValue := c.Param(segment)
	if segmentValue == "" {
		err := fmt.Errorf("empty value")
		return uuid.Nil, errors.E(op, err)
	}

	id, err := uuid.Parse(segmentValue)
	if err != nil {
		return uuid.Nil, errors.E(op, err)
	}

	return id, nil
}

func GetSpaceIdFromPath(c *gin.Context) (spaceId uuid.Uuid, err error) {
	const op errors.Op = "utils.GetSpaceIdFromPath"

	spaceId, err = getUuidFromPath(c, "spaceid")
	if err != nil {
		return uuid.Nil, errors.E(op, err)
	}

	return spaceId, nil
}

func GetThreadIdFromPath(c *gin.Context) (threadId uuid.Uuid, err error) {
	const op errors.Op = "utils.GetThreadIdFromPath"

	threadId, err = getUuidFromPath(c, "threadid")
	if err != nil {
		return uuid.Nil, errors.E(op, err)
	}

	return threadId, nil
}

func GetMessageIdFromPath(c *gin.Context) (threadId uuid.Uuid, err error) {
	const op errors.Op = "utils.GetMessageIdFromPath"

	threadId, err = getUuidFromPath(c, "messageid")
	if err != nil {
		return uuid.Nil, errors.E(op, err)
	}

	return threadId, nil
}

func GetUserUidFromPath(c *gin.Context) models.UserUid {
	return models.UserUid(c.Param("userid"))
}

func GetUserFromContext(c *gin.Context) (user *models.User, err error) {
	const op errors.Op = "utils.GetUserFromContext"

	userContext, userExists := c.Get("user")
	if !userExists {
		err := errors.New("no user in context")
		return nil, errors.E(op, err)
	}

	user, ok := userContext.(*models.User)
	if !ok {
		err := errors.New(fmt.Sprintf("underlying type of %#v is not %T", user, &models.User{}))
		return nil, errors.E(op, err)
	}

	return user, nil
}
