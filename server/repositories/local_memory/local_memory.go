package localmemory

import (
	"spaces-p/common"
	"spaces-p/errors"
	"spaces-p/models"
	"spaces-p/uuid"

	"nhooyr.io/websocket"
)

type BaseSession struct {
	SpaceId       uuid.Uuid
	UserId        uuid.Uuid
	Conn          *websocket.Conn
	Notifications chan models.Notification
}

type Session struct {
	SessionId uuid.Uuid
	BaseSession
}

type NewSessionInput BaseSession

type space map[uuid.Uuid]*Session

// TODO: must be thread-safe
type LocalMemory struct {
	spaces map[uuid.Uuid]space
}

func NewLocalMemory() *LocalMemory {
	return &LocalMemory{spaces: map[uuid.Uuid]space{}}
}

func (lm *LocalMemory) AddSession(newSessionInput NewSessionInput) *Session {
	var newSessionId = uuid.New()

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

func (lm *LocalMemory) GetSession(spaceId, sessionId uuid.Uuid) (*Session, error) {
	const op errors.Op = "localmemory.LocalMemory.GetSession"

	session, sessionExists := lm.spaces[spaceId][sessionId]
	if !sessionExists {
		return nil, errors.E(op, common.ErrNotFound)
	}

	return session, nil
}

// becomes no-op when space or session does not exist
func (lm *LocalMemory) DeleteSession(spaceId, sessionId uuid.Uuid) {
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
func (lm *LocalMemory) PublishNotificationToSpaceSessions(spaceId uuid.Uuid, notification models.Notification) {
	space, spaceExists := lm.spaces[spaceId]
	if !spaceExists {
		return
	}

	for _, session := range space {
		session.Notifications <- notification
	}
}

// becomes no-op when session does not exist in space
func (lm *LocalMemory) PublishNotificationToSpaceSession(spaceId, sessionId uuid.Uuid, notification models.Notification) {
	session, sessionExists := lm.spaces[spaceId][sessionId]
	if !sessionExists {
		return
	}

	session.Notifications <- notification
}
