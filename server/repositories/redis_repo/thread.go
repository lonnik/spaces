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

func (repo *RedisRepository) GetThread(ctx context.Context, threadId uuid.Uuid) (models.Thread, error) {
	const op errors.Op = "redis_repo.RedisRepository.GetThread"
	var threadKey = getThreadKey(threadId)

	r, err := repo.redisClient.HGetAll(ctx, threadKey).Result()
	switch {
	case err != nil:
		return models.Thread{}, err
	case len(r) == 0:
		return models.Thread{}, errors.E(op, common.ErrNotFound)
	}

	likesStr := r[threadFields.likesField]
	messagesCountStr := r[threadFields.messagesCountField]
	parentMessageIdStr := r[threadFields.parentMessageIdField]
	spaceIdStr := r[threadFields.spaceIdField]

	parentMessageId, err := uuid.Parse(parentMessageIdStr)
	switch {
	case uuid.IsInvalidLengthError(err):
		break
	case err != nil:
		return models.Thread{}, errors.E(op, err)
	}
	likes, err := strconv.Atoi(likesStr)
	if err != nil {
		return models.Thread{}, errors.E(op, err)
	}
	messagesCount, err := strconv.Atoi(messagesCountStr)
	if err != nil {
		return models.Thread{}, errors.E(op, err)
	}
	spaceId, err := uuid.Parse(spaceIdStr)
	if err != nil {
		return models.Thread{}, errors.E(op, err)
	}

	return models.Thread{
		ParentMessageId: parentMessageId,
		BaseThread: models.BaseThread{
			SpaceId:       spaceId,
			ID:            threadId,
			Likes:         likes,
			MessagesCount: messagesCount,
		},
	}, nil
}

func (repo *RedisRepository) GetThreadMessagesByTime(ctx context.Context, threadId uuid.Uuid, offset, count int64) ([]models.MessageWithChildThreadMessagesCount, error) {
	const op errors.Op = "redis_repo.RedisRepository.GetSpaceTopLevelThreadsByTime"
	var threadMessagesByTimeKey = getThreadMessagesByTimeKey(threadId)

	messages, err := repo.getThreadMessages(ctx, threadId, threadMessagesByTimeKey, offset, count)
	if err != nil {
		return nil, errors.E(op, err)
	}

	return messages, nil
}

func (repo *RedisRepository) GetThreadMessagesByPopularity(ctx context.Context, threadId uuid.Uuid, offset, count int64) ([]models.MessageWithChildThreadMessagesCount, error) {
	const op errors.Op = "redis_repo.RedisRepository.GetThreadMessagesByPopularity"
	var threadMessagesByPopularityKey = getThreadMessagesByPopularityKey(threadId)

	messages, err := repo.getThreadMessages(ctx, threadId, threadMessagesByPopularityKey, offset, count)
	if err != nil {
		return nil, errors.E(op, err)
	}

	return messages, nil
}

// set parent's message child_thread_id field, set thread
func (repo *RedisRepository) SetThread(ctx context.Context, spaceId, parentMessageId uuid.Uuid) (uuid.Uuid, error) {
	const op errors.Op = "redis_repo.RedisRepository.SetThread"
	var threadId = uuid.New()
	var threadKey = getThreadKey(threadId)
	var parentMessageKey = getMessageKey(parentMessageId)

	if err := repo.redisClient.HSet(ctx, parentMessageKey, map[string]any{
		messageFields.childThreadIdField: threadId.String(),
	}).Err(); err != nil {
		return uuid.Nil, errors.E(op, err)
	}

	if err := repo.redisClient.HSet(ctx, threadKey, map[string]any{
		threadFields.firstMessageIdField:  "",
		threadFields.likesField:           "0",
		threadFields.messagesCountField:   "0",
		threadFields.parentMessageIdField: parentMessageId.String(),
		threadFields.spaceIdField:         spaceId.String(),
	}).Err(); err != nil {
		return uuid.Nil, errors.E(op, err)
	}

	return threadId, nil
}

