package redis_repo

import "github.com/google/uuid"

// ---- USER ----

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

// ---- SPACE ----

// spaces:coords
func getSpaceCoordinatesKey() string {
	return "spaces:coords"
}

// // spaces:[adminId] set of space ids
// func getSpaceAdminKey(adminId string) string {
// 	return "spaces:" + adminId
// }

var spaceFields = struct {
	nameField               string
	themeColorHexaCodeField string
	radiusField             string
	locationField           string
	createdAtField          string
	adminIdField            string
}{
	nameField:               "name",
	themeColorHexaCodeField: "color",
	radiusField:             "radius",
	locationField:           "location",
	createdAtField:          "created_at",
	adminIdField:            "admin",
}

// spaces:[id] hash of space data
func getSpaceKey(spaceId uuid.UUID) string {
	return "spaces:" + spaceId.String()
}
