//go:build e2e
// +build e2e

package helpers

import (
	"spaces-p/pkg/common"
	"spaces-p/pkg/models"
)

type Test[A, W any] struct {
	Name            string
	Url             string
	CurrentTestUser models.BaseUser
	Args            A
	WantStatusCode  int
	WantData        W
}

type TestContext struct {
	ApiEndpoint string
	Repo        common.CacheRepository
	AuthClient  *StubAuthClient
	GeocodeRepo *SpyGeocodeRepository
}
