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

var (
	validCredentialsPath = "../../secrets/firebase_service_account_key.json"
	testUserEmail        = "test@gmail.com"
	testUserPassword     = "password1?"
)

func TestNewFirebaseAuthClient_invalidCredentials(t *testing.T) {
	_, err := firebase.NewFirebaseAuthClient(context.Background(), "invalid/path")

	assert.Error(t, err)
}

func TestNewFirebaseAuthClient_validCredentials(t *testing.T) {
	_, err := firebase.NewFirebaseAuthClient(context.Background(), validCredentialsPath)

	assert.NoError(t, err)
}

func TestFirebaseAuthClient_VerifyToken_invalidToken(t *testing.T) {
	fac, err := firebase.NewFirebaseAuthClient(context.Background(), validCredentialsPath)
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
			_, err := fac.VerifyToken(context.Background(), tt.token)
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
		err = fac.DeleteAllUsers(ctx)
		require.NoError(t, err)
	})

	token, err := helpers.SignInWithEmailPassword(testUserEmail, testUserPassword)
	require.NoError(t, err)

	userTokenData, err := fac.VerifyToken(ctx, token)

	assert.NoError(t, err)
	assert.Equal(t, userId, userTokenData.ID)
}

// TODO: test other methods of FireBaseAuthClient
