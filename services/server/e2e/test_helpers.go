package e2e

import (
	"net/http"
	"testing"
)

func isSuccessStatusCode(t *testing.T, statusCode int) bool {
	t.Helper()

	return statusCode >= http.StatusOK && statusCode <= http.StatusIMUsed
}

func copyMap[T any](original map[string]T) map[string]T {
	copyMap := make(map[string]T)
	for key, value := range original {
		copyMap[key] = value
	}
	return copyMap
}
