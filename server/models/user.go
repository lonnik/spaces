package models

type baseUser struct {
	ID        string `json:"id" faker:"-"`
	Username  string `json:"username" faker:"username"`
	FirstName string `json:"firstName" faker:"first_name"`
	LastName  string `json:"lastName" faker:"last_name"`
	AvatarUrl string `json:"avatarUrl" faker:"-"`
}
type User struct {
	baseUser
	IsSignedUp bool `json:"isSignedUp"`
}

type NewUser baseUser

type NewFakeUser struct {
	NewUser
	Email string `faker:"email"`
}
