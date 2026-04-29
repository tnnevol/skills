#!/usr/bin/env node

/**
 * actions/execution.cjs — 执行/迭代管理
 * 
 * 依赖：
 *   - api.cjs（get/post/put/del）
 *   - validate.cjs（参数校验）
 *   - sanitize.cjs（敏感数据脱敏）
 */

const { post, get, put, del } = require('../api.cjs');
const { validate, required, length, id, date, enum: enumVal } = require('../validate.cjs');
const { sanitize } = require('../sanitize.cjs');

// ========== 执行状态枚举 ==========

const EXECUTION_STATUSES = {
  wait: '待启动',
  doing: '进行中',
  suspended: '已暂停',
  closed: '已结束'
};

const EXECUTION_MODELS = ['waterfall', 'agile', 'scrum', 'kanban'];

// ========== 列出执行 ==========

/**
 * 列出执行
 * GET /api.php/v2/operations
 */
async function listExecution(params) {
  const filters = [];

  if (params.project) {
    id(params.project, '项目 ID');
    filters.push(`project=${params.project}`);
  }

  if (params.product) {
    id(params.product, '产品 ID');
    filters.push(`product=${params.product}`);
  }

  if (params.status) {
    enumVal(params.status, '状态', Object.keys(EXECUTION_STATUSES));
    filters.push(`status=${params.status}`);
  }

  const url = filters.length > 0 ? `/operations?${filters.join('&')}` : '/operations';

  // 支持 limit 和 offset
  const limit = parseInt(params.limit) || 20;
  const offset = parseInt(params.offset) || 0;

  // 禅道 API 使用 pageID 和 recPerPage
  const apiQuery = {
    pageID: Math.floor(offset / limit) + 1,
    recPerPage: limit,
  };

  const res = await get(url, apiQuery);
  
  if (!res.ok) {
    throw new Error(`[列表查询失败] ${res.error}`);
  }

  // 格式化输出
  const total = res.data.data?.total || res.data.data?.length || 0;
  console.log(`📋 执行列表（共 ${total} 条）:\n`);
  
  const items = res.data.data?.data || res.data.data || [];
  items.forEach((exec, index) => {
    const statusText = EXECUTION_STATUSES[exec.status] || exec.status;
    console.log(`📝 ${index + 1}. ${exec.name} (ID: ${exec.id})`);
    console.log(`   状态: ${statusText} | 项目: ${exec.projectName || '-'} | 产品: ${exec.productName || '-'}`);
    console.log(`   日期: ${exec.begin} ~ ${exec.end}`);
    console.log(`   负责人: ${exec.owner || '-'} | 创建: ${exec.openedDate}`);
    if (exec.desc) {
      console.log(`   描述: ${exec.desc}`);
    }
    console.log('');
  });
  
  return res.data;
}

// ========== 获取执行详情 ==========

/**
 * 获取执行详情
 * GET /api.php/v2/operations/<id>
 */
async function getExecution(executionId) {
  id(executionId, '执行 ID');

  const res = await get(`/operations/${executionId}`);
  
  if (!res.ok) {
    throw new Error(`[获取失败] ${res.error}`);
  }

  const exec = res.data;
  const statusText = EXECUTION_STATUSES[exec.status] || exec.status;

  console.log(`📋 执行详情: ${exec.name} (ID: ${exec.id})`);
  console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
  console.log(`状态: ${statusText}`);
  console.log(`项目: ${exec.projectName || '-'}`);
  console.log(`产品: ${exec.productName || '-'}`);
  console.log(`日期: ${exec.begin} ~ ${exec.end}`);
  console.log(`负责人: ${exec.owner || '-'}`);
  console.log(`创建: ${exec.openedDate}`);
  console.log(`链接: ${exec.url}`);
  if (exec.desc) {
    console.log(`描述: ${exec.desc}`);
  }
  console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);

  return exec;
}

