//go:build e2e
// +build e2e

package helpers

import (
	"fmt"
	"spaces-p/pkg/models"
	"spaces-p/pkg/utils"
	"sync"
	"testing"
)

const (
	usersFixtureFilePath     = "../../fixtures/users.json"
	spacesFixtureFilePath    = "../../fixtures/spaces.json"
	addressesFixtureFilePath = "../../fixtures/addresses.json"
)

var (
	users        []models.BaseUser
	usersErr     error
	usersMu      sync.Mutex
	addresses    []models.Address
	addressesErr error
)

func GetUsers(t *testing.T) []models.BaseUser {
	usersMu.Lock()
	defer usersMu.Unlock()

	if usersErr != nil {
		t.Fatal(usersErr)
	}

	if users == nil {
		users = getUsersFromFile(t, usersFixtureFilePath)
	}

	return users
}

func GetUser(t *testing.T, index int) *models.BaseUser {
	users := GetUsers(t)

	if index < 0 || index >= len(users) {
		t.Fatalf("user index = %d; want a value between 0 and %d", index, len(users)-1)
	}

	return &(users)[index]
}

func getUsersFromFile(t *testing.T, fileName string) []models.BaseUser {
	newUsers, err := utils.LoadRecordsFromJSONFile[models.BaseUser](fileName)
	if err != nil {
		usersErr = fmt.Errorf("utils.GetRecordsFromFile() err = %w; want nil", err)
		t.Fatal(err)
	}

	for i := range newUsers {
		newUsers[i].ID = models.UserUid(fmt.Sprintf("user%d", i+1))
		newUsers[i].AvatarUrl = fmt.Sprintf("https://www.avatars.com/%s", newUsers[i].Username)
	}

	return newUsers
}

func GetAddresses(t *testing.T) []models.Address {
	if addressesErr != nil {
		t.Fatal(addressesErr)
	}

	if addresses == nil {
		addresses = getAddressesFromFile(t, addressesFixtureFilePath)
	}

	return addresses
}

func GetAddress(t *testing.T, index int) *models.Address {
	addresses := GetAddresses(t)

	if index < 0 || index >= len(addresses) {
		t.Fatalf("address index = %d; want a value between 0 and %d", index, len(addresses)-1)
	}

	return &(addresses[index])
}

func getAddressesFromFile(t *testing.T, fileName string) []models.Address {
	addresses, err := utils.LoadRecordsFromJSONFile[models.Address](fileName)
	if err != nil {
		addressesErr = fmt.Errorf("utils.GetRecordsFromFile() err = %w; want nil", err)
		t.Fatal(err)
	}

	return addresses
}

var SpaceFixtures = []*models.Space{
	{
		BaseSpace: models.BaseSpace{
			Name:               "Thulestraße 31",
			ThemeColorHexaCode: "#A1BA6D",
			Radius:             68,
			Location:           models.Location{Long: 13.420215, Lat: 52.555241},
		},
	},
	{
		BaseSpace: models.BaseSpace{
			Name:               "Lunderstr 2",
			ThemeColorHexaCode: "#9AE174",
			Radius:             50,
			Location:           models.Location{Long: 13.419568, Lat: 52.555263},
		},
	},
	{
		BaseSpace: models.BaseSpace{
			Name:               "Haus am Park",
			ThemeColorHexaCode: "#86EB4F",
			Radius:             70,
			Location:           models.Location{Long: 13.420848, Lat: 52.554357},
		},
	},
	{
		BaseSpace: models.BaseSpace{
			Name:               "Trelleborger Str. 6",
			ThemeColorHexaCode: "#230EE7",
			Radius:             50,
			Location:           models.Location{Long: 13.418482, Lat: 52.554775},
		},
	},
}
