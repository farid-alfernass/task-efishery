package usecases

import (
	"context"

	"go-project/bin/modules/user"
	"go-project/bin/modules/user/models"
	"go-project/bin/pkg/errors"
	"go-project/bin/pkg/utils"
)

type queryUsecase struct {
	userRepositoryQuery user.MongodbRepositoryQuery
}

func NewQueryUsecase(mq user.MongodbRepositoryQuery) user.UsecaseQuery {
	return &queryUsecase{
		userRepositoryQuery: mq,
	}
}

func (q queryUsecase) GetUser(ctx context.Context, userId string) utils.Result {
	var result utils.Result

	queryRes := <-q.userRepositoryQuery.FindOne(ctx, userId)

	if queryRes.Error != nil {
		errObj := errors.InternalServerError("Internal server error")
		result.Error = errObj
		return result
	}
	user := queryRes.Data.(models.User)
	res := models.GetUserResponse{
		Id:           user.Id,
		Role:         user.Role,
		Name:         user.Name,
		MobileNumber: user.MobileNumber,
	}
	result.Data = res
	return result
}
