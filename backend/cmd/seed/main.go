package main

import (
	"context"
	"fmt"
	"log"
	"os"

	"deals-backend/config"
	"deals-backend/db"

	"golang.org/x/crypto/bcrypt"
)

func main() {
	cfg := config.Load()

	if err := db.Init(cfg.DatabaseURL); err != nil {
		log.Fatalf("Failed to connect to database: %v", err)
	}
	defer db.Close()

	email := "admin@flydeals.com"
	password := "admin123"

	if len(os.Args) > 1 {
		email = os.Args[1]
	}
	if len(os.Args) > 2 {
		password = os.Args[2]
	}

	hash, err := bcrypt.GenerateFromPassword([]byte(password), bcrypt.DefaultCost)
	if err != nil {
		log.Fatalf("Failed to hash password: %v", err)
	}

	_, err = db.Pool.Exec(context.Background(),
		"INSERT INTO admins (email, password_hash) VALUES ($1, $2) ON CONFLICT (email) DO UPDATE SET password_hash = $2",
		email, string(hash),
	)
	if err != nil {
		log.Fatalf("Failed to create admin: %v", err)
	}

	fmt.Printf("Admin user created/updated: %s\n", email)
}
