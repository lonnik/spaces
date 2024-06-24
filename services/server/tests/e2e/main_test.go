//go:build e2e
// +build e2e

package e2e

import (
	"flag"
	"fmt"
	"os"
	"spaces-p/tests/e2e/helpers"

	"testing"
)

var (
	apiVersion = "v1"
	serverPort = "8081"
)

func TestMain(m *testing.M) {
	flag.Parse()

	os.Setenv("ENVIRONMENT", "test")
	defer os.Unsetenv("ENVIRONMENT")

	// TODO: remove lines after removing gin dependency
	os.Setenv("GIN_MODE", "test")
	defer os.Unsetenv("GIN_MODE")

	teardownFunc, err := helpers.SetupE2EEnv(apiVersion, serverPort)
	if err != nil {
		fmt.Fprintf(os.Stderr, "helpers.SetupE2EEnv() err = %s; want nil\n", err)
		os.Exit(1)
	}
	defer teardownFunc()

	exitCode := m.Run()
	os.Exit(exitCode)
}
