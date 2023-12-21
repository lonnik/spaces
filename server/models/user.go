package models

type baseUser struct {
	ID        string `json:"id"`
	Username  string `json:"username"`
	FirstName string `json:"firstName"`
	LastName  string `json:"lastName"`
	AvatarUrl string `json:"avatarUrl"`
}
type User struct {
	baseUser
	IsSignedUp bool `json:"isSignedUp"`
}

type NewUser baseUser
