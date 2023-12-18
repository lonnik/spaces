package models

import (
	"github.com/google/uuid"
)

type User struct {
	ID         uuid.UUID `json:"id"`
	Username   string    `json:"username"`
	FirstName  string    `json:"firstName"`
	LastName   string    `json:"lastName"`
	IsVerified bool      `json:"isVerified"`
	IsSignedUp bool      `json:"isSignedUp"`
}
