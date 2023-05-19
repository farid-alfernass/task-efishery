package main

import (
	"context"
	"fmt"

	"go-project/bin/pkg/log"
	"go-project/bin/pkg/redis"
	"net/http"
	"os"
	"os/signal"
	"time"

	userHandler "go-project/bin/modules/user/handlers"
	userRepoCommands "go-project/bin/modules/user/repositories/commands"
	userRepoQueries "go-project/bin/modules/user/repositories/queries"
	userUsecase "go-project/bin/modules/user/usecases"

	"go-project/bin/config"
	"go-project/bin/pkg/apm"
	"go-project/bin/pkg/databases/mongodb"
	"go-project/bin/pkg/helpers"

	"go-project/bin/pkg/validator"

	"github.com/labstack/echo"
	"github.com/labstack/echo/middleware"

	"github.com/sirupsen/logrus"
	"go.elastic.co/apm/module/apmecho"
)

func main() {
	// Init MongoDB Connection
	mongodb.InitConnection()

	// Init Minio Connection
	// minio.InitMinio()

	// Init Redis Connection
	redis.InitConnection(config.GetConfig().RedisDB, config.GetConfig().RedisHost, config.GetConfig().RedisPort)

	log.Init()

	// Echo instance
	e := echo.New()
	e.Validator = &validator.CustomValidator{Validator: validator.New()}

	// Middleware
	e.Use(middleware.LoggerWithConfig(middleware.LoggerConfig{
		Skipper:          middleware.DefaultSkipper,
		Format:           `[ROUTE] ${time_rfc3339} | ${status} | ${latency_human} ${latency} | ${method} | ${uri}` + "\n",
		CustomTimeFormat: "2006-01-02 15:04:05.00000",
	}))
	e.Use(middleware.Recover())
	e.Use(apmecho.Middleware(apmecho.WithTracer(apm.GetTracer())))

	e.Use(middleware.CORSWithConfig(middleware.DefaultCORSConfig))

	// Register Http Handler
	setHttp(e)

	// Start server
	listenerPort := fmt.Sprintf(":%s", config.GetConfig().AppPort)
	e.Logger.Fatal(e.Start(listenerPort))

	server := &http.Server{
		Addr:         listenerPort,
		ReadTimeout:  5 * time.Second,
		WriteTimeout: 5 * time.Second,
		IdleTimeout:  5 * time.Second,
	}
	done := make(chan bool)
	quit := make(chan os.Signal, 1)
	signal.Notify(quit, os.Interrupt)

	go func() {
		<-quit
		logrus.Println("Server message-service is shutting down...")

		ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
		defer cancel()

		server.SetKeepAlivesEnabled(false)
		if err := server.Shutdown(ctx); err != nil {
			logrus.Fatalf("Could not gracefully shutdown the server product-service: %v\n", err)
		}
		close(done)
	}()

	if err := server.ListenAndServe(); err != nil && err != http.ErrServerClosed {
		logrus.Fatalf("Could not listen on %d: %v\n", config.GetConfig().AppPort, err)
	}

	<-done
	logrus.Println("Server myihx-billing-service stopped")
}

func setHttp(e *echo.Echo) {
	e.GET("/v1/health-check", func(c echo.Context) error {
		log.GetLogger().Info("main", "This service is running properly", "setConfluentEvents", "")
		return helpers.RespSuccess(c, "Index", "This service is running properly")
	})

	userQueryMongodbRepo := userRepoQueries.NewQueryMongodbRepository(mongodb.NewMongoDBLogger(mongodb.GetSlaveConn(), mongodb.GetSlaveDBName(), log.GetLogger()))
	userCommandMongodbRepo := userRepoCommands.NewCommandMongodbRepository(mongodb.NewMongoDBLogger(mongodb.GetMasterConn(), mongodb.GetMasterDBName(), log.GetLogger()))

	userQueryUsecase := userUsecase.NewQueryUsecase(userQueryMongodbRepo)
	userCommandUsecase := userUsecase.NewCommandUsecase(userQueryMongodbRepo, userCommandMongodbRepo)

	// set module
	userHandler.InituserHttpHandler(e, userQueryUsecase, userCommandUsecase)
}
