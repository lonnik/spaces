package helpers

import (
	"bytes"
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"os"
)

// signInWithEmailPassword signs in a user using email and password
// and returns the ID token.
func FirebaseAuthSignInByEmail(email, password string) (idToken string, err error) {
	apiKey := os.Getenv("TEST_FIREBASE_API_KEY")

	url := fmt.Sprintf("https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=%s", apiKey)

	payload := map[string]string{
		"email":             email,
		"password":          password,
		"returnSecureToken": "true",
	}
	jsonPayload, err := json.Marshal(payload)
	if err != nil {
		return "", err
	}

	resp, err := http.Post(url, "application/json", bytes.NewReader(jsonPayload))
	if err != nil {
		return "", err
	}
	defer resp.Body.Close()

	body, err := io.ReadAll(resp.Body)
	if err != nil {
		return "", err
	}

	if resp.StatusCode != http.StatusOK {
		return "", fmt.Errorf("error signing in: %v", string(body))
	}

	var result map[string]interface{}
	if err := json.Unmarshal(body, &result); err != nil {
		return "", err
	}

	idToken, ok := result["idToken"].(string)
	if !ok {
		return "", fmt.Errorf("unable to find idToken in response")
	}

	return idToken, nil
}
