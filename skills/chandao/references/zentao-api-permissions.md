# 权限、角色与部门

## 1. 角色与分组

禅道的权限由「权限分组（group）」决定，用户通过 `group` 字段关联分组；`role` 只是职位标识（`dev` / `qa` / `pm` / `po` / `td` / `pd` / `qd` / `top` / `others`）。

| 命令 | 能力 |
| --- | --- |
| `group list` | 列出分组、角色、成员；v1 带 `privs`，v2 带 `users` |
| `user get --id` | 查看用户 `role`、`dept`、`group` |
| `user create/update --group <ids>` | 分配分组（仅 v1） |

示例：

```bash
chandao-cli group list | jq -r '.data.data[] | "\(.id)\t\(.name)\t\(.role)"'
chandao-cli --api-version v1 user create --account dsh --password 'Init@2026' \
  --realname "DSH" --gender m --role po --dept 5 --group 5 --visions rnd
```

## 2. 没有 REST API 的能力

| 能力 | 现状 | 替代 |
| --- | --- | --- |
| 修改分组权限（grouppriv） | ❌ 无 REST | Web `index.php?m=group&f=managePriv&type=byGroup&param=<id>` 或 DB `zt_grouppriv` |
| 新建/修改部门 | ❌ 无创建接口 | Web 或 DB `zt_dept` |
| 文档创建/更新 | ❌ 实例未实现 | Web |

不要声称 CLI 能完成以上写操作；只读命令可以正常用。

## 3. 部门

`dept list` 返回树形结构（`items`），`dept get --id` 查看单个。部门 ID 用于用户 `dept` 字段。

## 4. 403 排查

1. 先确认参数名正确（v2 创建字段常带 `ID` 后缀）；
2. `user get --id <uid>` 看 `role` 是否为空、`group` 是否分配；
3. `group list` 看该分组是否有目标模块权限；
4. 换 `--api-version` 对比 v1/v2；
5. 检查目标产品/项目是否对该用户可见。

## 5. 账号安全

- 新账号给临时密码，首次登录后修改；
- 不要复用管理员账号做日常操作；
- `--group` 传最小权限分组；
- 删除用户是软删除，历史引用保留。
