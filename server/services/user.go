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

func (us *UserService) GetUser(ctx context.Context, userId models.UserUid) (*models.User, error) {
	const op errors.Op = "services.UserService.GetUser"

	user, err := us.cacheRepo.GetUserById(ctx, userId)
	switch {
	case err != nil:
		return nil, errors.E(op, err, http.StatusInternalServerError)
	case !user.IsSignedUp:
		return nil, errors.E(op, common.ErrUserNotSignedUp, http.StatusNotFound)
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

// CreateUser verifies the id token for its valicity, verifies that the user's email is verifies.
// It creates a new user with the information extracted from the id token in case there is no user yet with the same UID and returns that newly created user.
// In case a user already exists, CreateUser basically becomes a no-op and returns that existing user.
func (us *UserService) CreateUserFromIdToken(ctx context.Context, idToken string) (*models.User, error) {
	const op errors.Op = "services.UserService.CreateUser"

	token, err := firebase.AuthClient.VerifyIDToken(ctx, idToken)
	if err != nil {
		return nil, errors.E(op, err, http.StatusBadRequest)
	}
	var userUid = models.UserUid(token.UID)

	// extract signInProvider from token claims
	firebaseMap, ok := token.Claims["firebase"].(map[string]any)
	if !ok {
		errNoFirebaseMap := errors.New("there is no firebase claim as map value")
		return nil, errors.E(op, errNoFirebaseMap, http.StatusBadRequest)
	}
	signInProvider, ok := firebaseMap["sign_in_provider"].(string)
	if !ok {
		errNoSignInProvider := errors.New("there is no sign-in provider as string value")
		return nil, errors.E(op, errNoSignInProvider, http.StatusBadRequest)
	}

	// extract isVerified from token claims
	isVerified, ok := token.Claims["email_verified"].(bool)
	if !ok {
		errNoVerifiedClaim := errors.New("there is no is_verified claim as bool value")
		return nil, errors.E(op, errNoVerifiedClaim, http.StatusBadRequest)
	}

	if !isVerified && signInProvider != "password" {
		errNotVerified := errors.New("email is not verified")
		return nil, errors.E(op, errNotVerified, http.StatusBadRequest)
	}

	// check if user already exists in DB using UID
	_, err = us.cacheRepo.GetUserById(ctx, userUid)
	switch {
	case errors.Is(err, common.ErrNotFound):
		if err := us.createNewUserFromTokenClaims(ctx, userUid, token.Claims); err != nil {
			return nil, errors.E(op, err, http.StatusInternalServerError)
		}
	case err != nil:
		return nil, errors.E(op, err, http.StatusInternalServerError)
	}

	user, err := us.cacheRepo.GetUserById(ctx, userUid)
	if err != nil {
		return nil, errors.E(op, err)
	}

	return user, nil
}

func (us *UserService) createNewUserFromTokenClaims(ctx context.Context, id models.UserUid, tokenClaims map[string]any) error {
	const op errors.Op = "services.UserService.createNewUserFromTokenClaims"

	avatarUrl, _ := tokenClaims["picture"].(string)
	var firstName string
	var lastName string
	name, ok := tokenClaims["name"].(string)
	if ok {
		nameArr := strings.Split(name, " ")
		firstName = nameArr[0]
		if len(nameArr) > 1 {
			lastName = strings.Join(nameArr[1:], " ")
		}
	}

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
