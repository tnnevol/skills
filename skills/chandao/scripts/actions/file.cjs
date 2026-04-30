#!/usr/bin/env node

/**
 * actions/file.cjs — 附件/文件管理模块
 *
 * 命令：upload-file / list-files / download-file / delete-file
 *
 * 注意：文件模块可能需要特定权限
 */

const fs = require('fs');
const path = require('path');
const { get, post, del, request } = require('../api.cjs');
const { validate, required, id, enum: enumVal } = require('../validate.cjs');

const OBJECT_TYPES = ['bug', 'story', 'task', 'testcase', 'testtask', 'execution', 'product', 'project'];

// ============ 表格输出 ============

function table(headers, rows) {
  if (rows.length === 0) { console.log('📭 暂无附件'); return 0; }
  const widths = headers.map((h, i) => Math.max(String(h).length, ...rows.map((r) => String(r[i] ?? '').length)));
  console.log('| ' + headers.map((h, i) => pad(h, widths[i])).join(' | ') + ' |');
  console.log('|' + widths.map((w) => '-'.repeat(w + 2)).join('|') + '|');
  for (const row of rows) console.log('| ' + headers.map((h, i) => pad(String(row[i] ?? ''), widths[i])).join(' | ') + ' |');
  return rows.length;
}
function pad(str, len) { return str.padEnd(len, ' '); }

// ============ 上传附件 ============

async function uploadFile(params) {
  validate({
    file: { required: true },
    objectType: { required: true, enum: OBJECT_TYPES },
    objectID: { required: true },
  }, params);

  const filePath = params.file;
  if (!fs.existsSync(filePath)) throw new Error(`[上传失败] 文件不存在: ${filePath}`);

  // 由于禅道 API 对 multipart/form-data 的上传需要特殊处理
  // 这里先提供 dry-run 支持，实际上传需要配置额外的 multipart 处理
  if (params.dryRun) {
    console.log('🔍 [DRY-RUN] 模拟上传:');
    console.log(`  文件: ${filePath}`);
    console.log(`  关联类型: ${params.objectType}`);
    console.log(`  关联ID: ${params.objectID}`);
    console.log(`  大小: ${(fs.statSync(filePath).size / 1024).toFixed(1)} KB`);
    console.log(`  方法: POST /api.php/v2/files/${params.objectType}/${params.objectID}`);
    return;
  }

  // 实际上传：使用 FormData
  const FormData = require('form-data');
  const formData = new FormData();
  formData.append('files', fs.createReadStream(filePath));

  // 使用原生 http 请求上传（multipart/form-data）
  const { BASE_URL, ACCESS_TOKEN } = require('../env.cjs');
  const url = `${BASE_URL}/api.php/v2/files/${params.objectType}/${params.objectID}`;
  const headers = Object.assign(formData.getHeaders(), { 'Authorization': `Bearer ${ACCESS_TOKEN}` });

  const res = await request('POST', url, formData, {}, { headers });
  if (!res.ok) throw new Error(`[上传失败] ${res.error}`);

  console.log(`✅ 文件上传成功: ${path.basename(filePath)}`);
}

// ============ 查看附件列表 ============

async function listFiles(params) {
  validate({
    objectType: { required: true, enum: OBJECT_TYPES },
    objectID: { required: true },
  }, params);

  // 尝试不同的 API 路径
  const endpoints = [
    `/files/${params.objectType}/${params.objectID}`,
    `/files?objectType=${params.objectType}&objectID=${params.objectID}`,
  ];

  for (const endpoint of endpoints) {
    try {
      const res = await get(endpoint, { recPerPage: 50, pageID: 1 });
      if (res.ok) {
        let files = [];
        if (res.data && typeof res.data === 'object') {
          for (const key of Object.keys(res.data)) {
            if (Array.isArray(res.data[key])) {
              files = res.data[key];
              break;
            }
          }
        }

        if (files.length === 0) { console.log('📭 暂无附件'); return files; }

        const count = table(
          ['ID', '文件名', '大小(KB)', '上传人', '上传时间'],
          files.map(f => [
            String(f.id || '-'),
            (f.title || f.name || f.pathname || '-').slice(0, 20),
            f.size ? (f.size / 1024).toFixed(1) : '-',
            f.addedBy || f.createdBy || '-',
            f.addedDate || f.createdDate || '-',
          ])
        );
        console.log(`\n共 ${count} 条`);
        return files;
      }
    } catch {
      // 尝试下一个端点
    }
  }

  throw new Error('[查询失败] 文件 API 不可用（可能需要特定权限）');
}

