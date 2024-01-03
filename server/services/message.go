package services

import (
	"context"
	"fmt"
	"net/http"
	"spaces-p/common"
	"spaces-p/errors"
	"spaces-p/models"
	"spaces-p/uuid"
)

type MessageService struct {
	logger    common.Logger
	cacheRepo common.CacheRepository
}

func NewMessageService(logger common.Logger, cacheRepo common.CacheRepository) *MessageService {
	return &MessageService{logger, cacheRepo}
}

func (ts *MessageService) CreateMessage(ctx context.Context, spaceId uuid.Uuid, newMessage models.NewMessage) (uuid.Uuid, error) {
	const op errors.Op = "services.MessageService.CreateMessage"

	// ensure that thread exists
	_, err := ts.cacheRepo.GetThread(ctx, newMessage.ThreadId)
	switch {
	case errors.Is(err, common.ErrNotFound):
		err := errors.New(fmt.Sprintf("thread with id %s does not exist", newMessage.ThreadId.String()))
		return uuid.Nil, errors.E(op, err, http.StatusBadRequest)
	case err != nil:
		return uuid.Nil, errors.E(op, err, http.StatusInternalServerError)
	}

	messageId, err := ts.cacheRepo.SetMessage(ctx, newMessage)
	if err != nil {
		return uuid.Nil, errors.E(op, err, http.StatusInternalServerError)
	}

	return messageId, nil
}

func (ts *MessageService) LikeMessage(ctx context.Context, messageId uuid.Uuid) error {
	const op errors.Op = "services.MessageService.LikeMessage"

	// don't need to validate if message with messageId exists, because validateMessageInThreadMiddleware middleware is already doing this

	if err := ts.cacheRepo.LikeMessage(ctx, messageId); err != nil {
		return errors.E(op, err, http.StatusInternalServerError)
	}

	return nil
}
