package main

import (
	"context"
	"math/rand"
	"os"
	"spaces-p/pkg/common"
	"spaces-p/pkg/errors"
	"spaces-p/pkg/firebase"
	"spaces-p/pkg/models"
	"spaces-p/pkg/redis"
	localmemory "spaces-p/pkg/repositories/local_memory"
	"spaces-p/pkg/repositories/redis_repo"
	"spaces-p/pkg/services"
	"spaces-p/pkg/utils"
	"spaces-p/pkg/zerologger"
	"time"

	"github.com/go-faker/faker/v4"
	"github.com/rs/zerolog"
)

const (
	usersFixtureFilePath  = "fixtures/users.json"
	spacesFixtureFilePath = "fixtures/spaces.json"
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

	firebaseAuthClient, err := firebase.NewFirebaseAuthClient(ctx, "./secrets/firebase_service_account_key.json")
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

	if err := seedUsers(ctx, firebaseAuthClient, userService, newFakeUsers, "password1?"); err != nil {
		logger.Error(err)
		os.Exit(1)
	}

	newUsers, err := utils.LoadRecordsFromJSONFile[models.NewFakeUser](usersFixtureFilePath)
	if err != nil {
		logger.Error(err)
		os.Exit(1)
	}

	if err := seedUsers(ctx, firebaseAuthClient, userService, newUsers, "password1?"); err != nil {
		logger.Error(err)
		os.Exit(1)
	}

	newSpaces, err := utils.LoadRecordsFromJSONFile[models.NewSpace](spacesFixtureFilePath)
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

func seedUsers(ctx context.Context, authClient common.AuthClient, userService *services.UserService, newFakeUsers []models.NewFakeUser, password string) error {
	const op errors.Op = "main.seedUsers"

	for i := range newFakeUsers {
		userUid, err := authClient.CreateUser(ctx, newFakeUsers[i].Email, password, true)
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
