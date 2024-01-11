package models

import "spaces-p/uuid"

const (
	NewTopLevelThreadSpaceUpdateType SpaceUpdateType = iota + 1
	NewThreadSpaceUpdateType
	NewMessageSpaceUpdateType
	NewSubscriberSpaceUpdateType
	NewActiveSubscriberSpaceUpdateType
	RemoveActiveSubscriberSpaceUpdateType
	TopLevelThreadPopularityIncrease
	ThreadPopularityIncrease
	MessagePopularityIncrease
	BatchSpaceUpdateType
)

type SpaceUpdate interface {
	isSpaceUpdate()
}

type SingleSpaceUpdate[T NewTopLevelThreadSpaceUpdatePayload | NewThreadSpaceUpdatePayload | NewSubscriberPayload | NewActiveSubscriberPayload | NewMessageSpaceUpdatePayload | RemoveActiveSubscriberPayload | IncreaseTopLevelThreadPopularityUpdatePayload | IncreaseThreadPopularityUpdatePayload | IncreaseMessagePopularityUpdatePayload] struct {
	Type    SpaceUpdateType `json:"type"`
	UserId  UserUid         `json:"userId"`
	Payload T               `json:"payload"`
}

func (SingleSpaceUpdate[T]) isSpaceUpdate() {}

// TODO: implement publish update function
type MultiSpaceUpdate struct {
	Type    SpaceUpdateType `json:"type"`
	Payload []SpaceUpdate   `json:"payload"`
}

func (MultiSpaceUpdate) isSpaceUpdate() {}

type NewTopLevelThreadSpaceUpdatePayload struct {
	TopLevelThread TopLevelThread `json:"newToplevelThread"`
}

type NewThreadSpaceUpdatePayload struct {
	Thread Thread `json:"newThread"`
}

type NewSubscriberPayload struct {
	UserId UserUid `json:"userId"`
}

type NewActiveSubscriberPayload struct {
	UserId UserUid `json:"userId"`
}

type RemoveActiveSubscriberPayload struct {
	UserId UserUid `json:"userId"`
}

type NewMessageSpaceUpdatePayload struct {
	Message Message `json:"newMessage"`
}

type IncreaseTopLevelThreadPopularityUpdatePayload struct {
	ThreadId uuid.Uuid `json:"threadId"`
}

type IncreaseThreadPopularityUpdatePayload struct {
	ThreadId        uuid.Uuid `json:"threadId"`
	ParentMessageId uuid.Uuid `json:"parentMessageId"`
}

type IncreaseMessagePopularityUpdatePayload struct {
	ThreadId  uuid.Uuid `json:"threadId"`
	MessageId uuid.Uuid `json:"messageId"`
}

type SpaceUpdateType int
