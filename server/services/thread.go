package services

import (
	"context"
	"net/http"
	"spaces-p/common"
	"spaces-p/errors"
	"spaces-p/models"
	"spaces-p/uuid"
	"time"
)

type ThreadService struct {
	logger    common.Logger
	cacheRepo common.CacheRepository
}

func NewThreadService(logger common.Logger, cacheRepo common.CacheRepository) *ThreadService {
	return &ThreadService{logger, cacheRepo}
}

func (ts *ThreadService) CreateThread(ctx context.Context, spaceId, parentMessageId uuid.Uuid) (uuid.Uuid, error) {
	const op errors.Op = "services.ThreadService.CreateThread"

	m, err := ts.cacheRepo.GetMessage(ctx, parentMessageId)
	switch {
	case errors.Is(err, common.ErrNotFound):
		return uuid.Nil, errors.E(op, err, http.StatusBadRequest)
	case err != nil:
		return uuid.Nil, errors.E(op, err, http.StatusInternalServerError)
	case m.ChildThreadId != uuid.Nil:
		err := errors.New("the parent message's child thread id has been already set")
		return uuid.Nil, errors.E(op, err, http.StatusBadRequest)
	}

	createdAtTimeStamp := time.Now().UnixMilli()
	threadId, err := ts.cacheRepo.SetThread(ctx, spaceId, parentMessageId, createdAtTimeStamp)
	if err != nil {
		return uuid.Nil, errors.E(op, err, http.StatusInternalServerError)
	}

	return threadId, nil
}

func (ts *ThreadService) CreateTopLevelThread(ctx context.Context, spaceId uuid.Uuid, newTopLevelThreadFirstMessage models.NewTopLevelThreadFirstMessage) (uuid.Uuid, error) {
	const op errors.Op = "services.ThreadService.CreateTopLevelThread"

	createdAtTimeStamp := time.Now().UnixMilli()
	threadId, err := ts.cacheRepo.SetTopLevelThread(ctx, spaceId, createdAtTimeStamp, newTopLevelThreadFirstMessage)
	if err != nil {
		return uuid.Nil, errors.E(op, err, http.StatusInternalServerError)
	}

	return threadId, nil
}