// ========== 创建执行 ==========

/**
 * 创建执行
 * POST /api.php/v2/operations
 */
async function createExecution(params) {
  // 参数校验
  validate({
    name: { required: true, length: { min: 2, max: 100 } },
    begin: { required: true, date: true },
    end: { required: true, date: true },
    project: { required: true, id: true },
    product: { required: true, id: true },
    model: { enum: EXECUTION_MODELS },
    desc: { length: { max: 500 } },
    owner: { length: { max: 30 } },
  }, params);

  // end ≥ begin
  if (new Date(params.end) < new Date(params.begin)) {
    throw new Error('[创建失败] 结束日期不能早于开始日期');
  }

  const body = {
    name: params.name,
    begin: params.begin,
    end: params.end,
    project: params.project,
    product: params.product,
    model: params.model || 'waterfall',
    desc: params.desc,
    owner: params.owner
  };

  const res = await post('/operations', body, {}, { dryRun: params.dryRun });
  if (!res.ok) {
    throw new Error(`[创建失败] ${res.error}`);
  }

  console.log(`✅ 执行创建成功: ${params.name} (ID: ${res.data.id})`);
  if (params.dryRun) {
    console.log('🔍 [DRY-RUN] 未发送真实请求');
  }
  return res.data;
}

// ========== 更新执行 ==========

/**
 * 更新执行
 * PUT /api.php/v2/operations/<id>
 */
async function updateExecution(executionId, params) {
  id(executionId, '执行 ID');

  // 至少提供一个更新字段
  const updateFields = {};
  if (params.name) updateFields.name = params.name;
  if (params.begin) updateFields.begin = params.begin;
  if (params.end) updateFields.end = params.end;
  if (params.project) updateFields.project = params.project;
  if (params.product) updateFields.product = params.product;
  if (params.model) updateFields.model = params.model;
  if (params.desc) updateFields.desc = params.desc;
  if (params.owner) updateFields.owner = params.owner;

  if (Object.keys(updateFields).length === 0) {
    throw new Error('[更新失败] 至少提供一个更新字段');
  }

  // 校验更新字段
  if (updateFields.name) {
    length(updateFields.name, '名称', 2, 100);
  }
  if (updateFields.begin) {
    date(updateFields.begin, '开始日期');
  }
  if (updateFields.end) {
    date(updateFields.end, '结束日期');
  }

  // end ≥ begin
  if (updateFields.begin && updateFields.end && new Date(updateFields.end) < new Date(updateFields.begin)) {
    throw new Error('[更新失败] 结束日期不能早于开始日期');
  }

  const res = await put(`/operations/${executionId}`, updateFields);
  if (!res.ok) {
    throw new Error(`[更新失败] ${res.error}`);
  }

  console.log(`✅ 执行更新成功: ${executionId}`);
  return res.data;
}

// ========== 删除执行 ==========

/**
 * 删除执行（归档）
 * DELETE /api.php/v2/operations/<id>
 */
async function deleteExecution(executionId, params = {}) {
  id(executionId, '执行 ID');

  const res = await del(`/operations/${executionId}`, {}, { dryRun: params.dryRun });
  if (!res.ok) {
    throw new Error(`[删除失败] ${res.error}`);
  }

  console.log(`✅ 执行已归档: ${executionId}`);
  if (params.dryRun) {
    console.log('🔍 [DRY-RUN] 未发送真实请求');
  }
  return res.data;
}

// ========== 启动执行 ==========

/**
 * 启动执行
 * PUT /api.php/v2/operations/<id>/start
 */
async function startExecution(executionId) {
  id(executionId, '执行 ID');

  const res = await put(`/operations/${executionId}/start`, {});
  if (!res.ok) {
    throw new Error(`[启动失败] ${res.error}`);
  }

  console.log(`✅ 执行已启动: ${executionId}`);
  return res.data;
}

// ========== 暂停执行 ==========

