package common

import (
	"context"
	"spaces-p/models"
	"spaces-p/uuid"
)

type CacheRepository interface {
	DeleteAllKeys() error
	UserCacheRepository
	SpaceCacheRepository
	ThreadCacheRepository
	MessageCacheRepository
	AddressCacheRepository
}

type UserCacheRepository interface {
	GetUserById(ctx context.Context, id models.UserUid) (*models.User, error)
	SetUser(ctx context.Context, newUser models.NewUser) error
}

type SpaceCacheRepository interface {
	GetSpace(ctx context.Context, spaceid uuid.Uuid) (*models.Space, error)
	GetSpacesByUserId(ctx context.Context, userId models.UserUid, count, offset int64) ([]models.Space, error)
	GetSpacesByLocation(ctx context.Context, location models.Location, radius models.Radius, count int) ([]models.SpaceWithDistance, error)
	GetSpaceSubscribers(ctx context.Context, spaceId uuid.Uuid, offset, count int64) ([]models.User, error)
	GetSpaceActiveSubscribers(ctx context.Context, spaceId uuid.Uuid, offset, count int64) ([]models.User, error)
	GetSpaceTopLevelThreadsByTime(ctx context.Context, spaceId uuid.Uuid, offset, count int64) ([]models.TopLevelThread, error)
	GetSpaceTopLevelThreadsByPopularity(ctx context.Context, spaceId uuid.Uuid, offset, count int64) ([]models.TopLevelThread, error)
	SetSpace(ctx context.Context, newSpace models.NewSpace) (uuid.Uuid, error)
	SetSpaceSubscriber(ctx context.Context, spaceId uuid.Uuid, userUid models.UserUid) error
	SetSpaceSubscriberSession(ctx context.Context, spaceId uuid.Uuid, userUid models.UserUid, sessionId uuid.Uuid) error
	DeleteSpaceSubscriberSession(ctx context.Context, spaceId uuid.Uuid, userUid models.UserUid, sessionId uuid.Uuid) error
	HasSpaceThread(ctx context.Context, spaceId, threadId uuid.Uuid) (bool, error)
	HasSpaceSubscriber(ctx context.Context, spaceId uuid.Uuid, userUid models.UserUid) (bool, error)
}

type ThreadCacheRepository interface {
	GetThread(ctx context.Context, threadId uuid.Uuid) (*models.Thread, error)
	GetThreadMessagesByTime(ctx context.Context, threadId uuid.Uuid, offset, count int64) ([]models.MessageWithChildThreadMessagesCount, error)
	GetThreadMessagesByPopularity(ctx context.Context, threadId uuid.Uuid, offset, count int64) ([]models.MessageWithChildThreadMessagesCount, error)
	SetTopLevelThread(ctx context.Context, spaceId uuid.Uuid, createdAtTimeStamp int64, newMessage models.NewTopLevelThreadFirstMessage) (uuid.Uuid, error)
	SetThread(ctx context.Context, spaceId, parentMessageId uuid.Uuid, createdAtTimeStamp int64) (uuid.Uuid, error)
	HasThreadMessage(ctx context.Context, threadId, messageId uuid.Uuid) (bool, error)
}

type MessageCacheRepository interface {
	GetMessage(ctx context.Context, messageId uuid.Uuid) (*models.Message, error)
	SetMessage(ctx context.Context, newMessage models.NewMessage) (uuid.Uuid, error)
	LikeMessage(ctx context.Context, messageId uuid.Uuid) error
}

type AddressCacheRepository interface {
	GetAddress(ctx context.Context, geoHash string) (*models.Address, error)
	SetAddress(ctx context.Context, newAddress models.Address) error
}
