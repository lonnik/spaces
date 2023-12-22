package main

import (
	"context"
	"encoding/json"
	"io"
	"math/rand"
	"os"
	"spaces-p/errors"
	"spaces-p/firebase"
	"spaces-p/models"
	"spaces-p/redis"
	"spaces-p/repositories/redis_repo"
	"spaces-p/services"
	"spaces-p/zerologger"
	"time"

	"firebase.google.com/go/v4/auth"
	"github.com/go-faker/faker/v4"
	"github.com/rs/zerolog"
)

func main() {
	var ctx = context.Background()

	redis.ConnectRedis()
	redisRepo := redis_repo.NewRedisRepository(redis.RedisClient)

	zl := zerolog.New(zerolog.ConsoleWriter{Out: os.Stderr, TimeFormat: time.RFC3339}).With().Timestamp().Logger()
	logger := zerologger.New(zl)

	if err := firebase.InitAuthClient(); err != nil {
		logger.Error(err)
		panic(err)
	}

	spaceService := services.NewSpaceService(logger, redisRepo)
	userService := services.NewUserService(logger, redisRepo)

	newFakeUsers, err := createFakeUsers(ctx, userService, 3)
	if err != nil {
		logger.Error(err)
		os.Exit(1)
	}

	newSpacesFixtureJsonFile, err := os.Open("newSpacesFixture.json")
	if err != nil {
		logger.Error(err)
		os.Exit(1)
	}
	defer newSpacesFixtureJsonFile.Close()

	newSpacesFixtureBytes, err := io.ReadAll(newSpacesFixtureJsonFile)
	if err != nil {
		logger.Error(err)
		os.Exit(1)
	}

	var newSpaces = make([]models.NewSpace, 0)
	if err := json.Unmarshal(newSpacesFixtureBytes, &newSpaces); err != nil {
		logger.Error(err)
		os.Exit(1)
	}

	for _, newSpace := range newSpaces {
		randomFakeUsersIndex := rand.Intn(len(newFakeUsers))
		newSpace.AdminId = newFakeUsers[randomFakeUsersIndex].ID
		_, err := spaceService.CreateSpace(context.Background(), newSpace)
		if err != nil {
			logger.Error(err)
			os.Exit(1)
		}
	}
}

func createFakeUsers(ctx context.Context, userService *services.UserService, number int) ([]models.NewFakeUser, error) {
	const op errors.Op = "main.createFakeUsers"

	var fakeUsers = make([]models.NewFakeUser, 0, number)
	for i := 0; i < number; i++ {
		newFakeUser := new(models.NewFakeUser)
		if err := faker.FakeData(newFakeUser); err != nil {
			return nil, errors.E(op, err)
		}

		fireBaseUserparams := (&auth.UserToCreate{}).Email(newFakeUser.Email).Password("password1?").EmailVerified(true)

		u, err := firebase.AuthClient.CreateUser(ctx, fireBaseUserparams)
		if err != nil {
			return nil, errors.E(op, err)
		}

		newFakeUser.ID = u.UID
		if err := userService.CreateUser(ctx, newFakeUser.NewUser); err != nil {
			return nil, errors.E(op, err)
		}

		fakeUsers = append(fakeUsers, *newFakeUser)
	}

	return fakeUsers, nil
}
