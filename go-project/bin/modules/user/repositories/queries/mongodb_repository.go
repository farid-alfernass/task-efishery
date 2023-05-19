package queries

import (
	"context"

	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/bson/primitive"

	"go-project/bin/modules/user"
	"go-project/bin/modules/user/models"
	"go-project/bin/pkg/databases/mongodb"
	"go-project/bin/pkg/utils"
)

type queryMongodbRepository struct {
	mongoDb mongodb.MongoDBLogger
}

func NewQueryMongodbRepository(mongodb mongodb.MongoDBLogger) user.MongodbRepositoryQuery {
	return &queryMongodbRepository{
		mongoDb: mongodb,
	}
}

func (q queryMongodbRepository) FindOne(ctx context.Context, userId string) <-chan utils.Result {
	output := make(chan utils.Result)

	go func() {
		defer close(output)

		objId, _ := primitive.ObjectIDFromHex(userId)
		var user models.User
		err := q.mongoDb.FindOne(mongodb.FindOne{
			Result:         &user,
			CollectionName: "users",
			Filter: bson.M{
				"_id": objId,
			},
		}, ctx)
		if err != nil {
			output <- utils.Result{
				Error: err,
			}
		}

		output <- utils.Result{
			Data: user,
		}

	}()

	return output
}

func (q queryMongodbRepository) FindOnePhone(ctx context.Context, mobileNumber string) <-chan utils.Result {
	output := make(chan utils.Result)

	go func() {
		defer close(output)

		var user models.User
		err := q.mongoDb.FindOne(mongodb.FindOne{
			Result:         &user,
			CollectionName: "users",
			Filter: bson.M{
				"mobileNumber": mobileNumber,
			},
		}, ctx)

		if err != nil {
			output <- utils.Result{
				Error: err,
			}
		}

		output <- utils.Result{
			Data: user,
		}

	}()

	return output
}
