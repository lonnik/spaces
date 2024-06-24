package utils_test

import (
	"spaces-p/pkg/utils"
	"testing"
	"time"
)

func TestThrottle(t *testing.T) {
	execute, cleanup := utils.Throttle(1 * time.Nanosecond)
	defer cleanup()

	doneCh := make(chan bool)
	executedFunc := func() {
		doneCh <- true
	}
	execute(executedFunc)

	timer := time.NewTimer(10 * time.Millisecond)
	defer func() {
		if !timer.Stop() {
			<-timer.C
		}
	}()

	select {
	case <-timer.C:
		t.Error("executedFunc was not executed after 10 miliseconds")
	case <-doneCh:
	}
}
