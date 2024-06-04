package utils

import (
	"fmt"
	"spaces-p/errors"
	"spaces-p/models"
	"spaces-p/uuid"

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
	return getUuidFromPath(c, "spaceid")
}

func GetThreadIdFromPath(c *gin.Context) (threadId uuid.Uuid, err error) {
	return getUuidFromPath(c, "threadid")
}

func GetMessageIdFromPath(c *gin.Context) (threadId uuid.Uuid, err error) {
	return getUuidFromPath(c, "messageid")
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
