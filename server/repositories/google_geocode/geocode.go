package googlegeocode

const baseUrl = "https://maps.googleapis.com/maps/api/geocode/json"

type GoogleGeocodeRepo struct {
	apiKey string
}

func NewGoogleGeocodeRepo(apiKey string) *GoogleGeocodeRepo {
	return &GoogleGeocodeRepo{apiKey}
}
