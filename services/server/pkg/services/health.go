package services

import (
	"context"
	"spaces-p/pkg/common"
	"spaces-p/pkg/errors"

	"github.com/jmoiron/sqlx"
)

type HealthService struct {
	logger common.Logger
	db     *sqlx.DB
}

func NewHealthService(logger common.Logger, db *sqlx.DB) *HealthService {
	return &HealthService{logger, db}
}

func (hs *HealthService) GetDbHealth(ctx context.Context) error {
	const op errors.Op = "services.HealthService.GetDbHealth"

	var result int
	err := hs.db.Get(&result, "SELECT 1")
	if err != nil {
		return errors.E(op, err)
	}

	return nil
}
