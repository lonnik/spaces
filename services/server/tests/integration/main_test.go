package integration

import (
	"fmt"
	"os"
	"testing"

	"github.com/joho/godotenv"
)

func TestMain(m *testing.M) {
	err := godotenv.Load("../../.env.test")
	if err != nil {
		fmt.Println(".env.test file couldn't be loaded")
	}

	os.Setenv("ENVIRONMENT", "test")
	defer os.Unsetenv("ENVIRONMENT")

	os.Exit(m.Run())
}
