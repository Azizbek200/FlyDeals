package db

import (
	"context"
	"fmt"
	"log"
	"os"
	"path/filepath"
	"runtime"

	"github.com/jackc/pgx/v5/pgxpool"
)

var Pool *pgxpool.Pool

func Init(databaseURL string) error {
	var err error
	Pool, err = pgxpool.New(context.Background(), databaseURL)
	if err != nil {
		return fmt.Errorf("unable to connect to database: %w", err)
	}

	if err := Pool.Ping(context.Background()); err != nil {
		return fmt.Errorf("unable to ping database: %w", err)
	}

	log.Println("Connected to database")

	if err := runMigrations(); err != nil {
		return fmt.Errorf("failed to run migrations: %w", err)
	}

	return nil
}

func runMigrations() error {
	_, filename, _, _ := runtime.Caller(0)
	migrationsDir := filepath.Join(filepath.Dir(filename), "migrations")

	entries, err := os.ReadDir(migrationsDir)
	if err != nil {
		return fmt.Errorf("failed to read migrations directory: %w", err)
	}

	for _, entry := range entries {
		if entry.IsDir() {
			continue
		}

		path := filepath.Join(migrationsDir, entry.Name())
		sql, err := os.ReadFile(path)
		if err != nil {
			return fmt.Errorf("failed to read migration %s: %w", entry.Name(), err)
		}

		if _, err := Pool.Exec(context.Background(), string(sql)); err != nil {
			return fmt.Errorf("failed to execute migration %s: %w", entry.Name(), err)
		}

		log.Printf("Applied migration: %s", entry.Name())
	}

	return nil
}

func Close() {
	if Pool != nil {
		Pool.Close()
	}
}
