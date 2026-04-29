#!/usr/bin/env node

/**
 * actions/task.cjs — 任务管理模块
 * 
 * 命令：
 *   list-task / get-task / create-task / update-task / close-task / delete-task
 * 
 * 依赖：
 *   - api.cjs（post/put/del + dry-run）
 *   - validate.cjs（参数校验）
 *   - query.cjs（列表/详情查询）
 */

const { get, post, put, del } = require('../api.cjs');
const { validate, required, length, id, enum: enumVal, range, date } = require('../validate.cjs');

// ========== 任务类型和状态枚举 ==========

const TASK_TYPES = ['design', 'devel', 'test', 'study', 'discuss', 'bug'];
const TASK_STATUSES = ['wait', 'doing', 'done', 'canceled'];

// ========== 查询任务列表 ==========

/**
 * list-task — 任务列表查询
 * 
 * 策略：先尝试 /tasks 直接查询，失败时通过 /executions/<id>/tasks 回退
 * 因为禅道 v2 的 /tasks 端点返回空，/projects/ID/tasks 返回 403，
 * 而 /executions/ID/tasks 是唯一可靠的任务查询途径。
 */
async function listTasks(params = {}) {
  const page = params.page || 1;
  const limit = params.limit || 20;

  const query = {
    recPerPage: limit,
    pageID: page,
  };
  if (params.execution) query.execution = params.execution;
  if (params.assignedTo) query.assignedTo = params.assignedTo;
  if (params.type) query.type = params.type;
  if (params.status) query.status = params.status;

  // 尝试直接查询 /tasks（如果指定了 project，此端点会 403）
  let res = await get('/tasks', query);

  // 如果查询失败或返回空结果，通过 executions 回退
  const hasTasks = res.ok && res.data && Array.isArray(res.data.tasks) && res.data.tasks.length > 0;
  if (!hasTasks) {
    let executionIds = [];
    if (params.execution) {
      executionIds = [params.execution];
    } else {
      // 获取所有相关 execution IDs
      let execQuery = { recPerPage: 100, pageID: 1 };
      if (params.project) execQuery.project = params.project;
      const execRes = await get('/executions', execQuery);
      if (execRes.ok) {
        const items = execRes.data.executions || execRes.data.data || [];
        executionIds = items.map(e => e.id);
      }
    }

    if (executionIds.length > 0) {
      // 去重收集所有任务
      const taskMap = new Map();
      for (const execId of executionIds) {
        try {
          const taskRes = await get(`/executions/${execId}/tasks`, { recPerPage: limit, pageID: page });
          if (taskRes.ok && taskRes.data && Array.isArray(taskRes.data.tasks)) {
            for (const t of taskRes.data.tasks) {
              taskMap.set(t.id, t);
            }
          }
        } catch {
          // 忽略单个 execution 查询失败
        }
      }
      const tasks = Array.from(taskMap.values());

      if (tasks.length === 0) {
        console.log('📭 暂无任务');
        return tasks;
      }

      _printTaskTable(tasks, page);
      return tasks;
    }
  }

  // 处理直接查询成功的结果
  if (!res.ok) {
    throw new Error(`[查询失败] ${res.error}`);
  }

  let taskList = [];
  if (res.data && typeof res.data === 'object') {
    if (Array.isArray(res.data.tasks)) {
      taskList = res.data.tasks;
    } else {
      const result = res.data.result;
      if (Array.isArray(result)) {
        taskList = result;
      } else if (result && typeof result === 'object') {
        for (const key of Object.keys(result)) {
          if (Array.isArray(result[key])) {
            taskList = result[key];
            break;
          }
        }
        if (taskList.length === 0 && result.data && result.data.data && Array.isArray(result.data.data)) {
          taskList = result.data.data;
        }
      }
    }
  }
  const tasks = Array.isArray(taskList) ? taskList : [];

  if (tasks.length === 0) {
    console.log('📭 暂无任务');
    return tasks;
  }

  _printTaskTable(tasks, page);
  return tasks;
}

/**
 * 打印任务表格（内部函数）
 */
