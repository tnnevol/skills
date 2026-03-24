---
name: workspace-config
description: 钉钉知识库配置管理
---

# 知识库配置

管理钉钉知识库访问所需的各种配置。

## 所需配置

| 配置键 | 必填 | 说明 | 如何获取 |
|---|---|---|---|
| `DINGTALK_APP_KEY` | ✅ | 应用 AppKey | 钉钉开放平台 → 应用管理 → 凭证信息 |
| `DINGTALK_APP_SECRET` | ✅ | 应用 AppSecret | 同上 |
| `DINGTALK_MY_USER_ID` | ✅ | 当前用户的企业员工 ID（userId） | 管理后台 → 通讯录 → 成员管理 → 点击姓名查看 |
| `DINGTALK_MY_OPERATOR_ID` | ✅ | 当前用户的 unionId（operatorId） | 首次由辅助脚本自动转换并写入 |

## 配置管理脚本

使用辅助脚本来管理配置：

```bash
# 获取配置
bash scripts/dt_helper.sh --get KEY

# 设置配置
bash scripts/dt_helper.sh --set KEY=VALUE

# 自动转换 userId 为 unionId
bash scripts/dt_helper.sh --to-unionid
```

## 配置验证

在执行任何知识库或文档 API 调用前，必须验证配置：

- 所有任务通用必需：`DINGTALK_APP_KEY`、`DINGTALK_APP_SECRET`、`DINGTALK_MY_USER_ID`
- 涉及任何文档/知识库 API 调用：必须有 `DINGTALK_MY_OPERATOR_ID`

## 关键要点

- 配置信息需要安全保存
- 首次使用时需要自动转换 userId 为 unionId
- 配置缺失时应一次性询问用户所有缺失值
- 避免在输出中显示完整凭证