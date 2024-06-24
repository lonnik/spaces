package services

import (
	"context"
	"fmt"
	"net/http"
	"spaces-p/pkg/common"
	"spaces-p/pkg/errors"
	"spaces-p/pkg/models"
	localmemory "spaces-p/pkg/repositories/local_memory"
	"spaces-p/pkg/uuid"
)

type MessageService struct {
	logger          common.Logger
	cacheRepo       common.CacheRepository
	localMemoryRepo *localmemory.LocalMemoryRepo
}

func NewMessageService(logger common.Logger, cacheRepo common.CacheRepository, localMemoryRepo *localmemory.LocalMemoryRepo) *MessageService {
	return &MessageService{logger, cacheRepo, localMemoryRepo}
}

func (ts *MessageService) CreateMessage(ctx context.Context, spaceId uuid.Uuid, authenticatedUserId models.UserUid, newMessage models.NewMessage) (uuid.Uuid, error) {
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

	createdMessage, err := ts.cacheRepo.SetMessage(ctx, newMessage)
	if err != nil {
		return uuid.Nil, errors.E(op, err, http.StatusInternalServerError)
	}
	ts.localMemoryRepo.PublishNewMessage(spaceId, authenticatedUserId, *createdMessage)

	return createdMessage.ID, nil
}

func (ts *MessageService) GetMessage(ctx context.Context, messageId uuid.Uuid) (*models.MessageWithChildThreadMessagesCount, error) {
	const op errors.Op = "services.MessageService.GetMessage"

	message, err := ts.cacheRepo.GetMessage(ctx, messageId)
	switch {
	case errors.Is(err, common.ErrNotFound):
		return nil, errors.E(op, err, http.StatusBadRequest)
	case err != nil:
		return nil, errors.E(op, err, http.StatusInternalServerError)
	}

	return message, nil
}

func (ts *MessageService) LikeMessage(ctx context.Context, spaceId, threadId, likedMessageId uuid.Uuid, authenticatedUserId models.UserUid) error {
	const op errors.Op = "services.MessageService.LikeMessage"

	// don't need to validate if message with messageId exists, because validateMessageInThreadMiddleware middleware is already doing this

	if err := ts.cacheRepo.IncrementMessageLikesBy(ctx, threadId, likedMessageId, 1); err != nil {
		return errors.E(op, err)
	}
	ts.localMemoryRepo.PublishMessagePopularityIncrease(spaceId, authenticatedUserId, threadId, likedMessageId)

	var messageId = likedMessageId
loop:
	for {
		message, err := ts.cacheRepo.GetMessage(ctx, messageId)
		if err != nil {
			return errors.E(op, err)
		}

		thread, err := ts.cacheRepo.GetThread(ctx, message.ThreadId)
		var isTopLevelThread = thread.ParentMessageId == uuid.Nil
		switch {
		case err != nil:
			return errors.E(op, err)
		case isTopLevelThread:
			if err := ts.cacheRepo.IncrementTopLevelThreadLikesBy(ctx, spaceId, thread.ID, 1); err != nil {
				return errors.E(op, err)
			}
			ts.localMemoryRepo.PublishToplevelThreadPopularityIncrease(spaceId, authenticatedUserId, thread.ID)

			break loop
		default:
			if err := ts.cacheRepo.IncrementThreadLikesBy(ctx, thread.ID, 1); err != nil {
				return errors.E(op, err)
			}
			ts.localMemoryRepo.PublishThreadPopularityIncrease(spaceId, authenticatedUserId, thread.ParentMessageId, thread.ID)
		}

		messageId = thread.ParentMessageId
	}

	return nil
}
