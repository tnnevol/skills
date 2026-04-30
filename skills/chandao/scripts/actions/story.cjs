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
  if (params.epic) query.parent = params.epic; // 按史诗过滤（parent 字段）
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

  // 无过滤条件且无数据时，提供友好提示
  if (result.length === 0 && !params.product && !params.project && !params.status && !params.assignedTo) {
    console.log('📭 暂无需求数据');
    console.log('💡 建议：使用 --product=N 指定产品过滤，例如 --product=1');
    console.log('💡 可用过滤参数：--product / --project / --status / --assignedTo / --priority / --epic');
    return 0;
  }

  if (result.length === 0) {
    console.log('📭 暂无匹配的需求数据');
    return 0;
  }

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
  let res = await get(`/stories/${storyId}`);

  // 如果直接请求返回的数据结构不完整，尝试通过产品路径获取
  let story = null;
  if (res.ok && res.data) {
    // 尝试多种可能的数据结构
    if (res.data.result && typeof res.data.result === 'object' && res.data.result.id) {
      story = res.data.result;
    } else if (res.data.story && typeof res.data.story === 'object' && res.data.story.id) {
      story = res.data.story;
    } else if (res.data.id) {
      // 可能直接就是故事对象
      story = res.data;
    }
  }

  // 如果直接获取失败或数据不完整，尝试通过产品列表路径
  if (!story || !story.title) {
    // 先获取产品列表，然后尝试从每个产品获取故事详情
    const productsRes = await get('/products', { recPerPage: 50 });
    if (productsRes.ok && productsRes.data) {
      let products = [];
      if (productsRes.data.products && Array.isArray(productsRes.data.products)) {
        products = productsRes.data.products;
      } else if (Array.isArray(productsRes.data)) {
        products = productsRes.data;
      } else {
        for (const key of Object.keys(productsRes.data)) {
          if (Array.isArray(productsRes.data[key])) {
            products = productsRes.data[key];
            break;
          }
        }
      }

      for (const p of products) {
        const pid = p.id;
        const storyRes = await get(`/products/${pid}/stories/${storyId}`);
        if (storyRes.ok && storyRes.data) {
          if (storyRes.data.result && storyRes.data.result.id) {
            story = storyRes.data.result;
            break;
          } else if (storyRes.data.story && storyRes.data.story.id) {
            story = storyRes.data.story;
            break;
          } else if (storyRes.data.id) {
            story = storyRes.data;
            break;
          }
        }
      }
    }
  }

  if (!story) {
    throw new Error(`[查询失败] 未找到需求 #${storyId}，或当前账号无权限访问`);
  }

  const s = sanitize(story);

  const statusText = {
    active: '进行中',
    changed: '已变更',
    closed: '已关闭',
    draft: '草稿',
  };

  const priText = { 1: '紧急', 2: '高', 3: '中', 4: '低' };

  // 尝试从不同字段获取产品名称
  const productName = s.productName || (s.product && typeof s.product === 'object' ? s.product.name : s.product) || '-';

  card(`需求: ${s.title || s.name || storyId}`, [
    ['ID', s.id],
    ['标题', s.title || s.name],
    ['产品', productName],
    ['模块', s.moduleName || s.module || '-'],
    ['优先级', priText[s.pri] || s.pri || '-'],
    ['状态', statusText[s.status] || s.status || '-'],
    ['来源', s.source || '-'],
    ['类型', s.type || '-'],
    ['阶段', s.stage || '-'],
    ['描述', s.spec || s.description || '-'],
    ['指派给', s.assignedTo || s.assignedToName || '-'],
    ['创建人', s.createdBy || s.openedBy || '-'],
    ['创建时间', s.createdDate || s.openedDate || '-'],
    ['预计工时', s.estimate || '-'],
    ['实际工时', s.consumed || '-'],
    ['评审结果', s.reviewResult || '-'],
    ['关键词', s.keyword || '-'],
    ['URI', s.uri || '-'],
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

// ============ 删除需求 ============

async function deleteStory(storyId, params) {
  id(storyId, '需求ID');

  if (!params.yes && !params.dryRun) {
    console.log(`⚠️  确认要删除需求 #${storyId} 吗？此操作不可恢复！`);
    console.log('   使用 --yes 跳过确认');
    process.exit(1);
  }

  const res = await del(`/stories/${storyId}`, {}, { dryRun: params.dryRun });
  if (!res.ok) throw new Error(`[删除失败] ${res.error}`);

  if (params.dryRun) {
    console.log('✅ Dry-run 通过');
  } else {
    console.log(`✅ 需求 #${storyId} 已删除`);
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
      if (a.startsWith('--epic=')) params.epic = a.split('=')[1];
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
      case 'delete-story':
        if (!arg1) {
          console.error('用法: story.cjs delete-story <id>');
          process.exit(1);
        }
        await deleteStory(arg1, params);
        break;
      default:
        console.log(
          '用法: story.cjs <list-story|get-story|create-story|update-story|close-story|review-story|delete-story> [id] [选项]'
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
  deleteStory,
};
