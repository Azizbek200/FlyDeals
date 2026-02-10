package config

import (
	"os"
	"strings"
)

type Config struct {
	DatabaseURL  string
	JWTSecret    string
	CORSOrigin   string
	Port         string
	IsProduction bool
}

func Load() *Config {
	env := getEnv("GO_ENV", "development")
	corsOrigin := getEnv("CORS_ORIGIN", "http://localhost:3000")
	isProduction := env == "production" || (!strings.Contains(corsOrigin, "localhost") && !strings.Contains(corsOrigin, "127.0.0.1"))

	return &Config{
		DatabaseURL:  getEnv("DATABASE_URL", "postgres://user:password@localhost:5432/deals?sslmode=disable"),
		JWTSecret:    getEnv("JWT_SECRET", "change-me-in-production"),
		CORSOrigin:   corsOrigin,
		Port:         getEnv("PORT", "8080"),
		IsProduction: isProduction,
	}
}

func getEnv(key, fallback string) string {
	if val := os.Getenv(key); val != "" {
		return val
	}
	return fallback
}
