package models

type BaseUser struct {
	ID        string `json:"id"`
	Username  string `json:"username"`
	FirstName string `json:"firstName"`
	LastName  string `json:"lastName"`
	AvatarUrl string `json:"avatarUrl"`
}
type User struct {
	BaseUser
	IsSignedUp bool `json:"isSignedUp"`
}

type NewUser BaseUser
