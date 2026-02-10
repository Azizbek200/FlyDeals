package handlers

import (
	"context"
	"fmt"
	"net/http"
	"strconv"
	"time"

	"deals-backend/db"
	"deals-backend/models"
	"deals-backend/utils"

	"github.com/gin-gonic/gin"
)

type DealHandler struct{}

func NewDealHandler() *DealHandler {
	return &DealHandler{}
}

// Public: list published deals with pagination
func (h *DealHandler) ListPublicDeals(c *gin.Context) {
	page, _ := strconv.Atoi(c.DefaultQuery("page", "1"))
	limit, _ := strconv.Atoi(c.DefaultQuery("limit", "20"))

	if page < 1 {
		page = 1
	}
	if limit < 1 || limit > 100 {
		limit = 20
	}

	offset := (page - 1) * limit

	var total int
	err := db.Pool.QueryRow(context.Background(),
		"SELECT COUNT(*) FROM deals WHERE published = true",
	).Scan(&total)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to count deals"})
		return
	}

	rows, err := db.Pool.Query(context.Background(),
		`SELECT id, title, slug, departure_city, destination_city, price, currency,
		        travel_dates, affiliate_url, content, COALESCE(image_url, ''), published, created_at, updated_at
		 FROM deals WHERE published = true
		 ORDER BY created_at DESC
		 LIMIT $1 OFFSET $2`,
		limit, offset,
	)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch deals"})
		return
	}
	defer rows.Close()

	deals := []models.Deal{}
	for rows.Next() {
		var d models.Deal
		if err := rows.Scan(&d.ID, &d.Title, &d.Slug, &d.DepartureCity, &d.DestinationCity,
			&d.Price, &d.Currency, &d.TravelDates, &d.AffiliateURL, &d.Content, &d.ImageURL,
			&d.Published, &d.CreatedAt, &d.UpdatedAt); err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to scan deal"})
			return
		}
		deals = append(deals, d)
	}

	c.JSON(http.StatusOK, gin.H{
		"deals": deals,
		"total": total,
		"page":  page,
		"limit": limit,
	})
}

// Public: get single published deal by slug
func (h *DealHandler) GetPublicDeal(c *gin.Context) {
	slug := c.Param("slug")

	var d models.Deal
	err := db.Pool.QueryRow(context.Background(),
		`SELECT id, title, slug, departure_city, destination_city, price, currency,
		        travel_dates, affiliate_url, content, COALESCE(image_url, ''), published, created_at, updated_at
		 FROM deals WHERE slug = $1 AND published = true`,
		slug,
	).Scan(&d.ID, &d.Title, &d.Slug, &d.DepartureCity, &d.DestinationCity,
		&d.Price, &d.Currency, &d.TravelDates, &d.AffiliateURL, &d.Content, &d.ImageURL,
		&d.Published, &d.CreatedAt, &d.UpdatedAt)

	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Deal not found"})
		return
	}

	c.JSON(http.StatusOK, d)
}

// Admin: list all deals with pagination
func (h *DealHandler) ListAdminDeals(c *gin.Context) {
	page, _ := strconv.Atoi(c.DefaultQuery("page", "1"))
	limit, _ := strconv.Atoi(c.DefaultQuery("limit", "20"))

	if page < 1 {
		page = 1
	}
	if limit < 1 || limit > 100 {
		limit = 20
	}

	offset := (page - 1) * limit

	var total int
	err := db.Pool.QueryRow(context.Background(),
		"SELECT COUNT(*) FROM deals",
	).Scan(&total)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to count deals"})
		return
	}

	rows, err := db.Pool.Query(context.Background(),
		`SELECT id, title, slug, departure_city, destination_city, price, currency,
		        travel_dates, affiliate_url, content, COALESCE(image_url, ''), published, created_at, updated_at
		 FROM deals
		 ORDER BY created_at DESC
		 LIMIT $1 OFFSET $2`,
		limit, offset,
	)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch deals"})
		return
	}
	defer rows.Close()

	deals := []models.Deal{}
	for rows.Next() {
		var d models.Deal
		if err := rows.Scan(&d.ID, &d.Title, &d.Slug, &d.DepartureCity, &d.DestinationCity,
			&d.Price, &d.Currency, &d.TravelDates, &d.AffiliateURL, &d.Content, &d.ImageURL,
			&d.Published, &d.CreatedAt, &d.UpdatedAt); err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to scan deal"})
			return
		}
		deals = append(deals, d)
	}

	c.JSON(http.StatusOK, gin.H{
		"deals": deals,
		"total": total,
		"page":  page,
		"limit": limit,
	})
}

