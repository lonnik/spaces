//go:build e2e
// +build e2e

package helpers

import (
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"spaces-p/pkg/models"
	"testing"
)

// makes a request and when the status code of the response is in the 200er range, then it parses the response body and returns it.
// If the response status code is not in the 200er range, it returns nil as the first return value.
func MakeRequest[T any](
	t *testing.T,
	httpClient http.Client,
	method, url string,
	requestBody io.Reader,
	wantStatusCode int,
	asUser models.BaseUser,
	authClient *StubAuthClient,
) (*T, func()) {
	t.Helper()

	authClient.SetCurrentTestUser(asUser.ID)
	defer authClient.SetCurrentTestUser("")

	resp, teardownFunc := request(t, method, url, "fake_authorization_token", requestBody, httpClient)

	if resp.StatusCode != wantStatusCode {
		t.Errorf("resp.StatusCode got = %d; want = %d", resp.StatusCode, wantStatusCode)
	}

	if !isSuccessStatusCode(t, resp.StatusCode) {
		return nil, teardownFunc
	}

	responseBody, err := io.ReadAll(resp.Body)
	if err != nil {
		t.Fatalf("io.ReadAll err = %s; want nil", err)
	}

	var spaceResponse T
	err = json.Unmarshal(responseBody, &spaceResponse)
	if err != nil {
		t.Fatalf("json.Unmarshal() err = %s; want nil", err)
	}

	return &spaceResponse, teardownFunc
}

func request(t *testing.T, method, url, authorizationToken string, body io.Reader, httpClient http.Client) (*http.Response, func()) {
	req, err := http.NewRequest(method, url, body)
	if err != nil {
		t.Fatalf("http.NewRequest() err = %s; want nil", err)
	}
	req.Header.Add("Authorization", fmt.Sprintf("Bearer %s", authorizationToken))

	resp, err := httpClient.Do(req)
	if err != nil {
		t.Fatalf("client.Do() err = %s; want nil", err)
	}

	return resp, func() {
		resp.Body.Close()
	}
}

func isSuccessStatusCode(t *testing.T, statusCode int) bool {
	t.Helper()

	return statusCode >= http.StatusOK && statusCode <= http.StatusIMUsed
}
