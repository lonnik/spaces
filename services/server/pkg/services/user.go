package services

import (
	"context"
	"net/http"
	"spaces-p/pkg/common"
	"spaces-p/pkg/errors"
	"spaces-p/pkg/models"
)

type UserService struct {
	logger    common.Logger
	cacheRepo common.CacheRepository
}

func NewUserService(logger common.Logger, cacheRepo common.CacheRepository) *UserService {
	return &UserService{logger, cacheRepo}
}

func (us *UserService) GetUser(ctx context.Context, userId models.UserUid) (*models.User, error) {
	const op errors.Op = "services.UserService.GetUser"

	user, err := us.cacheRepo.GetUserById(ctx, userId)
	switch {
	case err != nil:
		return nil, errors.E(op, err, http.StatusInternalServerError)
		// TODO:
		// case !user.IsSignedUp:
		// 	return nil, errors.E(op, common.ErrUserNotSignedUp, http.StatusNotFound)
	}

	return user, nil
}

func (us *UserService) CreateUser(ctx context.Context, newUser models.NewUser) error {
	const op errors.Op = "services.UserService.CreateUser"

	if err := us.cacheRepo.SetUser(ctx, newUser); err != nil {
		return errors.E(op, err, http.StatusInternalServerError)
	}

	return nil
}

// CreateUser verifies the id token for its valicity, verifies that the user's email is verified.
// It creates a new user with the information extracted from the id token in case there is no user yet with the same UID and returns that newly created user.
// In case a user already exists, CreateUser basically becomes a no-op and returns that existing user.
func (us *UserService) CreateUserFromIdToken(ctx context.Context, authClient common.AuthClient, idToken string) (*models.User, error) {
	const op errors.Op = "services.UserService.CreateUser"

	userToken, err := authClient.VerifyToken(ctx, idToken)
	if err != nil {
		return nil, errors.E(op, err, http.StatusBadRequest)
	}

	if !userToken.EmailIsVerified && userToken.SignInProvider != "password" {
		errNotVerified := errors.New("email is not verified")
		return nil, errors.E(op, errNotVerified, http.StatusBadRequest)
	}

	// check if user already exists in DB using UID
	_, err = us.cacheRepo.GetUserById(ctx, userToken.ID)
	switch {
	case errors.Is(err, common.ErrNotFound):
		if err := us.cacheRepo.SetUser(ctx, models.NewUser(userToken.BaseUser)); err != nil {
			return nil, errors.E(op, err, http.StatusInternalServerError)
		}
	case err != nil:
		return nil, errors.E(op, err, http.StatusInternalServerError)
	}

	user, err := us.cacheRepo.GetUserById(ctx, userToken.ID)
	if err != nil {
		return nil, errors.E(op, err)
	}

	return user, nil
}
