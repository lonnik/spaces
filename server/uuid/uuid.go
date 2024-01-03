package uuid

import (
	"encoding/json"
	"spaces-p/errors"

	"github.com/google/uuid"
)

var Nil = Uuid(uuid.Nil)

type Uuid uuid.UUID

func (u Uuid) MarshalJSON() ([]byte, error) {
	if uuid.UUID(u) == uuid.Nil {
		return []byte(`""`), nil
	}

	return json.Marshal(uuid.UUID(u))
}

func (u *Uuid) UnmarshalJSON(data []byte) error {
	const op errors.Op = "uuid.Uuid.UnmarshalJSON"

	var rawUUID uuid.UUID
	if err := json.Unmarshal(data, &rawUUID); err != nil {
		return errors.E(op, err)
	}

	*u = Uuid(rawUUID)

	return nil
}

func (u Uuid) String() string {
	return uuid.UUID(u).String()
}

func Parse(s string) (Uuid, error) {
	const op errors.Op = "models.Parse"

	if s == "" {
		return Nil, nil
	}

	rawUUID, err := uuid.Parse(s)
	if err != nil {
		return Nil, errors.E(op, err)
	}

	return Uuid(rawUUID), nil
}

func IsInvalidLengthError(err error) bool {
	return uuid.IsInvalidLengthError(err)
}

func New() Uuid {
	return Uuid(uuid.New())
}
