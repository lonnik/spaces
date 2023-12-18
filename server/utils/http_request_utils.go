package utils

import (
	"fmt"
	"spaces-p/errors"
	"spaces-p/models"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
)

func getUuidFromPath(c *gin.Context, segment string) (uuid.UUID, error) {
	const op errors.Op = "utils.getUuidFromPath"

	segmentValue := c.Param(segment)
	uuidValue, err := uuid.Parse(segmentValue)
	if err != nil {
		return uuid.Nil, errors.E(op, err)
	}

	return uuidValue, nil
}

func GetUserIdFromPath(c *gin.Context) (userId uuid.UUID, err error) {
	return getUuidFromPath(c, "userid")
}

func GetUserFromContext(c *gin.Context) (user *models.User, err error) {
	const op errors.Op = "utils.GetUserFromContext"

	userContext, userExists := c.Get("user")
	if !userExists {
		err := fmt.Errorf("no user in context")
		return nil, errors.E(op, err)
	}

	user, ok := userContext.(*models.User)
	if !ok {
		err := errors.New(fmt.Sprintf("underlying type of %#v is not %T", user, &models.User{}))
		return nil, errors.E(op, err)
	}

	return user, nil
}
