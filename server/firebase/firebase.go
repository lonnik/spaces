package firebase

import (
	"context"
	"spaces-p/errors"

	firebase "firebase.google.com/go/v4"
	"firebase.google.com/go/v4/auth"
	"google.golang.org/api/option"
)

var AuthClient *auth.Client

func InitAuthClient() error {
	const op errors.Op = "firebase.InitAuthClient"

	ctx := context.Background()
	opt := option.WithCredentialsFile("./serviceAccountKey.json")

	app, err := firebase.NewApp(ctx, nil, opt)
	if err != nil {
		return errors.E(op, err)
	}

	AuthClient, err = app.Auth(ctx)
	if err != nil {
		return errors.E(op, err)
	}

	return nil
}
