---
name: helper-scripts
description: 钉钉文档辅助脚本使用
---

# 辅助脚本

dt_helper.sh 脚本提供了各种辅助功能来简化钉钉文档操作。

## 脚本功能

- 获取和缓存访问令牌
- 配置管理（获取/设置）
- 用户 ID 转换（userId 到 unionId）
- Token 失效处理

## 主要命令

```bash
# 获取访问令牌
bash scripts/dt_helper.sh --token

# 强制重新获取令牌（跳过缓存）
bash scripts/dt_helper.sh --token --nocache

# 获取配置值
bash scripts/dt_helper.sh --get KEY

# 设置配置值
bash scripts/dt_helper.sh --set KEY=VALUE

# 自动转换 userId 为 unionId
bash scripts/dt_helper.sh --to-unionid

# 使用特定的 userId 进行转换
bash scripts/dt_helper.sh --to-unionid <userid>
```

## Token 缓存机制

- 脚本按时间缓存 token，提高效率
- 无法感知 token 被提前吊销
- 若 API 返回 401（token 无效/过期），使用 --nocache 参数强制重新获取

## 使用示例

```bash
#!/bin/bash
set -e
HELPER="./scripts/dt_helper.sh"
NEW_TOKEN=$(bash "$HELPER" --token)
OPERATOR_ID=$(bash "$HELPER" --get DINGTALK_MY_OPERATOR_ID)
```

## 关键要点

- 辅助脚本简化了复杂的认证和配置管理
- Token 缓存机制提高了性能
- 脚本处理了常见的错误情况
- 推荐在所有操作中使用辅助脚本