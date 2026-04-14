/**
 * 附件操作: attachments（列出笔记附件）
 *
 * 注意：Memos v1 API 的附件通过笔记对象的 attachments 字段返回。
 * 当前实现：
 *   GET /api/v1/memos/{id} — 获取笔记（含附件信息）
 */

const { normalizeMemoId, formatBytes, formatTime, parseFlags } = require("../utils.cjs");

async function actionAttachments(callAPI, BASE_URL, argList) {
  const { positional } = parseFlags(argList);
  const rawId = positional[0];

  if (!rawId) {
    console.error("用法: api.cjs attachments <笔记ID>");
    process.exit(1);
  }

  const id = normalizeMemoId(rawId);

  // 获取笔记详情（含附件）
  const memo = await callAPI("GET", `/api/v1/${id}`);

  if (memo.code !== undefined) {
    console.error(`❌ ${memo.message || "笔记未找到"}`);
    process.exit(1);
  }

  const attachments = memo.attachments || [];

  if (attachments.length === 0) {
    console.log(`📎 ${id} 暂无附件`);
    return;
  }

  console.log(`📎 ${id} 的附件（共 ${attachments.length} 个）:\n`);
  console.log("━".repeat(50));

  for (const att of attachments) {
    const name = att.name || att.filename || "未知文件";
    const size = formatBytes(att.size || att.externalLink?.length);
    const type = att.type || att.mimeType || "未知";
    const url = att.externalLink
      ? `${BASE_URL}${att.externalLink}`
      : `(无外部链接)`;

    console.log(`\n📄 ${name}`);
    console.log(`   大小: ${size}`);
    console.log(`   类型: ${type}`);
    console.log(`   链接: ${url}`);
    console.log("─".repeat(50));
  }
}

module.exports = { actionAttachments };
