# Setup

## Configuration

Configuration is loaded in the following priority order (higher overrides lower):

1. **Environment variables** (highest priority, recommended)
2. **Skill directory `.env`** (next to SKILL.md)
3. **Project root `.env`** — project-level config

Required variables — recommended to export in your shell profile:

```bash
export AUTO_SAVE_BASE_URL=http://your-quark-auto-save:5005
export AUTO_SAVE_TOKEN=your-quark-auto-save-token
```

Alternatively, create a `.env` file (make sure it's in `.gitignore`). Environment variables are preferred over `.env` files because `.env` files risk accidental commits even with `.gitignore` in place.

## Mental Model

This skill uses several JavaScript scripts with different responsibilities:

- `scripts/api.cjs` — handles quark-auto-save API calls (add-task, config, run-now, suggestions).
- `scripts/sanitize.cjs` — sanitizes output to redact sensitive values.

## Authentication

Every API request passes the token as a URL query parameter:

```text
GET/POST {AUTO_SAVE_BASE_URL}/api/endpoint?token={AUTO_SAVE_TOKEN}
```

The token is derived from the login username/password and does not expire unless the credentials change.

## Runtime Detection

The skill ships with plain JavaScript scripts and no external dependencies. Before first use, detect the available JS runtime once and reuse for the session:

```bash
API_SCRIPT="${CLAUDE_SKILL_DIR}/scripts/api.cjs"

# Detect runtime (prefer bun > node > deno)
if command -v bun &>/dev/null; then RUNTIME="bun"; \
elif command -v node &>/dev/null; then RUNTIME="node"; \
elif command -v deno &>/dev/null; then RUNTIME="deno run --allow-net --allow-read --allow-env"; \
else echo "ERROR: No JS runtime found (need bun, node, or deno)" >&2; exit 1; fi
```

Use the same runtime for all scripts.

API calls:

```bash
$RUNTIME "$API_SCRIPT" <ACTION> [ARGS...]
```

### Action Mapping

| Action | API Method | Endpoint |
|--------|-----------|----------|
| `add-task` | POST | `/api/add_task?token=xxx` |
| `config` | GET | `/data?token=xxx` |
| `update-config` | POST | `/update?token=xxx` |
| `run-now` | POST | `/run_script_now?token=xxx` |
| `suggestions` | GET | `/task_suggestions?q=xxx&d=xxx&token=xxx` |

## Error Handling

- If the API returns a non-success response, display the error message clearly
- If authentication fails (401/403), suggest checking the environment variables
- If a resource is not found (404), say so clearly
- If the script returns `[CONFIG_MISSING]`, stop retrying and tell the user to set the required environment variables or `.env` values first
