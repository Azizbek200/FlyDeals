package config

import "os"

type Config struct {
	DatabaseURL string
	JWTSecret   string
	CORSOrigin  string
	Port        string
}

func Load() *Config {
	return &Config{
		DatabaseURL: getEnv("DATABASE_URL", "postgres://user:password@localhost:5432/deals?sslmode=disable"),
		JWTSecret:   getEnv("JWT_SECRET", "change-me-in-production"),
		CORSOrigin:  getEnv("CORS_ORIGIN", "http://localhost:3000"),
		Port:        getEnv("PORT", "8080"),
	}
}

func getEnv(key, fallback string) string {
	if val := os.Getenv(key); val != "" {
		return val
	}
	return fallback
}
