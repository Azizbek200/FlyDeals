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

	dbReady := true
	if err := db.Init(cfg.DatabaseURL); err != nil {
		log.Printf("WARNING: Failed to initialize database: %v", err)
		log.Printf("Server will start but database-dependent endpoints will fail")
		dbReady = false
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
		status := gin.H{"status": "ok", "database": dbReady}
		if !dbReady {
			c.JSON(http.StatusServiceUnavailable, status)
			return
		}
		c.JSON(http.StatusOK, status)
	})

	// Guard database-dependent routes against nil Pool
	dbRequired := func(c *gin.Context) {
		if db.Pool == nil {
			c.JSON(http.StatusServiceUnavailable, gin.H{"error": "Database not available"})
			c.Abort()
			return
		}
		c.Next()
	}

	authHandler := handlers.NewAuthHandler(cfg)
	dealHandler := handlers.NewDealHandler()

	// Public routes
	r.GET("/deals", dbRequired, dealHandler.ListPublicDeals)
	r.GET("/deals/:slug", dbRequired, dealHandler.GetPublicDeal)

	// Auth route
	r.POST("/admin/login", dbRequired, authHandler.Login)

	// Protected admin routes
	admin := r.Group("/admin")
	admin.Use(dbRequired, middleware.AuthRequired(cfg))
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
