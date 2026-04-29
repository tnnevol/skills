# Actions: run-now

## `run-now` — 立即运行脚本任务

**API:** `POST {AUTO_SAVE_BASE_URL}/run_script_now?token={AUTO_SAVE_TOKEN}`

**响应类型：** 该接口返回 `text/event-stream` (SSE) 格式流式响应，实时输出执行日志

**模式：**

1. **运行全部任务** — 不传参数
   ```
   /autosave run-now
   ```

2. **运行单个任务（旧格式，向后兼容）** — 传 tasklist
   ```
   /autosave run-now --tasklist name
   ```
   Body:
   ```json
   {
     "tasklist": [
       {
         "taskname": "name",
         "shareurl": "",
         "savepath": ""
       }
     ]
   }
   ```

3. **运行单个任务（新格式，推荐）** — 指定完整任务信息
   ```
   /autosave run-now --taskname=xxx --shareurl=https://pan.quark.cn/s/xxx --savepath=/media/path
   /autosave run-now --taskname=xxx --shareurl=https://pan.quark.cn/s/xxx --savepath=/media/path --pattern="(.*)\\.(mp4|mkv)" --replace="\\1"
   ```
   
   **参数说明：**
   - `--taskname` (必选): 任务名称
   - `--shareurl` (必选): 分享链接
   - `--savepath` (必选): 保存路径
   - `--pattern` (可选): 正则字符串（**不带 `//` 包裹**，如 `(.*)\\.(mp4|mkv)`）
   - `--replace` (可选): 替换内容（**JS 正则用 `\\1`、`\\2` 而非 `$1`、`$2`**）
   
   Body:
   ```json
   {
     "tasklist": [
       {
         "taskname": "xxx",
         "shareurl": "https://pan.quark.cn/s/xxx",
         "savepath": "/media/path",
         "pattern": "(.*)\\.(mp4|mkv)",
         "replace": "\\1"
       }
     ]
   }
   ```

4. **Cookie 和通知测试** — 传 quark_test
   ```
   /autosave run-now --quark-test
   ```
   Body:
   ```json
   {
     "quark_test": true,
     "push_config": {
       "QUARK_SIGN_NOTIFY": true
     }
   }
   ```

**响应：** 任务执行的流式日志（SSE 格式），实时输出执行状态和结果
