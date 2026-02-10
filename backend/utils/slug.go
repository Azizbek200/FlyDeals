package utils

import (
	"regexp"
	"strings"
)

var (
	nonAlphanumeric = regexp.MustCompile(`[^a-z0-9-]+`)
	multipleHyphens = regexp.MustCompile(`-{2,}`)
)

func GenerateSlug(title string) string {
	slug := strings.ToLower(title)
	slug = strings.ReplaceAll(slug, " ", "-")
	slug = nonAlphanumeric.ReplaceAllString(slug, "")
	slug = multipleHyphens.ReplaceAllString(slug, "-")
	slug = strings.Trim(slug, "-")
	return slug
}