// add new thread to space toplevel sets, set first message
func (repo *RedisRepository) SetTopLevelThread(ctx context.Context, spaceId uuid.Uuid, newMessage models.NewTopLevelThreadFirstMessage) (uuid.Uuid, error) {
	const op errors.Op = "redis_repo.RedisRepository.SetTopLevelThread"
	var threadId = uuid.New()

	// set first message
	firstMessageId, err := repo.setMessage(ctx, models.NewMessage{
		BaseMessage: models.BaseMessage(newMessage.NewMessageInput),
		ThreadId:    threadId,
		SenderId:    newMessage.SenderId,
	})
	if err != nil {
		return uuid.Nil, errors.E(op, err)
	}

	// set thread hash
	var threadKey = getThreadKey(threadId)
	if err := repo.redisClient.HSet(ctx, threadKey, map[string]any{
		threadFields.firstMessageIdField:  firstMessageId.String(),
		threadFields.likesField:           "0",
		threadFields.messagesCountField:   "0",
		threadFields.parentMessageIdField: "",
		threadFields.spaceIdField:         spaceId.String(),
	}).Err(); err != nil {
		return uuid.Nil, errors.E(op, err)
	}

	// add to space thread toplevel sets
	var spaceToplevelThreadsByTimeKey = getSpaceToplevelThreadsByTimeKey(spaceId)
	if err := repo.redisClient.ZAdd(ctx, spaceToplevelThreadsByTimeKey, redis.Z{
		Score:  float64(time.Now().UnixMilli()),
		Member: threadId.String(),
	}).Err(); err != nil {
		return uuid.Nil, errors.E(op, err)
	}

	var spaceToplevelThreadsByPopularityKey = getSpaceToplevelThreadsByPopularityKey(spaceId)
	if err := repo.redisClient.ZAdd(ctx, spaceToplevelThreadsByPopularityKey, redis.Z{
		Score:  0,
		Member: threadId.String(),
	}).Err(); err != nil {
		return uuid.Nil, errors.E(op, err)
	}

	return threadId, nil
}

func (repo *RedisRepository) HasThreadMessage(ctx context.Context, threadId, messageId uuid.Uuid) (bool, error) {
	const op errors.Op = "redis_repo.RedisRepository.HasThreadMessage"

	message, err := repo.GetMessage(ctx, messageId)
	if err != nil {
		return false, errors.E(op, err)
	}

	return message.ThreadId == threadId, nil
}

func (repo *RedisRepository) getThreadMessages(ctx context.Context, threadId uuid.Uuid, collectionKey string, offset, count int64) ([]models.MessageWithChildThreadMessagesCount, error) {
	const op errors.Op = "redis_repo.RedisRepository.getThreadMessages"

	messageMaps, messageIds, err := getCollectionValues(ctx, repo, collectionKey, offset, count, getMessageKey)
	if err != nil {
		return nil, errors.E(op, err)
	}

	var messages = make([]models.MessageWithChildThreadMessagesCount, 0, len(messageMaps))
	for i, messageMap := range messageMaps {

		childThreadIdStr := messageMap[messageFields.childThreadIdField]
		var childThreadId uuid.Uuid
		var err error
		var childThreadMessagesCount int64
		if childThreadIdStr != "" {
			childThreadId, err = uuid.Parse(childThreadIdStr)
			if err != nil {
				return nil, errors.E(op, err)
			}

			var childThreadMessagesByTimeKey = getThreadMessagesByTimeKey(childThreadId)
			childThreadMessagesCount, err = repo.redisClient.ZCard(ctx, childThreadMessagesByTimeKey).Result()
			if err != nil {
				return nil, errors.E(op, err)
			}
		}

		content := messageMap[messageFields.contentField]
		likesStr := messageMap[messageFields.likesField]
		senderId := messageMap[messageFields.senderIdField]
		threadIdStr := messageMap[messageFields.threadIdField]
		timeUnixMilliStr := messageMap[messageFields.timeStampField]
		messageTypeStr := messageMap[messageFields.typeField]

		likes, err := strconv.Atoi(likesStr)
		if err != nil {
			return nil, errors.E(op, err)
		}

		threadId, err := uuid.Parse(threadIdStr)
		if err != nil {
			return nil, errors.E(op, err)
		}

		timeStamp, err := utils.StringToTime(timeUnixMilliStr)
		if err != nil {
			return nil, errors.E(op, err)
		}

		var messageType models.MessageType
		if err := messageType.Parse(messageTypeStr); err != nil {
			return nil, errors.E(op, err)
		}

		messages = append(messages, models.MessageWithChildThreadMessagesCount{
			ChildThreadMessagesCount: childThreadMessagesCount,
			Message: models.Message{
				ID:            messageIds[i],
				Time:          timeStamp,
				ChildThreadId: childThreadId,
				Likes:         likes,
				NewMessage: models.NewMessage{
					BaseMessage: models.BaseMessage{
						Content: content,
						Type:    messageType,
					},
					ThreadId: threadId,
					SenderId: models.UserUid(senderId),
				},
			},
		})
	}

	return messages, nil
}

func (repo *RedisRepository) incrementMessageLikesBy(ctx context.Context, messageId uuid.Uuid, increment int64) error {
	const op errors.Op = "redis_repo.RedisRepository.incrementMessageLikesBy"
	var messageKey = getMessageKey(messageId)

	if err := repo.redisClient.HIncrBy(ctx, messageKey, messageFields.likesField, increment).Err(); err != nil {
		return errors.E(op, err)
	}

	return nil
}

func (repo *RedisRepository) incrementThreadLikesBy(ctx context.Context, threadId uuid.Uuid, increment int64) error {
	const op errors.Op = "redis_repo.RedisRepository.incrementThreadLikesBy"
	var threadKey = getThreadKey(threadId)

	if err := repo.redisClient.HIncrBy(ctx, threadKey, threadFields.likesField, increment).Err(); err != nil {
		return errors.E(op, err)
	}

	return nil
}
