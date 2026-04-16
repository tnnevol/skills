package actions

import (
	"encoding/json"
	"fmt"

	"halo-cli/internal/api"
)

// ActionPublish publishes a post by name.
// Usage: publish <name>
func ActionPublish(client *api.Client, args []string) error {
	return actionPublishUnpublish(client, args, true)
}

func actionPublishUnpublish(client *api.Client, args []string, doPublish bool) error {
	_, positional := ParseFlags(args)
	if len(positional) == 0 {
		actionName := "publish"
		if !doPublish {
			actionName = "unpublish"
		}
		return fmt.Errorf("用法: halo %s <name>", actionName)
	}
	name := positional[0]

	action := "publish"
	if !doPublish {
		action = "unpublish"
	}

	resp, err := client.Do("PUT", fmt.Sprintf("%s/%s/%s", consolePostsAPI, name, action), nil)
	if err != nil {
		actionLabel := "发布"
		if !doPublish {
			actionLabel = "取消发布"
		}
		return fmt.Errorf("文章%s失败: %w", actionLabel, err)
	}

	var data map[string]interface{}
	if err := json.Unmarshal(resp.Body, &data); err != nil {
		return fmt.Errorf("解析响应失败: %w", err)
	}

	spec := GetMap(data, "spec")
	meta := GetMap(data, "metadata")
	status := GetMap(data, "status")

	badge := "📝 已取消发布"
	if spec["publish"] == true {
		badge = "✅ 已发布"
	}

	actionLabel := "发布"
	if !doPublish {
		actionLabel = "取消发布"
	}

	fmt.Printf("\n✅ 文章%s成功\n", actionLabel)
	fmt.Printf("  标题: %s\n", GetString(spec, "title"))
	fmt.Printf("  名称: %s\n", GetString(meta, "name"))
	fmt.Printf("  状态: %s\n", badge)
	fmt.Printf("  版本: %v\n", meta["version"])

	if doPublish {
		fmt.Printf("  链接: %s\n", BuildPostLink(client.BaseURL, data))
	}

	if status != nil {
		conditions := GetInterfaceSlice(status, "conditions")
		if len(conditions) > 0 {
			fmt.Printf("  条件: %v\n", conditions)
		}
	}

	return nil
}
