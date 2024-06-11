package models

type UserUid string

func (m UserUid) MarshalBinary() ([]byte, error) {
	return []byte(m), nil
}

type BaseUser struct {
	ID        UserUid `json:"id" faker:"-"`
	Username  string  `json:"username" faker:"username"`
	FirstName string  `json:"firstName" faker:"first_name"`
	LastName  string  `json:"lastName" faker:"last_name"`
	AvatarUrl string  `json:"avatarUrl" faker:"-"`
}
type User struct {
	BaseUser
	IsSignedUp bool `json:"isSignedUp"`
}

type NewUser BaseUser

type NewFakeUser struct {
	NewUser
	Email string `faker:"email"`
}