// Admin: create a new deal
func (h *DealHandler) CreateDeal(c *gin.Context) {
	var req models.CreateDealRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid request: title, departure_city, destination_city, and price are required"})
		return
	}

	if req.Currency == "" {
		req.Currency = "EUR"
	}

	slug := utils.GenerateSlug(req.Title)

	// Ensure slug uniqueness
	baseSlug := slug
	counter := 1
	for {
		var exists bool
		err := db.Pool.QueryRow(context.Background(),
			"SELECT EXISTS(SELECT 1 FROM deals WHERE slug = $1)", slug,
		).Scan(&exists)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to check slug"})
			return
		}
		if !exists {
			break
		}
		slug = fmt.Sprintf("%s-%d", baseSlug, counter)
		counter++
	}

	now := time.Now()
	var deal models.Deal
	err := db.Pool.QueryRow(context.Background(),
		`INSERT INTO deals (title, slug, departure_city, destination_city, price, currency,
		                     travel_dates, affiliate_url, content, image_url, published, created_at, updated_at)
		 VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
		 RETURNING id, title, slug, departure_city, destination_city, price, currency,
		           travel_dates, affiliate_url, content, COALESCE(image_url, ''), published, created_at, updated_at`,
		req.Title, slug, req.DepartureCity, req.DestinationCity, req.Price, req.Currency,
		req.TravelDates, req.AffiliateURL, req.Content, req.ImageURL, req.Published, now, now,
	).Scan(&deal.ID, &deal.Title, &deal.Slug, &deal.DepartureCity, &deal.DestinationCity,
		&deal.Price, &deal.Currency, &deal.TravelDates, &deal.AffiliateURL, &deal.Content, &deal.ImageURL,
		&deal.Published, &deal.CreatedAt, &deal.UpdatedAt)

	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create deal"})
		return
	}

	c.JSON(http.StatusCreated, deal)
}

// Admin: update an existing deal
func (h *DealHandler) UpdateDeal(c *gin.Context) {
	idStr := c.Param("id")
	id, err := strconv.Atoi(idStr)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid deal ID"})
		return
	}

	var req models.UpdateDealRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid request body"})
		return
	}

	// Fetch existing deal
	var existing models.Deal
	err = db.Pool.QueryRow(context.Background(),
		`SELECT id, title, slug, departure_city, destination_city, price, currency,
		        travel_dates, affiliate_url, content, COALESCE(image_url, ''), published, created_at, updated_at
		 FROM deals WHERE id = $1`, id,
	).Scan(&existing.ID, &existing.Title, &existing.Slug, &existing.DepartureCity,
		&existing.DestinationCity, &existing.Price, &existing.Currency, &existing.TravelDates,
		&existing.AffiliateURL, &existing.Content, &existing.ImageURL, &existing.Published,
		&existing.CreatedAt, &existing.UpdatedAt)

	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Deal not found"})
		return
	}

	// Apply updates
	if req.Title != "" {
		existing.Title = req.Title
		existing.Slug = utils.GenerateSlug(req.Title)
	}
	if req.DepartureCity != "" {
		existing.DepartureCity = req.DepartureCity
	}
	if req.DestinationCity != "" {
		existing.DestinationCity = req.DestinationCity
	}
	if req.Price != 0 {
		existing.Price = req.Price
	}
	if req.Currency != "" {
		existing.Currency = req.Currency
	}
	if req.TravelDates != "" {
		existing.TravelDates = req.TravelDates
	}
	if req.AffiliateURL != "" {
		existing.AffiliateURL = req.AffiliateURL
	}
	if req.Content != "" {
		existing.Content = req.Content
	}
	if req.ImageURL != "" {
		existing.ImageURL = req.ImageURL
	}
	if req.Published != nil {
		existing.Published = *req.Published
	}

	now := time.Now()
	var deal models.Deal
	err = db.Pool.QueryRow(context.Background(),
		`UPDATE deals SET title=$1, slug=$2, departure_city=$3, destination_city=$4,
		                  price=$5, currency=$6, travel_dates=$7, affiliate_url=$8,
		                  content=$9, image_url=$10, published=$11, updated_at=$12
		 WHERE id=$13
		 RETURNING id, title, slug, departure_city, destination_city, price, currency,
		           travel_dates, affiliate_url, content, COALESCE(image_url, ''), published, created_at, updated_at`,
		existing.Title, existing.Slug, existing.DepartureCity, existing.DestinationCity,
		existing.Price, existing.Currency, existing.TravelDates, existing.AffiliateURL,
		existing.Content, existing.ImageURL, existing.Published, now, id,
	).Scan(&deal.ID, &deal.Title, &deal.Slug, &deal.DepartureCity, &deal.DestinationCity,
		&deal.Price, &deal.Currency, &deal.TravelDates, &deal.AffiliateURL, &deal.Content, &deal.ImageURL,
		&deal.Published, &deal.CreatedAt, &deal.UpdatedAt)

	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to update deal"})
		return
	}

	c.JSON(http.StatusOK, deal)
}

// Admin: delete a deal
func (h *DealHandler) DeleteDeal(c *gin.Context) {
	idStr := c.Param("id")
	id, err := strconv.Atoi(idStr)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid deal ID"})
		return
	}

	result, err := db.Pool.Exec(context.Background(), "DELETE FROM deals WHERE id = $1", id)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to delete deal"})
		return
	}

	if result.RowsAffected() == 0 {
		c.JSON(http.StatusNotFound, gin.H{"error": "Deal not found"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Deal deleted successfully"})
}
