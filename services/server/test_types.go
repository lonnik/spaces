package main

import "spaces-p/models"

type test[T []string] struct {
	name            string
	url             string
	currentTestUser models.BaseUser
	wantStatusCode  int
	wantData        T
}
