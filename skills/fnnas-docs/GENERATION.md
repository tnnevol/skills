# Generation Info

skills/fnnas-docs 的参考文件来自飞牛应用开放平台在线文档（非 git 仓库，
无公开 GitHub 镜像，探测 fnnas-developer 下多个候选仓库均不存在），
通过 llms.txt 协议抓取，已由技能自带脚本自动同步。

- **Source:** <https://developer.fnnas.com/llms.txt>（索引）/ `llms-full.txt`（正文）
- **Skill version:** `1.1.2`
- **Synced:** 2026-10-09（抓取时间以 references/update-log.md 为准）

## 同步方式

上游不是 git 仓库，无法用 submodule 锁定快照，改用技能自带抓取脚本：

```bash
cd skills/fnnas-docs && python3 scripts/fetch-docs.py
```

- 脚本从 llms-full.txt 解析每篇文档（含 `Source:` 行溯源 URL）并落到 `references/`。
- 每篇参考文件开头保留 `Source: https://developer.fnnas.com/...`，即逐文件溯源。
- 同步后如版本相关表述（API 字段、模板结构）有变，人工核对
  `SKILL.md` 的「创建与生命周期约束」是否需要跟随调整。

## 语言范围

上游仅中文，无国际化问题。
