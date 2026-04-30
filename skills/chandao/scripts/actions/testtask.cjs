#!/usr/bin/env node

/**
 * actions/testtask.cjs — 测试任务管理 + 测试结果提交模块
 *
 * 命令：list-testtask / get-testtask / create-testtask / update-testtask / delete-testtask
 *       run-testtask / submit-testresult
 */

const { get, post, put, del } = require('../api.cjs');
const { validate, required, length, id, range, enum: enumVal } = require('../validate.cjs');

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

// ============ 测试任务列表 ============

async function listTesttasks(params = {}) {
  const page = params.page || 1;
  const limit = params.limit || 20;

  const query = { recPerPage: limit, pageID: page };
  if (params.product) query.product = params.product;
  if (params.project) query.project = params.project;
  if (params.browseType) query.browseType = params.browseType;

  const res = await get('/testtasks', query);
  if (!res.ok) throw new Error(res.error);

  let tasks = res.data && Array.isArray(res.data.tasks) ? res.data.tasks : [];

  if (params.build) tasks = tasks.filter(t => String(t.build) === String(params.build));

  if (tasks.length === 0) { console.log('📭 暂无测试任务'); return tasks; }

  const count = table(
    ['ID', '名称', '产品', '状态', '创建人', '开始时间'],
    tasks.map(t => [
      String(t.id || '-'),
      (t.name || '-').slice(0, 18),
      t.productName || t.product || '-',
      t.status || '-',
      t.createdBy || '-',
      t.begin || '-',
    ])
  );
  console.log(`\n共 ${count} 条 (第 ${page} 页)`);
}

// ============ 测试任务详情 ============

async function getTesttask(taskId) {
  id(taskId, '任务ID');
  const res = await get(`/testtasks/${taskId}`);
  if (!res.ok) throw new Error(res.error);

  let tt = null;
  if (res.data && typeof res.data === 'object') {
    if (res.data.task) tt = res.data.task;
    else if (res.data.result) tt = res.data.result;
    else tt = res.data;
  }

  card(`测试任务: ${tt.name || taskId}`, [
    ['ID', tt.id],
    ['名称', tt.name],
    ['产品', tt.productName || tt.product],
    ['版本', tt.build || '-'],
    ['状态', tt.status],
    ['负责人', tt.owner || '-'],
    ['开始时间', tt.begin],
    ['结束时间', tt.end],
    ['创建人', tt.createdBy],
  ]);
}

// ============ 创建测试任务 ============

async function createTesttask(params) {
  validate({
    product: { required: true },
    name: { required: true, length: { min: 2, max: 100 } },
  }, params);

  const body = { productID: Number(params.product), name: params.name };
  if (params.build) body.build = params.build;
  if (params.owner) body.owner = params.owner;
  if (params.begin) body.begin = params.begin;
  if (params.end) body.end = params.end;
  if (params.desc) body.desc = params.desc;
  if (params.project) body.project = Number(params.project);

  const res = await post('/testtasks', body, {}, { dryRun: params.dryRun });
  if (!res.ok) throw new Error(`[创建失败] ${res.error}`);

  console.log(`✅ 测试任务创建成功: ${params.name}`);
  if (params.dryRun) console.log('🔍 [DRY-RUN] 未发送真实请求');
}

// ============ 更新测试任务 ============

async function updateTesttask(taskId, params) {
  id(taskId, '任务ID');

  const updateFields = {};
  if (params.name) { length(params.name, '名称', 2, 100); updateFields.name = params.name; }
  if (params.build) updateFields.build = params.build;
  if (params.owner) updateFields.owner = params.owner;
  if (params.begin) updateFields.begin = params.begin;
  if (params.end) updateFields.end = params.end;
  if (params.desc) updateFields.desc = params.desc;

  if (Object.keys(updateFields).length === 0) {
    throw new Error('[更新失败] 至少提供一个字段: --name / --build / --owner / --begin / --end');
  }

  const res = await put(`/testtasks/${taskId}`, updateFields, {}, { dryRun: params.dryRun });
  if (!res.ok) throw new Error(`[更新失败] ${res.error}`);

  console.log(`✅ 测试任务 #${taskId} 更新成功`);
  if (params.dryRun) console.log('🔍 [DRY-RUN] 未发送真实请求');
}

// ============ 删除测试任务 ============

async function deleteTesttask(taskId, params) {
  id(taskId, '任务ID');
  if (!params.yes && !params.dryRun) {
    console.log(`⚠️  确认要删除测试任务 #${taskId} 吗？`);
    console.log('   使用 --yes 跳过确认');
    process.exit(1);
  }
  const res = await del(`/testtasks/${taskId}`, {}, { dryRun: params.dryRun });
  if (!res.ok) throw new Error(`[删除失败] ${res.error}`);
  console.log(`✅ 测试任务 #${taskId} 已删除`);
  if (params.dryRun) console.log('🔍 [DRY-RUN] 未发送真实请求');
}

