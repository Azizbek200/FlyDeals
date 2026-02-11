package middleware

import (
	"log"
	"net/http"
	"strings"

	"deals-backend/config"

	"github.com/gin-gonic/gin"
	"github.com/golang-jwt/jwt/v5"
)

func AuthRequired(cfg *config.Config) gin.HandlerFunc {
	return func(c *gin.Context) {
		// Check Authorization: Bearer header first, then fall back to cookie
		var tokenString string
		var source string
		if auth := c.GetHeader("Authorization"); strings.HasPrefix(auth, "Bearer ") {
			tokenString = strings.TrimPrefix(auth, "Bearer ")
			source = "bearer"
		} else if auth != "" {
			log.Printf("AUTH: got Authorization header but not Bearer format: %q", auth[:min(len(auth), 20)])
			source = "invalid-format"
		}
		if tokenString == "" {
			tokenString, _ = c.Cookie("token")
			if tokenString != "" {
				source = "cookie"
			}
		}
		if tokenString == "" {
			log.Printf("AUTH: no token found (source=%s) for %s %s | Headers: Authorization=%q",
				source, c.Request.Method, c.Request.URL.Path, c.GetHeader("Authorization"))
			c.JSON(http.StatusUnauthorized, gin.H{"error": "Authentication required"})
			c.Abort()
			return
		}

		log.Printf("AUTH: token found via %s for %s %s (len=%d)",
			source, c.Request.Method, c.Request.URL.Path, len(tokenString))

		token, err := jwt.Parse(tokenString, func(token *jwt.Token) (interface{}, error) {
			if _, ok := token.Method.(*jwt.SigningMethodHMAC); !ok {
				return nil, jwt.ErrSignatureInvalid
			}
			return []byte(cfg.JWTSecret), nil
		})

		if err != nil || !token.Valid {
			log.Printf("AUTH: JWT parse failed for %s %s: %v", c.Request.Method, c.Request.URL.Path, err)
			c.JSON(http.StatusUnauthorized, gin.H{"error": "Invalid or expired token"})
			c.Abort()
			return
		}

		claims, ok := token.Claims.(jwt.MapClaims)
		if !ok {
			c.JSON(http.StatusUnauthorized, gin.H{"error": "Invalid token claims"})
			c.Abort()
			return
		}

		adminID, ok := claims["admin_id"].(float64)
		if !ok {
			c.JSON(http.StatusUnauthorized, gin.H{"error": "Invalid token claims"})
			c.Abort()
			return
		}

		c.Set("adminID", int(adminID))
		c.Next()
	}
}

func min(a, b int) int {
	if a < b {
		return a
	}
	return b
}
