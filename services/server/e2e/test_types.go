package e2e

import (
	"context"
	"spaces-p/common"
	"spaces-p/models"
	"time"
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
		BaseUser:        *tac.currentTestUser,
	}, nil
}

func (tac *EmptyAuthClient) CreateUser(ctx context.Context, email, password string, emailIsVerified bool) (models.UserUid, error) {
	return "", nil
}

func (tac *EmptyAuthClient) DeleteAllUsers(ctx context.Context) error {
	return nil
}

func (tac *EmptyAuthClient) setCurrentTestUser(newCurrentTestUser models.BaseUser) {
	tac.currentTestUser = &newCurrentTestUser
}

type SpyGeocodeRepository struct {
	calledCount        int
	currentTestAddress *models.Address
	currentErr         error
}

func (gr *SpyGeocodeRepository) GetAddress(ctx context.Context, location models.Location) (*models.Address, error) {
	gr.calledCount++

	return gr.currentTestAddress, gr.currentErr
}

func (gr *SpyGeocodeRepository) setTestAddress(newCurrentTestAddress models.Address, err error) {
	gr.currentTestAddress = &newCurrentTestAddress
	gr.currentErr = err
}

func (gr *SpyGeocodeRepository) reset() {
	gr.calledCount = 0
	gr.currentTestAddress = nil
	gr.currentErr = nil
}

type EmptyLogger struct{}

func (lg *EmptyLogger) Info(v ...any)  {}
func (lg *EmptyLogger) Error(v ...any) {}
func (lg *EmptyLogger) RequestInfo(method, path, clientIP string, statusCode int, latency time.Duration) {
}
