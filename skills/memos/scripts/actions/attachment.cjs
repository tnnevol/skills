/**
 * 附件操作: attachments（列出笔记附件）、upload（上传附件）、
 *   delete-attachment（删除附件）、batch-delete-attachment（批量删除附件）
 *
 * 注意：Memos v1 API 的附件通过笔记对象的 attachments 字段返回。
 * 当前实现：
 *   GET /api/v1/memos/{id} — 获取笔记（含附件信息）
 *   POST /api/v1/attachments — 上传附件
 *   DELETE /api/v1/attachments/{name} — 删除附件
 *   POST /api/v1/attachments:batchDelete — 批量删除附件
 */

const fs = require("fs");
const path = require("path");
const { normalizeMemoId, formatBytes, formatTime, parseFlags, normalizeAttachmentId } = require("../utils.cjs");

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
      ? att.externalLink
      : `(无外部链接)`;

    console.log(`\n📄 ${name}`);
    console.log(`   大小: ${size}`);
    console.log(`   类型: ${type}`);
    console.log(`   链接: ${url}`);
    console.log("─".repeat(50));
  }
}

/**
 * 检测文件 MIME 类型
 */
function detectMimeType(filePath) {
  const ext = path.extname(filePath).toLowerCase();
  const mimeMap = {
    // 图片
    ".png": "image/png",
    ".jpg": "image/jpeg",
    ".jpeg": "image/jpeg",
    ".gif": "image/gif",
    ".webp": "image/webp",
    ".svg": "image/svg+xml",
    ".bmp": "image/bmp",
    ".ico": "image/x-icon",
    // 文档
    ".pdf": "application/pdf",
    ".doc": "application/msword",
    ".docx": "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    ".xls": "application/vnd.ms-excel",
    ".xlsx": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    ".ppt": "application/vnd.ms-powerpoint",
    ".pptx": "application/vnd.openxmlformats-officedocument.presentationml.presentation",
    ".txt": "text/plain",
    ".md": "text/markdown",
    ".csv": "text/csv",
    // 代码
    ".js": "text/javascript",
    ".ts": "text/typescript",
    ".json": "application/json",
    ".xml": "application/xml",
    ".html": "text/html",
    ".css": "text/css",
    // 压缩包
    ".zip": "application/zip",
    ".rar": "application/x-rar-compressed",
    ".gz": "application/gzip",
    ".tar": "application/x-tar",
    // 视频
    ".mp4": "video/mp4",
    ".webm": "video/webm",
    ".avi": "video/x-msvideo",
    // 音频
    ".mp3": "audio/mpeg",
    ".wav": "audio/wav",
    ".ogg": "audio/ogg",
  };
  return mimeMap[ext] || "application/octet-stream";
}

// --- upload ---

/**
 * 上传附件
 * 用法: api.cjs upload-attachment <文件路径> [--memo=ID] [--filename=xxx] [--type=MIME]
 */
async function actionAttachmentUpload(callAPI, argList) {
  const { flags, positional } = parseFlags(argList);
  const filePath = positional[0];

  if (!filePath) {
    console.error("用法: api.cjs upload-attachment <文件路径> [--memo=笔记ID] [--filename=文件名] [--type=MIME类型]");
    console.error("\n参数说明:");
    console.error("  <文件路径>      本地文件路径（必填）");
    console.error("  --memo          关联的笔记 ID（可选，格式: memos/ID 或直接写 ID）");
    console.error("  --filename      自定义文件名（可选，默认使用原文件名）");
    console.error("  --type          MIME 类型（可选，自动检测）");
    process.exit(1);
  }

  // 读取文件
  const resolvedPath = path.resolve(filePath);
  if (!fs.existsSync(resolvedPath)) {
    console.error(`❌ 文件不存在: ${resolvedPath}`);
    process.exit(1);
  }

  const fileBuffer = fs.readFileSync(resolvedPath);
  const content = fileBuffer.toString("base64");
  const filename = flags.filename || path.basename(resolvedPath);
  const type = flags.type || detectMimeType(resolvedPath);

  // 构建 body
  const attachment = { filename, content, type };

  if (flags.memo) {
    attachment.memo = normalizeMemoId(String(flags.memo));
  }

  // API expects flat body: { filename, content, type, memo? }
  const body = { filename, content, type };
  if (attachment.memo) {
    body.memo = attachment.memo;
  }

  console.log(`\n📤 正在上传附件:`);
  console.log(`   文件: ${filename}`);
  console.log(`   大小: ${formatBytes(fileBuffer.length)}`);
  console.log(`   类型: ${type}`);
  if (attachment.memo) {
    console.log(`   关联: ${attachment.memo}`);
  }

  const data = await callAPI("POST", "/api/v1/attachments", JSON.stringify(body));

  const name = data.name || "unknown";
  const size = formatBytes(data.size);
  const externalLink = data.externalLink
    ? data.externalLink
    : "(无链接)";

  // 构建永久路径（笔记内容中使用的路径）
  // API 返回的 name 格式: attachments/xxx
  const permanentPath = externalLink !== "(无链接)"
    ? `${BASE_URL}/file/attachments/${name}/${filename}`
    : null;

  console.log(`\n✅ 附件上传成功`);
  console.log(`   名称: ${name}`);
  console.log(`   大小: ${size}`);
  if (permanentPath) {
    console.log(`   永久路径: ${permanentPath}`);
    console.log(`   💡 Markdown: \`![描述](${permanentPath})\``);
  }
  console.log(`   预签名URL: ${externalLink} (辅助验证，不嵌入笔记)`);
}

