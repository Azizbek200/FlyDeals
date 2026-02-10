package main

import (
	"log"
	"net/http"
	"sync/atomic"

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

	var dbReady atomic.Bool

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
		ready := dbReady.Load()
		status := gin.H{"status": "ok", "database": ready}
		if !ready {
			c.JSON(http.StatusServiceUnavailable, status)
			return
		}
		c.JSON(http.StatusOK, status)
	})

	// Guard database-dependent routes against nil Pool
	dbRequired := func(c *gin.Context) {
		if db.Pool == nil {
			c.JSON(http.StatusServiceUnavailable, gin.H{"error": "Database not available yet, please retry shortly"})
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

	// Initialize database in background so server starts immediately
	go func() {
		log.Printf("Connecting to database...")
		if err := db.Init(cfg.DatabaseURL); err != nil {
			log.Printf("WARNING: Failed to initialize database: %v", err)
			log.Printf("Database-dependent endpoints will return 503")
			return
		}
		dbReady.Store(true)
		log.Printf("Database ready")
	}()

	log.Printf("Server starting on port %s", cfg.Port)
	if err := r.Run(":" + cfg.Port); err != nil {
		log.Fatalf("Failed to start server: %v", err)
	}
}
