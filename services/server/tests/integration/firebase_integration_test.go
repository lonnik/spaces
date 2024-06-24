//go:build integration
// +build integration

package integration

import (
	"context"
	"spaces-p/pkg/firebase"
	"spaces-p/tests/integration/helpers"
	"testing"

	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/require"
)

// NOTE: This test requires a valid firebase service account key to be present in the secrets folder
// and a firebase API key to be present in the .env.test file.
// This test tests the FirebaseAuthClient implementation of the AuthClient interface

var (
	validCredentialsPath = "../../secrets/firebase_service_account_key.json"
	testUserPassword     = "password1?"
	testUserEmail        = "test@gmail.com"
)

func TestNewFirebaseAuthClient_invalidCredentials(t *testing.T) {
	_, err := firebase.NewFirebaseAuthClient(context.Background(), "invalid/path")

	assert.Error(t, err)
}

func TestNewFirebaseAuthClient_validCredentials(t *testing.T) {
	_, err := firebase.NewFirebaseAuthClient(context.Background(), validCredentialsPath)

	assert.NoError(t, err)
}

func TestFirebaseAuthClient_CreateUser(t *testing.T) {
	ctx := context.Background()

	fac, err := firebase.NewFirebaseAuthClient(ctx, validCredentialsPath)
	require.NoError(t, err)

	tests := []struct {
		name            string
		email           string
		password        string
		emailIsVerified bool
	}{
		{"user 1", "test@gmail.com", testUserPassword, true},
		{"user 2", "test2@gmail.com", testUserPassword, false},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			userId, err := fac.CreateUser(ctx, tt.email, tt.password, tt.emailIsVerified)
			require.NoError(t, err)
			t.Cleanup(func() {
				_, err = fac.DeleteAllUsers(ctx)
				require.NoError(t, err)
			})

			firebaseUserData, err := fac.Client.GetUser(ctx, string(userId))
			assert.NoError(t, err)
			assert.Equal(t, tt.email, firebaseUserData.Email)
			assert.Equal(t, tt.emailIsVerified, firebaseUserData.EmailVerified)
		})
	}
}

func TestFirebaseAuthClient_DeleteAllUsers(t *testing.T) {
	ctx := context.Background()

	fac, err := firebase.NewFirebaseAuthClient(ctx, validCredentialsPath)
	require.NoError(t, err)

	userId, err := fac.CreateUser(ctx, testUserEmail, testUserPassword, true)
	require.NoError(t, err)

	_, err = fac.Client.GetUser(ctx, string(userId))
	require.NoError(t, err)

	usersDeletedCount, err := fac.DeleteAllUsers(ctx)
	assert.NoError(t, err)
	assert.Equal(t, 1, usersDeletedCount)

	_, err = fac.Client.GetUser(ctx, string(userId))
	assert.Error(t, err)
}

func TestFirebaseAuthClient_VerifyToken_invalidToken(t *testing.T) {
	ctx := context.Background()

	fac, err := firebase.NewFirebaseAuthClient(ctx, validCredentialsPath)
	require.NoError(t, err)

	_, err = fac.CreateUser(ctx, testUserEmail, testUserPassword, true)
	require.NoError(t, err)
	t.Cleanup(func() {
		_, err = fac.DeleteAllUsers(ctx)
		require.NoError(t, err)
	})

	_, err = helpers.FirebaseAuthSignInByEmail(testUserEmail, testUserPassword)
	require.NoError(t, err)

	tests := []struct {
		name  string
		token string
	}{
		{"empty token", ""},
		{"invalid token", "invalid_token"},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			_, err := fac.VerifyToken(ctx, tt.token)
			t.Logf("error: %v", err)
			assert.Error(t, err)
		})
	}
}

func TestFirebaseAuthClient_VerifyToken_validToken(t *testing.T) {
	ctx := context.Background()

	fac, err := firebase.NewFirebaseAuthClient(ctx, validCredentialsPath)
	require.NoError(t, err)

	userId, err := fac.CreateUser(ctx, testUserEmail, testUserPassword, true)
	require.NoError(t, err)
	t.Cleanup(func() {
		_, err = fac.DeleteAllUsers(ctx)
		require.NoError(t, err)
	})

	token, err := helpers.FirebaseAuthSignInByEmail(testUserEmail, testUserPassword)
	require.NoError(t, err)

	userTokenData, err := fac.VerifyToken(ctx, token)

	assert.NoError(t, err)
	assert.Equal(t, userId, userTokenData.UserId)
}