// --- delete-attachment ---

/**
 * 删除附件
 * 用法: api.cjs delete-attachment <附件ID>
 */
async function actionAttachmentDelete(callAPI, argList) {
  const { positional } = parseFlags(argList);
  const rawId = positional[0];

  if (!rawId) {
    console.error("用法: api.cjs delete-attachment <附件ID>");
    console.error("\n参数说明:");
    console.error("  <附件ID>  附件名称（格式: attachments/ID 或直接写 ID）");
    process.exit(1);
  }

  const name = normalizeAttachmentId(rawId);

  // 获取附件信息用于确认
  // 通过列出所有笔记来查找包含此附件的笔记
  // 或者直接从 attachments/{name} 获取（如果 API 支持 GET 单附件）
  // 先尝试获取附件信息
  const attachment = await callAPI("GET", `/api/v1/${name}`);

  if (attachment.code !== undefined) {
    // 如果无法获取附件详情，仍然允许删除但给出警告
    console.log(`\n⚠️  无法获取附件详情（可能需要确认是否继续删除）`);
  } else {
    const filename = attachment.filename || attachment.name || "未知文件";
    const size = formatBytes(attachment.size);
    const type = attachment.type || attachment.mimeType || "未知";

    console.log(`\n⚠️  确定要删除这个附件吗？`);
    console.log(`   名称: ${filename}`);
    console.log(`   大小: ${size}`);
    console.log(`   类型: ${type}`);
    if (attachment.memo) {
      console.log(`   关联笔记: ${attachment.memo}`);
    }
  }

  await callAPI("DELETE", `/api/v1/${name}`);

  console.log(`\n✅ 已删除附件: ${name}`);
  console.log(`   链接: ${process.env.MEMOS_BASE_URL}/${name}`);
}

// --- batch-delete-attachment ---

/**
 * 批量删除附件
 * 用法: api.cjs batch-delete-attachment <附件ID1> <附件ID2> ...
 */
async function actionAttachmentBatchDelete(callAPI, argList) {
  const { positional } = parseFlags(argList);

  if (positional.length === 0) {
    console.error("用法: api.cjs batch-delete-attachment <附件ID1> <附件ID2> ...");
    console.error("\n参数说明:");
    console.error("  <附件ID>  附件名称（格式: attachments/ID 或直接写 ID），可指定多个");
    process.exit(1);
  }

  const names = positional.map((id) => normalizeAttachmentId(id));

  console.log(`\n⚠️  确定要批量删除 ${names.length} 个附件吗？`);
  for (const name of names) {
    console.log(`   - ${name}`);
  }

  const body = { names };
  await callAPI("POST", "/api/v1/attachments:batchDelete", JSON.stringify(body));

  console.log(`\n✅ 已批量删除 ${names.length} 个附件`);
  console.log(`   链接: ${names.map(name => `${process.env.MEMOS_BASE_URL}/${name}`).join(', ')}`);
}

module.exports = {
  actionAttachments,
  actionAttachmentUpload,
  actionAttachmentDelete,
  actionAttachmentBatchDelete,
};
