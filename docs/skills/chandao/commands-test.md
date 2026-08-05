# 测试用例格式

## 测试用例步骤与预期格式

测试用例**必须包含步骤（`--steps`）**，使用纯文本格式，**禁止使用 HTML 和 Markdown**。

**API 期望格式**（平行数组，长度一一对应）：
```json
{
  "steps": ["步骤1", "步骤2"],
  "expects": ["期望1", "期望2"],
  "stepType": ["step", "step"]
}
```

**`--steps` 参数格式**（唯一格式）：

```json
[{"step": "步骤1", "expect": "期望1", "type": "step"}, {"step": "步骤2", "expect": "期望2", "type": "step"}]
```

- `type` 仅支持 `step`
- 三个解析后的数组 `steps`、`expects`、`stepType` 长度一致，一一对应

**示例**：
```bash
--steps '[
  {"step": "打开登录页面", "expect": "页面正常加载，显示用户名和密码输入框", "type": "step"},
  {"step": "输入有效用户名", "expect": "输入框接受字符输入", "type": "step"},
  {"step": "输入有效密码", "expect": "密码以密文显示", "type": "step"},
  {"step": "点击登录按钮", "expect": "按钮点击响应正常", "type": "step"}
]'
```

> type 可选值：`unit` / `interface` / `feature` / `install` / `config` / `performance` / `security` / `other`

## 更新操作注意事项

禅道 API 的 PUT 请求会将未包含的字段重置为默认值。脚本内部已自动先 GET 再合并，无需手动处理。

详见 [pitfalls.md](./pitfalls.md) 第 23 条。
