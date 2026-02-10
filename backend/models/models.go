package models

import "time"

type Admin struct {
	ID           int       `json:"id"`
	Email        string    `json:"email"`
	PasswordHash string    `json:"-"`
	CreatedAt    time.Time `json:"created_at"`
}

type Deal struct {
	ID              int       `json:"id"`
	Title           string    `json:"title"`
	Slug            string    `json:"slug"`
	DepartureCity   string    `json:"departure_city"`
	DestinationCity string    `json:"destination_city"`
	Price           int       `json:"price"`
	Currency        string    `json:"currency"`
	TravelDates     string    `json:"travel_dates"`
	AffiliateURL    string    `json:"affiliate_url"`
	Content         string    `json:"content"`
	ImageURL        string    `json:"image_url"`
	Published       bool      `json:"published"`
	CreatedAt       time.Time `json:"created_at"`
	UpdatedAt       time.Time `json:"updated_at"`
}

type LoginRequest struct {
	Email    string `json:"email" binding:"required,email"`
	Password string `json:"password" binding:"required"`
}

type CreateDealRequest struct {
	Title           string `json:"title" binding:"required"`
	DepartureCity   string `json:"departure_city" binding:"required"`
	DestinationCity string `json:"destination_city" binding:"required"`
	Price           int    `json:"price" binding:"required"`
	Currency        string `json:"currency"`
	TravelDates     string `json:"travel_dates"`
	AffiliateURL    string `json:"affiliate_url"`
	Content         string `json:"content"`
	ImageURL        string `json:"image_url"`
	Published       bool   `json:"published"`
}

type UpdateDealRequest struct {
	Title           string `json:"title"`
	DepartureCity   string `json:"departure_city"`
	DestinationCity string `json:"destination_city"`
	Price           int    `json:"price"`
	Currency        string `json:"currency"`
	TravelDates     string `json:"travel_dates"`
	AffiliateURL    string `json:"affiliate_url"`
	Content         string `json:"content"`
	ImageURL        string `json:"image_url"`
	Published       *bool  `json:"published"`
}
