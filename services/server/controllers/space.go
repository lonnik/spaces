package controllers

import (
	"net/http"
	"spaces-p/common"
	"spaces-p/errors"
	"spaces-p/models"
	"spaces-p/services"
	"spaces-p/utils"

	"github.com/gin-gonic/gin"
)

type SpaceController struct {
	logger                   common.Logger
	spaceService             *services.SpaceService
	spaceNotificationService *services.SpaceNotificationsService
	threadService            *services.ThreadService
	messageService           *services.MessageService
}

func NewSpaceController(logger common.Logger, spaceService *services.SpaceService, spaceNotificationService *services.SpaceNotificationsService, threadService *services.ThreadService, messageService *services.MessageService) *SpaceController {
	return &SpaceController{logger, spaceService, spaceNotificationService, threadService, messageService}
}

func (uc *SpaceController) GetSpace(c *gin.Context) {
	const op errors.Op = "controllers.SpaceController.GetSpace"
	var ctx = c.Request.Context()

	spaceId, err := utils.GetSpaceIdFromPath(c)
	if err != nil {
		utils.WriteError(c, errors.E(op, err, http.StatusBadRequest), uc.logger)
		return
	}

	space, err := uc.spaceService.GetSpace(ctx, spaceId)
	if err != nil {
		utils.WriteError(c, errors.E(op, err), uc.logger)
		return
	}

	c.JSON(http.StatusOK, gin.H{"data": space})
}

func (uc *SpaceController) GetSpaces(c *gin.Context) {
	const op errors.Op = "controllers.SpaceController.GetSpaces"
	var ctx = c.Request.Context()
	var query struct {
		paginationQuery
		Location string         `form:"location"`
		Radius   models.Radius  `form:"radius" binding:"min=0,max=1000"`
		UserId   models.UserUid `form:"user_id"`
	}
	if query.Count == 0 {
		query.Count = 10
	}

	if err := c.ShouldBindQuery(&query); err != nil {
		utils.WriteError(c, errors.E(op, err, http.StatusBadRequest), uc.logger)
		return
	}
	switch {
	case query.Location != "" && query.UserId != "":
		err := errors.New("either the \"location\" or \"user_id\" query parameter must be specified, but not both")
		utils.WriteError(c, errors.E(op, err, http.StatusBadRequest), uc.logger)
		return
	case query.Location == "" && query.UserId == "":
		err := errors.New("either the \"location\" or \"user_id\" query parameter must be specified")
		utils.WriteError(c, errors.E(op, err, http.StatusBadRequest), uc.logger)
		return
	case query.Location != "" && query.Radius == 0:
		err := errors.New("when the \"location\" query parameter is specified, the \"radius\" query parameter must be specified as well")
		utils.WriteError(c, errors.E(op, err, http.StatusBadRequest), uc.logger)
		return
	case query.Location != "":
		var location models.Location
		if err := location.ParseString(query.Location); err != nil {
			utils.WriteError(c, errors.E(op, err, http.StatusBadRequest), uc.logger)
			return
		}

		spaces, err := uc.spaceService.GetSpacesByLocation(ctx, location, query.Radius, int(query.Count), int(query.Offset))
		if err != nil {
			utils.WriteError(c, errors.E(op, err), uc.logger)
			return
		}

		c.JSON(http.StatusOK, gin.H{"data": spaces})
	case query.UserId != "":
		spaces, err := uc.spaceService.GetSpacesByUser(ctx, query.UserId, query.Count, query.Offset)
		if err != nil {
			utils.WriteError(c, errors.E(op, err), uc.logger)
			return
		}

		c.JSON(http.StatusOK, gin.H{"data": spaces})
	}
}

