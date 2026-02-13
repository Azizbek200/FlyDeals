package main

import (
	"log"
	"net/http"
	"strings"
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

	log.Printf("CORS allowed origin: %s", cfg.CORSOrigin)
	r.Use(cors.New(cors.Config{
		AllowOriginFunc: func(origin string) bool {
			// Always allow the configured origin
			if origin == cfg.CORSOrigin {
				return true
			}
			// Allow any Vercel preview/production URL for this project
			if strings.HasSuffix(origin, ".vercel.app") {
				log.Printf("CORS: allowing Vercel origin %s", origin)
				return true
			}
			// Allow localhost for development
			if strings.HasPrefix(origin, "http://localhost") {
				return true
			}
			log.Printf("CORS: rejected origin %s", origin)
			return false
		},
		AllowMethods:     []string{"GET", "POST", "PUT", "DELETE", "OPTIONS"},
		AllowHeaders:     []string{"Origin", "Content-Type", "Authorization"},
		ExposeHeaders:    []string{"Set-Cookie"},
		AllowCredentials: true,
		MaxAge:           86400,
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
	subscriberHandler := handlers.NewSubscriberHandler()
	priceAlertHandler := handlers.NewPriceAlertHandler()
	analyticsHandler := handlers.NewAnalyticsHandler()

	// Public routes
	r.GET("/deals", dbRequired, dealHandler.ListPublicDeals)
	r.GET("/deals/:slug", dbRequired, dealHandler.GetPublicDeal)
	r.POST("/deals/:slug/click", dbRequired, dealHandler.TrackClick)
	r.GET("/destinations", dbRequired, dealHandler.ListDestinations)

	// Newsletter
	r.POST("/subscribe", dbRequired, subscriberHandler.Subscribe)
	r.DELETE("/subscribe", dbRequired, subscriberHandler.Unsubscribe)

	// Price alerts (public)
	r.POST("/price-alerts", dbRequired, priceAlertHandler.Create)
	r.GET("/price-alerts", dbRequired, priceAlertHandler.ListByEmail)
	r.DELETE("/price-alerts/:id", dbRequired, priceAlertHandler.Delete)

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
		admin.GET("/analytics", analyticsHandler.GetAnalytics)
		admin.GET("/subscribers", subscriberHandler.AdminListSubscribers)
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
