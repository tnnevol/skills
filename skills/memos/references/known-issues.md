# Known Issues

## 设计决策

### 评论删除/更新复用笔记 API
- **现象**: 评论在 Memos API 中本质也是 memo（relation type 为 COMMENT）
- **实现**: 评论的删除和更新操作复用笔记的 delete 和 update API 端点
- **原因**: 这样设计简化了 API 结构，使评论与普通笔记共享相同的生命周期管理机制
- **使用方式**: 
  - 删除评论: `/memos delete <comment_memo_id>`
  - 更新评论: `/memos update <comment_memo_id> "新评论内容"`

### 评论可见性继承机制
- **现象**: 评论的可见性默认继承其父笔记的可见性
- **实现**: 在添加评论时自动获取父笔记的可见性设置
- **原因**: 确保评论与被评论内容的访问权限一致
- **覆盖方式**: 可通过 `--visibility` 参数显式指定评论的可见性

### 评论 ID 格式
- **现象**: 评论具有与普通笔记相同的 ID 格式 (`memos/[ID]`)
- **实现**: 评论在数据库层面与笔记共享同一张表
- **原因**: 简化数据模型和查询逻辑
- **注意**: 在查找和操作评论时，需要使用完整的 memo ID 格式

### 评论 Memo 无法通过 GET 获取完整内容
- **现象**: 通过 `GET /api/v1/memos/{comment_id}` 获取评论时返回 404 或 `content: undefined`
- **原因**: 评论 Memo 是特殊类型（relation type = COMMENT），标准 GET 端点可能无法正常返回
- **应对策略**: 评论应通过 `GET /api/v1/memos/{parent_id}/comments` 列表接口查看，或通过 `get <comment_id>` 命令（api.cjs 封装）获取

### 评论列表 API 内容截断
- **现象**: 调用 `GET /api/v1/memos/{id}/comments` 列表接口时，长文本评论的 `content` 字段会被截断
- **验证方式**: 列表查看显示"会出现..."截断，但通过 `GET /api/v1/memos/{comment_id}` 单独获取时内容完整
- **原因**: Memos 列表接口默认返回摘要而非完整内容（类似预览模式）
- **影响**: 在 comments action 中展示评论列表时，长评论可能显示不完整
- **应对策略**: 
  - 当前：用户可通过 `get <comment_id>` 获取单条评论的完整内容
  - 未来优化：可在 skill 中增加 fallback 逻辑，检测到截断时自动获取完整内容
  - 排查提示：如显示不完整，建议通过单条获取验证是否被截断

### 直接调用 Memos API 的认证格式
- **现象**: 直接使用 `fetch` 调用 Memos API 时，使用 `token` 请求头返回 401
- **正确格式**: 必须使用 `Authorization: Bearer <token>` 格式
- **说明**: `api.cjs` 封装内部已处理正确的认证格式，仅在直接调用 API 时需要注意

### 评论默认可见性问题
- **现象**: 通过评论 API 创建的评论默认 visibility 为 `PRIVATE`，用户在页面上看不到
- **解决方案**: 添加评论时必须显式设置 `visibility: 'PROTECTED'`（或与父笔记一致）
- **最佳实践**: 所有通过 API 直接创建的评论都应显式指定可见性

### Shell 转义问题
- **现象**: 在 shell 命令中直接传递包含反引号（backtick）的内容时，反引号会被 shell 解释并丢失
- **解决方案**: 使用独立的 .cjs 脚本文件发送包含 markdown 格式（含反引号）的评论内容
- **模式**: 通过 `cat > /tmp/script.cjs << 'EOF' ... EOF` 方式创建脚本再执行