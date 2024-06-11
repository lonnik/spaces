package common

import (
	"context"
	"spaces-p/pkg/models"
)

type SignInProvider string

type UserTokenData struct {
	SignInProvider  SignInProvider
	EmailIsVerified bool
	models.BaseUser
}

type AuthClient interface {
	VerifyToken(ctx context.Context, idToken string) (*UserTokenData, error)
	CreateUser(ctx context.Context, email, password string, emailIsVerified bool) (models.UserUid, error)
	DeleteAllUsers(ctx context.Context) error
}
