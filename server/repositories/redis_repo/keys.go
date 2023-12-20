package redis_repo

// -----USER ----

var userFields = struct {
	userFirstNameField string
	userLastNameField  string
	userUsernameField  string
	userAvatarUrlField string
}{userFirstNameField: "first_name", userLastNameField: "last_name", userUsernameField: "username", userAvatarUrlField: "avatar_url"}

// getUserKey returns a redis key: users:[user_uid]
//
// The keys holds a HASH value with the following fields: "is_signed_up", "first_name", "last_name" "username", "avatar_url"
func getUserKey(id string) string {
	return "users:" + id
}
