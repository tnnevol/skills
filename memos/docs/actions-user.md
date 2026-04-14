# User Actions

> **Note**: The current skill version focuses on memo and tag operations.
> User management actions (create/update/delete users) require admin privileges
> and are not yet implemented in this skill.

## Available via API (not yet exposed as actions)

The Memos API supports these user-related endpoints:

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/v1/user/me` | GET | Get current user info |
| `/api/v1/users` | GET | List users (admin only) |
| `/api/v1/users/{id}` | PATCH | Update user (admin only) |

## Future Actions (planned)

- `whoami` — Show current user info
- `user-stats` — Show memo count, tag count, and other statistics

If you need these features now, you can request them and I'll implement them.
