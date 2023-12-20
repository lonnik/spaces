package services

import (
	"context"
	"net/http"
	"spaces-p/common"
	"spaces-p/errors"
	"spaces-p/firebase"
	"spaces-p/models"
	"strings"
)

type UserService struct {
	logger    common.Logger
	cacheRepo common.CacheRepository
}

func NewUserService(logger common.Logger, cacheRepo common.CacheRepository) *UserService {
	return &UserService{logger, cacheRepo}
}

// CreateUser verifies the id token for its valicity, verifies that the user's email is verifies.
// It creates a new user with the information extracted from the id token in case there is no user yet with the same UID and returns that newly created user.
// In case a user already exists, CreateUser basically becomes a no-op and returns that existing user.
func (us *UserService) CreateUser(ctx context.Context, idToken string) (*models.User, error) {
	const op errors.Op = "services.UserService.CreateUser"

	token, err := firebase.AuthClient.VerifyIDToken(ctx, idToken)
	if err != nil {
		return nil, errors.E(op, err, http.StatusBadRequest)
	}

	isVerified, ok := token.Claims["email_verified"].(bool)
	switch {
	case !ok:
		errNoVerifiedClaim := errors.New("there is no is_verified claim with bool value")
		return nil, errors.E(op, errNoVerifiedClaim, http.StatusBadRequest)
	case !isVerified:
		errNotVerified := errors.New("email is not verified")
		return nil, errors.E(op, errNotVerified, http.StatusBadRequest)
	}

	// check if user already exists in DB using UID
	_, err = us.cacheRepo.GetUserById(ctx, token.UID)
	switch {
	case errors.Is(err, common.ErrNotFound):
		if err := us.createNewUserFromTokenClaims(ctx, token.UID, token.Claims); err != nil {
			return nil, errors.E(op, err, http.StatusInternalServerError)
		}
	case err != nil:
		return nil, errors.E(op, err, http.StatusInternalServerError)
	}

	user, err := us.cacheRepo.GetUserById(ctx, token.UID)
	if err != nil {
		return nil, errors.E(op, err)
	}

	return user, nil
}

func (us *UserService) createNewUserFromTokenClaims(ctx context.Context, id string, tokenClaims map[string]any) error {
	const op errors.Op = "services.UserService.createNewUserFromTokenClaims"

	avatarUrl := tokenClaims["picture"].(string)
	name := tokenClaims["name"].(string)
	nameArr := strings.Split(name, " ")
	firstName := nameArr[0]
	lastName := strings.Join(nameArr[1:], " ")

	var newUser = models.NewUser{
		ID:        id,
		AvatarUrl: avatarUrl,
		FirstName: firstName,
		LastName:  lastName,
	}
	if err := us.cacheRepo.SetUser(ctx, newUser); err != nil {
		return errors.E(op, err)
	}

	return nil
}
