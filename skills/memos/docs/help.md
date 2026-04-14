# Help & Reference

This file is the single entry point for all user questions about Memos. Read this file, then follow the instructions below based on the question type.

---

## Type 1: Skill usage questions

Questions like "memos 是什么", "怎么创建笔记", "怎么查标签", "CONFIG_MISSING 怎么办" — answer directly from the content below.

### What is Memos?

[Memos](https://github.com/usememos/memos) is an open-source, self-hosted memo/note tool.
It provides a lightweight, Twitter-like interface for quickly capturing thoughts, ideas, and notes.
Key features include Markdown support, tag-based organization, visibility controls, and a RESTful API.

This skill lets you manage your Memos instance directly from the AI assistant — no need to open the web interface.

### FAQ

**Q: Why use this skill instead of the web UI?**
A: This skill enables programmatic memo management — you can create, search, update, and delete memos via natural language, integrate with other workflows, and automate repetitive tasks.

**Q: How do I create a memo?**
A: Use `/memos create "内容"`. By default it's PRIVATE. Add `--visibility=PUBLIC` or `--visibility=PROTECTED` to change visibility.

**Q: How do tags work?**
A: Tags are automatically extracted from `#tag` patterns in your memo content. For example, `#ai` and `#test` in the content will create tags `ai` and `test`.

**Q: What visibility levels are available?**
A: Three levels:
- `PRIVATE` — Only you can see it (default)
- `PROTECTED` — Visible to logged-in users
- `PUBLIC` — Anyone can see it

**Q: How do I get a memo's ID?**
A: When you list memos (`/memos list`), each memo shows its ID (e.g., `memos/abc123`). You can use the full `memos/abc123` or just `abc123` for get/update/delete.

**Q: I get `[CONFIG_MISSING]` — what do I do?**
A: You haven't set the required environment variables. Run:

```bash
export MEMOS_BASE_URL=https://your-memos-instance.com
export MEMOS_ACCESS_TOKEN=your-token
```

Alternatively, add them to a `.env` file in the skill directory.

**Q: Can I filter memos by tag?**
A: Yes. Use `/memos list --tag=xxx` to filter by a specific tag.

**Q: How do I update a memo?**
A: Use `/memos update <memo_id> "新内容"`. You can also change visibility with `--visibility=PUBLIC`.

**Q: Is there a confirmation before deleting?**
A: Yes. Before deletion, the skill will show the memo content and ask for confirmation.

**Q: How do I install or update this skill?**
A: This skill is located at `~/.openclaw/project-codes/skills/memos/`. Update the files directly or use the skill management system.

---

## Type 2: Memos API usage questions

Questions about the Memos API itself (endpoints, request formats, advanced features) — follow these steps:

1. **Fetch** the Memos documentation:
   - **API Reference**: `https://usememos.com/docs/api`
   - **GitHub**: `https://github.com/usememos/memos`
2. From the docs, find the relevant page or endpoint.
3. Answer the user based on the fetched content.
