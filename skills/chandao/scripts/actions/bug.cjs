#!/usr/bin/env node

/**
 * actions/bug.cjs — Bug 管理模块
 *
 * 命令：
 *   list-bug / get-bug / create-bug / resolve-bug / close-bug / activate-bug / update-bug / delete-bug
 *
 * 依赖：
 *   - api.cjs（get/post/put/del + dry-run）
 *   - validate.cjs（参数校验）
 */

const { get, post, put, del, sanitize } = require('../api.cjs');
const { validate, required, length, id, enum: enumVal, range } = require('../validate.cjs');

// ========== Bug 类型和状态枚举 ==========

const BUG_TYPES = ['codeerror', 'config', 'install', 'security', 'performance', 'standard', 'automation', 'designdefect', 'others'];
const BUG_SEVERITIES = [1, 2, 3, 4]; // 1=致命, 2=严重, 3=一般, 4=提示
const BUG_PRIORITIES = [1, 2, 3, 4]; // 1=紧急, 2=高, 3=中, 4=低
const BUG_STATUSES = ['active', 'resolved', 'closed'];
const BUG_RESOLUTIONS = ['fixed', 'bydesign', 'external', 'postponed', 'willnotfix', 'duplicate', 'notrepro'];

// ========== 查询 Bug 列表 ==========

/**
 * list-bug — Bug 列表查询
 * 支持：--product=N --project=N --execution=N --status=unresolved/resolved/closed --pri=N --severity=N --type=xxx
 */
async function listBugs(params = {}) {
  const page = params.page || 1;
  const limit = params.limit || 20;

  const query = {
    recPerPage: limit,
    pageID: page,
  };
  if (params.product) query.product = params.product;
  if (params.project) query.project = params.project;
  if (params.execution) query.execution = params.execution;
  if (params.browseType) query.browseType = params.browseType;
  if (params.assignedTo) query.assignedTo = params.assignedTo;

  const res = await get('/bugs', query);
  if (!res.ok) {
    throw new Error(`[查询失败] ${res.error}`);
  }

  const bugList = res.data && Array.isArray(res.data.bugs) ? res.data.bugs : [];

  if (bugList.length === 0) {
    console.log('📭 暂无 Bug');
    return bugList;
  }

  // 过滤状态（API 可能返回所有状态，前端再过滤）
  let filtered = bugList;
  if (params.status) {
    const statusMap = {
      'unresolved': 'active',
      'resolved': 'resolved',
      'closed': 'closed',
      'active': 'active',
    };
    const targetStatus = statusMap[params.status] || params.status;
    filtered = bugList.filter(b => b.status === targetStatus);
  }
  if (params.pri) {
    filtered = filtered.filter(b => String(b.pri) === String(params.pri));
  }
  if (params.severity) {
    filtered = filtered.filter(b => String(b.severity) === String(params.severity));
  }
  if (params.type) {
    filtered = filtered.filter(b => b.type === params.type);
  }

  if (filtered.length === 0) {
    console.log('📭 暂无符合筛选条件的 Bug');
    return filtered;
  }

  printBugTable(filtered, page);
  return filtered;
}

function printBugTable(bugs, page) {
  const severityMap = { '1': '致命', '2': '严重', '3': '一般', '4': '提示' };
  const priMap = { '1': '紧急', '2': '高', '3': '中', '4': '低' };

  console.log('');
  console.log('| ID | 标题 | 严重度 | 优先级 | 状态 | 指派给 | 解决结果 |');
  console.log('|----|------|--------|--------|------|--------|----------|');

  for (const b of bugs) {
    const idStr = String(b.id || '-').padEnd(3);
    const titleStr = (b.title || '-').slice(0, 18) + (b.title && b.title.length > 18 ? '...' : '');
    const sevStr = String(severityMap[String(b.severity)] || b.severity || '-').slice(0, 4);
    const priStr = String(priMap[String(b.pri)] || b.pri || '-').slice(0, 3);
    const statusStr = String(b.status || '-').slice(0, 5);
    const assignedStr = String(b.assignedTo || '-').slice(0, 6);
    const resolutionStr = String(b.resolution || '-').slice(0, 6);

    console.log(`| ${idStr} | ${titleStr} | ${sevStr} | ${priStr} | ${statusStr} | ${assignedStr} | ${resolutionStr} |`);
  }
  console.log(`\n共 ${bugs.length} 条 (第 ${page} 页)`);
}

