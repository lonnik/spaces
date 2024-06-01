package e2e

import (
	"context"
	"spaces-p/common"
	"spaces-p/models"
)

type test[A, W any] struct {
	name            string
	url             string
	currentTestUser models.BaseUser
	args            A
	wantStatusCode  int
	wantData        W
}

type EmptyAuthClient struct {
	currentTestUser *models.BaseUser
}

func (tac *EmptyAuthClient) VerifyToken(ctx context.Context, idToken string) (*common.UserTokenData, error) {
	return &common.UserTokenData{
		SignInProvider:  "email",
		EmailIsVerified: true,
		BaseUser:        *tac.getCurrentTestUser(),
	}, nil
}

func (tac *EmptyAuthClient) CreateUser(ctx context.Context, email, password string, emailIsVerified bool) (models.UserUid, error) {
	return "", nil
}

func (tac *EmptyAuthClient) DeleteAllUsers(ctx context.Context) error {
	return nil
}

func (tac *EmptyAuthClient) getCurrentTestUser() *models.BaseUser {
	return tac.currentTestUser
}

func (tac *EmptyAuthClient) setCurrentTestUser(newCurrentTestUser models.BaseUser) {
	tac.currentTestUser = &newCurrentTestUser
}
