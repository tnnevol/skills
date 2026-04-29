# Setup

## Configuration

Configuration is loaded in the following priority order (higher overrides lower):

1. **Environment variables** (highest priority, recommended)
2. **Skill directory `.env`** (next to SKILL.md)
3. **Project root `.env`** — project-level config

Required variables — recommended to export in your shell profile:

```bash
export MEMOS_BASE_URL=https://your-memos-instance.com
export MEMOS_ACCESS_TOKEN=your-memos-access-token
```

Alternatively, create a `.env` file (make sure it's in `.gitignore`). Environment variables are preferred over `.env` files because `.env` files risk accidental commits even with `.gitignore` in place.

## Mental Model

This skill uses several JavaScript scripts with different responsibilities:

- `scripts/api.cjs` — handles Memos API calls (list, create, get, update, delete memos, list tags).
- `scripts/sanitize.cjs` — sanitizes output to redact sensitive values.

## Authentication

Every API request uses Bearer Token auth:

```text
Authorization: Bearer <MEMOS_ACCESS_TOKEN>
Content-Type: application/json
```

## Runtime Detection

The skill ships with plain JavaScript scripts and no external dependencies. Before first use, detect the available JS runtime once and reuse it for the session:

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
| `list` | GET | `/api/v1/memos?pageSize=N[&filter=...]` |
| `create` | POST | `/api/v1/memos` |
| `get` | GET | `/api/v1/memos/{id}` |
| `update` | PATCH | `/api/v1/memos/{id}?updateMask=content,visibility` |
| `delete` | DELETE | `/api/v1/memos/{id}` |
| `tags` | GET | `/api/v1/memos?pageSize=100` (extract tags from response) |

## Error Handling

- If the API returns a non-success response, display the error message clearly
- If authentication fails (401/403), suggest checking the environment variables
- If a resource is not found (404), say so clearly
- If the script returns `[CONFIG_MISSING]`, stop retrying and tell the user to set the required environment variables or `.env` values first

## Memo ID Format

Memos API returns memo names in the format `memos/{id}` (e.g., `memos/7fyTR5EtB5oJrPFAUUi583`).
When using `get`, `update`, or `delete` actions, users can provide either:
- The full name: `memos/7fyTR5EtB5oJrPFAUUi583`
- Just the ID: `7fyTR5EtB5oJrPFAUUi583`

The script normalizes both formats automatically.
