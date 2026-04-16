package markdown

import (
	"bytes"

	"github.com/yuin/goldmark"
	"github.com/yuin/goldmark/extension"
)

// mdConverter is the shared goldmark instance with GFM extensions.
var mdConverter = goldmark.New(
	goldmark.WithExtensions(
		extension.GFM, // tables, strikethrough, task lists
	),
)

// Md2Html converts a Markdown string to HTML.
// Returns empty string for empty input.
func Md2Html(md string) string {
	if md == "" {
		return ""
	}

	var buf bytes.Buffer
	if err := mdConverter.Convert([]byte(md), &buf); err != nil {
		return ""
	}
	return buf.String()
}
