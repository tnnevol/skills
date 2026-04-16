package actions

import (
	"encoding/json"
	"fmt"

	"halo-cli/internal/api"
)

const extPostsAPI = "/apis/content.halo.run/v1alpha1/posts"

// ActionList lists posts with pagination and keyword search.
// Usage: list [--limit=N] [--page=N] [--keyword=xxx]
func ActionList(client *api.Client, args []string) error {
	flags, _ := ParseFlags(args)

	page := 1
	if v, ok := flags["page"]; ok {
		if n, err := parseInt(v); err == nil && n > 0 {
			page = n
		}
	}

	size := 20
	if v, ok := flags["limit"]; ok {
		if n, err := parseInt(v); err == nil {
			if n < 1 {
				n = 1
			}
			if n > 100 {
				n = 100
			}
			size = n
		}
	}

	keyword := flags["keyword"]

	apiPath := fmt.Sprintf("%s?page=%d&size=%d", extPostsAPI, page, size)
	if keyword != "" {
		apiPath += "&keyword=" + keyword
	}

	resp, err := client.Do("GET", apiPath, nil)
	if err != nil {
		return fmt.Errorf("获取文章列表失败: %w", err)
	}

	var data map[string]interface{}
	if err := json.Unmarshal(resp.Body, &data); err != nil {
		return fmt.Errorf("解析响应失败: %w", err)
	}

	items, _ := data["items"].([]interface{})
	total, _ := data["total"].(float64)

	if len(items) == 0 {
		fmt.Println("📭 没有找到文章。")
		return nil
	}

	fmt.Printf("\n📄 文章列表（共 %.0f 篇，第 %d 页）\n\n", total, page)

	for _, item := range items {
		post, ok := item.(map[string]interface{})
		if !ok {
			continue
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

		name := GetString(meta, "name")
		visitCount := GetFloat64(status, "visitCount")
		visible := GetString(spec, "visible")
		if visible == "" {
			visible = "PUBLIC"
		}
		link := BuildPostLink(client.BaseURL, post)

		fmt.Printf("  %s | %s\n", badge, visible)
		fmt.Printf("  标题: %s\n", title)
		fmt.Printf("  名称: %s\n", name)
		if date != "" {
			fmt.Printf("  时间: %s\n", date)
		}
		fmt.Printf("  阅读: %.0f\n", visitCount)
		fmt.Printf("  链接: %s\n", link)
		fmt.Println("─" + "──────────────────────────────────────────────────")
	}

	hasNext, _ := data["hasNext"].(bool)
	if hasNext || int(total) > page*size {
		fmt.Printf("\n💡 使用 --page=%d 查看下一页\n", page+1)
	}

	return nil
}

func parseInt(s string) (int, error) {
	var n int
	_, err := fmt.Sscanf(s, "%d", &n)
	return n, err
}