// ========== 获取 Bug 详情 ==========

async function getBug(bugId) {
  id(bugId, 'Bug ID');

  const res = await get(`/bugs/${bugId}`);
  if (!res.ok) {
    throw new Error(`[查询失败] ${res.error}`);
  }

  // 动态取 Bug 数据（兼容多种响应结构）
  let bug = null;
  if (res.data && typeof res.data === 'object') {
    const result = res.data.result;
    if (result && typeof result === 'object' && !Array.isArray(result)) {
      bug = result;
    } else if (res.data.bug) {
      bug = res.data.bug;
    } else if (Object.keys(res.data).length > 2) {
      // 取第一个非元数据字段
      for (const key of Object.keys(res.data)) {
        if (!['status', 'msg', 'title', 'pager'].includes(key) && typeof res.data[key] === 'object' && !Array.isArray(res.data[key])) {
          bug = res.data[key];
          break;
        }
      }
    }
    if (!bug) bug = res.data;
  } else {
    bug = res.data;
  }

  const severityMap = { '1': '致命', '2': '严重', '3': '一般', '4': '提示' };
  const priMap = { '1': '紧急', '2': '高', '3': '中', '4': '低' };

  console.log('');
  console.log(`🐛 Bug: ${bug.title || bugId}`);
  console.log('━'.repeat(50));
  console.log(`  ID: ${bug.id}`);
  console.log(`  产品: ${bug.productName || bug.product || '-'}`);
  console.log(`  模块: ${bug.moduleName || '-'}`);
  console.log(`  严重度: ${severityMap[String(bug.severity)] || bug.severity || '-'}`);
  console.log(`  优先级: ${priMap[String(bug.pri)] || bug.pri || '-'}`);
  console.log(`  类型: ${bug.type || '-'}`);
  console.log(`  状态: ${bug.status || '-'}`);
  console.log(`  指派给: ${bug.assignedTo || '-'}`);
  console.log(`  解决结果: ${bug.resolution || '-'}`);
  console.log(`  影响版本: ${bug.openedBuild || '-'}`);
  console.log(`  解决版本: ${bug.resolvedBuild || '-'}`);
  if (bug.steps) {
    const steps = String(bug.steps).slice(0, 200) + (bug.steps.length > 200 ? '...' : '');
    console.log(`  重现步骤: ${steps}`);
  }
  console.log('━'.repeat(50));

  return bug;
}

// ========== 创建 Bug ==========

async function createBug(params) {
  validate({
    product: { required: true },
    title: { required: true, length: { min: 2, max: 200 } },
    openedBuild: { required: true },
    severity: { enum: BUG_SEVERITIES.map(String) },
    pri: { enum: BUG_PRIORITIES.map(String) },
    type: { enum: BUG_TYPES },
    steps: { length: { max: 5000 } },
  }, params);

  // 可选 ID 字段：手动校验格式（validate 的 id 规则会强制 required）
  if (params.product) {
    const num = Number(params.product);
    if (!Number.isInteger(num) || num < 1) throw new Error(`[校验失败] product 必须是正整数: ${params.product}`);
  }

  const body = {
    product: params.product,
    title: params.title,
    openedBuild: typeof params.openedBuild === 'string' ? [params.openedBuild] : (Array.isArray(params.openedBuild) ? params.openedBuild : [params.openedBuild]),
  };
  if (params.project) body.project = params.project;
  if (params.execution) body.execution = params.execution;
  if (params.severity) body.severity = parseInt(params.severity);
  if (params.pri) body.pri = parseInt(params.pri);
  if (params.type) body.type = params.type;
  if (params.steps) body.steps = params.steps;
  if (params.story) body.story = params.story;
  if (params.assignedTo) body.assignedTo = params.assignedTo;

  const res = await post('/bugs', body, {}, { dryRun: params.dryRun });
  if (!res.ok) {
    throw new Error(`[创建失败] ${res.error}`);
  }

  console.log(`✅ Bug 创建成功: ${params.title}`);
  if (params.dryRun) {
    console.log('🔍 [DRY-RUN] 未发送真实请求');
  }
  return res.data;
}