// ============ 下载附件 ============

async function downloadFile(fileId, params) {
  id(fileId, '附件ID');

  if (params.dryRun) {
    console.log('🔍 [DRY-RUN] 模拟下载:');
    console.log(`  附件ID: ${fileId}`);
    console.log(`  方法: GET /api.php/v2/files/${fileId}/download`);
    if (params.output) console.log(`  保存路径: ${params.output}`);
    return;
  }

  const { BASE_URL, ACCESS_TOKEN } = require('../env.cjs');
  const url = `${BASE_URL}/api.php/v2/files/${fileId}/download`;

  const res = await fetch(url, {
    headers: { 'Authorization': `Bearer ${ACCESS_TOKEN}` },
  });

  if (!res.ok) throw new Error(`[下载失败] HTTP ${res.status}`);

  const buffer = Buffer.from(await res.arrayBuffer());
  const outputPath = params.output || path.join(process.cwd(), `file_${fileId}`);
  fs.writeFileSync(outputPath, buffer);
  console.log(`✅ 文件已下载: ${outputPath} (${(buffer.length / 1024).toFixed(1)} KB)`);
}

// ============ 删除附件 ============

async function deleteFile(fileId, params) {
  id(fileId, '附件ID');

  if (!params.yes && !params.dryRun) {
    console.log(`⚠️  确认要删除附件 #${fileId} 吗？`);
    console.log('   使用 --yes 跳过确认');
    process.exit(1);
  }

  const res = await del(`/files/${fileId}`, {}, { dryRun: params.dryRun });
  if (!res.ok) throw new Error(`[删除失败] ${res.error}`);

  console.log(`✅ 附件 #${fileId} 已删除`);
  if (params.dryRun) console.log('🔍 [DRY-RUN] 未发送真实请求');
}

// ========== CLI ==========

if (require.main === module) {
  const action = process.argv[2];
  const arg1 = process.argv[3];

  function parseParams(args) {
    const params = {};
    for (const a of args) {
      if (a.startsWith('--')) {
        const [key, ...valueParts] = a.slice(2).split('=');
        const value = valueParts.length ? valueParts.join('=') : true;
        params[key.replace(/-([a-z])/g, (_, c) => c.toUpperCase())] = value;
      }
    }
    return params;
  }

  async function run() {
    const params = parseParams(process.argv.slice(['upload-file', 'list-files'].includes(action) ? 3 : 4));
    switch (action) {
      case 'upload-file': await uploadFile(params); break;
      case 'list-files': await listFiles(params); break;
      case 'download-file': if (!arg1) { console.error('用法: file.cjs download-file <id> [--output=path]'); process.exit(1); } await downloadFile(arg1, params); break;
      case 'delete-file': if (!arg1) { console.error('用法: file.cjs delete-file <id>'); process.exit(1); } await deleteFile(arg1, params); break;
      default:
        console.log('用法: file.cjs <upload-file|list-files|download-file|delete-file> [id] [options]');
        console.log('');
        console.log('  upload-file    --file=path --objectType=bug --objectID=1');
        console.log('  list-files     --objectType=bug --objectID=1');
        console.log('  download-file  <id> [--output=path]');
        console.log('  delete-file    <id>');
        console.log('');
        console.log('  --dry-run      模拟执行');
        console.log('  --yes          跳过确认');
    }
  }

  run().catch(e => { console.error(`❌ ${e.message}`); process.exit(1); });
}

module.exports = { uploadFile, listFiles, downloadFile, deleteFile };
