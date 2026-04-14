# auto-save Setup

## Installation

To install the auto-save skill:

```bash
npx skills add tnnevol/skills --skill auto-save -g -y
```

## Configuration

The skill requires the following environment variables:

| Variable | Description |
|----------|-------------|
| `AUTO_SAVE_BASE_URL` | Backend service address |
| `AUTO_SAVE_TOKEN` | Authentication token (passed as URL parameter `?token=xxx`) |

These should be set in your shell environment before using the skill.

## Action Mapping

| Action | API Method | Endpoint |
|--------|-----------|----------|
| `add-task` | POST | `/api/add_task?token=xxx` |
| `config` | GET | `/data?token=xxx` |
| `update-config` | POST | `/update?token=xxx` |
| `run-now` | POST | `/run_script_now?token=xxx` |
| `search` | GET | `/task_suggestions?q=xxx&d=xxx&token=xxx`（带有效性预检查） |
| `detail` | POST | `/get_share_detail?token=xxx` |

## API Endpoints

### get_share_detail 接口

POST /get_share_detail?token=xxx

请求体：
```json
{
  "shareurl": "分享链接",
  "stoken": "首次为空，浏览子目录时传入上一步返回的 stoken",
  "task": { 从 config 自动补全 },
  "magic_regex": { 从 config 获取 }
}
```

浏览子目录：shareurl 格式为 "https://pan.quark.cn/s/xxx#/list/share/{fid}"

## Security Guidelines

- Token values are never exposed in chat, files, code, logs, or command arguments
- All API calls go through the provided script (`scripts/api.cjs`)
- Environment variables are read via `process.env` at runtime only
- Sensitive values in logs are automatically sanitized