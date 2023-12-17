package controllers

import (
	"fmt"
	"net/http"
	"spaces-p/common"
	"spaces-p/errors"
	"spaces-p/utils"
	"strings"

	"github.com/gin-gonic/gin"
)

type UserController struct {
	logger common.Logger
}

func NewUserController(logger common.Logger) *UserController {
	return &UserController{logger: logger}
}

func (us *UserController) GoogleOAuthCallback(c *gin.Context) {
	const op errors.Op = "main"
	const customSchema = "tryout-expo"

	authCode := c.Query("code")
	state := c.Query("state")

	if authCode == "" || state == "" {
		err := errors.New("no valid code or state query param")
		utils.WriteError(c, errors.E(op, err, http.StatusBadRequest), us.logger)
		return
	}

	fmt.Println("c.Request.URL.String() :>>", c.Request.URL.String())
	customSchemeURI := strings.Replace(c.Request.URL.String(), "/api/google-oauthcallback", customSchema+"://", 1)
	fmt.Println("customSchemeURI :>>", customSchemeURI)

	// Redirect to your app's custom scheme URI
	c.Redirect(http.StatusFound, customSchemeURI)
}
