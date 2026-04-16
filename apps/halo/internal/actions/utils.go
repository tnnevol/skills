package actions

import (
	"fmt"
	"net/url"
	"regexp"
	"strings"
	"time"
)

// parseFlags parses command-line arguments into a flags map and positional args.
// Supports --key=value and --key forms.
func ParseFlags(args []string) (flags map[string]string, positional []string) {
	flags = make(map[string]string)
	for _, arg := range args {
		if strings.HasPrefix(arg, "--") {
			kv := strings.SplitN(arg[2:], "=", 2)
			if len(kv) == 2 {
				flags[kv[0]] = kv[1]
			} else {
				// --flag with no value → treat as boolean true
				flags[kv[0]] = "true"
			}
		} else {
			positional = append(positional, arg)
		}
	}
	return
}

// slugify converts text to a URL-friendly slug.
// Lowercases, replaces non-alphanumeric chars with hyphens, collapses multiples.
func Slugify(text string) string {
	// Lowercase
	s := strings.ToLower(strings.TrimSpace(text))

	// Convert Chinese chars to pinyin-like representation: just keep and hyphenate
	// For simplicity, replace non-alnum with hyphens
	re := regexp.MustCompile(`[^a-z0-9]+`)
	s = re.ReplaceAllString(s, "-")

	// Collapse multiple hyphens
	s = strings.Trim(s, "-")
	for strings.Contains(s, "--") {
		s = strings.ReplaceAll(s, "--", "-")
	}

	if s == "" {
		// Fallback for purely Chinese or special text
		s = fmt.Sprintf("post-%d", time.Now().Unix())
	}

	return s
}

// formatTime formats an ISO 8601 timestamp into a human-readable Chinese format.
func FormatTime(isoStr string) string {
	if isoStr == "" {
		return ""
	}
	t, err := time.Parse(time.RFC3339, isoStr)
	if err != nil {
		// Try with nanoseconds
		t, err = time.Parse("2006-01-02T15:04:05.000000Z", isoStr)
		if err != nil {
			return isoStr
		}
	}
	// Convert to Asia/Shanghai
	loc, _ := time.LoadLocation("Asia/Shanghai")
	t = t.In(loc)
	return t.Format("2006-01-02 15:04")
}

// buildPostLink constructs the public URL for a post.
func BuildPostLink(baseURL string, post map[string]interface{}) string {
	spec, ok := post["spec"].(map[string]interface{})
	if !ok {
		return ""
	}
	slug, _ := spec["slug"].(string)
	if slug == "" {
		metadata, ok := post["metadata"].(map[string]interface{})
		if !ok {
			return baseURL
		}
		slug, _ = metadata["name"].(string)
	}
	if slug == "" {
		return baseURL
	}
	return strings.TrimRight(baseURL, "/") + "/archives/" + url.PathEscape(slug)
}

// truncate limits string length and adds "..." if truncated.
func Truncate(s string, maxLen int) string {
	if len([]rune(s)) <= maxLen {
		return s
	}
	runes := []rune(s)
	return string(runes[:maxLen]) + "..."
}

// getNestedMap safely navigates nested maps.
func GetNestedMap(data map[string]interface{}, keys ...string) map[string]interface{} {
	current := data
	for _, key := range keys {
		next, ok := current[key].(map[string]interface{})
		if !ok {
			return nil
		}
		current = next
	}
	return current
}

// getString safely extracts a string from a map.
func GetString(data map[string]interface{}, key string) string {
	if v, ok := data[key].(string); ok {
		return v
	}
	return ""
}

// getMap safely extracts a map from a map.
func GetMap(data map[string]interface{}, key string) map[string]interface{} {
	if v, ok := data[key].(map[string]interface{}); ok {
		return v
	}
	return nil
}

// getFloat64 safely extracts a float64 from a map.
func GetFloat64(data map[string]interface{}, key string) float64 {
	if v, ok := data[key].(float64); ok {
		return v
	}
	return 0
}

// getInterfaceSlice safely extracts a []interface{} from a map.
func GetInterfaceSlice(data map[string]interface{}, key string) []interface{} {
	if v, ok := data[key].([]interface{}); ok {
		return v
	}
	return nil
}

// cleanSpec removes empty/undefined fields from spec before sending to API.
func CleanSpec(spec map[string]interface{}) {
	if spec["slug"] == "" || spec["slug"] == nil {
		delete(spec, "slug")
	}
	if spec["cover"] == "" || spec["cover"] == nil {
		delete(spec, "cover")
	}
	if spec["template"] == "" || spec["template"] == nil {
		delete(spec, "template")
	}
}