function _printTaskTable(tasks, page) {
  console.log('');
  console.log('| ID | 名称 | 项目 | 类型 | 指派给 | 状态 | 进度 | 截止日期 |');
  console.log('|----|------|------|------|--------|------|------|----------|');

  for (const t of tasks) {
    const idStr = String(t.id || '-').padEnd(3);
    const nameStr = (t.name || '-').slice(0, 16) + (t.name && t.name.length > 16 ? '...' : '');
    const projectStr = String(t.projectName || t.project || '-').slice(0, 5);
    const typeStr = String(t.type || '-').slice(0, 6);
    const assignedStr = String(t.assignedTo || '-').slice(0, 7);
    const statusStr = String(t.status || '-').slice(0, 6);
    const progressStr = String(t.progress ? `${t.progress}%` : '-').slice(0, 5);
    const deadlineStr = String(t.deadline || '-').slice(0, 9);

    console.log(`| ${idStr} | ${nameStr} | ${projectStr} | ${typeStr} | ${assignedStr} | ${statusStr} | ${progressStr} | ${deadlineStr} |`);
  }
  console.log(`\n共 ${tasks.length} 条 (第 ${page} 页)`);
}

// ========== 获取任务详情 ==========

/**
 * get-task — 任务详情查询
 */
async function getTask(taskId) {
  id(taskId, '任务 ID');

  const res = await get(`/tasks/${taskId}`);
  if (!res.ok) {
    throw new Error(`[查询失败] ${res.error}`);
  }

  // 动态取任务数据（兼容多种响应结构）
  let task = null;
  if (res.data && typeof res.data === 'object') {
    const result = res.data.result;
    if (result && typeof result === 'object' && !Array.isArray(result)) {
      task = result;
    } else if (res.data && typeof res.data === 'object' && Object.keys(res.data).length > 1) {
      task = res.data;
    } else {
      task = res.data;
    }
  } else {
    task = res.data;
  }

  console.log('');
  console.log(`📋 任务: ${task.name || taskId}`);
  console.log('━'.repeat(50));
  console.log(`  ID: ${task.id}`);
  console.log(`  项目: ${task.projectName || task.project || '-'}`);
  console.log(`  类型: ${task.type || '-'}`);
  console.log(`  指派给: ${task.assignedTo || '-'}`);
  console.log(`  状态: ${task.status || '-'}`);
  console.log(`  进度: ${task.progress ? `${task.progress}%` : '-'}`);
  console.log(`  截止日期: ${task.deadline || '-'}`);
  console.log(`  预估工时: ${task.estimate || '-'}`);
  if (task.desc) {
    const desc = String(task.desc).slice(0, 100) + (task.desc.length > 100 ? '...' : '');
    console.log(`  描述: ${desc}`);
  }
  console.log('━'.repeat(50));

  return task;
}

// ========== 创建任务 ==========

/**
 * create-task — 创建任务
 */
async function createTask(params) {
  // 参数校验
  validate({
    project: { required: true, id: true },
    name: { required: true, length: { min: 2, max: 100 } },
    type: { required: true, enum: TASK_TYPES },
    assignedTo: { required: true, length: { min: 1, max: 30 } },
    estimate: { range: { min: 0, max: 999 } },
    desc: { length: { min: 0, max: 500 } },
    deadline: { date: true },
  }, params);

  const body = {
    project: params.project,
    name: params.name,
    type: params.type,
    assignedTo: params.assignedTo,
  };
  if (params.estimate) body.estimate = params.estimate;
  if (params.desc) body.desc = params.desc;
  if (params.deadline) body.deadline = params.deadline;

  const res = await post('/tasks', body, {}, { dryRun: params.dryRun });
  if (!res.ok) {
    throw new Error(`[创建失败] ${res.error}`);
  }

  console.log(`✅ 任务创建成功: ${params.name}`);
  if (params.dryRun) {
    console.log('🔍 [DRY-RUN] 未发送真实请求');
  }
  return res.data;
}

// ========== 更新任务 ==========

/**
 * update-task — 更新任务
 */
