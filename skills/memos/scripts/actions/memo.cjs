/**
 * Memo 操作: list, create, get, update, delete, pin
 */

const { normalizeMemoId, stripMemoPrefix, formatVisibility, truncate, formatTime, parseFlags } = require("../utils.cjs");

// --- list ---

async function actionList(callAPI, argList) {
  const { flags } = parseFlags(argList);
  const limit = parseInt(flags.limit) || 10;
  const tagFilter = flags.tag || null;
  const state = flags.state || null;  // NORMAL or ARCHIVED
  const order = flags.order || null;  // orderBy
  const filter = flags.filter || null;  // CEL expression filter
  const showDeleted = flags['show-deleted'] ? true : null;  // show deleted memos

  let allMemos = [];
  let nextPageToken = "";

  while (true) {
    // Build query parameters
    const params = [];
    params.push(`pageSize=${Math.min(limit, 100)}`);
    
    if (state) params.push(`state=${encodeURIComponent(state)}`);
    if (order) params.push(`orderBy=${encodeURIComponent(order)}`);
    if (filter) params.push(`filter=${encodeURIComponent(filter)}`);
    if (showDeleted) params.push(`showDeleted=true`);
    
    // Add tag filter via CEL if specified
    if (tagFilter) {
      // If filter is already specified, combine with AND
      if (filter) {
        params.push(`filter=${encodeURIComponent(`(${filter}) && tags == ["${tagFilter}"]`)}`);
      } else {
        params.push(`filter=${encodeURIComponent(`tags == ["${tagFilter}"]`)}`);
      }
    }
    
    if (nextPageToken) {
      params.push(`pageToken=${encodeURIComponent(nextPageToken)}`);
    }
    
    const url = `/api/v1/memos?${params.join('&')}`;
    
    const data = await callAPI("GET", url);
    const memos = data.memos || [];

    // If tag filter was applied via API, we don't need to filter client-side
    if (tagFilter && filter) {
      // Both filters applied via API, no client-side filtering needed
      allMemos = allMemos.concat(memos.slice(0, limit - allMemos.length));
    } else if (tagFilter && !filter) {
      // Tag filter was applied via API, no client-side filtering needed
      allMemos = allMemos.concat(memos.slice(0, limit - allMemos.length));
    } else {
      // Original logic when no tag filter was applied via API
      allMemos = allMemos.concat(memos.slice(0, limit - allMemos.length));
    }

    nextPageToken = data.nextPageToken || "";
    if (!nextPageToken || allMemos.length >= limit) break;
  }

  allMemos = allMemos.slice(0, limit);

  if (allMemos.length === 0) {
    console.log("📭 没有找到笔记。");
    return;
  }

  console.log(`📝 笔记列表（共 ${allMemos.length} 条）:\n`);
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

// --- create ---

async function actionCreate(callAPI, argList) {
  const { flags, positional } = parseFlags(argList);
  const content = positional.join(" ");
  const visibility = formatVisibility(flags.visibility);
  const memoId = flags['memo-id'] || null;

  if (!content) {
    console.error("用法: api.cjs create \"内容\" [--visibility=PUBLIC|PRIVATE|PROTECTED] [--memo-id=自定义ID]");
    process.exit(1);
  }

  const body = { content, visibility };
  if (memoId) {
    body.memo_id = memoId;
  }
  const data = await callAPI("POST", "/api/v1/memos", JSON.stringify(body));

  const id = data.name || "unknown";
  const tags = (data.tags || []).map((t) => `#${t}`).join(" ") || "(无标签)";

  console.log("\n✅ 笔记创建成功");
  console.log(`   ID: ${id}`);
  if (memoId) {
    console.log(`   自定义ID: ${memoId}`);
  }
  console.log(`   可见性: ${data.visibility || visibility}`);
  console.log(`   标签: ${tags}`);
  console.log(`   链接: ${process.env.MEMOS_BASE_URL}/${data.name}`);
}

// --- get ---

async function actionGet(callAPI, argList) {
  const { positional } = parseFlags(argList);
  const rawId = positional[0];

  if (!rawId) {
    console.error("用法: api.cjs get <笔记ID>");
    process.exit(1);
  }

  const id = normalizeMemoId(rawId);
  const data = await callAPI("GET", `/api/v1/${id}`);

  if (data.code !== undefined) {
    console.error(`❌ ${data.message || "笔记未找到"}`);
    process.exit(1);
  }

  console.log(`\n📋 笔记: ${data.name}`);
  console.log("━".repeat(50));
  console.log(data.content || "(空内容)");
  console.log("━".repeat(50));

  const tags = (data.tags || []).map((t) => `#${t}`).join(" ") || "(无标签)";
  console.log(`\n标签: ${tags}`);
  console.log(`可见性: ${data.visibility || "PRIVATE"}`);
  console.log(`创建: ${formatTime(data.createTime)}`);
  console.log(`更新: ${formatTime(data.updateTime)}`);
  if (data.pinned) console.log("📌 已置顶");
  console.log(`链接: ${process.env.MEMOS_BASE_URL}/${data.name}`);
}

// --- update ---

async function actionUpdate(callAPI, argList) {
  const { flags, positional } = parseFlags(argList);
  const rawId = positional[0];
  const content = positional.slice(1).join(" ");
  const visibility = flags.visibility ? formatVisibility(flags.visibility) : null;

  if (!rawId || !content) {
    console.error("用法: api.cjs update <笔记ID> \"新内容\" [--visibility=PUBLIC|PRIVATE|PROTECTED]");
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

  console.log("\n✅ 笔记更新成功");
  console.log(`   ID: ${data.name || id}`);
  console.log(`   可见性: ${data.visibility || visibility || "PRIVATE"}`);
  console.log(`   标签: ${tags}`);
  console.log(`   链接: ${process.env.MEMOS_BASE_URL}/${data.name || id}`);
}

// --- delete ---

async function actionDelete(callAPI, argList) {
  const { flags, positional } = parseFlags(argList);
  const rawId = positional[0];
  const force = flags.force ? true : null;

  if (!rawId) {
    console.error("用法: api.cjs delete <笔记ID> [--force]");
    process.exit(1);
  }

  const id = normalizeMemoId(rawId);

  const memo = await callAPI("GET", `/api/v1/${id}`);

  if (memo.code !== undefined) {
    console.error(`❌ ${memo.message || "笔记未找到"}`);
    process.exit(1);
  }

  console.log(`\n⚠️  确定要删除这条笔记吗？`);
  console.log(`   ID: ${memo.name}`);
  console.log(`   内容: ${truncate(memo.content || "", 100).replace(/\n/g, " ")}`);
  console.log(`   标签: ${(memo.tags || []).map((t) => `#${t}`).join(" ") || "(无标签)"}`);
  if (force) {
    console.log(`   模式: 强制删除（含关联数据）`);
  }

  let deleteUrl = `/api/v1/${id}`;
  if (force) {
    deleteUrl += `?force=true`;
  }

  await callAPI("DELETE", deleteUrl);

  console.log(`\n✅ 已删除笔记: ${id}`);
  console.log(`   链接: ${process.env.MEMOS_BASE_URL}/${id}`);
}

// --- pin ---

async function actionPin(callAPI, argList) {
  const { positional } = parseFlags(argList);
  const rawId = positional[0];

  if (!rawId) {
    console.error("用法: api.cjs pin <笔记ID>");
    process.exit(1);
  }

  const id = normalizeMemoId(rawId);

  const memo = await callAPI("GET", `/api/v1/${id}`);

  if (memo.code !== undefined) {
    console.error(`❌ ${memo.message || "笔记未找到"}`);
    process.exit(1);
  }

  const newPinned = !memo.pinned;
  const data = await callAPI("PATCH", `/api/v1/${id}?updateMask=pinned`, JSON.stringify({ pinned: newPinned }));

  if (newPinned) {
    console.log("\n📌 笔记已置顶");
    console.log(`   ID: ${data.name || id}`);
    console.log(`   状态: 已置顶`);
    console.log(`   链接: ${process.env.MEMOS_BASE_URL}/${data.name || id}`);
  } else {
    console.log("\n📌 笔记已取消置顶");
    console.log(`   ID: ${data.name || id}`);
    console.log(`   状态: 已取消置顶`);
    console.log(`   链接: ${process.env.MEMOS_BASE_URL}/${data.name || id}`);
  }
}

module.exports = {
  actionList,
  actionCreate,
  actionGet,
  actionUpdate,
  actionDelete,
  actionPin,
};
