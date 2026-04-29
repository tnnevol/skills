#!/usr/bin/env node

/**
 * actions/story.cjs — 需求管理模块（Story CRUD）
 *
 * 命令：
 *   list-story   — 需求列表查询
 *   get-story    — 需求详情查询
 *   create-story — 创建需求
 *   update-story — 更新需求
 *   close-story  — 关闭需求
 *   review-story — 评审需求
 *
 * 依赖：api.cjs（骨架层）+ validate.cjs（参数校验）+ story-api.cjs（路由处理）
 */

const { get, post, put, del, sanitize, handleResponse, request } = require('../api.cjs');
const { validate, required, length, id, range, enum: enumVal, date } = require('../validate.cjs');
// story-api.cjs 的导入已移除，避免与本地实现冲突 (getStory/createStory/updateStory/closeStory/reviewStory)
const readline = require('readline');

// ============ 表格 & 卡片输出 ============

function table(headers, rows) {
  if (rows.length === 0) {
    console.log('📭 暂无数据');
    return 0;
  }

  const widths = headers.map((h, i) =>
    Math.max(
      String(h).length,
      ...rows.map((r) => String(r[i] ?? '').length)
    )
  );

  const headerLine =
    '| ' + headers.map((h, i) => pad(h, widths[i])).join(' | ') + ' |';
  const separator =
    '|' + widths.map((w) => '-'.repeat(w + 2)).join('|') + '|';

  console.log(headerLine);
  console.log(separator);
  for (const row of rows) {
    console.log(
      '| ' +
        headers.map((h, i) => pad(String(row[i] ?? ''), widths[i])).join(' | ') +
        ' |'
    );
  }
  return rows.length;
}

function pad(str, len) {
  return str.padEnd(len, ' ');
}

function card(title, fields) {
  console.log(`📋 ${title}`);
  console.log('━'.repeat(40));
  for (const [label, value] of fields) {
    if (value !== undefined && value !== null && value !== '') {
      console.log(`  ${label}: ${value}`);
    }
  }
  console.log('━'.repeat(40));
}

// ============ 二次确认 ============

async function confirmAction(message) {
  const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
  return new Promise((resolve) => {
    rl.question(`${message} [y/N] `, (answer) => {
      rl.close();
      resolve(answer.toLowerCase() === 'y');
    });
  });
}

// ============ 查询：需求列表 ============

