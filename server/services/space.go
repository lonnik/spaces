package services

import (
	"context"
	"net/http"
	"spaces-p/common"
	"spaces-p/errors"
	"spaces-p/models"
	"spaces-p/uuid"
)

type SpaceService struct {
	logger    common.Logger
	cacheRepo common.CacheRepository
}

func NewSpaceService(logger common.Logger, cacheRepo common.CacheRepository) *SpaceService {
	return &SpaceService{logger, cacheRepo}
}

func (ss *SpaceService) GetSpacesByLocation(ctx context.Context, location models.Location, radius models.Radius, count, offset int) ([]models.SpaceWithDistance, error) {
	const op errors.Op = "services.SpaceService.GetSpacesByLocation"

	spaces, err := ss.cacheRepo.GetSpacesByLocation(ctx, location, radius, count+offset)
	if err != nil {
		return nil, errors.E(op, err, http.StatusInternalServerError)
	}

	return spaces[offset:], nil
}

func (ss *SpaceService) GetSpacesByUser(ctx context.Context, userId models.UserUid, count, offset int) ([]models.Space, error) {
	const op errors.Op = "services.SpaceService.GetSpacesByUser"

	spaces, err := ss.cacheRepo.GetSpacesByUserId(ctx, userId, count, offset)
	if err != nil {
		return nil, errors.E(op, err)
	}

	return spaces, nil
}

func (ss *SpaceService) GetTopLevelThreads(ctx context.Context, spaceId uuid.Uuid, sort models.Sorting, offset, count int64) ([]models.TopLevelThread, error) {
	const op errors.Op = "services.SpaceService.GetTopLevelThreads"

	var threads []models.TopLevelThread
	var err error
	switch sort {
	case models.PopularitySorting:
		threads, err = ss.cacheRepo.GetSpaceTopLevelThreadsByPopularity(ctx, spaceId, offset, count)
	case models.RecentSorting:
		threads, err = ss.cacheRepo.GetSpaceTopLevelThreadsByTime(ctx, spaceId, offset, count)
	}
	if err != nil {
		return nil, errors.E(op, err, http.StatusInternalServerError)
	}

	return threads, nil
}

func (ss *SpaceService) GetThreadWithMessages(ctx context.Context, spaceId, threadId uuid.Uuid, messagesSort models.Sorting, messagesOffset, messagesCount int64) (models.ThreadWithMessages, error) {
	const op errors.Op = "services.SpaceService.GetThreadWithMessages"

	thread, err := ss.cacheRepo.GetThread(ctx, threadId)
	if err != nil {
		return models.ThreadWithMessages{}, errors.E(op, err, http.StatusInternalServerError)
	}

	var messages []models.MessageWithChildThreadMessagesCount
	switch messagesSort {
	case models.PopularitySorting:
		messages, err = ss.cacheRepo.GetThreadMessagesByPopularity(ctx, threadId, messagesOffset, messagesCount)
	case models.RecentSorting:
		messages, err = ss.cacheRepo.GetThreadMessagesByTime(ctx, threadId, messagesOffset, messagesCount)
	}
	if err != nil {
		return models.ThreadWithMessages{}, errors.E(op, err, http.StatusInternalServerError)
	}

	return models.ThreadWithMessages{
		Thread:   thread,
		Messages: messages,
	}, nil
}

func (ss *SpaceService) CreateSpace(ctx context.Context, newSpace models.NewSpace) (uuid.Uuid, error) {
	const op errors.Op = "services.SpaceService.CreateSpace"

	// verify that user with id == newSpace.AdminId exists
	_, err := ss.cacheRepo.GetUserById(ctx, newSpace.AdminId)
	switch {
	case errors.Is(err, common.ErrNotFound):
		err := errors.New("admin id does not belong to existing user")
		return uuid.Nil, errors.E(op, err, http.StatusBadRequest)
	case err != nil:
		return uuid.Nil, errors.E(op, err, http.StatusInternalServerError)
	}

	spaceId, err := ss.cacheRepo.SetSpace(ctx, newSpace)
	if err != nil {
		return uuid.Nil, errors.E(op, err, http.StatusInternalServerError)
	}

	return spaceId, nil
}

func (ss *SpaceService) AddSpaceSubscriber(ctx context.Context, spaceId uuid.Uuid, userUid models.UserUid) error {
	const op errors.Op = "services.SpaceService.AddSpaceSubscriber"

	// check if space subscriber already exists so the created at time is not overridden in the spaceSubscribersKey and userSpacesKey sorted sets
	spaceHasSubscriber, err := ss.cacheRepo.HasSpaceSubscriber(ctx, spaceId, userUid)
	switch {
	case err != nil:
		return errors.E(op, err, http.StatusInternalServerError)
	case spaceHasSubscriber:
		return nil
	}

	if err := ss.cacheRepo.SetSpaceSubscriber(ctx, spaceId, userUid); err != nil {
		return errors.E(op, err, http.StatusInternalServerError)
	}

	return nil
}

func (ss *SpaceService) GetSpaceSubscribers(ctx context.Context, spaceId uuid.Uuid, activeSubscribers bool, offset, count int64) ([]models.User, error) {
	const op errors.Op = "services.SpaceService.GetSpaceSubscribers"

	var subscribers = []models.User{}
	var err error
	switch activeSubscribers {
	case true:
		subscribers, err = ss.cacheRepo.GetSpaceActiveSubscribers(ctx, spaceId, offset, count)
	case false:
		subscribers, err = ss.cacheRepo.GetSpaceSubscribers(ctx, spaceId, offset, count)
	}
	if err != nil {
		return nil, errors.E(op, err, http.StatusInternalServerError)
	}

	return subscribers, nil
}
