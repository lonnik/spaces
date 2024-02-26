package redis_repo

import (
	"context"
	"spaces-p/common"
	"spaces-p/errors"
	"spaces-p/models"
	"spaces-p/utils"
	"spaces-p/uuid"
	"strconv"
	"time"

	"github.com/redis/go-redis/v9"
)

func (repo *RedisRepository) GetMessage(ctx context.Context, messageId uuid.Uuid) (*models.MessageWithChildThreadMessagesCount, error) {
	const op errors.Op = "redis_repo.RedisRepository.GetMessage"
	var messageKey = getMessageKey(messageId)

	messageMap, err := repo.redisClient.HGetAll(ctx, messageKey).Result()
	switch {
	case err != nil:
		return &models.MessageWithChildThreadMessagesCount{}, errors.E(op, err)
	case len(messageMap) == 0:
		return &models.MessageWithChildThreadMessagesCount{}, errors.E(op, common.ErrNotFound)
	}

	childThreadIdStr := messageMap[messageFields.childThreadIdField]
	content := messageMap[messageFields.contentField]
	likesStr := messageMap[messageFields.likesField]
	senderIdStr := messageMap[messageFields.senderIdField]
	threadIdStr := messageMap[messageFields.threadIdField]
	createdAtMilliStr := messageMap[messageFields.createdAtField]
	messageTypeStr := messageMap[messageFields.typeField]

	childThreadId, err := uuid.Parse(childThreadIdStr)
	switch {
	case uuid.IsInvalidLengthError(err):
		break
	case err != nil:
		return &models.MessageWithChildThreadMessagesCount{}, errors.E(op, err)
	}

	var childThreadMessagesByTimeKey = getThreadMessagesByTimeKey(childThreadId)
	childThreadMessagesCount, err := repo.redisClient.ZCard(ctx, childThreadMessagesByTimeKey).Result()
	if err != nil {
		return nil, errors.E(op, err)
	}

	likes, err := strconv.Atoi(likesStr)
	if err != nil {
		return &models.MessageWithChildThreadMessagesCount{}, errors.E(op, err)
	}

	senderId := models.UserUid(senderIdStr)

	threadId, err := uuid.Parse(threadIdStr)
	if err != nil {
		return &models.MessageWithChildThreadMessagesCount{}, errors.E(op, err)
	}

	createdAt, err := utils.StringToTime(createdAtMilliStr)
	if err != nil {
		return &models.MessageWithChildThreadMessagesCount{}, errors.E(op, err)
	}

	var messageType models.MessageType
	if err := messageType.Parse(messageTypeStr); err != nil {
		return &models.MessageWithChildThreadMessagesCount{}, errors.E(op, err)
	}

	return &models.MessageWithChildThreadMessagesCount{
		ChildThreadMessagesCount: childThreadMessagesCount,
		Message: models.Message{
			ID:            messageId,
			CreatedAt:     createdAt,
			ChildThreadId: childThreadId,
			Likes:         likes,
			NewMessage: models.NewMessage{
				BaseMessage: models.BaseMessage{
					Content: content,
					Type:    messageType,
				},
				SenderId: senderId,
				ThreadId: threadId,
			}},
	}, nil
}

func (repo *RedisRepository) SetMessage(ctx context.Context, newMessage models.NewMessage) (*models.Message, error) {
	const op errors.Op = "redis_repo.RedisRepository.SetMessage"
	var threadKey = getThreadKey(newMessage.ThreadId)
	var createdAt = time.Now()

	createdMessage, err := repo.setMessage(ctx, createdAt, newMessage)
	if err != nil {
		return nil, errors.E(op, err)
	}

	// add messages to sets
	var threadMessagesByTimeKey = getThreadMessagesByTimeKey(newMessage.ThreadId)
	if err := repo.redisClient.ZAdd(ctx, threadMessagesByTimeKey, redis.Z{
		Score:  float64(createdAt.UnixMilli()),
		Member: createdMessage.ID.String(),
	}).Err(); err != nil {
		return nil, errors.E(op, err)
	}

	var threadMessagesByPopularityKey = getThreadMessagesByPopularityKey(newMessage.ThreadId)
	if err := repo.redisClient.ZAdd(ctx, threadMessagesByPopularityKey, redis.Z{
		Score:  0,
		Member: createdMessage.ID.String(),
	}).Err(); err != nil {
		return nil, errors.E(op, err)
	}

	// increment messages count in thread
	if err := repo.redisClient.HIncrBy(ctx, threadKey, threadFields.messagesCountField, 1).Err(); err != nil {
		return nil, errors.E(op, err)
	}

	return createdMessage, nil
}

func (repo *RedisRepository) IncrementMessageLikesBy(ctx context.Context, threadId, messageId uuid.Uuid, increment int64) error {
	const op errors.Op = "redis_repo.RedisRepository.IncrementMessageLikesBy"
	var messageKey = getMessageKey(messageId)
	var threadMessagesByPopularityKey = getThreadMessagesByPopularityKey(threadId)

	if err := repo.redisClient.HIncrBy(ctx, messageKey, messageFields.likesField, increment).Err(); err != nil {
		return errors.E(op, err)
	}

	if err := repo.redisClient.ZIncrBy(ctx, threadMessagesByPopularityKey, float64(1), messageId.String()).Err(); err != nil {
		return errors.E(op, err)
	}

	return nil
}

func (repo *RedisRepository) setMessage(ctx context.Context, createdAt time.Time, newMessage models.NewMessage) (*models.Message, error) {
	const op errors.Op = "redis_repo.RedisRepository.setMessage"

	var messageId = uuid.New()
	var messageKey = getMessageKey(messageId)

	createdAtStr := strconv.FormatInt(createdAt.UnixMilli(), 10)
	messageTypeStr, err := newMessage.Type.String()
	threadIdStr := newMessage.ThreadId.String()
	senderId := newMessage.SenderId
	if err != nil {
		return nil, errors.E(op, err)
	}

	var createdMessage = &models.Message{
		ID:         messageId,
		NewMessage: newMessage,
		CreatedAt:  createdAt,
	}

	if err := repo.redisClient.HSet(ctx, messageKey, map[string]any{
		messageFields.childThreadIdField: "",
		messageFields.contentField:       newMessage.Content,
		messageFields.likesField:         "0",
		messageFields.senderIdField:      senderId,
		messageFields.threadIdField:      threadIdStr,
		messageFields.createdAtField:     createdAtStr,
		messageFields.typeField:          messageTypeStr,
	}).Err(); err != nil {
		return nil, errors.E(op, err)
	}

	return createdMessage, nil
}
