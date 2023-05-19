package usecases

import (
	"context"
	"go-project/bin/config"
	"go-project/bin/modules/user"
	"go-project/bin/modules/user/models"
	"go-project/bin/pkg/errors"
	"go-project/bin/pkg/token"
	"go-project/bin/pkg/utils"
	"math/rand"
	"time"
)

type commandUsecase struct {
	userRepositoryQuery   user.MongodbRepositoryQuery
	userRepositoryCommand user.MongodbRepositoryCommand
}

func NewCommandUsecase(mq user.MongodbRepositoryQuery, mc user.MongodbRepositoryCommand) user.UsecaseCommand {
	return &commandUsecase{
		userRepositoryQuery:   mq,
		userRepositoryCommand: mc,
	}
}

func (c commandUsecase) RegisterUser(ctx context.Context, payload models.User) utils.Result {
	var result utils.Result
	var user models.UpsertUser
	queryRes := <-c.userRepositoryQuery.FindOnePhone(ctx, payload.MobileNumber)
	if queryRes.Data != nil {
		errObj := errors.Conflict("User already exist")
		result.Error = errObj
		return result
	}
	chars := "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789"
	rand.Seed(time.Now().UnixNano())
	password := utils.GeneratePassword(chars, 4)
	user.MobileNumber = payload.MobileNumber
	user.Name = payload.Name
	user.Role = payload.Role
	user.Password = utils.HashPassword(password)

	result = <-c.userRepositoryCommand.InsertOneUser(ctx, user)
	if result.Error != nil {
		errObj := errors.InternalServerError("Failed insert user")
		result.Error = errObj
		return result
	}
	data := models.RegisterResponse{
		MobileNumber: user.MobileNumber,
		Password:     password,
	}
	result.Data = data

	return result
}

func (c commandUsecase) LoginUser(ctx context.Context, payload models.LoginRequest) utils.Result {
	var result utils.Result

	queryRes := <-c.userRepositoryQuery.FindOnePhone(ctx, payload.MobileNumber)
	if queryRes.Data == nil {
		errObj := errors.NotFound("User not found")
		result.Error = errObj
		return result
	}

	user := queryRes.Data.(models.User)
	valid := utils.CheckPasswordHash(payload.Password, user.Password)
	if !valid {
		errObj := errors.UnauthorizedError("Password not match")
		result.Error = errObj
		return result
	}

	claim := token.Claim{
		MobileNumber: user.MobileNumber,
		UserId:       user.Id,
	}

	jwt := <-token.Generate(ctx, config.GetConfig().PrivateKey, &claim, config.GetConfig().AccessTokenExpired)
	if jwt.Error != nil {
		errObj := errors.BadRequest("Invalid token")
		result.Error = errObj
		return result
	}
	data := models.LoginResponse{
		Id:           user.Id,
		MobileNumber: user.MobileNumber,
		Role:         user.Role,
		Timestamp:    time.Now().Local().String(),
		AccessToken:  jwt.Data.(string),
	}
	result.Data = data
	return result
}

func (c commandUsecase) UpdateUser(ctx context.Context, payload models.User) utils.Result {
	var result utils.Result

	queryRes := <-c.userRepositoryQuery.FindOne(ctx, payload.Id)
	if queryRes.Data == nil {
		errObj := errors.NotFound("User not found")
		result.Error = errObj
		return result
	}

	payload.Password = utils.HashPassword(payload.Password)

	result = <-c.userRepositoryCommand.UpdateOneUser(ctx, payload)
	if result.Error != nil {
		errObj := errors.InternalServerError("Failed update user")
		result.Error = errObj
		return result
	}

	return result
}

func (c commandUsecase) DeleteUser(ctx context.Context, userId string) utils.Result {
	var result utils.Result

	queryRes := <-c.userRepositoryQuery.FindOne(ctx, userId)
	if queryRes.Data == nil {
		errObj := errors.NotFound("User not found")
		result.Error = errObj
		return result
	}

	result = <-c.userRepositoryCommand.DeleteOneUser(ctx, userId)
	if result.Error != nil {
		errObj := errors.InternalServerError("Failed delete user")
		result.Error = errObj
		return result
	}

	return result
}