func (uc *SpaceController) GetSpaceSubscribers(c *gin.Context) {
	const op errors.Op = "controllers.SpaceController.GetSpaceSubscribers"
	var ctx = c.Request.Context()

	var query struct {
		paginationQuery
		Active bool `form:"active"`
	}
	if err := c.ShouldBindQuery(&query); err != nil {
		utils.WriteError(c, errors.E(op, err, http.StatusBadRequest), uc.logger)
		return
	}
	if query.Count == 0 {
		query.Count = 10
	}

	spaceId, err := utils.GetSpaceIdFromPath(c)
	if err != nil {
		utils.WriteError(c, errors.E(op, err, http.StatusBadRequest), uc.logger)
		return
	}

	subscribers, err := uc.spaceService.GetSpaceSubscribers(ctx, spaceId, query.Active, query.Offset, query.Count)
	if err != nil {
		utils.WriteError(c, errors.E(op, err), uc.logger)
		return
	}

	c.JSON(http.StatusOK, gin.H{"data": subscribers})
}

func (uc *SpaceController) CreateSpace(c *gin.Context) {
	const op errors.Op = "controllers.SpaceController.CreateSpace"
	var ctx = c.Request.Context()

	user, err := utils.GetUserFromContext(c)
	if err != nil {
		utils.WriteError(c, errors.E(op, err, http.StatusBadRequest), uc.logger)
		return
	}

	var body models.BaseSpace
	if err := c.ShouldBindJSON(&body); err != nil {
		utils.WriteError(c, errors.E(op, err, http.StatusBadRequest), uc.logger)
		return
	}

	spaceId, err := uc.spaceService.CreateSpace(ctx, models.NewSpace{BaseSpace: body, AdminId: user.ID})
	if err != nil {
		utils.WriteError(c, errors.E(op, err), uc.logger)
		return
	}

	c.JSON(http.StatusOK, gin.H{"data": gin.H{
		"spaceId": spaceId,
	}})
}

func (uc *SpaceController) GetTopLevelThreads(c *gin.Context) {
	const op errors.Op = "controllers.SpaceController.GetTopLevelThreads"
	var ctx = c.Request.Context()
	var query struct {
		paginationQuery
		Sort string `form:"sort" binding:"oneof='recent' 'popularity' ''"`
	}
	if err := c.ShouldBindQuery(&query); err != nil {
		utils.WriteError(c, errors.E(op, err, http.StatusBadRequest), uc.logger)
		return
	}
	if query.Count == 0 {
		query.Count = 10
	}
	var sort models.Sorting
	var err error
	if query.Sort != "" {
		err = sort.ParseString(query.Sort)
	} else {
		sort = models.RecentSorting
	}
	if err != nil {
		utils.WriteError(c, errors.E(op, err, http.StatusInternalServerError), uc.logger)
		return
	}

	spaceId, err := utils.GetSpaceIdFromPath(c)
	if err != nil {
		utils.WriteError(c, errors.E(op, err, http.StatusBadRequest), uc.logger)
		return
	}

	topLevelThreads, err := uc.spaceService.GetTopLevelThreads(ctx, spaceId, sort, query.Offset, query.Count)
	if err != nil {
		utils.WriteError(c, errors.E(op, err, http.StatusInternalServerError), uc.logger)
		return
	}

	c.JSON(http.StatusOK, gin.H{"data": topLevelThreads})
}

func (uc *SpaceController) GetThreadWithMessages(c *gin.Context) {
	const op errors.Op = "controllers.SpaceController.GetThreadWithMessages"
	var ctx = c.Request.Context()
	var query struct {
		MessagesOffset int64  `form:"messages_offset" binding:"min=0"`
		MessagesCount  int64  `form:"messages_count" binding:"min=0"`
		MessagesSort   string `form:"messages_sort" binding:"oneof='recent' 'popularity' ''"`
	}
	if err := c.ShouldBindQuery(&query); err != nil {
		utils.WriteError(c, errors.E(op, err, http.StatusBadRequest), uc.logger)
		return
	}
	if query.MessagesCount == 0 {
		query.MessagesCount = 10
	}
	var messagesSort models.Sorting
	var err error
	if query.MessagesSort != "" {
		err = messagesSort.ParseString(query.MessagesSort)
	} else {
		messagesSort = models.RecentSorting
	}
	if err != nil {
		utils.WriteError(c, errors.E(op, err, http.StatusInternalServerError), uc.logger)
		return
	}

	spaceId, err := utils.GetSpaceIdFromPath(c)
	if err != nil {
		utils.WriteError(c, errors.E(op, err, http.StatusBadRequest), uc.logger)
		return
	}

	threadId, err := utils.GetThreadIdFromPath(c)
	if err != nil {
		utils.WriteError(c, errors.E(op, err, http.StatusBadRequest), uc.logger)
		return
	}

	threads, err := uc.spaceService.GetThreadWithMessages(ctx, spaceId, threadId, messagesSort, query.MessagesOffset, query.MessagesCount)
	if err != nil {
		utils.WriteError(c, errors.E(op, err), uc.logger)
		return
	}

	c.JSON(http.StatusOK, gin.H{"data": threads})
}