/**
 * 暂停执行
 * PUT /api.php/v2/operations/<id>/suspend
 */
async function suspendExecution(executionId) {
  id(executionId, '执行 ID');

  const res = await put(`/operations/${executionId}/suspend`, {});
  if (!res.ok) {
    throw new Error(`[暂停失败] ${res.error}`);
  }

  console.log(`✅ 执行已暂停: ${executionId}`);
  return res.data;
}

// ========== 关闭执行 ==========

/**
 * 关闭执行
 * PUT /api.php/v2/operations/<id>/close
 */
async function closeExecution(executionId) {
  id(executionId, '执行 ID');

  const res = await put(`/operations/${executionId}/close`, {});
  if (!res.ok) {
    throw new Error(`[关闭失败] ${res.error}`);
  }

  console.log(`✅ 执行已关闭: ${executionId}`);
  return res.data;
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
    // 带 id 的命令：get-execution, update-execution, start-execution, suspend-execution, close-execution, delete-execution
    const needsId = ['get-execution', 'update-execution', 'start-execution', 'suspend-execution', 'close-execution', 'delete-execution'].includes(action);
    
    let params;
    if (needsId) {
      params = parseParams(process.argv.slice(4));
    } else {
      params = parseParams(process.argv.slice(3));
    }

    switch (action) {
      case 'list-execution':
        await listExecution(params);
        break;
      case 'get-execution':
        if (!arg1) {
          console.error('用法: execution.cjs get-execution <id>');
          process.exit(1);
        }
        await getExecution(arg1);
        break;
      case 'create-execution':
        await createExecution(params);
        break;
      case 'update-execution':
        if (!arg1) {
          console.error('用法: execution.cjs update-execution <id> [--name=xxx] [--begin=xxx] ...');
          process.exit(1);
        }
        await updateExecution(arg1, params);
        break;
      case 'delete-execution':
        if (!arg1) {
          console.error('用法: execution.cjs delete-execution <id>');
          process.exit(1);
        }
        await deleteExecution(arg1, params);
        break;
      case 'start-execution':
        if (!arg1) {
          console.error('用法: execution.cjs start-execution <id>');
          process.exit(1);
        }
        await startExecution(arg1);
        break;
      case 'suspend-execution':
        if (!arg1) {
          console.error('用法: execution.cjs suspend-execution <id>');
          process.exit(1);
        }
        await suspendExecution(arg1);
        break;
      case 'close-execution':
        if (!arg1) {
          console.error('用法: execution.cjs close-execution <id>');
          process.exit(1);
        }
        await closeExecution(arg1);
        break;
      default:
        console.log('用法: execution.cjs <list-execution|get-execution|create-execution|update-execution|delete-execution|start-execution|suspend-execution|close-execution> [id] [options]');
        console.log('');
        console.log('命令:');
        console.log('  list-execution     执行列表');
        console.log('  get-execution      执行详情');
        console.log('  create-execution   创建执行');
        console.log('  update-execution   更新执行');
        console.log('  delete-execution   删除执行');
        console.log('  start-execution    启动执行');
        console.log('  suspend-execution  暂停执行');
        console.log('  close-execution    关闭执行');
        console.log('');
        console.log('选项:');
        console.log('  --dry-run    模拟执行，不发送真实请求');
        console.log('  --page=N     分页页码');
        console.log('  --limit=N    每页数量');
        console.log('  --project=N  按项目过滤');
        console.log('  --product=N  按产品过滤');
        console.log('  --status=X   按状态过滤 (wait/doing/suspended/closed)');
    }
  }

  run().catch((e) => {
    console.error(`❌ ${e.message}`);
    process.exit(1);
  });
}

// ========== 导出 API ==========

module.exports = {
  listExecution,
  getExecution,
  createExecution,
  updateExecution,
  deleteExecution,
  startExecution,
  suspendExecution,
  closeExecution
};
