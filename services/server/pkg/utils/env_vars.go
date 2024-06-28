package utils

import (
	"fmt"
	"os"
)

func GetEnv(key string) (string, error) {
	envVars := map[string]string{
		"DB_HOST":                os.Getenv("DB_HOST"),
		"DB_USER":                os.Getenv("DB_USER"),
		"DB_PASSWORD":            os.Getenv("DB_PASSWORD"),
		"DB_NAME":                os.Getenv("DB_NAME"),
		"ENVIRONMENT":            os.Getenv("ENVIRONMENT"),
		"API_VERSION":            os.Getenv("API_VERSION"),
		"REDIS_HOST":             os.Getenv("REDIS_HOST"),
		"REDIS_PORT":             os.Getenv("REDIS_PORT"),
		"GOOGLE_GEOCODE_API_KEY": os.Getenv("GOOGLE_GEOCODE_API_KEY"),
		"HOST":                   os.Getenv("HOST"),
		"PORT":                   os.Getenv("PORT"),
	}

	val, ok := envVars[key]
	if val == "" || !ok {
		err := fmt.Errorf("no value found for key: %s", key)
		return "", err
	}

	return val, nil
}