// ============ 执行测试任务 ============

async function runTesttask(taskId, params) {
  id(taskId, '任务ID');

  if (!params.dryRun && !params.yes) {
    console.log(`⚠️  确认要执行测试任务 #${taskId} 吗？`);
    console.log('   使用 --yes 跳过确认');
    process.exit(1);
  }

  // 尝试不同的 API 路径
  const endpoints = [
    `/testtasks/${taskId}/start`,
    `/testtasks/${taskId}/run`,
    `/testtasks/${taskId}/execute`,
  ];

  let lastError = null;
  for (const endpoint of endpoints) {
    try {
      const res = await post(endpoint, {}, {}, { dryRun: params.dryRun });
      if (res.ok) {
        console.log(`✅ 测试任务 #${taskId} 已执行`);
        if (params.dryRun) console.log('🔍 [DRY-RUN] 未发送真实请求');
        return res.data;
      }
      lastError = res.error;
    } catch (e) {
      lastError = e.message;
    }
  }

  // 如果状态流转 API 不可用，尝试更新状态
  const updateRes = await put(`/testtasks/${taskId}`, { status: 'doing' }, {}, { dryRun: params.dryRun });
  if (!updateRes.ok) throw new Error(`[执行失败] 所有尝试均失败，最后错误: ${lastError}`);

  console.log(`✅ 测试任务 #${taskId} 已更新为执行中`);
  if (params.dryRun) console.log('🔍 [DRY-RUN] 未发送真实请求');
  return updateRes.data;
}

// ============ 提交测试结果 ============

async function submitTestresult(params) {
  validate({
    testtask: { required: true },
    testcase: { required: true },
    result: { required: true, enum: ['pass', 'fail', 'blocked'] },
  }, params);

  const body = {
    testtaskID: Number(params.testtask),
    caseID: Number(params.testcase),
    result: params.result,
  };
  if (params.realRun) body.realRun = params.realRun;
  if (params.steps) body.steps = params.steps;
  if (params.comment) body.comment = params.comment;

  // 尝试不同的提交路径
  const endpoints = [
    '/testresults',
    '/testtasks/' + params.testtask + '/results',
  ];

  for (const endpoint of endpoints) {
    const res = await post(endpoint, body, {}, { dryRun: params.dryRun });
    if (res.ok) {
      const resultText = { pass: '通过', fail: '失败', blocked: '阻塞' }[params.result];
      console.log(`✅ 测试结果提交成功 (用例 ${params.testcase}: ${resultText})`);
      if (params.dryRun) console.log('🔍 [DRY-RUN] 未发送真实请求');
      return res.data;
    }
  }

  throw new Error(`[提交失败] 所有端点均失败`);
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
    const writeActions = ['create-testtask', 'update-testtask', 'run-testtask', 'submit-testresult'];
    const params = parseParams(process.argv.slice(writeActions.includes(action) ? 3 : 4));
    switch (action) {
      case 'list-testtask': await listTesttasks(params); break;
      case 'get-testtask': if (!arg1) { console.error('用法: testtask.cjs get-testtask <id>'); process.exit(1); } await getTesttask(arg1); break;
      case 'create-testtask': await createTesttask(params); break;
      case 'update-testtask': if (!arg1) { console.error('用法: testtask.cjs update-testtask <id> [--name=xxx]'); process.exit(1); } await updateTesttask(arg1, params); break;
      case 'delete-testtask': if (!arg1) { console.error('用法: testtask.cjs delete-testtask <id>'); process.exit(1); } await deleteTesttask(arg1, params); break;
      case 'run-testtask': if (!arg1) { console.error('用法: testtask.cjs run-testtask <id>'); process.exit(1); } await runTesttask(arg1, params); break;
      case 'submit-testresult': await submitTestresult(params); break;
      default:
        console.log('用法: testtask.cjs <list-testtask|get-testtask|create-testtask|update-testtask|delete-testtask|run-testtask|submit-testresult> [id] [options]');
        console.log('');
        console.log('  --dry-run     模拟执行');
        console.log('  --yes         跳过确认');
        console.log('  --page=N      分页');
    }
  }

  run().catch(e => { console.error(`❌ ${e.message}`); process.exit(1); });
}

module.exports = { listTesttasks, getTesttask, createTesttask, updateTesttask, deleteTesttask, runTesttask, submitTestresult };
