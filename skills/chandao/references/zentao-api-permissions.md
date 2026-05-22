# 禅道 API v2 权限与角色相关问题

## 1. 用户无角色导致 403 和空列表

### 现象
- 创建操作返回 `HTTP 403: {"status":"error","message":"Not allowed"}`
- 列表操作返回空数据（`recTotal: 0`），但其他用户/模块正常

### 根因
用户 `role` 字段为空（`""`），未分配任何角色。禅道权限模型：
- **读取权限**：登录用户即可访问（如 `story list`、`bug list`）
- **写入权限**：需要角色对应的 capability（如 `storyCreate`、`epicCreate`）
- **模块权限**：某些模块（如 systems）需要特定角色才能访问

### 诊断步骤
```bash
# 1. 查看当前用户角色
chandao user get <numeric_id>
# 检查返回的 "role" 字段是否为空

# 2. 如果 user get <account_name> 返回 "User does not exist"
# 用数字 ID 重试（字符串账号名查询不稳定）
```

### 解决方案
禅道 Web 后台 → 组织 → 用户 → 编辑 → 分配角色

### 受影响的端点（已验证）

| 端点 | 无角色时表现 | 有角色后预期 |
|------|------------|------------|
| `POST /epics` | 403 | 200 + 创建成功 |
| `POST /requirements` | 403 | 200 + 创建成功 |
| `POST /stories` | 403 | 200 + 创建成功 |
| `GET /products/{id}/systems` | 403 | 200 + 系统列表 |
| `GET /products/{id}/requirements` | 200 但 `recTotal: 0` | 200 + 实际数据 |
| `GET /products/{id}/epics` | 200 但 `recTotal: 0` | 200 + 实际数据 |
| `GET /products/{id}/feedbacks` | 200 但 `recTotal: 0` | 200 + 实际数据 |
| `GET /products/{id}/tickets` | 200 但 `recTotal: 0` | 200 + 实际数据 |

**注意**：列表端点不会返回 403，而是返回空数据。这是最容易误判的情况——看起来像代码解析问题，实际是权限问题。

## 2. 角色级模块权限差异（qa vs dev/po/pm）

### 现象
用户已分配角色（如 `qa`），但特定模块仍返回 403。

### 根因
禅道的权限是**按角色 × 模块**配置的，不同角色默认拥有不同模块的访问权限：

| 模块 | qa（测试） | dev（开发） | po（产品） | pm（项目） |
|------|-----------|------------|-----------|-----------|
| Bug | ✅ 读写 | ✅ 读写 | ✅ 读 | ✅ 读 |
| Story | ✅ 读 | ✅ 读写 | ✅ 读写 | ✅ 读 |
| Epic | ✅ 读 | ❌ | ✅ 读写 | ✅ 读 |
| System（应用） | ❌ | ❌ | ✅ 读写 | ✅ 读写 |
| Testcase | ✅ 读写 | ✅ 读 | ✅ 读 | ✅ 读 |
| Testtask | ✅ 读写 | ❌ | ✅ 读 | ✅ 读 |

**已验证**（xiaoqian, role=qa, product=21）：
- `GET /products/21/epics` → 200 ✅（qa 可读 epic）
- `POST /epics` → 403 ❌（qa 无 epic 写入权限）
- `GET /products/21/systems` → 403 ❌（qa 无 system 模块权限）
- `POST /systems` → 403 ❌

### 解决方案
1. 在禅道后台给角色添加对应模块的权限：组织 → 权限 → 选择角色 → 勾选模块
2. 或者换用更高权限的角色（如 `po` 或 `pm`）

### ⚠️ 角色可能被清空
在禅道后台修改权限配置时，用户的 `role` 字段可能被意外清空。修改权限后建议重新检查：
```bash
chandao user get <id>
# 确认 "role" 字段不为空
```

## 3. `user get` 字符串账号名不稳定

### 现象
```bash
chandao user get xiaoqian   # → "User does not exist."
chandao user get 6          # → 正常返回用户详情
```

### 根因
禅道 API v2 的 `/users/{id}` 端点对字符串账号名的查找逻辑不一致，某些账号名无法被识别。

### 建议
始终使用数字用户 ID 查询，不要依赖字符串账号名。
