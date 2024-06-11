package common

import "spaces-p/pkg/errors"

var (
	ErrNotFound            = errors.New("not found")
	ErrUserNotSignedUp     = errors.New("user is not fully signed up yet")
	ErrOnlyAllowedInDevEnv = errors.New("only allowed in development environment")
)