func (uc *SpaceController) SpaceConnect(c *gin.Context) {
	const op errors.Op = "controllers.SpaceController.SpaceConnect"
	var ctx = c.Request.Context()

	user, err := utils.GetUserFromContext(c)
	if err != nil {
		utils.WriteError(c, errors.E(op, err, http.StatusBadRequest), uc.logger)
		return
	}

	spaceId, err := utils.GetSpaceIdFromPath(c)
	if err != nil {
		utils.WriteError(c, errors.E(op, err, http.StatusBadRequest), uc.logger)
		return
	}

	err = uc.spaceNotificationService.SpaceConnect(ctx, c, spaceId, *user)
	// don't write http status to response again
	uc.logger.Error(err)
}

func (uc *SpaceController) CreateTopLevelThread(c *gin.Context) {
	const op errors.Op = "controllers.SpaceController.CreateTopLevelThread"
	var ctx = c.Request.Context()

	var body models.NewMessageInput
	if err := c.ShouldBindJSON(&body); err != nil {
		utils.WriteError(c, errors.E(op, err, http.StatusBadRequest), uc.logger)
		return
	}

	authenticatedUser, err := utils.GetUserFromContext(c)
	if err != nil {
		utils.WriteError(c, errors.E(op, err, http.StatusInternalServerError), uc.logger)
		return
	}

	spaceId, err := utils.GetSpaceIdFromPath(c)
	if err != nil {
		utils.WriteError(c, errors.E(op, err, http.StatusBadRequest), uc.logger)
		return
	}

	threadId, messageId, err := uc.threadService.CreateTopLevelThread(ctx, spaceId, models.NewTopLevelThreadFirstMessage{
		NewMessageInput: body,
		SenderId:        authenticatedUser.ID,
	})
	if err != nil {
		utils.WriteError(c, errors.E(op, err), uc.logger)
		return
	}

	c.JSON(http.StatusOK, gin.H{"data": map[string]any{"threadId": threadId, "firstMessageId": messageId}})
}

func (uc *SpaceController) CreateThread(c *gin.Context) {
	const op errors.Op = "controllers.SpaceController.CreateThread"
	var ctx = c.Request.Context()

	authenticatedUser, err := utils.GetUserFromContext(c)
	if err != nil {
		utils.WriteError(c, errors.E(op, err, http.StatusInternalServerError), uc.logger)
		return
	}

	spaceId, err := utils.GetSpaceIdFromPath(c)
	if err != nil {
		utils.WriteError(c, errors.E(op, err, http.StatusBadRequest), uc.logger)
		return
	}

	messageId, err := utils.GetMessageIdFromPath(c)
	if err != nil {
		utils.WriteError(c, errors.E(op, err, http.StatusBadRequest), uc.logger)
		return
	}

	threadId, err := uc.threadService.CreateThread(ctx, spaceId, messageId, authenticatedUser.ID)
	if err != nil {
		utils.WriteError(c, errors.E(op, err), uc.logger)
		return
	}

	c.JSON(http.StatusOK, gin.H{"data": map[string]any{"threadId": threadId}})
}

