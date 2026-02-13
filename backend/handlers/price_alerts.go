package handlers

import (
	"context"
	"net/http"
	"strconv"
	"strings"

	"deals-backend/db"
	"deals-backend/models"

	"github.com/gin-gonic/gin"
)

type PriceAlertHandler struct{}

func NewPriceAlertHandler() *PriceAlertHandler {
	return &PriceAlertHandler{}
}

type createPriceAlertRequest struct {
	Email           string `json:"email" binding:"required,email"`
	DepartureCity   string `json:"departure_city"`
	DestinationCity string `json:"destination_city" binding:"required"`
	TargetPrice     int    `json:"target_price" binding:"required"`
	Currency        string `json:"currency"`
}

// CreatePriceAlert creates a new price alert
func (h *PriceAlertHandler) Create(c *gin.Context) {
	var req createPriceAlertRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Email, destination city, and target price are required"})
		return
	}

	if req.Currency == "" {
		req.Currency = "EUR"
	}

	var alert models.PriceAlert
	err := db.Pool.QueryRow(context.Background(),
		`INSERT INTO price_alerts (email, departure_city, destination_city, target_price, currency)
		 VALUES ($1, $2, $3, $4, $5)
		 RETURNING id, email, departure_city, destination_city, target_price, currency, created_at`,
		strings.ToLower(strings.TrimSpace(req.Email)), req.DepartureCity, req.DestinationCity,
		req.TargetPrice, req.Currency,
	).Scan(&alert.ID, &alert.Email, &alert.DepartureCity, &alert.DestinationCity,
		&alert.TargetPrice, &alert.Currency, &alert.CreatedAt)

	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create price alert"})
		return
	}

	c.JSON(http.StatusCreated, alert)
}

// ListByEmail lists price alerts for a given email
func (h *PriceAlertHandler) ListByEmail(c *gin.Context) {
	email := strings.ToLower(strings.TrimSpace(c.Query("email")))
	if email == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Email query parameter is required"})
		return
	}

	rows, err := db.Pool.Query(context.Background(),
		`SELECT id, email, departure_city, destination_city, target_price, currency, created_at
		 FROM price_alerts WHERE email = $1 ORDER BY created_at DESC`, email)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch price alerts"})
		return
	}
	defer rows.Close()

	alerts := []models.PriceAlert{}
	for rows.Next() {
		var a models.PriceAlert
		if err := rows.Scan(&a.ID, &a.Email, &a.DepartureCity, &a.DestinationCity,
			&a.TargetPrice, &a.Currency, &a.CreatedAt); err != nil {
			continue
		}
		alerts = append(alerts, a)
	}

	c.JSON(http.StatusOK, gin.H{"alerts": alerts})
}

// Delete removes a price alert by ID
func (h *PriceAlertHandler) Delete(c *gin.Context) {
	idStr := c.Param("id")
	id, err := strconv.Atoi(idStr)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid alert ID"})
		return
	}

	result, err := db.Pool.Exec(context.Background(),
		"DELETE FROM price_alerts WHERE id = $1", id)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to delete price alert"})
		return
	}

	if result.RowsAffected() == 0 {
		c.JSON(http.StatusNotFound, gin.H{"error": "Price alert not found"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Price alert deleted"})
}
