#!/usr/bin/env node

/**
 * actions/project.cjs — 项目管理写操作
 * 
 * 依赖：
 *   - api.cjs（post/put/del + dry-run）
 *   - validate.cjs（参数校验）
 *   - query.cjs（项目列表/详情查询）
 */

const { post, put, del, get } = require('../api.cjs');
const { validate, required, length, id, date, enum: enumVal } = require('../validate.cjs');
const { getProject } = require('./query.cjs');

// ========== 项目模式枚举 ==========

const PROJECT_MODELS = ['waterfall', 'agile', 'scrum', 'kanban'];

// ========== 创建项目 ==========

/**
 * 创建项目
 * POST /api.php/v2/projects
 */
async function createProject(params) {
  // 参数校验
  validate({
    name: { required: true, length: { min: 2, max: 100 } },
    begin: { required: true, date: true },
    end: { required: true, date: true },
    model: { enum: PROJECT_MODELS },
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
  };
  if (params.model) body.model = params.model;
  if (params.desc) body.desc = params.desc;
  if (params.owner) body.owner = params.owner;

  const res = await post('/projects', body, {}, { dryRun: params.dryRun });
  if (!res.ok) {
    throw new Error(`[创建失败] ${res.error}`);
  }

  console.log(`✅ 项目创建成功: ${params.name}`);
  if (params.dryRun) {
    console.log('🔍 [DRY-RUN] 未发送真实请求');
  }
  return res.data;
}

// ========== 更新项目 ==========

/**
 * 更新项目
 * PUT /api.php/v2/projects/<id>
 */
async function updateProject(projectId, params) {
  id(projectId, '项目 ID');

  // 至少提供一个更新字段
  const updateFields = {};
  if (params.name) updateFields.name = params.name;
  if (params.begin) updateFields.begin = params.begin;
  if (params.end) updateFields.end = params.end;
  if (params.desc) updateFields.desc = params.desc;

  if (Object.keys(updateFields).length === 0) {
    throw new Error('[更新失败] 至少提供一个更新字段: --name / --begin / --end / --desc');
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
  const begin = updateFields.begin || params.begin;
  const end = updateFields.end || params.end;
  if (begin && end && new Date(end) < new Date(begin)) {
    throw new Error('[更新失败] 结束日期不能早于开始日期');
  }

  const res = await put(`/projects/${projectId}`, updateFields, {}, { dryRun: params.dryRun });
  if (!res.ok) {
    // 已关闭不可修改
    if (res.httpStatus === 400) {
      throw new Error('[更新失败] 已关闭的项目不可修改');
    }
    throw new Error(`[更新失败] ${res.error}`);
  }

  console.log(`✅ 项目更新成功: ${projectId}`);
  if (params.dryRun) {
    console.log('🔍 [DRY-RUN] 未发送真实请求');
  }
  return res.data;
}

// ========== 状态变更 ==========

/**
 * 开始项目
 * PUT /api.php/v2/projects/<id> status=doing
 */
async function startProject(projectId, params) {
  id(projectId, '项目 ID');

  const res = await put(`/projects/${projectId}`, { status: 'doing' }, {}, { dryRun: params.dryRun });
  if (!res.ok) {
    throw new Error(`[开始失败] ${res.error}`);
  }

  console.log(`✅ 项目已开始: ${projectId}`);
  if (params.dryRun) {
    console.log('🔍 [DRY-RUN] 未发送真实请求');
  }
  return res.data;
}

/**
 * 暂停项目
 * PUT /api.php/v2/projects/<id> status=suspended
 */
async function suspendProject(projectId, params) {
  id(projectId, '项目 ID');

  const res = await put(`/projects/${projectId}`, { status: 'suspended' }, {}, { dryRun: params.dryRun });
  if (!res.ok) {
    throw new Error(`[暂停失败] ${res.error}`);
  }

  console.log(`✅ 项目已暂停: ${projectId}`);
  if (params.dryRun) {
    console.log('🔍 [DRY-RUN] 未发送真实请求');
  }
  return res.data;
}

/**
 * 关闭项目
 * PUT /api.php/v2/projects/<id> status=closed
 */
async function closeProject(projectId, params) {
  id(projectId, '项目 ID');

  const res = await put(`/projects/${projectId}`, { status: 'closed' }, {}, { dryRun: params.dryRun });
  if (!res.ok) {
    throw new Error(`[关闭失败] ${res.error}`);
  }

  console.log(`✅ 项目已关闭: ${projectId}`);
  if (params.dryRun) {
    console.log('🔍 [DRY-RUN] 未发送真实请求');
  }
  return res.data;
}

// ========== 团队管理 ==========

/**
 * 查看项目团队
 * GET /api.php/v2/projects/<id>/teams
 */
async function getProjectTeam(projectId, params) {
  id(projectId, '项目 ID');

  const res = await get(`/projects/${projectId}/teams`, {
    recPerPage: params.limit || 20,
    pageID: params.page || 1,
  });
  if (!res.ok) {
    throw new Error(`[查询失败] ${res.error}`);
  }

  // 表格输出
  const teams = res.data && res.data.result ? res.data.result : [];
  if (teams.length === 0) {
    console.log('📭 暂无团队成员');
    return teams;
  }

  console.log('');
  console.log('| 账号    | 角色            | 加入时间          |');
  console.log('|---------|-----------------|-------------------|');
  for (const t of teams) {
    const account = String(t.account || '-').padEnd(8);
    const role = String(t.role || '-').padEnd(16);
    const joined = String(t.joinDate || '-').padEnd(18);
    console.log(`| ${account} | ${role} | ${joined} |`);
  }
  console.log(`\n共 ${teams.length} 人`);

  return teams;
}

/**
 * 添加团队成员
 * POST /api.php/v2/projects/<id>/teams
 */
async function addTeamMember(projectId, params) {
  id(projectId, '项目 ID');

  if (!params.account) {
    throw new Error('[添加失败] 请提供 --account=xxx');
  }

  const body = { account: params.account };
  if (params.role) body.role = params.role;

  const res = await post(`/projects/${projectId}/teams`, body, {}, { dryRun: params.dryRun });
  if (!res.ok) {
    throw new Error(`[添加失败] ${res.error}`);
  }

  console.log(`✅ 团队成员添加成功: ${params.account}`);
  if (params.dryRun) {
    console.log('🔍 [DRY-RUN] 未发送真实请求');
  }
  return res.data;
}

/**
 * 移除团队成员
 * DELETE /api.php/v2/projects/<id>/teams/<account>
 */
async function removeTeamMember(projectId, params) {
  id(projectId, '项目 ID');

  if (!params.account) {
    throw new Error('[移除失败] 请提供 --account=xxx');
  }

  const res = await del(`/projects/${projectId}/teams/${params.account}`, {}, { dryRun: params.dryRun });
  if (!res.ok) {
    throw new Error(`[移除失败] ${res.error}`);
  }

  console.log(`✅ 团队成员移除成功: ${params.account}`);
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
        params[key] = value;
      }
    }
    return params;
  }

  async function run() {
    const params = parseParams(process.argv.slice(4));

    switch (action) {
      case 'create-project':
        await createProject(params);
        break;
      case 'update-project':
        if (!arg1) {
          console.error('用法: project.cjs update-project <id> [--name=xxx] [--begin=xxx] [--end=xxx] [--desc=xxx]');
          process.exit(1);
        }
        await updateProject(arg1, params);
        break;
      case 'start-project':
        if (!arg1) {
          console.error('用法: project.cjs start-project <id>');
          process.exit(1);
        }
        await startProject(arg1, params);
        break;
      case 'suspend-project':
        if (!arg1) {
          console.error('用法: project.cjs suspend-project <id>');
          process.exit(1);
        }
        await suspendProject(arg1, params);
        break;
      case 'close-project':
        if (!arg1) {
          console.error('用法: project.cjs close-project <id>');
          process.exit(1);
        }
        await closeProject(arg1, params);
        break;
      case 'team':
        if (!arg1) {
          console.error('用法: project.cjs team <id>');
          process.exit(1);
        }
        await getProjectTeam(arg1, params);
        break;
      case 'add-team':
        if (!arg1) {
          console.error('用法: project.cjs add-team <id> --account=xxx [--role=xxx]');
          process.exit(1);
        }
        await addTeamMember(arg1, params);
        break;
      case 'remove-team':
        if (!arg1) {
          console.error('用法: project.cjs remove-team <id> --account=xxx');
          process.exit(1);
        }
        await removeTeamMember(arg1, params);
        break;
      default:
        console.log('用法: project.cjs <create-project|update-project|start-project|suspend-project|close-project|team|add-team|remove-team> [id] [options]');
        console.log('');
        console.log('命令:');
        console.log('  create-project   创建项目');
        console.log('  update-project   更新项目');
        console.log('  start-project    开始项目');
        console.log('  suspend-project  暂停项目');
        console.log('  close-project    关闭项目');
        console.log('  team             查看团队');
        console.log('  add-team         添加成员');
        console.log('  remove-team      移除成员');
        console.log('');
        console.log('选项:');
        console.log('  --dry-run        模拟执行，不发送真实请求');
        console.log('  --yes            跳过二次确认');
    }
  }

  run().catch((e) => {
    console.error(`❌ ${e.message}`);
    process.exit(1);
  });
}

module.exports = {
  createProject,
  updateProject,
  startProject,
  suspendProject,
  closeProject,
  getProjectTeam,
  addTeamMember,
  removeTeamMember,
};
