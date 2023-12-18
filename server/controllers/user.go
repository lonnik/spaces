package controllers

import (
	"net/http"
	"spaces-p/common"
	"spaces-p/errors"
	"spaces-p/models"
	"spaces-p/services"

	"spaces-p/utils"
	"strings"

	"github.com/gin-gonic/gin"
)

type UserController struct {
	userService *services.UserService
	logger      common.Logger
}

func NewUserController(logger common.Logger, userService *services.UserService) *UserController {
	return &UserController{userService, logger}
}

func (us *UserController) GoogleOAuthCallback(c *gin.Context) {
	const op errors.Op = "controllers.UserController.GoogleOAuthCallback"
	const customSchema = "tryout-expo"

	authCode := c.Query("code")
	state := c.Query("state")

	if authCode == "" || state == "" {
		err := errors.New("no valid code or state query param")
		utils.WriteError(c, errors.E(op, err, http.StatusBadRequest), us.logger)
		return
	}

	customSchemeURI := strings.Replace(c.Request.URL.String(), "/api/google-oauthcallback", customSchema+"://", 1)

	// Redirect to your app's custom scheme URI
	c.Redirect(http.StatusFound, customSchemeURI)
}

func (us *UserController) Signup(c *gin.Context) {
	const op errors.Op = "controllers.UserController.Signup"

	var newUser *models.User
	provider := c.Param("provider")

	switch provider {
	case "google":
		var body struct {
			AuthCode     string `json:"authCode"`
			CodeVerifier string `json:"codeVerifier"`
		}

		if err := c.ShouldBindJSON(&body); err != nil {
			utils.WriteError(c, errors.E(op, err, http.StatusBadRequest), us.logger)
			return
		}

		var err error
		newUser, err = us.userService.SignUpGoogle(body.AuthCode, body.CodeVerifier)
		if err != nil {
			utils.WriteError(c, errors.E(op, err, http.StatusInternalServerError), us.logger)
			return
		}
	case "apple":
	case "email":
	default:
		err := errors.New("no valid provider")
		utils.WriteError(c, errors.E(op, err, http.StatusBadRequest), us.logger)
		return
	}

	c.JSON(http.StatusOK, gin.H{"data": newUser})
}