func (uc *SpaceController) CreateMessage(c *gin.Context) {
	const op errors.Op = "controllers.SpaceController.CreateMessage"
	var ctx = c.Request.Context()

	var body models.NewMessageInput
	if err := c.ShouldBindJSON(&body); err != nil {
		utils.WriteError(c, errors.E(op, err, http.StatusBadRequest), uc.logger)
		return
	}

	authenticatedUser, err := utils.GetUserFromContext(c)
	if err != nil {
		utils.WriteError(c, errors.E(op, err, http.StatusInternalServerError), uc.logger)
		return
	}

	spaceId, err := utils.GetSpaceIdFromPath(c)
	if err != nil {
		utils.WriteError(c, errors.E(op, err, http.StatusBadRequest), uc.logger)
		return
	}

	threadId, err := utils.GetThreadIdFromPath(c)
	if err != nil {
		utils.WriteError(c, errors.E(op, err, http.StatusBadRequest), uc.logger)
		return
	}

	messageId, err := uc.messageService.CreateMessage(ctx, spaceId, authenticatedUser.ID, models.NewMessage{
		BaseMessage: models.BaseMessage(body),
		SenderId:    authenticatedUser.ID,
		ThreadId:    threadId,
	})
	if err != nil {
		utils.WriteError(c, errors.E(op, err), uc.logger)
		return
	}

	c.JSON(http.StatusOK, gin.H{"data": map[string]any{"messageId": messageId}})
}

func (uc *SpaceController) GetMessage(c *gin.Context) {
	const op errors.Op = "controllers.SpaceController.GetMessage"
	var ctx = c.Request.Context()

	messageId, err := utils.GetMessageIdFromPath(c)
	if err != nil {
		utils.WriteError(c, errors.E(op, err, http.StatusBadRequest), uc.logger)
		return
	}

	message, err := uc.messageService.GetMessage(ctx, messageId)
	if err != nil {
		utils.WriteError(c, errors.E(op, err), uc.logger)
		return
	}

	c.JSON(http.StatusOK, gin.H{"data": message})
}

func (uc *SpaceController) LikeMessage(c *gin.Context) {
	const op errors.Op = "controllers.SpaceController.LikeMessage"
	var ctx = c.Request.Context()

	authenticatedUser, err := utils.GetUserFromContext(c)
	if err != nil {
		utils.WriteError(c, errors.E(op, err, http.StatusInternalServerError), uc.logger)
		return
	}

	spaceId, err := utils.GetSpaceIdFromPath(c)
	if err != nil {
		utils.WriteError(c, errors.E(op, err, http.StatusBadRequest), uc.logger)
		return
	}

	threadId, err := utils.GetThreadIdFromPath(c)
	if err != nil {
		utils.WriteError(c, errors.E(op, err, http.StatusBadRequest), uc.logger)
		return
	}

	messageId, err := utils.GetMessageIdFromPath(c)
	if err != nil {
		utils.WriteError(c, errors.E(op, err, http.StatusBadRequest), uc.logger)
		return
	}

	if err := uc.messageService.LikeMessage(ctx, spaceId, threadId, messageId, authenticatedUser.ID); err != nil {
		utils.WriteError(c, errors.E(op, err), uc.logger)
		return
	}

	c.JSON(http.StatusOK, gin.H{"data": "success"})
}

func (uc *SpaceController) AddSpaceSubscriber(c *gin.Context) {
	const op errors.Op = "controllers.SpaceController.AddSpaceSubscriber"
	var ctx = c.Request.Context()

	spaceId, err := utils.GetSpaceIdFromPath(c)
	if err != nil {
		utils.WriteError(c, errors.E(op, err, http.StatusBadRequest), uc.logger)
		return
	}

	authenticatedUser, err := utils.GetUserFromContext(c)
	if err != nil {
		utils.WriteError(c, errors.E(op, err, http.StatusInternalServerError), uc.logger)
		return
	}

	if err := uc.spaceService.AddSpaceSubscriber(ctx, spaceId, authenticatedUser.ID); err != nil {
		utils.WriteError(c, errors.E(op, err), uc.logger)
		return
	}

	c.JSON(http.StatusOK, gin.H{"data": "success"})
}
