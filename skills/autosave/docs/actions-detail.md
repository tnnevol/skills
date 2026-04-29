# `detail` — 查看分享详情

## Usage

```
/autosave detail <shareurl>
```

## Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `shareurl` | string | Yes | 分享链接（如：https://pan.quark.cn/s/xxx） |
| `--stoken` | string | No | 子目录浏览时的 stoken（默认为空） |
| `--savepath` | string | No | 保存路径（默认为 `/media/`） |

## Execution Flow

1. **Prepare Request Body**
   - `shareurl`: user input
   - `stoken`: from --stoken flag (empty initially)
   - `task.taskname`: auto-completed from search results/config
   - `task.savepath`: from --savepath flag or default `/media/`
   - `task.addition`: from config's `task_plugins_config_default`
   - `task.runweek`: default `[1,2,3,4,5,6,7]`
   - `magic_regex`: from config's `magic_regex`

2. **Call API**
   - POST `{AUTO_SAVE_BASE_URL}/get_share_detail?token={AUTO_SAVE_TOKEN}`
   - Request body includes all parameters above

3. **Return Result**
   - Display share details (title, size, file count, validity)
   - For subdirectory browsing: show directory listing with `fid` for navigation

## Subdirectory Browsing

To browse subdirectories:

```
/autosave detail <shareurl>#/list/share/{fid} --stoken <stoken>
```

## Examples

```
/autosave detail https://pan.quark.cn/s/xxxxxx
/autosave detail https://pan.quark.cn/s/xxxxxx --savepath /movies/
/autosave detail https://pan.quark.cn/s/xxxxxx#/list/share/123456 --stoken abcdef
```

## Error Handling

| Error | User Message |
|-------|-------------|
| Invalid share URL | "分享链接格式不正确" |
| Share not found/expired | "分享链接已失效或不存在" |
| API error | "获取分享详情失败，请稍后重试" |
| Token error | "认证失败，请检查配置" |