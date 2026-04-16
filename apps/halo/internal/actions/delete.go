package actions

import (
	"encoding/json"
	"fmt"

	"halo-cli/internal/api"
)

// ActionDelete deletes a post by name.
// Usage: delete <name>
func ActionDelete(client *api.Client, args []string) error {
	_, positional := ParseFlags(args)
	if len(positional) == 0 {
		return fmt.Errorf("用法: halo delete <name>")
	}
	name := positional[0]

	// Fetch post info for confirmation display
	resp, err := client.Do("GET", fmt.Sprintf("%s/%s", extPostsAPI, name), nil)
	if err != nil {
		return fmt.Errorf("获取文章信息失败: %w", err)
	}

	var post map[string]interface{}
	if err := json.Unmarshal(resp.Body, &post); err != nil {
		return fmt.Errorf("解析响应失败: %w", err)
	}

	spec := GetMap(post, "spec")
	title := GetString(spec, "title")
	if title == "" {
		title = "(无标题)"
	}

	fmt.Printf("\n⚠️  确定要删除文章吗？\n")
	fmt.Printf("  标题: %s\n", title)
	fmt.Printf("  名称: %s\n", name)

	_, err = client.Do("DELETE", fmt.Sprintf("%s/%s", extPostsAPI, name), nil)
	if err != nil {
		return fmt.Errorf("删除文章失败: %w", err)
	}

	fmt.Printf("\n✅ 文章已删除: %s\n", name)

	return nil
}
