package handlers

import (
	"context"
	"net/http"
	"strings"

	"deals-backend/db"
	"deals-backend/models"

	"github.com/gin-gonic/gin"
)

type SubscriberHandler struct{}

func NewSubscriberHandler() *SubscriberHandler {
	return &SubscriberHandler{}
}

type subscribeRequest struct {
	Email string `json:"email" binding:"required,email"`
}

// Subscribe adds an email to the newsletter
func (h *SubscriberHandler) Subscribe(c *gin.Context) {
	var req subscribeRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "A valid email is required"})
		return
	}

	email := strings.ToLower(strings.TrimSpace(req.Email))

	_, err := db.Pool.Exec(context.Background(),
		"INSERT INTO subscribers (email) VALUES ($1) ON CONFLICT (email) DO NOTHING", email)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to subscribe"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Subscribed successfully"})
}

// Unsubscribe removes an email from the newsletter
func (h *SubscriberHandler) Unsubscribe(c *gin.Context) {
	var req subscribeRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "A valid email is required"})
		return
	}

	email := strings.ToLower(strings.TrimSpace(req.Email))

	result, err := db.Pool.Exec(context.Background(),
		"DELETE FROM subscribers WHERE email = $1", email)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to unsubscribe"})
		return
	}

	if result.RowsAffected() == 0 {
		c.JSON(http.StatusNotFound, gin.H{"error": "Email not found"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Unsubscribed successfully"})
}

// AdminListSubscribers lists all subscribers (admin only)
func (h *SubscriberHandler) AdminListSubscribers(c *gin.Context) {
	rows, err := db.Pool.Query(context.Background(),
		"SELECT id, email, created_at FROM subscribers ORDER BY created_at DESC")
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch subscribers"})
		return
	}
	defer rows.Close()

	subscribers := []models.Subscriber{}
	for rows.Next() {
		var s models.Subscriber
		if err := rows.Scan(&s.ID, &s.Email, &s.CreatedAt); err != nil {
			continue
		}
		subscribers = append(subscribers, s)
	}

	c.JSON(http.StatusOK, gin.H{"subscribers": subscribers, "total": len(subscribers)})
}
