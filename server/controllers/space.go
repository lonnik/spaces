package controllers

import (
	"net/http"
	"spaces-p/common"
	"spaces-p/errors"
	"spaces-p/models"
	"spaces-p/services"
	"spaces-p/utils"

	"github.com/gin-gonic/gin"
)

type SpaceController struct {
	logger       common.Logger
	spaceService *services.SpaceService
}

func NewSpaceController(logger common.Logger, spaceService *services.SpaceService) *SpaceController {
	return &SpaceController{logger, spaceService}
}

func (uc *SpaceController) GetSpaces(c *gin.Context) {
	const op errors.Op = "controllers.SpaceController.GetSpaces"
	var ctx = c.Request.Context()
	var query struct {
		Location string  `form:"searchByLocation"`
		Radius   float64 `form:"radius"`
	}

	if err := c.ShouldBindQuery(&query); err != nil {
		utils.WriteError(c, errors.E(op, err, http.StatusBadRequest), uc.logger)
		return
	}

	var location models.Location
	if err := location.ParseString(query.Location); err != nil {
		utils.WriteError(c, errors.E(op, err, http.StatusBadRequest), uc.logger)
		return
	}

	spaces, err := uc.spaceService.GetSpacesByLocation(ctx, location, models.Radius(query.Radius))
	if err != nil {
		utils.WriteError(c, errors.E(op, err), uc.logger)
		return
	}

	c.JSON(http.StatusOK, gin.H{"data": spaces})
}

func (uc *SpaceController) CreateSpace(c *gin.Context) {
	const op errors.Op = "controllers.SpaceController.CreateSpace"
	var ctx = c.Request.Context()

	var body models.NewSpace
	if err := c.ShouldBindJSON(&body); err != nil {
		utils.WriteError(c, errors.E(op, err, http.StatusBadRequest), uc.logger)
		return
	}

	spaceId, err := uc.spaceService.CreateSpace(ctx, body)
	if err != nil {
		utils.WriteError(c, errors.E(op, err), uc.logger)
		return
	}

	c.JSON(http.StatusOK, gin.H{"data": gin.H{
		"spaceId": spaceId,
	}})
}
