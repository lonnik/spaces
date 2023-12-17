package main

import (
	"fmt"
	"log"
	"net/http"
	"strings"
)

const oauthCallbackPath = "/oauthcallback"

func main() {
	m := http.NewServeMux()
	m.HandleFunc(oauthCallbackPath, func(w http.ResponseWriter, r *http.Request) {
		authCode := r.URL.Query().Get("code")
		state := r.URL.Query().Get("state")
		if authCode == "" || state == "" {
			http.Error(w, "Authorization code not found", http.StatusBadRequest)
			return
		}

		customSchemeURI := strings.Replace(r.URL.String(), oauthCallbackPath, "tryout-expo://", 1)
		fmt.Println("customSchemeURI :>>", customSchemeURI)

		// Redirect to your app's custom scheme URI
		http.Redirect(w, r, customSchemeURI, http.StatusFound)
	})

	log.Println("Starting server on :80")
	log.Fatal(http.ListenAndServe(":80", m))
}
