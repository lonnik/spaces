package utils

import (
	"fmt"
	"spaces-p/errors"
	"spaces-p/models"

	"github.com/gin-gonic/gin"
)

func GetUserIdFromPath(c *gin.Context) string {
	return c.Param("userid")
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
