package models

import (
	"encoding/json"
	"fmt"
	"spaces-p/errors"
	"spaces-p/uuid"
	"time"
)

type BaseMessage struct {
	Content string      `json:"content" binding:"required"`
	Type    MessageType `json:"type"`
}

type NewMessageInput BaseMessage

type NewTopLevelThreadFirstMessage struct {
	NewMessageInput
	SenderId UserUid `json:"senderId"`
}

type NewMessage struct {
	BaseMessage
	SenderId UserUid   `json:"senderId"`
	ThreadId uuid.Uuid `json:"threadId"`
}

type Message struct {
	NewMessage
	ID            uuid.Uuid `json:"id"`
	CreatedAt     time.Time `json:"created_at"`
	ChildThreadId uuid.Uuid `json:"childThreadId"`
	Likes         int       `json:"likesCount"`
}

type MessageWithChildThreadMessagesCount struct {
	Message
	ChildThreadMessagesCount int64 `json:"childThreadMessagesCount"`
}

type MessageType int

const (
	MessageTypeText MessageType = iota
)

var messageTypeStrings = []string{"text"}
var messageTypeStringMessageTypeMap = map[string]MessageType{"text": MessageTypeText}

func (m *MessageType) String() (string, error) {
	const op errors.Op = "models.MessageType.String"

	if int((*m)) >= len(messageTypeStrings) {
		err := errors.New("invalid message type")
		return "", errors.E(op, err)
	}

	return messageTypeStrings[*m], nil
}

func (m *MessageType) MarshalJSON() ([]byte, error) {
	const op errors.Op = "models.MessageType.MarshalJSON"

	messageTypeString, err := m.String()
	if err != nil {
		return nil, errors.E(op, err)
	}

	messageTypeJson, err := json.Marshal(messageTypeString)
	if err != nil {
		return nil, errors.E(op, err)
	}

	return messageTypeJson, nil
}

func (m *MessageType) Parse(str string) error {
	const op errors.Op = "models.MessageType.Parse"

	messageType, ok := messageTypeStringMessageTypeMap[str]
	if !ok {
		err := errors.New(fmt.Sprintf("%s is not valid messageType value", str))
		return errors.E(op, err)
	}

	*m = messageType

	return nil
}

func (m *MessageType) UnmarshalJSON(data []byte) error {
	const op errors.Op = "models.MessageType.UnmarshalJSON"

	var str string
	if err := json.Unmarshal(data, &str); err != nil {
		return errors.E(op, err)
	}

	if err := m.Parse(str); err != nil {
		return errors.E(op, err)
	}

	return nil
}
