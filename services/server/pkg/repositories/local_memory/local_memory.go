package localmemory

import (
	"spaces-p/pkg/models"
	"spaces-p/pkg/uuid"
	"sync"
)

const NotificationsBufferSize = 16

type BaseSession struct {
	SpaceId         uuid.Uuid
	UserId          models.UserUid
	NotificationsCh chan models.SpaceUpdate
	CloseSlow       func()
}

type Session struct {
	SessionId uuid.Uuid
	BaseSession
}

type NewSessionInput BaseSession

type space map[uuid.Uuid]*Session

type LocalMemoryRepo struct {
	mu     sync.Mutex
	spaces map[uuid.Uuid]space
}

func NewLocalMemoryRepo() *LocalMemoryRepo {
	return &LocalMemoryRepo{spaces: map[uuid.Uuid]space{}}
}

func (lm *LocalMemoryRepo) AddSession(newSessionInput NewSessionInput) *Session {
	var newSessionId = uuid.New()

	lm.mu.Lock()
	defer lm.mu.Unlock()

	newSession := &Session{
		SessionId:   newSessionId,
		BaseSession: BaseSession(newSessionInput),
	}

	_, spaceExists := lm.spaces[newSession.SpaceId]
	if !spaceExists {
		lm.spaces[newSession.SpaceId] = make(space)
	}

	lm.spaces[newSession.SpaceId][newSessionId] = newSession

	return newSession
}

// becomes no-op when space or session does not exist
func (lm *LocalMemoryRepo) DeleteSession(spaceId, sessionId uuid.Uuid) {
	lm.mu.Lock()
	defer lm.mu.Unlock()

	space, spaceExists := lm.spaces[spaceId]
	if !spaceExists {
		return
	}

	delete(space, sessionId)

	if len(space) == 0 {
		delete(lm.spaces, spaceId)
	}
}

// becomes no-op when space does not exist
func (lm *LocalMemoryRepo) publishNotificationToSpaceSessions(spaceId uuid.Uuid, spaceUpdate models.SpaceUpdate) {
	lm.mu.Lock()
	defer lm.mu.Unlock()

	space, spaceExists := lm.spaces[spaceId]
	if !spaceExists {
		return
	}

	for _, session := range space {
		lm.publishNotification(session, spaceUpdate)
	}
}

func (lm *LocalMemoryRepo) PublishNewToplevelThread(spaceId uuid.Uuid, userId models.UserUid, newTopLevelThread models.TopLevelThread) {
	u := &models.SingleSpaceUpdate[models.NewTopLevelThreadSpaceUpdatePayload]{
		Type:    models.NewThreadSpaceUpdateType,
		UserId:  userId,
		Payload: models.NewTopLevelThreadSpaceUpdatePayload{TopLevelThread: newTopLevelThread},
	}

	lm.publishNotificationToSpaceSessions(spaceId, u)
}

func (lm *LocalMemoryRepo) PublishNewThread(spaceId uuid.Uuid, userId models.UserUid, newThread models.Thread) {
	u := &models.SingleSpaceUpdate[models.NewThreadSpaceUpdatePayload]{
		Type:    models.NewThreadSpaceUpdateType,
		UserId:  userId,
		Payload: models.NewThreadSpaceUpdatePayload{Thread: newThread},
	}

	lm.publishNotificationToSpaceSessions(spaceId, u)
}

func (lm *LocalMemoryRepo) PublishNewSpaceSubscriber(spaceId uuid.Uuid, userId models.UserUid) {
	u := &models.SingleSpaceUpdate[models.NewSubscriberPayload]{
		Type:    models.NewSubscriberSpaceUpdateType,
		UserId:  userId,
		Payload: models.NewSubscriberPayload{UserId: userId},
	}

	lm.publishNotificationToSpaceSessions(spaceId, u)
}

func (lm *LocalMemoryRepo) PublishNewActiveSpaceSubscriber(spaceId uuid.Uuid, userId models.UserUid) {
	u := &models.SingleSpaceUpdate[models.NewActiveSubscriberPayload]{
		Type:    models.NewActiveSubscriberSpaceUpdateType,
		UserId:  userId,
		Payload: models.NewActiveSubscriberPayload{UserId: userId},
	}

	lm.publishNotificationToSpaceSessions(spaceId, u)
}

func (lm *LocalMemoryRepo) PublishRemoveActiveSpaceSubscriber(spaceId uuid.Uuid, userId models.UserUid) {
	u := &models.SingleSpaceUpdate[models.RemoveActiveSubscriberPayload]{
		Type:    models.RemoveActiveSubscriberSpaceUpdateType,
		UserId:  userId,
		Payload: models.RemoveActiveSubscriberPayload{UserId: userId},
	}

	lm.publishNotificationToSpaceSessions(spaceId, u)
}

func (lm *LocalMemoryRepo) PublishNewMessage(spaceId uuid.Uuid, userId models.UserUid, message models.Message) {
	u := &models.SingleSpaceUpdate[models.NewMessageSpaceUpdatePayload]{
		Type:    models.NewMessageSpaceUpdateType,
		UserId:  userId,
		Payload: models.NewMessageSpaceUpdatePayload{Message: message},
	}

	lm.publishNotificationToSpaceSessions(spaceId, u)
}

func (lm *LocalMemoryRepo) PublishToplevelThreadPopularityIncrease(spaceId uuid.Uuid, userId models.UserUid, threadId uuid.Uuid) {
	u := &models.SingleSpaceUpdate[models.IncreaseTopLevelThreadPopularityUpdatePayload]{
		Type:    models.TopLevelThreadPopularityIncrease,
		UserId:  userId,
		Payload: models.IncreaseTopLevelThreadPopularityUpdatePayload{ThreadId: threadId},
	}

	lm.publishNotificationToSpaceSessions(spaceId, u)
}

func (lm *LocalMemoryRepo) PublishThreadPopularityIncrease(spaceId uuid.Uuid, userId models.UserUid, parentMessageId, threadId uuid.Uuid) {
	u := &models.SingleSpaceUpdate[models.IncreaseThreadPopularityUpdatePayload]{
		Type:    models.ThreadPopularityIncrease,
		UserId:  userId,
		Payload: models.IncreaseThreadPopularityUpdatePayload{ThreadId: threadId, ParentMessageId: parentMessageId},
	}

	lm.publishNotificationToSpaceSessions(spaceId, u)
}

func (lm *LocalMemoryRepo) PublishMessagePopularityIncrease(spaceId uuid.Uuid, userId models.UserUid, threadId, messageId uuid.Uuid) {
	u := &models.SingleSpaceUpdate[models.IncreaseMessagePopularityUpdatePayload]{
		Type:    models.MessagePopularityIncrease,
		UserId:  userId,
		Payload: models.IncreaseMessagePopularityUpdatePayload{ThreadId: threadId, MessageId: messageId},
	}

	lm.publishNotificationToSpaceSessions(spaceId, u)
}

func (lm *LocalMemoryRepo) publishNotification(session *Session, spaceUpdate models.SpaceUpdate) {
	select {
	case session.NotificationsCh <- spaceUpdate:
	default:
		go session.CloseSlow()
	}
}
