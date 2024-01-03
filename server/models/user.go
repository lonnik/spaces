package models

type UserUid string

func (m UserUid) MarshalBinary() ([]byte, error) {
	return []byte(m), nil
}

type baseUser struct {
	ID        UserUid `json:"id" faker:"-"`
	Username  UserUid `json:"username" faker:"username"`
	FirstName string  `json:"firstName" faker:"first_name"`
	LastName  string  `json:"lastName" faker:"last_name"`
	AvatarUrl string  `json:"avatarUrl" faker:"-"`
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
