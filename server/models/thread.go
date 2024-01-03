package models

import (
	"encoding/json"
	"fmt"
	"spaces-p/errors"
	"spaces-p/uuid"
)

type BaseThread struct {
	ID            uuid.Uuid `json:"id"`
	Likes         int       `json:"likes"`
	MessagesCount int       `json:"messagesCount"`
	SpaceId       uuid.Uuid `json:"spaceId"`
}

type TopLevelThread struct {
	BaseThread
	FirstMessage Message `json:"firstMessage"`
}

type Thread struct {
	BaseThread
	ParentMessageId uuid.Uuid `json:"parentMessageId"`
}

type ThreadWithMessages struct {
	Thread
	Messages []MessageWithChildThreadMessagesCount `json:"messages"`
}

type Sorting int

const (
	RecentSorting Sorting = iota
	PopularitySorting
)

var sortingStrings = map[string]Sorting{"recent": RecentSorting, "popularity": PopularitySorting}

func (s *Sorting) UnmarshalJSON(data []byte) error {
	const op errors.Op = "models.Sorting.UnmarshalJSON"

	var str string
	if err := json.Unmarshal(data, &str); err != nil {
		return errors.E(op, err)
	}

	sorting, ok := sortingStrings[str]
	if !ok {
		err := errors.New(fmt.Sprintf("%s is not valid sorting value", str))
		return errors.E(op, err)
	}

	*s = sorting

	return nil
}
