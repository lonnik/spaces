package main

import (
	"context"
	"encoding/json"
	"io"
	"math/rand"
	"os"
	"spaces-p/common"
	"spaces-p/errors"
	"spaces-p/firebase"
	"spaces-p/models"
	"spaces-p/redis"
	localmemory "spaces-p/repositories/local_memory"
	"spaces-p/repositories/redis_repo"
	"spaces-p/services"
	"spaces-p/zerologger"
	"time"

	"github.com/go-faker/faker/v4"
	"github.com/rs/zerolog"
)

func main() {
	var ctx = context.Background()

	redisPort := os.Getenv("REDIS_PORT")
	redisHost := os.Getenv("REDIS_HOST")

	redisClient := redis.GetRedisClient(redisHost, redisPort)
	redisRepo := redis_repo.NewRedisRepository(redisClient)
	localMemoryRepo := localmemory.NewLocalMemoryRepo()

	zl := zerolog.New(zerolog.ConsoleWriter{Out: os.Stderr, TimeFormat: time.RFC3339}).With().Timestamp().Logger()
	logger := zerologger.New(zl)

	firebaseAuthClient, err := firebase.NewFirebaseAuthClient(ctx)
	if err != nil {
		logger.Error(err)
		panic(err)
	}

	spaceService := services.NewSpaceService(logger, redisRepo, localMemoryRepo)
	userService := services.NewUserService(logger, redisRepo)

	newFakeUsers, err := createFakeUsers(3)
	if err != nil {
		logger.Error(err)
		os.Exit(1)
	}

	if err := seedUsers(ctx, firebaseAuthClient, userService, newFakeUsers); err != nil {
		logger.Error(err)
		os.Exit(1)
	}

	newUsers, err := createRecordsFromFile[models.NewFakeUser](ctx, "newUsersFixture.json")
	if err != nil {
		logger.Error(err)
		os.Exit(1)
	}

	if err := seedUsers(ctx, firebaseAuthClient, userService, newUsers); err != nil {
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

func createFakeUsers(number int) ([]models.NewFakeUser, error) {
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

func seedUsers(ctx context.Context, authClient common.AuthClient, userService *services.UserService, newFakeUsers []models.NewFakeUser) error {
	const op errors.Op = "main.seedUsers"

	for i := range newFakeUsers {
		userUid, err := authClient.CreateUser(ctx, newFakeUsers[i].Email, "password1?", true)
		if err != nil {
			return errors.E(op, err)
		}

		newFakeUsers[i].ID = userUid
		if err := userService.CreateUser(ctx, newFakeUsers[i].NewUser); err != nil {
			return errors.E(op, err)
		}
	}

	return nil
}