async function updateTask(taskId, params) {
  id(taskId, '任务 ID');

  // 至少提供一个更新字段
  const updateFields = {};
  if (params.name) updateFields.name = params.name;
  if (params.assignedTo) updateFields.assignedTo = params.assignedTo;
  if (params.estimate) updateFields.estimate = params.estimate;
  if (params.desc) updateFields.desc = params.desc;
  if (params.deadline) updateFields.deadline = params.deadline;

  if (Object.keys(updateFields).length === 0) {
    throw new Error('[更新失败] 至少提供一个更新字段: --name / --assignedTo / --estimate / --desc / --deadline');
  }

  // 校验更新字段
  if (updateFields.name) {
    length(updateFields.name, '名称', 2, 100);
  }
  if (updateFields.assignedTo) {
    length(updateFields.assignedTo, '指派人', 1, 30);
  }
  if (updateFields.estimate) {
    range(updateFields.estimate, '预估工时', 0, 999);
  }
  if (updateFields.deadline) {
    date(updateFields.deadline, '截止日期');
  }

  const res = await put(`/tasks/${taskId}`, updateFields, {}, { dryRun: params.dryRun });
  if (!res.ok) {
    throw new Error(`[更新失败] ${res.error}`);
  }

  console.log(`✅ 任务更新成功: ${taskId}`);
  if (params.dryRun) {
    console.log('🔍 [DRY-RUN] 未发送真实请求');
  }
  return res.data;
}

// ========== 关闭任务 ==========

/**
 * close-task — 关闭任务
 */
async function closeTask(taskId, params) {
  id(taskId, '任务 ID');

  // 二次确认
  if (!params.dryRun && !params.yes) {
    console.log(`⚠️  确认要关闭任务 ${taskId} 吗？`);
    console.log('   使用 --yes 跳过确认');
    process.exit(1);
  }

  const res = await put(`/tasks/${taskId}`, { status: 'closed' }, {}, { dryRun: params.dryRun });
  if (!res.ok) {
    throw new Error(`[关闭失败] ${res.error}`);
  }

  console.log(`✅ 任务已关闭: ${taskId}`);
  if (params.dryRun) {
    console.log('🔍 [DRY-RUN] 未发送真实请求');
  }
  return res.data;
}

// ========== 删除任务 ==========

/**
 * delete-task — 删除任务
 */
async function deleteTask(taskId, params) {
  id(taskId, '任务 ID');

  // 二次确认
  if (!params.dryRun && !params.yes) {
    console.log(`⚠️  确认要删除任务 ${taskId} 吗？`);
    console.log('   使用 --yes 跳过确认');
    process.exit(1);
  }

  const res = await del(`/tasks/${taskId}`, {}, { dryRun: params.dryRun });
  if (!res.ok) {
    throw new Error(`[删除失败] ${res.error}`);
  }

  console.log(`✅ 任务已删除: ${taskId}`);
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
        // 转 camelCase：dry-run → dryRun
        const camelKey = key.replace(/-([a-z])/g, (_, c) => c.toUpperCase());
        params[camelKey] = value;
      }
    }
    return params;
  }

  async function run() {
    const sliceStart = action === 'create-task' ? 3 : 4;
    const params = parseParams(process.argv.slice(sliceStart));

    switch (action) {
      case 'list-task':
        await listTasks(params);
        break;
      case 'get-task':
        if (!arg1) {
          console.error('用法: task.cjs get-task <id>');
          process.exit(1);
        }
        await getTask(arg1);
        break;
      case 'create-task':
        await createTask(params);
        break;
      case 'update-task':
        if (!arg1) {
          console.error('用法: task.cjs update-task <id> [--name=xxx] [--assignedTo=xxx] [--estimate=N] [--desc=xxx] [--deadline=xxx]');
          process.exit(1);
        }
        await updateTask(arg1, params);
        break;
      case 'close-task':
        if (!arg1) {
          console.error('用法: task.cjs close-task <id>');
          process.exit(1);
        }
        await closeTask(arg1, params);
        break;
      case 'delete-task':
        if (!arg1) {
          console.error('用法: task.cjs delete-task <id>');
          process.exit(1);
        }
        await deleteTask(arg1, params);
        break;
      default:
        console.log('用法: task.cjs <list-task|get-task|create-task|update-task|close-task|delete-task> [id] [options]');
        console.log('');
        console.log('命令:');
        console.log('  list-task    任务列表');
        console.log('  get-task     任务详情');
        console.log('  create-task  创建任务');
        console.log('  update-task  更新任务');
        console.log('  close-task   关闭任务');
        console.log('  delete-task  删除任务');
        console.log('');
        console.log('选项:');
        console.log('  --dry-run    模拟执行，不发送真实请求');
        console.log('  --yes        跳过二次确认');
        console.log('  --page=N     分页页码');
        console.log('  --limit=N    每页数量');
    }
  }

  run().catch((e) => {
    console.error(`❌ ${e.message}`);
    process.exit(1);
  });
}

module.exports = {
  listTasks,
  getTask,
  createTask,
  updateTask,
  closeTask,
  deleteTask,
};
