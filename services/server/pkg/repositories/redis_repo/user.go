package redis_repo

import (
	"context"
	"spaces-p/pkg/common"
	"spaces-p/pkg/errors"
	"spaces-p/pkg/models"
)

func (repo *RedisRepository) GetUserById(ctx context.Context, id models.UserUid) (*models.User, error) {
	const op errors.Op = "redis_repo.RedisRepository.GetUserById"
	var userKey = getUserKey(id)

	r, err := repo.redisClient.HGetAll(ctx, userKey).Result()
	switch {
	case err != nil:
		return nil, errors.E(op, err)
	case len(r) == 0:
		return nil, errors.E(op, common.ErrNotFound)
	}

	return repo.parseUser(id, r), nil
}

func (repo *RedisRepository) SetUser(ctx context.Context, newUser models.NewUser) error {
	const op errors.Op = "redis_repo.RedisRepository.SetUser"
	var userKey = getUserKey(newUser.ID)

	v := map[string]interface{}{
		userFields.userFirstNameField: newUser.FirstName,
		userFields.userLastNameField:  newUser.LastName,
		userFields.userUsernameField:  newUser.Username,
		userFields.userAvatarUrlField: newUser.AvatarUrl,
	}

	if err := repo.redisClient.HSet(ctx, userKey, v).Err(); err != nil {
		return errors.E(op, err)
	}

	return nil
}

func (repo *RedisRepository) parseUser(userUid models.UserUid, stringMap map[string]string) *models.User {
	firstNameStr := stringMap[userFields.userFirstNameField]
	lastNameStr := stringMap[userFields.userLastNameField]
	userNameStr := stringMap[userFields.userUsernameField]
	avatarUrlStr := stringMap[userFields.userAvatarUrlField]
	isSignedUp := firstNameStr != "" && lastNameStr != "" && userNameStr != "" && avatarUrlStr != ""

	return &models.User{
		BaseUser: models.BaseUser{
			ID:        userUid,
			FirstName: firstNameStr,
			LastName:  lastNameStr,
			Username:  userNameStr,
			AvatarUrl: avatarUrlStr,
		},
		IsSignedUp: isSignedUp,
	}
}