async function listStories(params = {}) {
  const page = params.page || 1;
  const limit = params.limit || 20;

  const query = {
    recPerPage: limit,
    pageID: page,
  };
  if (params.product) query.product = params.product;
  if (params.project) query.project = params.project;
  if (params.status) query.status = params.status;
  if (params.assignedTo) query.assignedTo = params.assignedTo;
  if (params.priority) query.priority = params.priority;
  if (params.orderBy) query.orderBy = params.orderBy;

  const res = await get('/stories', query);
  if (!res.ok) throw new Error(res.error);

  // 取 data 中第一个数组字段
  let data = null;
  if (res.data && typeof res.data === 'object') {
    if (Array.isArray(res.data.stories)) {
      data = res.data.stories;
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

  const count = table(
    ['ID', '标题', '产品', '优先级', '状态', '指派给', '创建人'],
    result.map((s) => [
      String(s.id || '-'),
      (s.title || '-').slice(0, 20),
      s.productName || s.product || '-',
      String(s.pri || '-'),
      s.status || '-',
      s.assignedTo || '-',
      s.createdBy || '-',
    ])
  );

  if (result.length >= limit) {
    console.log(`\n💡 还有更多，使用 --page=${page + 1} 查看下一页`);
  }
  console.log(`\n共 ${count} 条 (第 ${page} 页)`);
}

// ============ 查询：需求详情 ============

async function getStory(storyId) {
  id(storyId, '需求ID');
  const res = await get(`/stories/${storyId}`);
  if (!res.ok) throw new Error(res.error);

  const story = res.data && res.data.result ? res.data.result : res.data;
  const s = sanitize(story);

  const statusText = {
    active: '进行中',
    changed: '已变更',
    closed: '已关闭',
    draft: '草稿',
  };

  const priText = { 1: '紧急', 2: '高', 3: '中', 4: '低' };

  card(`需求: ${s.title || storyId}`, [
    ['ID', s.id],
    ['标题', s.title],
    ['产品', s.productName || s.product],
    ['优先级', priText[s.pri] || s.pri],
    ['状态', statusText[s.status] || s.status],
    ['描述', s.spec ? s.spec.slice(0, 200) : '-'],
    ['指派给', s.assignedTo],
    ['创建人', s.createdBy],
    ['创建时间', s.createdDate],
    ['预计工时', s.estimate],
    ['实际工时', s.consumed],
    ['评审结果', s.reviewResult],
  ]);
}

// ============ 创建需求 ============

async function createStory(params) {
  // 参数校验
  validate(
    {
      product: { required: true, id: true },
      title: { required: true, length: { min: 2, max: 100 } },
      priority: { range: { min: 1, max: 4 } },
      estimate: { range: { min: 0.5, max: 999 } },
    },
    params
  );

  const body = {
    productID: Number(params.product),
    title: params.title,
  };
  if (params.spec) body.spec = params.spec;
  if (params.priority) body.pri = Number(params.priority);
  if (params.assignedTo) body.assignedTo = params.assignedTo;
  if (params.module) body.module = Number(params.module);
  if (params.estimate) body.estimate = Number(params.estimate);
  if (params.project) body.project = Number(params.project);
  if (params.execution) body.execution = Number(params.execution);
  if (params.category) body.category = params.category;
  if (params.source) body.source = params.source;

  const res = await post('/stories', body, {}, { dryRun: params.dryRun });
  if (!res.ok) throw new Error(res.error);

  if (params.dryRun) {
    console.log('✅ Dry-run 通过，请求体:');
    console.log(JSON.stringify(body, null, 2));
  } else {
    console.log(`✅ 需求创建成功，ID: ${res.data && res.data.id ? res.data.id : '未知'}`);
  }
}

// ============ 更新需求 ============

async function updateStory(storyId, params) {
  id(storyId, '需求ID');

  // 至少需要一个更新字段
  const updateFields = {};
  if (params.title) {
    length(params.title, '标题', 2, 100);
    updateFields.title = params.title;
  }
  if (params.spec) updateFields.spec = params.spec;
  if (params.priority) {
    range(params.priority, '优先级', 1, 4);
    updateFields.pri = Number(params.priority);
  }
  if (params.assignedTo) updateFields.assignedTo = params.assignedTo;
  if (params.module) updateFields.module = Number(params.module);
  if (params.estimate) {
    range(params.estimate, '预计工时', 0.5, 999);
    updateFields.estimate = Number(params.estimate);
  }

  if (Object.keys(updateFields).length === 0) {
    throw new Error('[校验失败] 至少需要一个更新字段：--title / --spec / --priority / --assignedTo / --module / --estimate');
  }

  const res = await put(`/stories/${storyId}`, updateFields, {}, { dryRun: params.dryRun });
  if (!res.ok) throw new Error(res.error);

  if (params.dryRun) {
    console.log('✅ Dry-run 通过，请求体:');
    console.log(JSON.stringify(updateFields, null, 2));
  } else {
    console.log(`✅ 需求 #${storyId} 更新成功`);
  }
}

// ============ 关闭需求 ============

async function closeStory(storyId, params) {
  id(storyId, '需求ID');

  // 二次确认
  if (!params.yes && !params.dryRun) {
    const ok = await confirmAction(`⚠️  确认关闭需求 #${storyId}？`);
    if (!ok) {
      console.log('已取消');
      return;
    }
  }

  const body = {};
  if (params.reason) body.closedReason = params.reason;

  const res = await put(`/stories/${storyId}/close`, body, {}, { dryRun: params.dryRun });
  if (!res.ok) throw new Error(res.error);

  if (params.dryRun) {
    console.log('✅ Dry-run 通过，关闭请求:');
    console.log(JSON.stringify(body, null, 2));
  } else {
    console.log(`✅ 需求 #${storyId} 已关闭`);
  }
}

// ============ 评审需求 ============

async function reviewStory(storyId, params) {
  id(storyId, '需求ID');

  // 校验评审结果
  enumVal(params.result, '评审结果', ['pass', 'reject']);
  if (!params.result) {
    throw new Error('[校验失败] 评审结果必填：--result=pass 或 --result=reject');
  }

  const body = { result: params.result };
  if (params.reason) body.reason = params.reason;

  const res = await put(`/stories/${storyId}/review`, body, {}, { dryRun: params.dryRun });
  if (!res.ok) throw new Error(res.error);

  if (params.dryRun) {
    console.log('✅ Dry-run 通过，评审请求:');
    console.log(JSON.stringify(body, null, 2));
  } else {
    const resultText = params.result === 'pass' ? '通过' : '不通过';
    console.log(`✅ 需求 #${storyId} 评审${resultText}`);
  }
}

// ============ CLI 入口 ============

if (require.main === module) {
  const action = process.argv[2];
  const arg1 = process.argv[3];

  function parseParams(args) {
    const params = {};
    for (const a of args) {
      if (a.startsWith('--page=')) params.page = parseInt(a.split('=')[1]);
      if (a.startsWith('--limit=')) params.limit = parseInt(a.split('=')[1]);
      if (a.startsWith('--product=')) params.product = a.split('=')[1];
      if (a.startsWith('--project=')) params.project = a.split('=')[1];
      if (a.startsWith('--status=')) params.status = a.split('=')[1];
      if (a.startsWith('--assignedTo=')) params.assignedTo = a.split('=')[1];
      if (a.startsWith('--priority=')) params.priority = parseInt(a.split('=')[1]);
      if (a.startsWith('--title=')) params.title = a.split('=')[1];
      if (a.startsWith('--spec=')) params.spec = a.split('=')[1];
      if (a.startsWith('--estimate=')) params.estimate = parseFloat(a.split('=')[1]);
      if (a.startsWith('--module=')) params.module = parseInt(a.split('=')[1]);
      if (a.startsWith('--result=')) params.result = a.split('=')[1];
      if (a.startsWith('--reason=')) params.reason = a.split('=')[1];
      if (a.startsWith('--category=')) params.category = a.split('=')[1];
      if (a.startsWith('--source=')) params.source = a.split('=')[1];
      if (a.startsWith('--execution=')) params.execution = parseInt(a.split('=')[1]);
      if (a === '--dry-run') params.dryRun = true;
      if (a === '--yes') params.yes = true;
    }
    return params;
  }

  async function run() {
    // 区分带 id 和不带 id 的命令
    // 带 id: get-story <id>, update-story <id>, close-story <id>, review-story <id>
    // 不带 id: list-story, create-story
    const needsId = ['get-story', 'update-story', 'close-story', 'review-story'].includes(action);
    
    let params;
    if (needsId) {
      // arg1 = id, params 从 index 4 开始
      params = parseParams(process.argv.slice(4));
    } else {
      // 没有 id, params 从 index 3 开始
      params = parseParams(process.argv.slice(3));
    }

    switch (action) {
      case 'list-story':
        await listStories(params);
        break;
      case 'get-story':
        if (!arg1) {
          console.error('用法: story.cjs get-story <id>');
          process.exit(1);
        }
        await getStory(arg1);
        break;
      case 'create-story':
        await createStory(params);
        break;
      case 'update-story':
        if (!arg1) {
          console.error('用法: story.cjs update-story <id> [--title=xxx] [--spec=xxx] ...');
          process.exit(1);
        }
        await updateStory(arg1, params);
        break;
      case 'close-story':
        if (!arg1) {
          console.error('用法: story.cjs close-story <id> [--reason=xxx] [--yes]');
          process.exit(1);
        }
        await closeStory(arg1, params);
        break;
      case 'review-story':
        if (!arg1) {
          console.error('用法: story.cjs review-story <id> --result=pass|reject [--reason=xxx]');
          process.exit(1);
        }
        await reviewStory(arg1, params);
        break;
      default:
        console.log(
          '用法: story.cjs <list-story|get-story|create-story|update-story|close-story|review-story> [id] [选项]'
        );
    }
  }

  run().catch((e) => {
    console.error(`❌ ${e.message}`);
    process.exit(1);
  });
}

module.exports = {
  listStories,
  getStory,
  createStory,
  updateStory,
  closeStory,
  reviewStory,
};
