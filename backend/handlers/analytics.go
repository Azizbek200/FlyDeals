package handlers

import (
	"context"
	"net/http"

	"deals-backend/db"
	"deals-backend/models"

	"github.com/gin-gonic/gin"
)

type AnalyticsHandler struct{}

func NewAnalyticsHandler() *AnalyticsHandler {
	return &AnalyticsHandler{}
}

// GetAnalytics returns aggregate statistics for the admin dashboard
func (h *AnalyticsHandler) GetAnalytics(c *gin.Context) {
	var resp models.AnalyticsResponse

	// Total deals
	db.Pool.QueryRow(context.Background(),
		"SELECT COUNT(*) FROM deals").Scan(&resp.TotalDeals)

	// Published deals
	db.Pool.QueryRow(context.Background(),
		"SELECT COUNT(*) FROM deals WHERE published = true").Scan(&resp.PublishedDeals)

	// Total clicks
	db.Pool.QueryRow(context.Background(),
		"SELECT COALESCE(SUM(click_count), 0) FROM deals").Scan(&resp.TotalClicks)

	// Subscriber count
	db.Pool.QueryRow(context.Background(),
		"SELECT COUNT(*) FROM subscribers").Scan(&resp.Subscribers)

	// Top 10 deals by clicks
	rows, err := db.Pool.Query(context.Background(),
		`SELECT id, title, click_count FROM deals
		 WHERE click_count > 0
		 ORDER BY click_count DESC LIMIT 10`)
	if err == nil {
		defer rows.Close()
		for rows.Next() {
			var d models.DealAnalytics
			if err := rows.Scan(&d.ID, &d.Title, &d.ClickCount); err == nil {
				resp.TopDeals = append(resp.TopDeals, d)
			}
		}
	}

	if resp.TopDeals == nil {
		resp.TopDeals = []models.DealAnalytics{}
	}

	c.JSON(http.StatusOK, resp)
}
