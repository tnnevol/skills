#!/usr/bin/env node

/**
 * actions/query.cjs — 6 个查询命令的输出格式化
 *
 * 依赖秀才的 api.cjs（http/https 原生模块）
 * 列表：表格输出 | 详情：卡片输出
 */
const { get, sanitize } = require('../api.cjs');

// ============ 表格输出 ============

/**
 * 表格输出
 * @returns {number} 数据行数
 */
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

// ============ 卡片输出 ============

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

// ============ 列表查询（固定取 data.result） ============

async function queryList(endpoint, params = {}) {
  const page = params.page || 1;
  const limit = params.limit || 20;

  const query = {
    recPerPage: limit,
    pageID: page,
  };
  if (params.browseType) query.browseType = params.browseType;
  if (params.orderBy) query.orderBy = params.orderBy;

  const res = await get(endpoint, query);
  if (!res.ok) {
    throw new Error(res.error);
  }

  // 禅道 v2 统一返回结构：{ status: 'success', result: [...] }
  const result = res.data && res.data.result ? res.data.result : [];
  return {
    data: Array.isArray(result) ? result : [],
    page,
    limit,
    hasMore: Array.isArray(result) && result.length >= limit,
  };
}

async function queryDetail(endpoint, id) {
  const res = await get(`${endpoint}/${id}`);
  if (!res.ok) {
    throw new Error(res.error);
  }
  return res.data && res.data.result ? res.data.result : res.data;
}

// ============ 用户模块 ============

async function listUsers(params = {}) {
  const result = await queryList('/users', {
    page: params.page,
    limit: params.limit,
    browseType: params.browseType || 'inside',
    orderBy: params.orderBy || 'id_asc',
  });

  const sanitized = sanitize({ users: result.data }).users;
  const count = table(
    ['账号', '姓名', '角色', '部门', '手机'],
    sanitized.map((u) => [
      u.account || '-',
      u.realname || u.nickname || '-',
      u.role || '-',
      u.dept || '-',
      u.mobile || '-',
    ])
  );

  if (result.hasMore) {
    console.log(`\n💡 还有更多，使用 --page=${params.page + 1} 查看下一页`);
  }
  console.log(`\n共 ${count} 条 (第 ${params.page || 1} 页)`);
}

async function getUser(id) {
  const user = await queryDetail('/users', id);
  const s = sanitize(user);

  card(`用户: ${s.realname || s.account || id}`, [
    ['账号', s.account],
    ['姓名', s.realname],
    ['角色', s.role],
    ['部门', s.dept],
    ['手机', s.mobile],
    ['邮箱', s.email],
    ['类型', s.type],
    ['上级', s.superior],
    ['加入日期', s.join],
    ['状态', s.deleted === '1' ? '已删除' : '正常'],
  ]);
}

// ============ 产品模块 ============

async function listProducts(params = {}) {
  const result = await queryList('/products', {
    page: params.page,
    limit: params.limit,
    browseType: params.browseType || 'all',
    orderBy: params.orderBy || 'id_asc',
  });

  const count = table(
    ['ID', '名称', '类型', '负责人', '状态'],
    result.data.map((p) => [
      String(p.id || '-'),
      p.name || '-',
      p.type || '-',
      p.PO || '-',
      p.status || '-',
    ])
  );

  if (result.hasMore) {
    console.log(`\n💡 还有更多，使用 --page=${params.page + 1} 查看下一页`);
  }
  console.log(`\n共 ${count} 条 (第 ${params.page || 1} 页)`);
}

async function getProduct(id) {
  const product = await queryDetail('/products', id);

  const statusText = { normal: '正常', closed: '已关闭', suspended: '已暂停' };

  card(`产品: ${product.name || id}`, [
    ['ID', product.id],
    ['名称', product.name],
    ['类型', product.type],
    ['状态', statusText[product.status] || product.status],
    ['负责人', product.PO],
    ['测试负责人', product.QD],
    ['发布负责人', product.RD],
    ['所属项目集', product.programName || product.program],
    ['创建时间', product.createdDate],
  ]);
}

// ============ 项目模块 ============

async function listProjects(params = {}) {
  const result = await queryList('/projects', {
    page: params.page,
    limit: params.limit,
    browseType: params.browseType || 'all',
    orderBy: params.orderBy || 'id_asc',
  });

  const count = table(
    ['ID', '名称', '模式', '起止时间', '状态'],
    result.data.map((p) => [
      String(p.id || '-'),
      p.name || '-',
      p.model || '-',
      `${p.begin || '?'} ~ ${p.end || '?'}`,
      p.status || '-',
    ])
  );

  if (result.hasMore) {
    console.log(`\n💡 还有更多，使用 --page=${params.page + 1} 查看下一页`);
  }
  console.log(`\n共 ${count} 条 (第 ${params.page || 1} 页)`);
}

async function getProject(id) {
  const project = await queryDetail('/projects', id);

  const statusText = {
    wait: '未开始',
    doing: '进行中',
    suspended: '已暂停',
    closed: '已关闭',
    done: '已完成',
  };

  card(`项目: ${project.name || id}`, [
    ['ID', project.id],
    ['名称', project.name],
    ['模式', project.model],
    ['类型', project.type],
    ['状态', statusText[project.status] || project.status],
    ['开始日期', project.begin],
    ['结束日期', project.end],
    ['项目负责人', project.PM],
    ['产品负责人', project.PO],
    ['进度', project.progress ? `${project.progress}%` : '-'],
    ['团队人数', project.teamCount],
  ]);
}

// CLI 入口
if (require.main === module) {
  const action = process.argv[2];
  const arg1 = process.argv[3];

  function parseParams(args) {
    const params = {};
    for (const a of args) {
      if (a.startsWith('--page=')) params.page = parseInt(a.split('=')[1]);
      if (a.startsWith('--limit=')) params.limit = parseInt(a.split('=')[1]);
      if (a.startsWith('--browseType='))
        params.browseType = a.split('=')[1];
    }
    return params;
  }

  async function run() {
    const params = parseParams(process.argv.slice(4));
    switch (action) {
      case 'users':
        await listUsers(params);
        break;
      case 'user':
        if (!arg1) {
          console.error('用法: query.cjs user <id>');
          process.exit(1);
        }
        await getUser(arg1);
        break;
      case 'products':
        await listProducts(params);
        break;
      case 'product':
        if (!arg1) {
          console.error('用法: query.cjs product <id>');
          process.exit(1);
        }
        await getProduct(arg1);
        break;
      case 'projects':
        await listProjects(params);
        break;
      case 'project':
        if (!arg1) {
          console.error('用法: query.cjs project <id>');
          process.exit(1);
        }
        await getProject(arg1);
        break;
      default:
        console.log(
          '用法: query.cjs <users|user|products|product|projects|project> [id] [--page=N] [--limit=N]'
        );
    }
  }
  run().catch((e) => {
    console.error(`❌ ${e.message}`);
    process.exit(1);
  });
}

module.exports = {
  listUsers,
  getUser,
  listProducts,
  getProduct,
  listProjects,
  getProject,
};
