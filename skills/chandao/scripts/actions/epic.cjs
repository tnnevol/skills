#!/usr/bin/env node

/**
 * actions/epic.cjs — 史诗管理模块
 *
 * 命令：
 *   list-epic / get-epic / create-epic / update-epic / delete-epic
 *
 * 注意：史诗模块可能需要特定产品/项目权限
 */

const { get, post, put, del } = require('../api.cjs');
const { validate, required, length, id, range, enum: enumVal } = require('../validate.cjs');

// ========== 表格 & 卡片输出 ==========

function table(headers, rows) {
  if (rows.length === 0) {
    console.log('📭 暂无数据');
    return 0;
  }
  const widths = headers.map((h, i) =>
    Math.max(String(h).length, ...rows.map((r) => String(r[i] ?? '').length))
  );
  const headerLine = '| ' + headers.map((h, i) => pad(h, widths[i])).join(' | ') + ' |';
  const separator = '|' + widths.map((w) => '-'.repeat(w + 2)).join('|') + '|';
  console.log(headerLine);
  console.log(separator);
  for (const row of rows) {
    console.log('| ' + headers.map((h, i) => pad(String(row[i] ?? ''), widths[i])).join(' | ') + ' |');
  }
  return rows.length;
}

function pad(str, len) {
  return str.padEnd(len, ' ');
}

function card(title, fields) {
  console.log(`📋 ${title}`);
  console.log('━'.repeat(50));
  for (const [label, value] of fields) {
    if (value !== undefined && value !== null && value !== '') {
      console.log(`  ${label}: ${value}`);
    }
  }
  console.log('━'.repeat(50));
}

// ========== 查询：史诗列表 ==========

async function listEpics(params = {}) {
  const page = params.page || 1;
  const limit = params.limit || 20;

  const query = { recPerPage: limit, pageID: page };
  if (params.product) query.product = params.product;
  if (params.project) query.project = params.project;
  if (params.status) query.status = params.status;

  const res = await get('/epics', query);
  if (!res.ok) throw new Error(res.error);

  let data = null;
  if (res.data && typeof res.data === 'object') {
    if (Array.isArray(res.data.epics)) {
      data = res.data.epics;
    } else {
      for (const key of Object.keys(res.data)) {
        if (Array.isArray(res.data[key])) {
          data = res.data[key];
          break;
        }
      }
    }
  }
  const result = Array.isArray(data) ? data : [];

  if (result.length === 0) {
    console.log('📭 暂无史诗数据');
    return result;
  }

  const count = table(
    ['ID', '标题', '产品', '优先级', '状态', '创建人'],
    result.map((e) => [
      String(e.id || '-'),
      (e.title || '-').slice(0, 20),
      e.productName || e.product || '-',
      String(e.pri || '-'),
      e.status || '-',
      e.openedBy || e.createdBy || '-',
    ])
  );

  if (result.length >= limit) {
    console.log(`\n💡 还有更多，使用 --page=${page + 1} 查看下一页`);
  }
  console.log(`\n共 ${count} 条 (第 ${page} 页)`);
}

// ========== 查询：史诗详情 ==========

async function getEpic(epicId) {
  id(epicId, '史诗ID');
  const res = await get(`/epics/${epicId}`);
  if (!res.ok) throw new Error(res.error);

  let epic = null;
  if (res.data && typeof res.data === 'object') {
    if (res.data.epic) epic = res.data.epic;
    else if (res.data.result) epic = res.data.result;
    else epic = res.data;
  }

  card(`史诗: ${epic.title || epicId}`, [
    ['ID', epic.id],
    ['标题', epic.title],
    ['产品', epic.productName || epic.product],
    ['优先级', epic.pri],
    ['状态', epic.status],
    ['描述', epic.desc ? epic.desc.slice(0, 200) : '-'],
    ['创建人', epic.openedBy || epic.createdBy],
    ['创建时间', epic.openedDate || epic.createdDate],
  ]);
}

// ========== 创建史诗 ==========

async function createEpic(params) {
  validate({
    product: { required: true },
    title: { required: true, length: { min: 2, max: 200 } },
  }, params);

  if (params.product) {
    const num = Number(params.product);
    if (!Number.isInteger(num) || num < 1) throw new Error(`[校验失败] product 必须是正整数`);
  }

  const body = {
    productID: Number(params.product),
    title: params.title,
  };
  if (params.desc) body.desc = params.desc;
  if (params.pri) body.pri = Number(params.pri);
  if (params.assignedTo) body.assignedTo = params.assignedTo;
  if (params.project) body.project = Number(params.project);

  const res = await post('/epics', body, {}, { dryRun: params.dryRun });
  if (!res.ok) throw new Error(`[创建失败] ${res.error}`);

  console.log(`✅ 史诗创建成功: ${params.title}`);
  if (params.dryRun) {
    console.log('🔍 [DRY-RUN] 未发送真实请求');
  }
}

