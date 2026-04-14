# Actions: add-task, suggestions

## `add-task` — 添加转存任务

**API:** `POST {AUTO_SAVE_BASE_URL}/api/add_task?token={AUTO_SAVE_TOKEN}`

**必填参数：**
- `--name` — 任务名称
- `--shareurl` — 夸克网盘分享链接（如 `https://pan.quark.cn/s/xxxxxx`）
- `--savepath` — 保存路径（如 `/影视/测试`）

**可选参数：**
- `--pattern` — 文件匹配正则（如 `(.*)\\.(mp4|mkv)`）
- `--replace` — 替换规则

**示例：**
```
/auto-save add-task --name "xxx" --shareurl "https://pan.quark.cn/s/xxx" --savepath "/xxx"
/auto-save add-task --name "xxx" --shareurl "https://pan.quark.cn/s/xxx" --savepath "/xxx" --pattern "(.*)\\.(mp4|mkv)"
```

**成功响应：**
```json
{
  "success": true,
  "code": 0,
  "message": "任务添加成功",
  "data": {
    "taskname": "string",
    "shareurl": "string",
    "savepath": "string"
  }
}
```

---

## `search` — 搜索任务建议

**API:** `GET {AUTO_SAVE_BASE_URL}/task_suggestions?q={query}&d={depth}&token={AUTO_SAVE_TOKEN}`

**必填参数：**
- `--query` — 搜索关键词

**可选参数：**
- `--depth` — 搜索深度，默认 1

**功能增强：**
搜索结果会进行有效性预检查，对每个结果调用 `get_share_detail` 接口验证有效性。有效结果排在前面，无效/过期的结果会标注"已失效"。结果会显示：标题、文件大小（size）、文件数量（all_file_num）、是否有效。

**示例：**
```
/auto-save search --query "test"
/auto-save search --query "团战" --depth 2
```

**响应示例：**
```json
{
  "success": true,
  "data": [
    {
      "taskname": "...",
      "shareurl": "...",
      "content": "...",
      "datetime": "...",
      "channel": "...",
      "source": "..."
    }
  ]
}
```
