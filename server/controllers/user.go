package controllers

import (
	"net/http"
	"spaces-p/common"
	"spaces-p/errors"
	"spaces-p/services"
	"spaces-p/utils"

	"github.com/gin-gonic/gin"
)

type UserController struct {
	userService *services.UserService
	logger      common.Logger
}

func NewUserController(logger common.Logger, userService *services.UserService) *UserController {
	return &UserController{userService, logger}
}

func (uc *UserController) CreateUser(c *gin.Context) {
	const op errors.Op = "controllers.UserController.CreateUser"
	var body struct {
		IdToken string `json:"idToken"`
	}

	if err := c.ShouldBindJSON(&body); err != nil {
		utils.WriteError(c, errors.E(op, err, http.StatusBadRequest), uc.logger)
		return
	}

	user, err := uc.userService.CreateUser(c.Request.Context(), body.IdToken)
	if err != nil {
		utils.WriteError(c, errors.E(op, err), uc.logger)
		return
	}

	c.JSON(http.StatusOK, gin.H{"data": user})
}
