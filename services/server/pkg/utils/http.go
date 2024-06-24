package utils

import (
	"context"
	"fmt"
	"net/http"
	"time"
)

func WaitForReady(
	ctx context.Context,
	timeoutDuration time.Duration,
	endpoint string,
) error {
	timeout := time.After(timeoutDuration)

	client := &http.Client{}
	for {
		req, err := http.NewRequestWithContext(ctx, http.MethodGet, endpoint, nil)
		if err != nil {
			return err
		}
		res, err := client.Do(req)
		switch {
		case err != nil:
			fmt.Printf("error making request: %s", err.Error())
		case res.StatusCode == http.StatusOK:
			res.Body.Close()
			fmt.Printf("endpoint is ready!\n")
			return nil
		default:
			res.Body.Close()
		}

		select {
		case <-ctx.Done():
			err := fmt.Errorf("context cancelled: %s", ctx.Err().Error())
			return err
		case <-timeout:
			err := fmt.Errorf("timeout reached")
			return err
		default:
			time.Sleep(100 * time.Millisecond)
			continue
		}
	}
}
