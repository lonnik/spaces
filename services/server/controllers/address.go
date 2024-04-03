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

type AddressController struct {
	logger         common.Logger
	addressService *services.AddressService
}

func NewAddressController(logger common.Logger, addressService *services.AddressService) *AddressController {
	return &AddressController{logger, addressService}
}

func (uc *AddressController) GetAddress(c *gin.Context) {
	const op errors.Op = "controllers.AddressController.GetAddress"
	var ctx = c.Request.Context()
	var query struct {
		Location string `form:"location" binding:"required"`
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

	address, err := uc.addressService.GetAddress(ctx, location)
	if err != nil {
		utils.WriteError(c, errors.E(op, err), uc.logger)
		return
	}

	c.JSON(http.StatusOK, gin.H{"data": address})
}
