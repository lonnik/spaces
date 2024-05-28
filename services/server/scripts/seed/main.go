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
	localmemory "spaces-p/repositories/local_memory"
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

	redisClient := redis.GetRedisClient()
	redisRepo := redis_repo.NewRedisRepository(redisClient)
	localMemoryRepo := localmemory.NewLocalMemoryRepo()

	zl := zerolog.New(zerolog.ConsoleWriter{Out: os.Stderr, TimeFormat: time.RFC3339}).With().Timestamp().Logger()
	logger := zerologger.New(zl)

	if err := firebase.InitAuthClient(); err != nil {
		logger.Error(err)
		panic(err)
	}

	spaceService := services.NewSpaceService(logger, redisRepo, localMemoryRepo)
	userService := services.NewUserService(logger, redisRepo)

	newFakeUsers, err := createFakeUsers(ctx, 3)
	if err != nil {
		logger.Error(err)
		os.Exit(1)
	}

	if err := seedUsers(ctx, userService, newFakeUsers); err != nil {
		logger.Error(err)
		os.Exit(1)
	}

	newUsers, err := createRecordsFromFile[models.NewFakeUser](ctx, "newUsersFixture.json")
	if err != nil {
		logger.Error(err)
		os.Exit(1)
	}

	if err := seedUsers(ctx, userService, newUsers); err != nil {
		logger.Error(err)
		os.Exit(1)
	}

	newSpaces, err := createRecordsFromFile[models.NewSpace](ctx, "newSpacesFixture.json")
	if err != nil {
		logger.Error(err)
		os.Exit(1)
	}

	for _, newSpace := range newSpaces {
		randomFakeUsersIndex := rand.Intn(len(newFakeUsers))
		newSpace.AdminId = models.UserUid(newFakeUsers[randomFakeUsersIndex].ID)
		_, err := spaceService.CreateSpace(context.Background(), newSpace)
		if err != nil {
			logger.Error(err)
			os.Exit(1)
		}
	}
}

func createRecordsFromFile[T models.NewSpace | models.NewFakeUser](ctx context.Context, fileName string) ([]T, error) {
	const op errors.Op = "main.createFakeUsersFromFile"

	jsonFile, err := os.Open(fileName)
	if err != nil {
		return nil, errors.E(op, err)
	}
	defer jsonFile.Close()

	newRecordsBytes, err := io.ReadAll(jsonFile)
	if err != nil {
		return nil, errors.E(op, err)
	}

	var newRecords = make([]T, 0)
	if err := json.Unmarshal(newRecordsBytes, &newRecords); err != nil {
		return nil, errors.E(op, err)
	}

	return newRecords, nil
}

func createFakeUsers(ctx context.Context, number int) ([]models.NewFakeUser, error) {
	const op errors.Op = "main.createFakeUsers"

	var fakeUsers = make([]models.NewFakeUser, 0, number)
	for i := 0; i < number; i++ {
		newFakeUser := new(models.NewFakeUser)
		if err := faker.FakeData(newFakeUser); err != nil {
			return nil, errors.E(op, err)
		}

		fakeUsers = append(fakeUsers, *newFakeUser)
	}

	return fakeUsers, nil
}

func seedUsers(ctx context.Context, userService *services.UserService, newFakeUsers []models.NewFakeUser) error {
	const op errors.Op = "main.seedUsers"

	for i := range newFakeUsers {
		fireBaseUserparams := (&auth.UserToCreate{}).Email(newFakeUsers[i].Email).Password("password1?").EmailVerified(true)

		u, err := firebase.AuthClient.CreateUser(ctx, fireBaseUserparams)
		if err != nil {
			return errors.E(op, err)
		}

		newFakeUsers[i].ID = models.UserUid(u.UID)
		if err := userService.CreateUser(ctx, newFakeUsers[i].NewUser); err != nil {
			return errors.E(op, err)
		}
	}

	return nil
}
