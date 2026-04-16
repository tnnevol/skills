package actions

import (
	"encoding/json"
	"fmt"

	"halo-cli/internal/api"
)

const consolePostsAPI = "/apis/api.console.halo.run/v1alpha1/posts"

// ActionGet retrieves a post's details.
// Usage: get <name>
func ActionGet(client *api.Client, args []string) error {
	_, positional := ParseFlags(args)
	if len(positional) == 0 {
		return fmt.Errorf("用法: halo get <name>")
	}
	name := positional[0]

	resp, err := client.Do("GET", fmt.Sprintf("%s/%s", extPostsAPI, name), nil)
	if err != nil {
		return fmt.Errorf("获取文章失败: %w", err)
	}

	var post map[string]interface{}
	if err := json.Unmarshal(resp.Body, &post); err != nil {
		return fmt.Errorf("解析响应失败: %w", err)
	}

	spec := GetMap(post, "spec")
	meta := GetMap(post, "metadata")
	status := GetMap(post, "status")

	badge := "📝 草稿"
	if spec["publish"] == true {
		badge = "✅ 已发布"
	}

	title := GetString(spec, "title")
	if title == "" {
		title = "(无标题)"
	}

	publishTime := GetString(spec, "publishTime")
	if publishTime == "" {
		publishTime = GetString(meta, "creationTimestamp")
	}
	date := FormatTime(publishTime)

	slug := GetString(spec, "slug")
	visible := GetString(spec, "visible")
	if visible == "" {
		visible = "PUBLIC"
	}
	visitCount := GetFloat64(status, "visitCount")
	version := meta["version"]

	// Extract categories
	var categories []string
	cats, _ := post["categories"].([]interface{})
	for _, c := range cats {
		if cm, ok := c.(map[string]interface{}); ok {
			cspec := GetMap(cm, "spec")
			displayName := GetString(cspec, "displayName")
			if displayName == "" {
				cmeta := GetMap(cm, "metadata")
				displayName = GetString(cmeta, "name")
			}
			if displayName != "" {
				categories = append(categories, displayName)
			}
		}
	}

	// Extract tags
	var tags []string
	tagsRaw, _ := post["tags"].([]interface{})
	for _, t := range tagsRaw {
		if tm, ok := t.(map[string]interface{}); ok {
			tspec := GetMap(tm, "spec")
			displayName := GetString(tspec, "displayName")
			if displayName == "" {
				tmeta := GetMap(tm, "metadata")
				displayName = GetString(tmeta, "name")
			}
			if displayName != "" {
				tags = append(tags, displayName)
			}
		}
	}

	fmt.Printf("\n📄 %s\n", title)
	fmt.Println("══════════════════════════════════════════════")
	fmt.Printf("  状态: %s | 可见性: %s\n", badge, visible)
	fmt.Printf("  名称: %s\n", GetString(meta, "name"))
	if slug != "" {
		fmt.Printf("  Slug: %s\n", slug)
	}
	if date != "" {
		fmt.Printf("  时间: %s\n", date)
	}
	if len(categories) > 0 {
		fmt.Printf("  分类: %s\n", joinStrings(categories, ", "))
	}
	if len(tags) > 0 {
		fmt.Printf("  标签: %s\n", joinStrings(tags, ", "))
	}
	fmt.Printf("  阅读: %.0f\n", visitCount)
	fmt.Printf("  版本: %v\n", version)
	fmt.Printf("  链接: %s\n", BuildPostLink(client.BaseURL, post))

	// Try to get head-content (Console API endpoint, may 403)
	contentResp, err := client.Do("GET", fmt.Sprintf("%s/%s/head-content", consolePostsAPI, name), nil)
	if err == nil {
		var contentData map[string]interface{}
		if err := json.Unmarshal(contentResp.Body, &contentData); err == nil {
			content := GetString(contentData, "content")
			if content == "" {
				content = GetString(contentData, "raw")
			}
			if content != "" {
				fmt.Printf("\n── 内容预览 ──\n")
				fmt.Println(Truncate(content, 500))
			}
		}
	}
	// Silently ignore 403/network errors

	return nil
}

func joinStrings(strs []string, sep string) string {
	if len(strs) == 0 {
		return ""
	}
	result := strs[0]
	for _, s := range strs[1:] {
		result += sep + s
	}
	return result
}
