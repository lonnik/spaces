package localmemory

import (
	"spaces-p/models"
	"spaces-p/uuid"
	"sync"
)

const NotificationsBufferSize = 16

type BaseSession struct {
	SpaceId         uuid.Uuid
	UserId          models.UserUid
	NotificationsCh chan models.Notification
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
func (lm *LocalMemoryRepo) PublishNotificationToSpaceSessions(spaceId uuid.Uuid, notification models.Notification) {
	lm.mu.Lock()
	defer lm.mu.Unlock()

	space, spaceExists := lm.spaces[spaceId]
	if !spaceExists {
		return
	}

	for _, session := range space {
		lm.publishNotification(session, notification)
	}
}

// becomes no-op when session does not exist in space
func (lm *LocalMemoryRepo) PublishNotificationToSpaceSession(spaceId, sessionId uuid.Uuid, notification models.Notification) {
	lm.mu.Lock()
	defer lm.mu.Unlock()

	session, sessionExists := lm.spaces[spaceId][sessionId]
	if !sessionExists {
		return
	}

	lm.publishNotification(session, notification)
}

func (lm *LocalMemoryRepo) publishNotification(session *Session, notification []byte) {
	select {
	case session.NotificationsCh <- notification:
	default:
		go session.CloseSlow()
	}
}
