package models

type Address struct {
	GeoHash          string `json:"geohash"`
	Street           string `json:"street"`
	StreetNumber     string `json:"streetNumber"`
	City             string `json:"city"`
	PostalCode       int    `json:"postalCode"`
	Country          string `json:"country"`
	FormattedAddress string `json:"formattedAddress"`
}
