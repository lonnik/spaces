package googlegeocode

import (
	"context"
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"net/url"
	"spaces-p/pkg/errors"
	"spaces-p/pkg/models"
	"spaces-p/pkg/utils"
	"strconv"
	"strings"
)

var (
	ErrNonSuccessResponseStatus = errors.New("no success response status")
	ErrZeroResults              = errors.New("no results were found")
	acceptedResultTypes         = []string{"street_address", "sublocality_level_2", "sublocality_level_1", "sublocality", "locality"}
)

type AddressComponent struct {
	LongName  string   `json:"long_name"`
	ShortName string   `json:"short_name"`
	Types     []string `json:"types"`
}

type Result struct {
	Types             []string           `json:"types"`
	AddressComponents []AddressComponent `json:"address_components"`
	FormattedAddress  string             `json:"formatted_address"`
}

type ResponseBody struct {
	Status       string   `json:"status"`
	Results      []Result `json:"results"`
	ErrorMessage string   `json:"error_message"`
}

func (gcr *GoogleGeocodeRepo) GetAddress(ctx context.Context, location models.Location) (*models.Address, error) {
	const op errors.Op = "googlegeocode.GoogleGeocodeRepo.GetAddress"

	url, err := gcr.constructReverseGeoCodeUrl(location)
	if err != nil {
		return &models.Address{}, errors.E(op, err)
	}

	req, err := http.NewRequest("GET", url, nil)
	if err != nil {
		return &models.Address{}, errors.E(op, err)
	}
	req.Header.Set("Content-Type", "application/json")

	var client = http.Client{}
	res, err := client.Do(req)
	if err != nil {
		return &models.Address{}, errors.E(op, err)
	}
	defer res.Body.Close()
	requestSucceeded := strings.HasPrefix(res.Status, "2")
	if !requestSucceeded {
		return &models.Address{}, errors.E(op, ErrNonSuccessResponseStatus)
	}

	responseBodyJson, err := io.ReadAll(res.Body)
	if err != nil {
		return &models.Address{}, errors.E(op, err)
	}

	var responseBody ResponseBody
	if err := json.Unmarshal(responseBodyJson, &responseBody); err != nil {
		return &models.Address{}, errors.E(op, err)
	}

	if responseBody.Status == "ZERO_RESULTS" {
		return &models.Address{}, errors.E(op, ErrZeroResults)
	}
	if len(responseBody.Results) == 0 {
		err := fmt.Errorf("response status = %v: error message = %v", responseBody.Status, responseBody.ErrorMessage)
		return &models.Address{}, errors.E(op, err)
	}
	if responseBody.Status != "OK" {
		return &models.Address{}, errors.E(op, ErrNonSuccessResponseStatus)
	}

	result := getResult(responseBody.Results)

	return constructAddressFromResult(result), nil
}

func (gcr *GoogleGeocodeRepo) constructReverseGeoCodeUrl(location models.Location) (string, error) {
	const op errors.Op = "googlegeocode.GoogleGeocodeRepo.constructReverseGeoCodeUrl"

	u, err := url.Parse(baseUrl)
	if err != nil {
		return "", errors.E(op, err)
	}

	urlParams := url.Values{}
	latLngValue := fmt.Sprintf("%f,%f", location.Lat, location.Long)
	resultTypeValue := strings.Join(acceptedResultTypes, "|")
	urlParams.Add("latlng", latLngValue)
	urlParams.Add("key", gcr.apiKey)
	urlParams.Add("result_type", resultTypeValue)
	u.RawQuery = urlParams.Encode()

	return u.String(), nil
}

func constructAddressFromResult(result Result) *models.Address {
	resultType := getMinResultType(result.Types)
	var address = models.Address{}
	switch resultType {
	case acceptedResultTypes[0]: // street_number
		for _, addressComponent := range result.AddressComponents {
			if utils.SliceContains[string](addressComponent.Types, "street_number") {
				address.StreetNumber = addressComponent.ShortName
			}
			if utils.SliceContains[string](addressComponent.Types, "route") {
				address.Street = addressComponent.ShortName
			}
			if utils.SliceContains[string](addressComponent.Types, "locality") {
				address.City = addressComponent.ShortName
			}
			if utils.SliceContains[string](addressComponent.Types, "postal_code") {
				postalCode, _ := strconv.Atoi(addressComponent.ShortName)
				address.PostalCode = postalCode
			}
			if utils.SliceContains[string](addressComponent.Types, "country") {
				address.Country = addressComponent.LongName
			}
		}
		address.FormattedAddress = result.FormattedAddress
	case acceptedResultTypes[2], acceptedResultTypes[3], acceptedResultTypes[4]: //sublocality, locality
		for _, addressComponent := range result.AddressComponents {
			if utils.SliceContains[string](addressComponent.Types, "locality") {
				address.City = addressComponent.ShortName
			}

			if utils.SliceContains[string](addressComponent.Types, "country") {
				address.Country = addressComponent.LongName
			}
		}
		address.FormattedAddress = result.FormattedAddress
	}

	return &address
}

func getResult(results []Result) Result {
	for i, result := range results {
		resultType := getMinResultType(result.Types)
		var isLastResult = len(results)-1 == i
		if (resultType != acceptedResultTypes[1]) || isLastResult {
			return result
		}
	}

	return Result{}
}

func getMinResultType(resultTypes []string) string {
	var minResultTypeIndex = len(acceptedResultTypes)
	for _, resultType := range resultTypes {
		resultTypeIndex := getResultTypeIndex(resultType)
		if resultTypeIndex < minResultTypeIndex {
			minResultTypeIndex = resultTypeIndex
		}
	}

	return acceptedResultTypes[minResultTypeIndex]
}

func getResultTypeIndex(resultType string) int {
	for i, acceptedResultType := range acceptedResultTypes {
		if acceptedResultType == resultType {
			return i
		}
	}

	return len(acceptedResultTypes)
}
