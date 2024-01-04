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

func (repo *RedisRepository) GetMessage(ctx context.Context, messageId uuid.Uuid) (*models.Message, error) {
	const op errors.Op = "redis_repo.RedisRepository.GetMessage"
	var messageKey = getMessageKey(messageId)

	messageMap, err := repo.redisClient.HGetAll(ctx, messageKey).Result()
	switch {
	case err != nil:
		return &models.Message{}, errors.E(op, err)
	case len(messageMap) == 0:
		return &models.Message{}, errors.E(op, common.ErrNotFound)
	}

	childThreadIdStr := messageMap[messageFields.childThreadIdField]
	content := messageMap[messageFields.contentField]
	likesStr := messageMap[messageFields.likesField]
	senderIdStr := messageMap[messageFields.senderIdField]
	threadIdStr := messageMap[messageFields.threadIdField]
	timeUnixMilliStr := messageMap[messageFields.timeStampField]
	messageTypeStr := messageMap[messageFields.typeField]

	childThreadId, err := uuid.Parse(childThreadIdStr)
	switch {
	case uuid.IsInvalidLengthError(err):
		break
	case err != nil:
		return &models.Message{}, errors.E(op, err)
	}

	likes, err := strconv.Atoi(likesStr)
	if err != nil {
		return &models.Message{}, errors.E(op, err)
	}

	senderId := models.UserUid(senderIdStr)

	threadId, err := uuid.Parse(threadIdStr)
	if err != nil {
		return &models.Message{}, errors.E(op, err)
	}

	timeStamp, err := utils.StringToTime(timeUnixMilliStr)
	if err != nil {
		return &models.Message{}, errors.E(op, err)
	}

	var messageType models.MessageType
	if err := messageType.Parse(messageTypeStr); err != nil {
		return &models.Message{}, errors.E(op, err)
	}

	return &models.Message{
		ID:            messageId,
		Time:          timeStamp,
		ChildThreadId: childThreadId,
		Likes:         likes,
		NewMessage: models.NewMessage{
			BaseMessage: models.BaseMessage{
				Content: content,
				Type:    messageType,
			},
			SenderId: senderId,
			ThreadId: threadId,
		},
	}, nil
}

func (repo *RedisRepository) SetMessage(ctx context.Context, newMessage models.NewMessage) (uuid.Uuid, error) {
	const op errors.Op = "redis_repo.RedisRepository.SetMessage"
	var threadKey = getThreadKey(newMessage.ThreadId)

	messageId, err := repo.setMessage(ctx, newMessage)
	if err != nil {
		return uuid.Nil, errors.E(op, err)
	}

	// add messages to sets
	var threadMessagesByTimeKey = getThreadMessagesByTimeKey(newMessage.ThreadId)
	if err := repo.redisClient.ZAdd(ctx, threadMessagesByTimeKey, redis.Z{
		Score:  float64(time.Now().UnixMilli()),
		Member: messageId.String(),
	}).Err(); err != nil {
		return uuid.Nil, errors.E(op, err)
	}

	var threadMessagesByPopularityKey = getThreadMessagesByPopularityKey(newMessage.ThreadId)
	if err := repo.redisClient.ZAdd(ctx, threadMessagesByPopularityKey, redis.Z{
		Score:  0,
		Member: messageId.String(),
	}).Err(); err != nil {
		return uuid.Nil, errors.E(op, err)
	}

	// increment messages count in thread
	if err := repo.redisClient.HIncrBy(ctx, threadKey, threadFields.messagesCountField, 1).Err(); err != nil {
		return uuid.Nil, errors.E(op, err)
	}

	return messageId, nil
}

func (repo *RedisRepository) LikeMessage(ctx context.Context, likedMessageId uuid.Uuid) error {
	const op errors.Op = "redis_repo.RedisRepository.LikeMessage"

	if err := repo.incrementMessageLikesBy(ctx, likedMessageId, 1); err != nil {
		return errors.E(op, err)
	}

	var messageId = likedMessageId
loop:
	for {
		message, err := repo.GetMessage(ctx, messageId)
		if err != nil {
			return errors.E(op, err)
		}

		if err := repo.incrementThreadLikesBy(ctx, message.ThreadId, 1); err != nil {
			return errors.E(op, err)
		}

		thread, err := repo.GetThread(ctx, message.ThreadId)
		var isTopLevelThread = thread.ParentMessageId == uuid.Nil
		switch {
		case err != nil:
			return errors.E(op, err)
		case isTopLevelThread:
			var spaceToplevelThreadsByPopularityKey = getSpaceToplevelThreadsByPopularityKey(thread.SpaceId)
			if err := repo.redisClient.ZIncrBy(ctx, spaceToplevelThreadsByPopularityKey, 1, thread.ID.String()).Err(); err != nil {
				return errors.E(op, err)
			}

			break loop
		}

		// only if first level message id is not first message of topleve thread
		if likedMessageId == messageId {
			var threadMessagesByPopularityKey = getThreadMessagesByPopularityKey(messageId)
			if err := repo.redisClient.ZIncrBy(ctx, threadMessagesByPopularityKey, float64(1), messageId.String()).Err(); err != nil {
				return errors.E(op, err)
			}
		}

		messageId = thread.ParentMessageId
	}

	return nil
}

func (repo *RedisRepository) setMessage(ctx context.Context, newMessage models.NewMessage) (uuid.Uuid, error) {
	const op errors.Op = "redis_repo.RedisRepository.setMessage"

	var messageId = uuid.New()
	var messageKey = getMessageKey(messageId)

	timeStampStr := getTimeStampString()
	messageTypeStr, err := newMessage.Type.String()
	threadIdStr := newMessage.ThreadId.String()
	senderId := newMessage.SenderId
	if err != nil {
		return uuid.Nil, errors.E(op, err)
	}

	if err := repo.redisClient.HSet(ctx, messageKey, map[string]any{
		messageFields.childThreadIdField: "",
		messageFields.contentField:       newMessage.Content,
		messageFields.likesField:         "0",
		messageFields.senderIdField:      senderId,
		messageFields.threadIdField:      threadIdStr,
		messageFields.timeStampField:     timeStampStr,
		messageFields.typeField:          messageTypeStr,
	}).Err(); err != nil {
		return uuid.Nil, errors.E(op, err)
	}

	return messageId, nil
}