// ========== 更新史诗 ==========

async function updateEpic(epicId, params) {
  id(epicId, '史诗ID');

  const updateFields = {};
  if (params.title) { length(params.title, '标题', 2, 200); updateFields.title = params.title; }
  if (params.desc) updateFields.desc = params.desc;
  if (params.pri) { range(params.pri, '优先级', 1, 4); updateFields.pri = Number(params.pri); }
  if (params.assignedTo) updateFields.assignedTo = params.assignedTo;
  if (params.status) updateFields.status = params.status;

  if (Object.keys(updateFields).length === 0) {
    throw new Error('[更新失败] 至少提供一个更新字段: --title / --desc / --pri / --assignedTo / --status');
  }

  const res = await put(`/epics/${epicId}`, updateFields, {}, { dryRun: params.dryRun });
  if (!res.ok) throw new Error(`[更新失败] ${res.error}`);

  console.log(`✅ 史诗 #${epicId} 更新成功`);
  if (params.dryRun) {
    console.log('🔍 [DRY-RUN] 未发送真实请求');
  }
}

// ========== 删除史诗 ==========

async function deleteEpic(epicId, params) {
  id(epicId, '史诗ID');

  if (!params.yes && !params.dryRun) {
    console.log(`⚠️  确认要删除史诗 #${epicId} 吗？此操作不可恢复！`);
    console.log('   使用 --yes 跳过确认');
    process.exit(1);
  }

  const res = await del(`/epics/${epicId}`, {}, { dryRun: params.dryRun });
  if (!res.ok) throw new Error(`[删除失败] ${res.error}`);

  console.log(`✅ 史诗 #${epicId} 已删除`);
  if (params.dryRun) {
    console.log('🔍 [DRY-RUN] 未发送真实请求');
  }
}

// ========== CLI 入口 ==========

if (require.main === module) {
  const action = process.argv[2];
  const arg1 = process.argv[3];

  function parseParams(args) {
    const params = {};
    for (const a of args) {
      if (a.startsWith('--')) {
        const [key, ...valueParts] = a.slice(2).split('=');
        const value = valueParts.length ? valueParts.join('=') : true;
        const camelKey = key.replace(/-([a-z])/g, (_, c) => c.toUpperCase());
        params[camelKey] = value;
      }
    }
    return params;
  }

  async function run() {
    const sliceStart = ['create-epic', 'update-epic'].includes(action) ? 3 : 4;
    const params = parseParams(process.argv.slice(sliceStart));

    switch (action) {
      case 'list-epic':
        await listEpics(params);
        break;
      case 'get-epic':
        if (!arg1) { console.error('用法: epic.cjs get-epic <id>'); process.exit(1); }
        await getEpic(arg1);
        break;
      case 'create-epic':
        await createEpic(params);
        break;
      case 'update-epic':
        if (!arg1) { console.error('用法: epic.cjs update-epic <id> [--title=xxx] [--desc=xxx]'); process.exit(1); }
        await updateEpic(arg1, params);
        break;
      case 'delete-epic':
        if (!arg1) { console.error('用法: epic.cjs delete-epic <id>'); process.exit(1); }
        await deleteEpic(arg1, params);
        break;
      default:
        console.log('用法: epic.cjs <list-epic|get-epic|create-epic|update-epic|delete-epic> [id] [options]');
        console.log('');
        console.log('命令:');
        console.log('  list-epic     史诗列表（--product=N）');
        console.log('  get-epic      史诗详情');
        console.log('  create-epic   创建史诗（--product=N --title=xxx）');
        console.log('  update-epic   更新史诗');
        console.log('  delete-epic   删除史诗（二次确认）');
        console.log('');
        console.log('选项:');
        console.log('  --dry-run     模拟执行，不发送真实请求');
        console.log('  --yes         跳过二次确认');
        console.log('  --page=N      分页页码');
        console.log('  --limit=N     每页数量');
    }
  }

  run().catch((e) => {
    console.error(`❌ ${e.message}`);
    process.exit(1);
  });
}

module.exports = { listEpics, getEpic, createEpic, updateEpic, deleteEpic };
