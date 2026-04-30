#!/usr/bin/env node

/**
 * actions/testcase.cjs — 测试用例管理模块
 *
 * 命令：list-testcase / get-testcase / create-testcase / update-testcase / delete-testcase
 */

const { get, post, put, del } = require('../api.cjs');
const { validate, required, length, id, range, enum: enumVal } = require('../validate.cjs');

const CASE_TYPES = ['feature', 'interface', 'performance', 'security', 'other'];
const CASE_PRIORITIES = [1, 2, 3, 4];

// ============ 表格 & 卡片 ============

function table(headers, rows) {
  if (rows.length === 0) { console.log('📭 暂无数据'); return 0; }
  const widths = headers.map((h, i) => Math.max(String(h).length, ...rows.map((r) => String(r[i] ?? '').length)));
  console.log('| ' + headers.map((h, i) => pad(h, widths[i])).join(' | ') + ' |');
  console.log('|' + widths.map((w) => '-'.repeat(w + 2)).join('|') + '|');
  for (const row of rows) console.log('| ' + headers.map((h, i) => pad(String(row[i] ?? ''), widths[i])).join(' | ') + ' |');
  return rows.length;
}
function pad(str, len) { return str.padEnd(len, ' '); }

function card(title, fields) {
  console.log(`📋 ${title}`);
  console.log('━'.repeat(50));
  for (const [label, value] of fields) {
    if (value !== undefined && value !== null && value !== '') console.log(`  ${label}: ${value}`);
  }
  console.log('━'.repeat(50));
}

// ============ 测试用例列表 ============

async function listTestcases(params = {}) {
  const page = params.page || 1;
  const limit = params.limit || 20;

  const query = { recPerPage: limit, pageID: page };
  if (params.product) query.product = params.product;
  if (params.project) query.project = params.project;
  if (params.browseType) query.browseType = params.browseType;

  const res = await get('/testcases', query);
  if (!res.ok) throw new Error(res.error);

  let cases = res.data && Array.isArray(res.data.cases) ? res.data.cases : [];

  if (params.module) cases = cases.filter(c => String(c.module) === String(params.module));
  if (params.type) cases = cases.filter(c => c.type === params.type);

  if (cases.length === 0) { console.log('📭 暂无测试用例'); return cases; }

  const priText = { 1: '紧急', 2: '高', 3: '中', 4: '低' };
  const count = table(
    ['ID', '标题', '类型', '优先级', '状态', '创建人'],
    cases.map(c => [
      String(c.id || '-'),
      (c.title || '-').slice(0, 20),
      c.type || '-',
      priText[String(c.pri)] || c.pri || '-',
      c.status || '-',
      c.createdBy || '-',
    ])
  );
  console.log(`\n共 ${count} 条 (第 ${page} 页)`);
}

// ============ 测试用例详情 ============

async function getTestcase(caseId) {
  id(caseId, '用例ID');
  const res = await get(`/testcases/${caseId}`);
  if (!res.ok) throw new Error(res.error);

  let tc = null;
  if (res.data && typeof res.data === 'object') {
    if (res.data.case) tc = res.data.case;
    else if (res.data.result) tc = res.data.result;
    else tc = res.data;
  }

  card(`测试用例: ${tc.title || caseId}`, [
    ['ID', tc.id],
    ['标题', tc.title],
    ['类型', tc.type],
    ['优先级', tc.pri],
    ['状态', tc.status],
    ['前置条件', tc.precondition],
    ['步骤', tc.steps ? tc.steps.slice(0, 300) : '-'],
    ['预期结果', tc.expect],
    ['创建人', tc.createdBy],
    ['创建时间', tc.createdDate],
  ]);
}

// ============ 创建测试用例 ============

async function createTestcase(params) {
  validate({
    product: { required: true },
    title: { required: true, length: { min: 2, max: 200 } },
  }, params);

  const body = { productID: Number(params.product), title: params.title };
  if (params.type) body.type = params.type;
  if (params.pri) body.pri = Number(params.pri);
  if (params.module) body.module = Number(params.module);
  if (params.steps) body.steps = params.steps;
  if (params.expect) body.expect = params.expect;
  if (params.precondition) body.precondition = params.precondition;
  if (params.project) body.project = Number(params.project);

  const res = await post('/testcases', body, {}, { dryRun: params.dryRun });
  if (!res.ok) throw new Error(`[创建失败] ${res.error}`);

  console.log(`✅ 测试用例创建成功: ${params.title}`);
  if (params.dryRun) {
    console.log('🔍 [DRY-RUN] 未发送真实请求');
  }
}

// ============ 更新测试用例 ============

async function updateTestcase(caseId, params) {
  id(caseId, '用例ID');

  const updateFields = {};
  if (params.title) { length(params.title, '标题', 2, 200); updateFields.title = params.title; }
  if (params.type) updateFields.type = params.type;
  if (params.pri) { range(params.pri, '优先级', 1, 4); updateFields.pri = Number(params.pri); }
  if (params.steps) updateFields.steps = params.steps;
  if (params.expect) updateFields.expect = params.expect;

  if (Object.keys(updateFields).length === 0) {
    throw new Error('[更新失败] 至少提供一个字段: --title / --type / --pri / --steps / --expect');
  }

  const res = await put(`/testcases/${caseId}`, updateFields, {}, { dryRun: params.dryRun });
  if (!res.ok) throw new Error(`[更新失败] ${res.error}`);

  console.log(`✅ 测试用例 #${caseId} 更新成功`);
  if (params.dryRun) console.log('🔍 [DRY-RUN] 未发送真实请求');
}

// ============ 删除测试用例 ============

async function deleteTestcase(caseId, params) {
  id(caseId, '用例ID');
  if (!params.yes && !params.dryRun) {
    console.log(`⚠️  确认要删除测试用例 #${caseId} 吗？`);
    console.log('   使用 --yes 跳过确认');
    process.exit(1);
  }
  const res = await del(`/testcases/${caseId}`, {}, { dryRun: params.dryRun });
  if (!res.ok) throw new Error(`[删除失败] ${res.error}`);
  console.log(`✅ 测试用例 #${caseId} 已删除`);
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
    const params = parseParams(process.argv.slice(['create-testcase', 'update-testcase'].includes(action) ? 3 : 4));
    switch (action) {
      case 'list-testcase': await listTestcases(params); break;
      case 'get-testcase': if (!arg1) { console.error('用法: testcase.cjs get-testcase <id>'); process.exit(1); } await getTestcase(arg1); break;
      case 'create-testcase': await createTestcase(params); break;
      case 'update-testcase': if (!arg1) { console.error('用法: testcase.cjs update-testcase <id> [--title=xxx]'); process.exit(1); } await updateTestcase(arg1, params); break;
      case 'delete-testcase': if (!arg1) { console.error('用法: testcase.cjs delete-testcase <id>'); process.exit(1); } await deleteTestcase(arg1, params); break;
      default:
        console.log('用法: testcase.cjs <list-testcase|get-testcase|create-testcase|update-testcase|delete-testcase> [id] [options]');
        console.log('');
        console.log('  --dry-run     模拟执行');
        console.log('  --yes         跳过确认');
        console.log('  --page=N      分页');
        console.log('  --limit=N     每页数量');
    }
  }

  run().catch(e => { console.error(`❌ ${e.message}`); process.exit(1); });
}

module.exports = { listTestcases, getTestcase, createTestcase, updateTestcase, deleteTestcase };