// ========== 解决 Bug ==========

async function resolveBug(bugId, params) {
  id(bugId, 'Bug ID');

  validate({
    resolution: { required: true, enum: BUG_RESOLUTIONS },
    resolvedBuild: { required: true },
  }, params);

  if (!params.dryRun && !params.yes) {
    console.log(`⚠️  确认要解决 Bug ${bugId} 吗？`);
    console.log(`   解决方式: ${params.resolution}`);
    console.log('   使用 --yes 跳过确认');
    process.exit(1);
  }

  const body = {
    resolution: params.resolution,
    resolvedBuild: params.resolvedBuild,
  };
  if (params.resolvedDate) body.resolvedDate = params.resolvedDate;
  if (params.resolutionNote) body.resolutionNote = params.resolutionNote;

  const res = await put(`/bugs/${bugId}/resolve`, body, {}, { dryRun: params.dryRun });
  if (!res.ok) {
    throw new Error(`[解决失败] ${res.error}`);
  }

  console.log(`✅ Bug 已解决: ${bugId} (方式: ${params.resolution})`);
  if (params.dryRun) {
    console.log('🔍 [DRY-RUN] 未发送真实请求');
  }
  return res.data;
}

// ========== 关闭 Bug ==========

async function closeBug(bugId, params) {
  id(bugId, 'Bug ID');

  if (!params.dryRun && !params.yes) {
    console.log(`⚠️  确认要关闭 Bug ${bugId} 吗？`);
    console.log('   使用 --yes 跳过确认');
    process.exit(1);
  }

  const body = {};
  if (params.closedNote) body.closedNote = params.closedNote;

  const res = await put(`/bugs/${bugId}/close`, body, {}, { dryRun: params.dryRun });
  if (!res.ok) {
    throw new Error(`[关闭失败] ${res.error}`);
  }

  console.log(`✅ Bug 已关闭: ${bugId}`);
  if (params.dryRun) {
    console.log('🔍 [DRY-RUN] 未发送真实请求');
  }
  return res.data;
}

// ========== 激活 Bug ==========

async function activateBug(bugId, params) {
  id(bugId, 'Bug ID');

  if (!params.dryRun && !params.yes) {
    console.log(`⚠️  确认要激活 Bug ${bugId} 吗？`);
    console.log('   使用 --yes 跳过确认');
    process.exit(1);
  }

  const body = {};
  if (params.activatedNote) body.activatedNote = params.activatedNote;

  const res = await put(`/bugs/${bugId}/activate`, body, {}, { dryRun: params.dryRun });
  if (!res.ok) {
    throw new Error(`[激活失败] ${res.error}`);
  }

  console.log(`✅ Bug 已激活: ${bugId}`);
  if (params.dryRun) {
    console.log('🔍 [DRY-RUN] 未发送真实请求');
  }
  return res.data;
}

// ========== 更新 Bug ==========

