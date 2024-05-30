package firebase

import (
	"context"
	"fmt"
	"spaces-p/common"
	"spaces-p/errors"
	"spaces-p/models"
	"strings"

	firebase "firebase.google.com/go/v4"
	"firebase.google.com/go/v4/auth"
	"google.golang.org/api/option"
)

type FirebaseAuthClient struct {
	client *auth.Client
}

func NewFirebaseAuthClient(ctx context.Context) (*FirebaseAuthClient, error) {
	const op errors.Op = "firebase.NewFirebaseAuthClient"

	opt := option.WithCredentialsFile("./firebase/firebase_service_account_key.json")

	app, err := firebase.NewApp(ctx, nil, opt)
	if err != nil {
		return nil, errors.E(op, err)
	}

	authClient, err := app.Auth(ctx)
	if err != nil {
		return nil, errors.E(op, err)
	}

	return &FirebaseAuthClient{authClient}, nil
}

func (fac *FirebaseAuthClient) VerifyToken(ctx context.Context, idToken string) (*common.UserTokenData, error) {
	const op errors.Op = "firebase.FirebaseAuthClient.VerifyToken"

	token, err := fac.client.VerifyIDToken(ctx, idToken)
	if err != nil {
		return nil, errors.E(op, err)
	}

	emailIsVerified, ok := token.Claims["email_verified"].(bool)
	if !ok {
		err := fmt.Errorf("there is no is_verified claim as bool value")
		return nil, errors.E(op, err)
	}

	firebaseMap, ok := token.Claims["firebase"].(map[string]any)
	if !ok {
		err := fmt.Errorf("there is no firebase claim as map value")
		return nil, errors.E(op, err)
	}
	signInProvider, ok := firebaseMap["sign_in_provider"].(string)
	if !ok {
		err := fmt.Errorf("there is no sign-in provider as string value")
		return nil, errors.E(op, err)
	}

	var userToken = &common.UserTokenData{
		SignInProvider:  common.SignInProvider(signInProvider),
		EmailIsVerified: emailIsVerified,
		BaseUser:        *fac.getBaseUserDataFromTokenClaims(token.Claims, models.UserUid(token.UID)),
	}

	return userToken, nil
}

func (fac *FirebaseAuthClient) CreateUser(ctx context.Context, email, password string, emailIsVerified bool) (models.UserUid, error) {
	const op errors.Op = "firebase.FirebaseAuthClient.CreateUser"

	fireBaseUserparams := (&auth.UserToCreate{}).Email(email).Password(password).EmailVerified(emailIsVerified)
	u, err := fac.client.CreateUser(ctx, fireBaseUserparams)
	if err != nil {
		return "", errors.E(op, err)
	}

	return models.UserUid(u.UID), nil
}

func (fac *FirebaseAuthClient) getBaseUserDataFromTokenClaims(tokenClaims map[string]any, userId models.UserUid) *models.BaseUser {
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

	return &models.BaseUser{
		ID:        userId,
		AvatarUrl: avatarUrl,
		FirstName: firstName,
		LastName:  lastName,
	}
}
