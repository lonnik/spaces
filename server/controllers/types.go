package controllers

type paginationQuery struct {
	Offset int64 `form:"offset"`
	Count  int64 `form:"count"`
}
