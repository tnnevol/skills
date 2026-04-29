# 禅道 Skill 迭代开发计划 (feat/iter-xiaobei)

## 项目目标
完成 tnnevol-skills 项目的 chandao skill 功能开发

## 当前状态
- ✅ 分支已切出：`feat/iter-xiaobei`
- 📋 任务来源：memos/AFGYNvt2d9y3SZht2nGt88

## 开发任务

### 阶段一：执行/迭代（execution）模块开发 (P1)

- [ ] 创建 `scripts/actions/execution.cjs`
  - [ ] `list-execution` - 列出执行（支持状态过滤、分页）
  - [ ] `get-execution <id>` - 获取执行详情
  - [ ] `create-execution` - 创建执行（关联产品/项目）
  - [ ] `update-execution` - 更新执行
  - [ ] `delete-execution` - 删除/归档执行
  - [ ] `start-execution <id>` - 启动执行
  - [ ] `suspend-execution <id>` - 暂停执行
  - [ ] `close-execution <id>` - 关闭执行

- [ ] 创建 `docs/actions-execution.md`
- [ ] 更新 `SKILL.md` 命令表补充 execution 模块

### 阶段二：Story/Task API 修复 (P0)

- [ ] 分析当前 `scripts/query.cjs` 的 API 路由逻辑
- [ ] 确定禅道 project ID 的自动注入点
- [ ] 修复 `/api.php/v2/stories` → `/api.php/v2/projects/{id}/stories`
- [ ] 修复 `/api.php/v2/tasks` → `/api.php/v2/projects/{id}/tasks`
- [ ] 测试验证

### 阶段三：集成测试

- [ ] 在实际禅道环境（ID=2 的执行）测试完整流程
- [ ] 编写使用示例与故障排查文档
- [ ] 通知小六测试

## 时间计划
- 阶段一：2-3 天
- 阶段二：1-2 天
- 阶段三：0.5 天

## 需要协助
- 需要老白提供禅道项目 ID 和测试环境权限
- 可能需要展堂指导 API 路由修复方案
