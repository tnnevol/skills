# Actions: config, update-config

## `config` — 获取整体配置

**API:** `GET {AUTO_SAVE_BASE_URL}/data?token={AUTO_SAVE_TOKEN}`

**无参数。**

**示例：**
```
/autosave config
```

**响应：** 返回整体配置数据（JSON 格式）

---

## `update-config` — 更新整体配置

**API:** `POST {AUTO_SAVE_BASE_URL}/update?token={AUTO_SAVE_TOKEN}`

**参数：**
- `--field` — 配置项 key
- `--value` — 配置项值

**示例：**
```
/autosave update-config --field some_key --value some_value
```

**响应：** 更新成功/失败的状态信息
