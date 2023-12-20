package redis_repo

import (
	"context"
	"reflect"
	"spaces-p/common"
	"spaces-p/errors"
	"spaces-p/models"
)

func (repo *RedisRepository) GetUserById(ctx context.Context, id string) (*models.User, error) {
	const op errors.Op = "redis_repo.RedisRepository.GetUserById"
	var userKey = getUserKey(id)

	r, err := repo.redisClient.HGetAll(ctx, userKey).Result()
	switch {
	case err != nil:
		return nil, errors.E(op, err)
	case len(r) == 0:
		return nil, errors.E(op, common.ErrNotFound)
	}

	var user = models.User{}
	user.ID = id
	user.FirstName = r[userFields.userFirstNameField]
	user.LastName = r[userFields.userLastNameField]
	user.Username = r[userFields.userUsernameField]
	user.AvatarUrl = r[userFields.userAvatarUrlField]
	user.IsSignedUp = len(r) == reflect.TypeOf(userFields).NumField()

	return &user, nil
}

func (repo *RedisRepository) SetUser(ctx context.Context, newUser models.NewUser) error {
	const op errors.Op = "redis_repo.RedisRepository.SetUser"
	var userKey = getUserKey(newUser.ID)

	v := map[string]interface{}{}
	if newUser.FirstName != "" {
		v[userFields.userFirstNameField] = newUser.FirstName
	}
	if newUser.LastName != "" {
		v[userFields.userLastNameField] = newUser.LastName
	}
	if newUser.Username != "" {
		v[userFields.userUsernameField] = newUser.Username
	}
	if newUser.AvatarUrl != "" {
		v[userFields.userAvatarUrlField] = newUser.AvatarUrl
	}

	if err := repo.redisClient.HSet(ctx, userKey, v).Err(); err != nil {
		return errors.E(op, err)
	}

	return nil
}
