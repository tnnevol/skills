# Actions: run-now

## `run-now` — 立即运行脚本任务

**API:** `POST {AUTO_SAVE_BASE_URL}/run_script_now?token={AUTO_SAVE_TOKEN}`

**模式：**

1. **运行全部任务** — 不传 body
   ```
   /auto-save run-now
   ```

2. **运行单个任务** — 传 tasklist
   ```
   /auto-save run-now --tasklist name
   ```
   Body:
   ```json
   {
     "tasklist": [
       {
         "taskname": "name",
         "shareurl": "",
         "savepath": "/path"
       }
     ]
   }
   ```

3. **Cookie 和通知测试** — 传 quark_test
   ```
   /auto-save run-now --quark-test
   ```
   Body:
   ```json
   {
     "quark_test": true,
     "cookie": "xxx",
     "push_config": {
       "QUARK_SIGN_NOTIFY": true
     }
   }
   ```

**响应：** 任务执行状态/结果
