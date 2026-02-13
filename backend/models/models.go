package models

import "time"

type Admin struct {
	ID           int       `json:"id"`
	Email        string    `json:"email"`
	PasswordHash string    `json:"-"`
	CreatedAt    time.Time `json:"created_at"`
}

type Deal struct {
	ID              int        `json:"id"`
	Title           string     `json:"title"`
	Slug            string     `json:"slug"`
	DepartureCity   string     `json:"departure_city"`
	DestinationCity string     `json:"destination_city"`
	Price           int        `json:"price"`
	Currency        string     `json:"currency"`
	TravelDates     string     `json:"travel_dates"`
	AffiliateURL    string     `json:"affiliate_url"`
	Content         string     `json:"content"`
	ImageURL        string     `json:"image_url"`
	Published       bool       `json:"published"`
	OriginalPrice   *int       `json:"original_price,omitempty"`
	ExpiresAt       *time.Time `json:"expires_at,omitempty"`
	ScheduledAt     *time.Time `json:"scheduled_at,omitempty"`
	ClickCount      int        `json:"click_count"`
	Tags            []string   `json:"tags"`
	CreatedAt       time.Time  `json:"created_at"`
	UpdatedAt       time.Time  `json:"updated_at"`
}

type LoginRequest struct {
	Email    string `json:"email" binding:"required,email"`
	Password string `json:"password" binding:"required"`
}

type CreateDealRequest struct {
	Title           string   `json:"title" binding:"required"`
	DepartureCity   string   `json:"departure_city" binding:"required"`
	DestinationCity string   `json:"destination_city" binding:"required"`
	Price           int      `json:"price" binding:"required"`
	Currency        string   `json:"currency"`
	TravelDates     string   `json:"travel_dates"`
	AffiliateURL    string   `json:"affiliate_url"`
	Content         string   `json:"content"`
	ImageURL        string   `json:"image_url"`
	Published       bool     `json:"published"`
	OriginalPrice   *int     `json:"original_price"`
	ExpiresAt       string   `json:"expires_at"`
	ScheduledAt     string   `json:"scheduled_at"`
	Tags            []string `json:"tags"`
}

type UpdateDealRequest struct {
	Title           string   `json:"title"`
	DepartureCity   string   `json:"departure_city"`
	DestinationCity string   `json:"destination_city"`
	Price           int      `json:"price"`
	Currency        string   `json:"currency"`
	TravelDates     string   `json:"travel_dates"`
	AffiliateURL    string   `json:"affiliate_url"`
	Content         string   `json:"content"`
	ImageURL        string   `json:"image_url"`
	Published       *bool    `json:"published"`
	OriginalPrice   *int     `json:"original_price"`
	ExpiresAt       string   `json:"expires_at"`
	ScheduledAt     string   `json:"scheduled_at"`
	Tags            []string `json:"tags"`
}

type Subscriber struct {
	ID        int       `json:"id"`
	Email     string    `json:"email"`
	CreatedAt time.Time `json:"created_at"`
}

type PriceAlert struct {
	ID              int       `json:"id"`
	Email           string    `json:"email"`
	DepartureCity   string    `json:"departure_city"`
	DestinationCity string    `json:"destination_city"`
	TargetPrice     int       `json:"target_price"`
	Currency        string    `json:"currency"`
	CreatedAt       time.Time `json:"created_at"`
}

type Destination struct {
	City      string `json:"city"`
	DealCount int    `json:"deal_count"`
}

type AnalyticsResponse struct {
	TotalDeals     int             `json:"total_deals"`
	PublishedDeals int             `json:"published_deals"`
	TotalClicks    int             `json:"total_clicks"`
	Subscribers    int             `json:"subscribers"`
	TopDeals       []DealAnalytics `json:"top_deals"`
}

type DealAnalytics struct {
	ID         int    `json:"id"`
	Title      string `json:"title"`
	ClickCount int    `json:"click_count"`
}
