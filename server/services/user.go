package services

import (
	"fmt"
	"io"
	"net/http"
	"net/url"
	"spaces-p/common"
	"spaces-p/models"
	"strings"
)

type UserService struct {
	logger common.Logger
}

const (
	clientId     = "761033409352-qg2008kkuf6f2jlm9vbh025qj3emih95.apps.googleusercontent.com"
	clientSecret = "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"
	redirectUri  = "https://2e5d-2003-ca-5f3a-3500-9125-c037-490c-b88d.ngrok-free.app/api/google-oauthcallback"
)

func NewUserService(logger common.Logger) *UserService {
	return &UserService{logger}
}

func (us *UserService) SignUpGoogle(authCode, codeVerifier string) (*models.User, error) {
	client := &http.Client{}

	data := url.Values{}
	data.Set("client_id", clientId)
	data.Set("client_secret", clientSecret)
	data.Set("code", authCode)
	data.Set("code_verifier", codeVerifier)
	data.Set("grant_type", "authorization_code")
	data.Set("redirect_uri", redirectUri)

	req, err := http.NewRequest("POST", "https://oauth2.googleapis.com/token", strings.NewReader(data.Encode()))
	if err != nil {
		return nil, err
	}
	req.Header.Add("Content-Type", "application/x-www-form-urlencoded")

	resp, err := client.Do(req)
	if err != nil {
		return nil, err
	}
	defer resp.Body.Close()

	responseBody, err := io.ReadAll(resp.Body)
	if err != nil {
		return nil, err
	}

	fmt.Println("responseBody :>>", string(responseBody))
	fmt.Println("resp.Header :>>", resp.Header)

	return nil, nil
}
