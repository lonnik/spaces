package controllers

type paginationQuery struct {
	Offset int64 `form:"offset" binding:"min=0"`
	Count  int64 `form:"count" binding:"min=0"`
}
