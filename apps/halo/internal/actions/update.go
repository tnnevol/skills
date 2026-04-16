package actions

import (
	"encoding/json"
	"fmt"
	"strings"

	"halo-cli/internal/api"
	"halo-cli/internal/markdown"
)

// ActionUpdate updates an existing post.
// Usage: update <name> [--title=xxx] [--raw=xxx] [--content=xxx]
// Handles optimistic locking by fetching the latest version first.
func ActionUpdate(client *api.Client, args []string) error {
	flags, positional := ParseFlags(args)
	if len(positional) == 0 {
		return fmt.Errorf("用法: halo update <name> [--title=xxx] [--raw=xxx] [--content=xxx]")
	}
	name := positional[0]

	// 1. Fetch latest version (optimistic locking)
	resp, err := client.Do("GET", fmt.Sprintf("%s/%s", extPostsAPI, name), nil)
	if err != nil {
		return fmt.Errorf("获取文章最新版本失败: %w", err)
	}

	var current map[string]interface{}
	if err := json.Unmarshal(resp.Body, &current); err != nil {
		return fmt.Errorf("解析响应失败: %w", err)
	}

	currentSpec := GetMap(current, "spec")
	currentMeta := GetMap(current, "metadata")
	if currentSpec == nil || currentMeta == nil {
		return fmt.Errorf("文章结构异常")
	}

	// 2. If content needs updating, update it first (Console API)
	if flags["raw"] != "" || flags["content"] != "" {
		var rawContent, contentContent string

		if flags["raw"] != "" && flags["content"] == "" {
			// Only --raw provided, convert to HTML
			html := markdown.Md2Html(flags["raw"])
			rawContent = html
			contentContent = html
		} else if flags["raw"] == "" && flags["content"] != "" {
			// Only --content provided
			rawContent = flags["content"]
			contentContent = flags["content"]
		} else {
			// Both provided, content takes priority
			contentContent = flags["content"]
			rawContent = contentContent
		}

		contentBody := map[string]interface{}{
			"raw":     rawContent,
			"content": contentContent,
			"rawType": "HTML",
		}
		_, err := client.Do("PUT", fmt.Sprintf("%s/%s/content", consolePostsAPI, name), contentBody)
		if err != nil {
			return fmt.Errorf("更新文章内容失败: %w", err)
		}
	}

	// 3. Build flat-format Post for metadata update (Extension API)
	updatedPost := map[string]interface{}{
		"apiVersion": GetString(current, "apiVersion"),
		"kind":       GetString(current, "kind"),
		"metadata":   currentMeta,
		"spec":       currentSpec,
	}

	// Apply field updates
	if flags["title"] != "" {
		currentSpec["title"] = flags["title"]
	}
	if flags["slug"] != "" {
		currentSpec["slug"] = flags["slug"]
	}
	if flags["visible"] != "" {
		currentSpec["visible"] = flags["visible"]
	}
	if flags["categories"] != "" {
		cats := splitCSV(flags["categories"])
		currentSpec["categories"] = cats
	}
	if flags["tags"] != "" {
		tags := splitCSV(flags["tags"])
		currentSpec["tags"] = tags
	}
	if _, ok := flags["cover"]; ok {
		currentSpec["cover"] = flags["cover"]
	}
	if _, ok := flags["pinned"]; ok {
		currentSpec["pinned"] = flags["pinned"] == "true"
	}
	if _, ok := flags["allowComment"]; ok {
		currentSpec["allowComment"] = flags["allowComment"] == "true"
	}

	CleanSpec(currentSpec)

	// 4. PUT update metadata (Extension API flat format)
	resp, err = client.Do("PUT", fmt.Sprintf("%s/%s", extPostsAPI, name), updatedPost)
	if err != nil {
		return fmt.Errorf("更新文章元数据失败: %w", err)
	}

	var data map[string]interface{}
	if err := json.Unmarshal(resp.Body, &data); err != nil {
		return fmt.Errorf("解析响应失败: %w", err)
	}

	spec := GetMap(data, "spec")
	meta := GetMap(data, "metadata")

	fmt.Println("\n✅ 文章更新成功")
	fmt.Printf("  标题: %s\n", GetString(spec, "title"))
	fmt.Printf("  名称: %s\n", GetString(meta, "name"))
	fmt.Printf("  版本: %v\n", meta["version"])
	if flags["raw"] != "" || flags["content"] != "" {
		fmt.Println("  内容: 已更新")
	}
	fmt.Printf("  链接: %s\n", BuildPostLink(client.BaseURL, data))

	return nil
}

func splitCSV(s string) []string {
	var result []string
	for _, part := range strings.Split(s, ",") {
		part = strings.TrimSpace(part)
		if part != "" {
			result = append(result, part)
		}
	}
	return result
}
