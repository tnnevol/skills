package actions

import (
	"encoding/json"
	"fmt"
	"time"

	"halo-cli/internal/api"
	"halo-cli/internal/markdown"
)

// ActionCreate creates a new post.
// Usage: create --title=标题 [--raw=Markdown内容] [--content=HTML内容] [--slug=xxx] [--publish] [--public]
func ActionCreate(client *api.Client, args []string) error {
	flags, _ := ParseFlags(args)

	title := flags["title"]
	if title == "" {
		return fmt.Errorf("用法: halo create --title=标题 [--raw=内容] [--slug=xxx] [--publish] [--public]")
	}

	raw := flags["raw"]
	content := flags["content"]
	doPublish := flags["publish"] == "true" || flags["publish"] == "1"
	isPublic := flags["public"] == "true"

	// Visibility: default PRIVATE, --public sets PUBLIC
	visible := "PRIVATE"
	if isPublic {
		visible = "PUBLIC"
	}

	// Generate slug from title if not provided
	slug := flags["slug"]
	if slug == "" {
		slug = Slugify(title)
	}

	// Process content
	// If only --raw is provided, convert Markdown → HTML and use for both raw and content
	var finalRaw, finalContent string
	rawType := "HTML"

	if raw != "" && content == "" {
		// Only --raw provided, convert to HTML
		html := markdown.Md2Html(raw)
		finalRaw = html
		finalContent = html
	} else if raw == "" && content != "" {
		// Only --content provided, use as-is
		finalRaw = content
		finalContent = content
	} else if raw != "" && content != "" {
		// Both provided, content takes priority
		finalRaw = content
		finalContent = content
	}

	// Generate post name
	postName := slug + "-" + time.Now().Format("20060102150405")

	// Build Console API request (nested format)
	postRequest := map[string]interface{}{
		"post": map[string]interface{}{
			"apiVersion": "content.halo.run/v1alpha1",
			"kind":       "Post",
			"metadata": map[string]interface{}{
				"name":        postName,
				"labels":      map[string]interface{}{},
				"annotations": map[string]interface{}{},
			},
			"spec": map[string]interface{}{
				"title":     title,
				"slug":      slug,
				"visible":   visible,
				"publish":   doPublish,
				"allowComment": true,
				"pinned":    false,
				"cover":     "",
				"template":  "",
				"categories": []string{},
				"tags":      []string{},
				"aliases":   []string{},
				"meta": map[string]interface{}{
					"labels":      map[string]interface{}{},
					"annotations": map[string]interface{}{},
				},
				"deprecated":  false,
				"deleted":     false,
				"priority":    0,
				"htmlMetas":   []string{},
				"excerpt": map[string]interface{}{
					"autoGenerate": true,
					"raw":          "",
				},
			},
		},
		"content": map[string]interface{}{
			"raw":      finalRaw,
			"content":  finalContent,
			"rawType":  rawType,
		},
	}

	resp, err := client.Do("POST", consolePostsAPI, postRequest)
	if err != nil {
		return fmt.Errorf("创建文章失败: %w", err)
	}

	var data map[string]interface{}
	if err := json.Unmarshal(resp.Body, &data); err != nil {
		return fmt.Errorf("解析响应失败: %w", err)
	}

	spec := GetMap(data, "spec")
	meta := GetMap(data, "metadata")

	respTitle := GetString(spec, "title")
	respName := GetString(meta, "name")
	respVisible := GetString(spec, "visible")
	if respVisible == "" {
		respVisible = visible
	}
	respVersion := meta["version"]

	published := false
	if spec["publish"] == true {
		published = true
	}
	badge := "✅ 已发布"
	if !published {
		badge = "📝 草稿（未发布）"
	}

	fmt.Println("\n✅ 文章创建成功")
	fmt.Printf("  标题: %s\n", respTitle)
	fmt.Printf("  名称: %s\n", respName)
	fmt.Printf("  可见性: %s\n", respVisible)
	fmt.Printf("  格式: %s\n", rawType)
	fmt.Printf("  状态: %s\n", badge)
	fmt.Printf("  版本: %v\n", respVersion)
	fmt.Printf("  链接: %s\n", BuildPostLink(client.BaseURL, data))

	if !published {
		fmt.Printf("\n💡 使用 `halo publish %s` 发布文章\n", respName)
	}

	return nil
}
