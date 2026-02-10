package main

import (
	"log"
	"net/http"

	"deals-backend/config"
	"deals-backend/db"
	"deals-backend/handlers"
	"deals-backend/middleware"

	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
)

func main() {
	cfg := config.Load()

	if cfg.IsProduction {
		gin.SetMode(gin.ReleaseMode)
	}

	if err := db.Init(cfg.DatabaseURL); err != nil {
		log.Fatalf("Failed to initialize database: %v", err)
	}
	defer db.Close()

	r := gin.Default()

	r.Use(cors.New(cors.Config{
		AllowOrigins:     []string{cfg.CORSOrigin},
		AllowMethods:     []string{"GET", "POST", "PUT", "DELETE", "OPTIONS"},
		AllowHeaders:     []string{"Origin", "Content-Type", "Authorization"},
		ExposeHeaders:    []string{"Set-Cookie"},
		AllowCredentials: true,
	}))

	// Health check endpoint for production deployments
	r.GET("/health", func(c *gin.Context) {
		c.JSON(http.StatusOK, gin.H{"status": "ok"})
	})

	authHandler := handlers.NewAuthHandler(cfg)
	dealHandler := handlers.NewDealHandler()

	// Public routes
	r.GET("/deals", dealHandler.ListPublicDeals)
	r.GET("/deals/:slug", dealHandler.GetPublicDeal)

	// Auth route
	r.POST("/admin/login", authHandler.Login)

	// Protected admin routes
	admin := r.Group("/admin")
	admin.Use(middleware.AuthRequired(cfg))
	{
		admin.GET("/deals", dealHandler.ListAdminDeals)
		admin.POST("/deals", dealHandler.CreateDeal)
		admin.PUT("/deals/:id", dealHandler.UpdateDeal)
		admin.DELETE("/deals/:id", dealHandler.DeleteDeal)
	}

	log.Printf("Server starting on port %s", cfg.Port)
	if err := r.Run(":" + cfg.Port); err != nil {
		log.Fatalf("Failed to start server: %v", err)
	}
}
