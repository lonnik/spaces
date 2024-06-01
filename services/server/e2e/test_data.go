package e2e

import "spaces-p/models"

var Users = map[string]models.BaseUser{
	"user1": {
		ID:        models.UserUid("user1"),
		Username:  "niko",
		FirstName: "Nikolas",
		LastName:  "Heidner",
		AvatarUrl: "https://www.avatars.com/niko",
	},
	"user2": {
		ID:        models.UserUid("user2"),
		Username:  "luka",
		FirstName: "Luka",
		LastName:  "Stärk",
		AvatarUrl: "https://www.avatars.com/luka",
	},
	"user3": {
		ID:        models.UserUid("user3"),
		Username:  "przemi",
		FirstName: "Przemek",
		LastName:  "Borucki",
		AvatarUrl: "https://www.avatars.com/przemi",
	},
}

var spaces = map[string]*models.Space{
	"space1": {
		BaseSpace: models.BaseSpace{
			Name:               "Thulestraße 31",
			ThemeColorHexaCode: "#A1BA6D",
			Radius:             68,
			Location:           models.Location{Long: 13.420215, Lat: 52.555241},
		},
	},
	"space2": {
		BaseSpace: models.BaseSpace{
			Name:               "Lunderstr 2",
			ThemeColorHexaCode: "#9AE174",
			Radius:             50,
			Location:           models.Location{Long: 13.419568, Lat: 52.555263},
		},
	},
	"space3": {
		BaseSpace: models.BaseSpace{
			Name:               "Haus am Park",
			ThemeColorHexaCode: "#86EB4F",
			Radius:             70,
			Location:           models.Location{Long: 13.420848, Lat: 52.554357},
		},
	},
	"space4": {
		BaseSpace: models.BaseSpace{
			Name:               "Trelleborger Str. 6",
			ThemeColorHexaCode: "#230EE7",
			Radius:             50,
			Location:           models.Location{Long: 13.418482, Lat: 52.554775},
		},
	},
}
