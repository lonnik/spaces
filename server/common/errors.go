package common

import "spaces-p/errors"

var (
	ErrNotFound        = errors.New("not found")
	ErrUserNotSignedUp = errors.New("user is not fully signed up yet")
)
