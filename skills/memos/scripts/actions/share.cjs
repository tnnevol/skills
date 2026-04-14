/**
 * 分享操作: share（创建/撤销/列出分享链接）
 *
 * 注意：分享 API 的端点格式可能因 Memos 版本而异。
 * 当前实现使用以下端点：
 *   POST /api/v1/memos/{id}/shares  — 创建分享
 *   GET  /api/v1/memos/{id}/shares  — 列出分享
 *   DELETE /api/v1/shares/{shareId} — 撤销分享
 */

const { normalizeMemoId, formatTime, parseFlags } = require("../utils.cjs");

/**
 * 温和版 API 调用 — 不 exit，返回 { ok, data, status, text }
 */
async function softCall(BASE_URL, ACCESS_TOKEN, method, path, body) {
  const url = `${BASE_URL}${path}`;
  const opts = {
    method,
    headers: { Authorization: `Bearer ${ACCESS_TOKEN}` },
  };
  if (body) {
    opts.headers["Content-Type"] = "application/json";
    opts.body = typeof body === "string" ? body : JSON.stringify(body);
  }
  try {
    const res = await fetch(url, opts);
    const text = await res.text();
    let data;
    try { data = JSON.parse(text); } catch { data = text; }
    return { ok: res.status < 400, status: res.status, text, data };
  } catch (err) {
    return { ok: false, status: 0, text: err.message, data: null };
  }
}

async function actionShare(callAPI, BASE_URL, ACCESS_TOKEN, argList) {
  const { flags, positional } = parseFlags(argList);
  const rawId = positional[0];

  if (!rawId) {
    console.error("用法: api.cjs share <笔记ID> [--list] [--revoke <分享ID>]");
    process.exit(1);
  }

  const id = normalizeMemoId(rawId);

  if (flags.revoke) {
    const shareId = typeof flags.revoke === "string" ? flags.revoke : flags.revoke;
    const res = await softCall(BASE_URL, ACCESS_TOKEN, "DELETE", `/api/v1/shares/${shareId}`);
    if (res.ok) {
      console.log("\n✅ 分享链接已撤销");
      console.log(`   分享ID: ${shareId}`);
    } else {
      console.error(`❌ 撤销失败: 该 Memos 实例可能不支持分享 API`);
      process.exit(1);
    }
    return;
  }

  if (flags.list) {
    const res = await softCall(BASE_URL, ACCESS_TOKEN, "GET", `/api/v1/${id.replace("memos/", "")}/shares`);
    if (!res.ok) {
      console.error(`❌ 无法获取分享列表: 该 Memos 实例可能不支持分享 API`);
      process.exit(1);
    }
    const shares = res.data.shares || [];
    if (shares.length === 0) {
      console.log(`🔗 ${id} 暂无分享链接`);
      return;
    }
    console.log(`🔗 ${id} 的分享链接（共 ${shares.length} 个）:\n`);
    console.log("━".repeat(50));
    for (const share of shares) {
      console.log(`\n📎 分享ID: ${share.name || share.id || "未知"}`);
      console.log(`   链接: ${BASE_URL}/s/${share.name || share.id}`);
      console.log(`   创建时间: ${formatTime(share.createTime)}`);
      console.log("─".repeat(50));
    }
    return;
  }

  // 创建分享链接
  const res = await softCall(BASE_URL, ACCESS_TOKEN, "POST", `/api/v1/${id}/shares`, JSON.stringify({}));
  if (res.ok) {
    const shareId = res.data.name || res.data.id || "未知";
    console.log("\n✅ 分享链接创建成功");
    console.log(`   笔记: ${id}`);
    console.log(`   分享ID: ${shareId}`);
    console.log(`   链接: ${BASE_URL}/s/${shareId.replace("memos/shares/", "")}`);
  } else {
    console.error(`❌ 分享功能不可用: 该 Memos 实例可能不支持分享 API`);
    process.exit(1);
  }
}

module.exports = { actionShare };
