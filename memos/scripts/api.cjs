/**
 * Generic API caller for Memos
 * Usage: <runtime> api.js <ACTION> [ARGS...]
 *
 * Runs on: node (>=18), bun, deno
 * Zero dependencies — native fetch + JSON only
 *
 * Actions:
 *   list [--limit=N] [--tag=xxx]     - List memos
 *   create "content" [--visibility=X] - Create memo
 *   get <memo_id>                    - Get memo
 *   update <memo_id> "content"       - Update memo
 *   delete <memo_id>                 - Delete memo
 *   tags                             - List all tags
 */

const { BASE_URL, ACCESS_TOKEN } = require("./env.cjs");
const { sanitize } = require("./sanitize.cjs");

// --- Args ---

const args = process.argv.slice(2);
const action = args[0];

if (!action) {
  console.error("Usage: api.js <ACTION> [ARGS...]");
  console.error("Actions: list, create, get, update, delete, tags");
  process.exit(1);
}

// --- Helpers ---

function normalizeMemoId(id) {
  if (!id) return id;
  if (id.startsWith("memos/")) return id;
  return `memos/${id}`;
}

function stripMemoPrefix(id) {
  if (!id) return id;
  return id.replace(/^memos\//, "");
}

function formatVisibility(v) {
  if (!v) return "PRIVATE";
  return v.toUpperCase();
}

function truncate(str, len = 100) {
  if (!str) return "";
  return str.length > len ? str.slice(0, len) + "..." : str;
}

function formatTime(isoStr) {
  if (!isoStr) return "";
  try {
    const d = new Date(isoStr);
    const Y = d.getFullYear();
    const M = String(d.getMonth() + 1).padStart(2, "0");
    const D = String(d.getDate()).padStart(2, "0");
    const h = String(d.getHours()).padStart(2, "0");
    const m = String(d.getMinutes()).padStart(2, "0");
    return `${Y}-${M}-${D} ${h}:${m}`;
  } catch {
    return isoStr;
  }
}

function parseFlags(argList) {
  const flags = {};
  const positional = [];
  for (const arg of argList) {
    if (arg.startsWith("--")) {
      const [key, ...rest] = arg.slice(2).split("=");
      flags[key] = rest.length > 0 ? rest.join("=") : true;
    } else {
      positional.push(arg);
    }
  }
  return { flags, positional };
}

// --- API Caller ---

async function callAPI(method, path, body) {
  const url = `${BASE_URL}${path}`;
  const fetchOptions = {
    method,
    headers: {
      Authorization: `Bearer ${ACCESS_TOKEN}`,
    },
  };

  if (body) {
    fetchOptions.headers["Content-Type"] = "application/json";
    fetchOptions.body = typeof body === "string" ? body : JSON.stringify(body);
  }

  const res = await fetch(url, fetchOptions);
  const text = await res.text();

  if (res.status >= 400) {
    console.error(`HTTP ${res.status} Error:`);
    console.error(sanitize(text));
    process.exit(1);
  }

  try {
    return JSON.parse(text);
  } catch {
    return text;
  }
}

// --- Action: list ---

async function actionList(argList) {
  const { flags } = parseFlags(argList);
  const limit = parseInt(flags.limit) || 10;
  const tagFilter = flags.tag || null;

  let allMemos = [];
  let nextPageToken = "";

  // Fetch memos (paginate if needed)
  while (true) {
    let url = `/api/v1/memos?pageSize=${Math.min(limit, 100)}`;
    if (nextPageToken) {
      url += `&pageToken=${encodeURIComponent(nextPageToken)}`;
    }

    const data = await callAPI("GET", url);
    const memos = data.memos || [];

    if (tagFilter) {
      // Filter by tag
      for (const memo of memos) {
        if (memo.tags && memo.tags.includes(tagFilter)) {
          allMemos.push(memo);
          if (allMemos.length >= limit) break;
        }
      }
    } else {
      allMemos = allMemos.concat(memos.slice(0, limit - allMemos.length));
    }

    nextPageToken = data.nextPageToken || "";
    if (!nextPageToken || allMemos.length >= limit) break;
  }

  allMemos = allMemos.slice(0, limit);

  if (allMemos.length === 0) {
    console.log("📭 No memos found.");
    return;
  }

  console.log(`📝 Memos (共 ${allMemos.length} 条):\n`);
  console.log("━".repeat(50));

  for (const memo of allMemos) {
    const id = memo.name || "unknown";
    const content = truncate(memo.content || "", 120);
    const tags = (memo.tags || []).map((t) => `#${t}`).join(" ") || "(无标签)";
    const visibility = memo.visibility || "PRIVATE";
    const created = formatTime(memo.createTime);
    const pinned = memo.pinned ? " 📌" : "";

    console.log(`\n📝 ${stripMemoPrefix(id)}${pinned}`);
    console.log(`   内容: ${content.replace(/\n/g, " ")}`);
    console.log(`   标签: ${tags}`);
    console.log(`   可见性: ${visibility}`);
    console.log(`   创建: ${created}`);
    console.log("─".repeat(50));
  }
}

// --- Action: create ---

async function actionCreate(argList) {
  const { flags, positional } = parseFlags(argList);
  const content = positional.join(" ");
  const visibility = formatVisibility(flags.visibility);

  if (!content) {
    console.error("Usage: api.js create \"content\" [--visibility=PUBLIC|PRIVATE|PROTECTED]");
    process.exit(1);
  }

  const body = { content, visibility };
  const data = await callAPI("POST", "/api/v1/memos", JSON.stringify(body));

  const id = data.name || "unknown";
  const tags = (data.tags || []).map((t) => `#${t}`).join(" ") || "(无标签)";

  console.log("\n✅ Memo created successfully");
  console.log(`   ID: ${id}`);
  console.log(`   可见性: ${data.visibility || visibility}`);
  console.log(`   标签: ${tags}`);
}

// --- Action: get ---

async function actionGet(argList) {
  const { positional } = parseFlags(argList);
  const rawId = positional[0];

  if (!rawId) {
    console.error("Usage: api.js get <memo_id>");
    process.exit(1);
  }

  const id = normalizeMemoId(rawId);
  const data = await callAPI("GET", `/api/v1/${id}`);

  if (data.code !== undefined) {
    console.error(`❌ ${data.message || "Memo not found"}`);
    process.exit(1);
  }

  console.log(`\n📋 Memo: ${data.name}`);
  console.log("━".repeat(50));
  console.log(data.content || "(空内容)");
  console.log("━".repeat(50));

  const tags = (data.tags || []).map((t) => `#${t}`).join(" ") || "(无标签)";
  console.log(`\n标签: ${tags}`);
  console.log(`可见性: ${data.visibility || "PRIVATE"}`);
  console.log(`创建: ${formatTime(data.createTime)}`);
  console.log(`更新: ${formatTime(data.updateTime)}`);
  if (data.pinned) console.log("📌 已置顶");
}

// --- Action: update ---

async function actionUpdate(argList) {
  const { flags, positional } = parseFlags(argList);
  const rawId = positional[0];
  const content = positional.slice(1).join(" ");
  const visibility = flags.visibility ? formatVisibility(flags.visibility) : null;

  if (!rawId || !content) {
    console.error("Usage: api.js update <memo_id> \"new content\" [--visibility=PUBLIC|PRIVATE|PROTECTED]");
    process.exit(1);
  }

  const id = normalizeMemoId(rawId);
  let updateMask = "content";
  const body = { content };

  if (visibility) {
    updateMask += ",visibility";
    body.visibility = visibility;
  }

  const url = `/api/v1/${id}?updateMask=${updateMask}`;
  const data = await callAPI("PATCH", url, JSON.stringify(body));

  const tags = (data.tags || []).map((t) => `#${t}`).join(" ") || "(无标签)";

  console.log("\n✅ Memo updated successfully");
  console.log(`   ID: ${data.name || id}`);
  console.log(`   可见性: ${data.visibility || visibility || "PRIVATE"}`);
  console.log(`   标签: ${tags}`);
}

// --- Action: delete ---

async function actionDelete(argList) {
  const { positional } = parseFlags(argList);
  const rawId = positional[0];

  if (!rawId) {
    console.error("Usage: api.js delete <memo_id>");
    process.exit(1);
  }

  const id = normalizeMemoId(rawId);

  // First fetch the memo to show preview for confirmation
  const memo = await callAPI("GET", `/api/v1/${id}`);

  if (memo.code !== undefined) {
    console.error(`❌ ${memo.message || "Memo not found"}`);
    process.exit(1);
  }

  console.log(`\n⚠️  确定要删除这条 memo 吗？`);
  console.log(`   ID: ${memo.name}`);
  console.log(`   内容: ${truncate(memo.content || "", 100).replace(/\n/g, " ")}`);
  console.log(`   标签: ${(memo.tags || []).map((t) => `#${t}`).join(" ") || "(无标签)"}`);

  // Since we can't prompt interactively in script mode, we proceed with deletion
  // The agent should confirm before calling this action
  await callAPI("DELETE", `/api/v1/${id}`);

  console.log(`\n✅ Memo deleted: ${id}`);
}

// --- Action: tags ---

async function actionTags() {
  const tagCounts = new Map();
  let nextPageToken = "";
  let totalPages = 0;

  while (true) {
    let url = `/api/v1/memos?pageSize=100`;
    if (nextPageToken) {
      url += `&pageToken=${encodeURIComponent(nextPageToken)}`;
    }

    const data = await callAPI("GET", url);
    const memos = data.memos || [];
    totalPages++;

    for (const memo of memos) {
      if (memo.tags && Array.isArray(memo.tags)) {
        for (const tag of memo.tags) {
          tagCounts.set(tag, (tagCounts.get(tag) || 0) + 1);
        }
      }
    }

    nextPageToken = data.nextPageToken || "";
    if (!nextPageToken) break;

    // Safety limit: don't fetch more than 50 pages (5000 memos)
    if (totalPages >= 50) {
      console.log("\n⚠️  分页已达上限 (5000 memos)，标签统计可能不完整");
      break;
    }
  }

  if (tagCounts.size === 0) {
    console.log("🏷️  没有发现任何标签。");
    return;
  }

  const sorted = [...tagCounts.entries()].sort((a, b) => {
    // Sort by count desc, then name asc
    if (b[1] !== a[1]) return b[1] - a[1];
    return a[0].localeCompare(b[0]);
  });

  console.log(`\n🏷️  Tags (共 ${sorted.length} 个):\n`);
  console.log("━".repeat(30));

  for (const [tag, count] of sorted) {
    const bar = "█".repeat(Math.min(count, 20));
    console.log(`  #${tag.padEnd(12)} (${String(count).padStart(3)}) ${bar}`);
  }

  console.log("━".repeat(30));
  console.log("\n括号内为该标签下的 memo 数量");
}

// --- Main ---

const actionMap = {
  list: actionList,
  create: actionCreate,
  get: actionGet,
  update: actionUpdate,
  delete: actionDelete,
  tags: actionTags,
};

const actionFn = actionMap[action];

if (!actionFn) {
  console.error(`Unknown action: ${action}`);
  console.error("Available actions: list, create, get, update, delete, tags");
  process.exit(1);
}

actionFn(args.slice(1)).catch((err) => {
  console.error(err.message || err);
  process.exit(1);
});