async function updateBug(bugId, params) {
  id(bugId, 'Bug ID');

  const updateFields = {};
  if (params.title) updateFields.title = params.title;
  if (params.pri) updateFields.pri = parseInt(params.pri);
  if (params.severity) updateFields.severity = parseInt(params.severity);
  if (params.type) updateFields.type = params.type;
  if (params.assignedTo) updateFields.assignedTo = params.assignedTo;
  if (params.steps) updateFields.steps = params.steps;

  if (Object.keys(updateFields).length === 0) {
    throw new Error('[更新失败] 至少提供一个更新字段: --title / --pri / --severity / --type / --assignedTo / --steps');
  }

  const res = await put(`/bugs/${bugId}`, updateFields, {}, { dryRun: params.dryRun });
  if (!res.ok) {
    throw new Error(`[更新失败] ${res.error}`);
  }

  console.log(`✅ Bug 更新成功: ${bugId}`);
  if (params.dryRun) {
    console.log('🔍 [DRY-RUN] 未发送真实请求');
  }
  return res.data;
}

// ========== 删除 Bug ==========

async function deleteBug(bugId, params) {
  id(bugId, 'Bug ID');

  if (!params.dryRun && !params.yes) {
    console.log(`⚠️  确认要删除 Bug ${bugId} 吗？此操作不可恢复！`);
    console.log('   使用 --yes 跳过确认');
    process.exit(1);
  }

  const res = await del(`/bugs/${bugId}`, {}, { dryRun: params.dryRun });
  if (!res.ok) {
    throw new Error(`[删除失败] ${res.error}`);
  }

  console.log(`✅ Bug 已删除: ${bugId}`);
  if (params.dryRun) {
    console.log('🔍 [DRY-RUN] 未发送真实请求');
  }
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
    const sliceStart = ['create-bug', 'resolve-bug', 'update-bug'].includes(action) ? 3 : 4;
    const params = parseParams(process.argv.slice(sliceStart));

    switch (action) {
      case 'list-bug':
        await listBugs(params);
        break;
      case 'get-bug':
        if (!arg1) { console.error('用法: bug.cjs get-bug <id>'); process.exit(1); }
        await getBug(arg1);
        break;
      case 'create-bug':
        await createBug(params);
        break;
      case 'resolve-bug':
        if (!arg1) { console.error('用法: bug.cjs resolve-bug <id> --resolution=fixed --resolvedBuild=trunk'); process.exit(1); }
        await resolveBug(arg1, params);
        break;
      case 'close-bug':
        if (!arg1) { console.error('用法: bug.cjs close-bug <id>'); process.exit(1); }
        await closeBug(arg1, params);
        break;
      case 'activate-bug':
        if (!arg1) { console.error('用法: bug.cjs activate-bug <id>'); process.exit(1); }
        await activateBug(arg1, params);
        break;
      case 'update-bug':
        if (!arg1) { console.error('用法: bug.cjs update-bug <id> [--title=xxx] [--pri=N]'); process.exit(1); }
        await updateBug(arg1, params);
        break;
      case 'delete-bug':
        if (!arg1) { console.error('用法: bug.cjs delete-bug <id>'); process.exit(1); }
        await deleteBug(arg1, params);
        break;
      default:
        console.log('用法: bug.cjs <list-bug|get-bug|create-bug|resolve-bug|close-bug|activate-bug|update-bug|delete-bug> [id] [options]');
        console.log('');
        console.log('命令:');
        console.log('  list-bug      Bug 列表（--product=N --status=unresolved/resolved/closed）');
        console.log('  get-bug       Bug 详情');
        console.log('  create-bug    创建 Bug（--product=N --title=xxx --openedBuild=trunk）');
        console.log('  resolve-bug   解决 Bug（--resolution=fixed --resolvedBuild=trunk）');
        console.log('  close-bug     关闭 Bug');
        console.log('  activate-bug  激活 Bug');
        console.log('  update-bug    编辑 Bug');
        console.log('  delete-bug    删除 Bug');
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

module.exports = {
  listBugs,
  getBug,
  createBug,
  resolveBug,
  closeBug,
  activateBug,
  updateBug,
  deleteBug,
};
