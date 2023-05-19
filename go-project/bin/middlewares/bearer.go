package middlewares

import (
	"encoding/json"
	"strings"

	"go-project/bin/config"
	"go-project/bin/pkg/errors"
	"go-project/bin/pkg/helpers"
	"go-project/bin/pkg/token"

	"github.com/labstack/echo"
)

func VerifyBearer(next echo.HandlerFunc) echo.HandlerFunc {
	return func(c echo.Context) error {
		tokenString := strings.TrimPrefix(c.Request().Header.Get(echo.HeaderAuthorization), "Bearer ")

		if len(tokenString) == 0 {
			return helpers.RespError(c, errors.UnauthorizedError("Invalid token!"))
		}
		publicKey := config.GetConfig().PublicKey

		parsedToken := <-token.Validate(c.Request().Context(), publicKey, tokenString)
		if parsedToken.Error != nil {
			return helpers.RespError(c, errors.UnauthorizedError(parsedToken.Error.Error()))
		}
		data, _ := json.Marshal(parsedToken.Data)
		jsonData := []byte(data)
		var claim token.Claim
		json.Unmarshal(jsonData, &claim)
		c.Set("userId", claim.UserId)
		return next(c)
	}
}
