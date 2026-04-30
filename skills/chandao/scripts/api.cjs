#!/usr/bin/env node

/**
 * 禅道 API 统一请求封装
 * 
 * 功能：
 *   - 自动注入 Token 到请求头（token: xxx 格式）
 *   - 统一 baseURL 拼接
 *   - 分页处理：pageID + recPerPage（默认 20）
 *   - 统一错误处理（401 自动刷新 Token）
 *   - dry-run 框架：写操作支持 --dry-run 预览
 *   - CLI 入口：node api.cjs <action> [args...]
 * 
 * CLI 用法：
 *   node api.cjs get /users                    # 获取用户列表
 *   node api.cjs get /users/1                  # 获取用户详情
 *   node api.cjs get /products --limit=50      # 获取产品列表
 *   node api.cjs get /projects --page=2        # 翻页
 *   node api.cjs post /users '{"account":"x"}' # POST 请求
 *   node api.cjs post /users '{"account":"x"}' --dry-run  # 预览 POST
 *   node api.cjs delete /users/1               # 删除用户
 */

const fs = require('fs');
const path = require('path');
const { loadRequired, API_PATH_PREFIX } = require('./env.cjs');
const { getToken, refreshToken, httpRaw } = require('./auth.cjs');
const { sanitize } = require('./sanitize.cjs');

// ========== dry-run 框架 ==========

/**
 * dry-run 模式：打印操作信息，不发送请求
 */
function dryRunResult(method, url, body) {
  console.log('🔍 [DRY-RUN] 模拟写操作');
  console.log(`  方法: ${method}`);
  console.log(`  URL: ${url}`);
  if (body) console.log(`  Body: ${JSON.stringify(body)}`);
  console.log('');
  return {
    status: 200,
    data: {
      status: 'success',
      dryRun: true,
      message: 'Dry-run 模式，未发送真实请求',
      method,
      url,
      body,
    },
  };
}

/**
 * 操作日志记录（追加到文件）
 */
function appendOperationLog(entry) {
  try {
    const logPath = path.join(__dirname, '../.operation-log.jsonl');
    const line = JSON.stringify({
      time: new Date().toISOString(),
      ...entry,
    }) + '\n';
    fs.appendFileSync(logPath, line, 'utf8');
  } catch {
    // 写入失败不影响主流程
  }
}

// ========== 请求层 ==========

/**
 * 带认证的请求（自动处理 401 刷新 + 网络重试 + 智能路由）
 * @param {string} method - HTTP 方法
 * @param {string} endpoint - API 端点
 * @param {object|null} body - 请求体
 * @param {object} query - 查询参数
 * @param {object} options - 额外选项（dryRun 等）
 * @param {number} retries - 重试次数
 */
async function request(method, endpoint, body, query, options = {}, retries = 2) {
  const { baseUrl } = loadRequired();

  // 智能路由：根据 endpoint 和 query 参数调整 API 路径
  let adjustedEndpoint = endpoint;
  
  // 修复禅道 API 路由：stories/tasks 需要按 project 分组
  if (endpoint === '/stories' && query && query.project) {
    // /api.php/v2/stories?project=ID → /api.php/v2/projects/ID/stories
    const projectId = query.project;
    adjustedEndpoint = `/projects/${projectId}/stories`;
    // 从查询参数中移除 project，因为它已成为 URL 路径的一部分
    const newQuery = { ...query };
    delete newQuery.project;
    query = newQuery;
  } else if (endpoint === '/stories' && query && query.product) {
    // /api.php/v2/stories?product=ID → /api.php/v2/products/ID/stories
    const productId = query.product;
    adjustedEndpoint = `/products/${productId}/stories`;
    const newQuery = { ...query };
    delete newQuery.product;
    query = newQuery;
  } else if (endpoint === '/tasks' && query && query.project) {
    // /api.php/v2/tasks?project=ID → /api.php/v2/projects/ID/tasks
    const projectId = query.project;
    adjustedEndpoint = `/projects/${projectId}/tasks`;
    // 从查询参数中移除 project，因为它已成为 URL 路径的一部分
    const newQuery = { ...query };
    delete newQuery.project;
    query = newQuery;
  } else if (endpoint === '/tasks' && query && query.execution) {
    // /api.php/v2/tasks?execution=ID → /api.php/v2/executions/ID/tasks
    const executionId = query.execution;
    adjustedEndpoint = `/executions/${executionId}/tasks`;
    const newQuery = { ...query };
    delete newQuery.execution;
    query = newQuery;
  }

  // 拼接路径：确保 endpoint 以 / 开头，baseUrl 已去尾斜杠
  const cleanEndpoint = adjustedEndpoint.startsWith('/') ? adjustedEndpoint : '/' + adjustedEndpoint;
  const apiPath = `${API_PATH_PREFIX}${cleanEndpoint}`;

  // 构建查询参数
  const params = new URLSearchParams();
  if (query) {
    for (const [k, v] of Object.entries(query)) {
      if (v !== undefined && v !== null) params.append(k, String(v));
    }
  }
  const queryString = params.toString() ? `?${params.toString()}` : '';

  const url = `${baseUrl}${apiPath}${queryString}`;

  // dry-run 模式：打印操作信息，不发送请求
  if (options && options.dryRun) {
    return dryRunResult(method, url, body);
  }

  // 获取Token 并发起请求
  const token = await getToken();
  let res;
  
  try {
    res = await httpRaw(url, {
      method,
      headers: { token },
      body: body ? JSON.stringify(body) : null,
    });
  } catch (error) {
    // 网络错误重试机制
    if (retries > 0 && (error.code === 'ECONNRESET' || error.code === 'ETIMEDOUT' || error.code === 'ENOTFOUND')) {
      const delay = 1000 * (3 - retries + 1); // 递增延迟：第一次1秒，第二次2秒，第三次3秒
      console.warn(`[WARN] 请求失败，${delay}ms 后重试 (${3 - retries}/3): ${url}`);
      await new Promise(resolve => setTimeout(resolve, delay));
      return request(method, endpoint, body, query, options, retries - 1);
    }
    throw error;
  }

  // 401 自动刷新 Token 并重试
  if (res.status === 401 || (res.data && res.data.status === 'fail' && res.data.message && res.data.message.includes('token'))) {
    await refreshToken();
    const newToken = await getToken();
    res = await httpRaw(url, {
      method,
      headers: { token: newToken },
      body: body ? JSON.stringify(body) : null,
    });
  }

  return res;
}

/**
 * GET 请求
 */
async function get(endpoint, query = {}) {
  const res = await request('GET', endpoint, null, query, {});
  return handleResponse(res, 'GET');
}

/**
 * POST 请求
 */
async function post(endpoint, body, query = {}, options = {}) {
  const res = await request('POST', endpoint, body, query, options);
  
  // 记录操作日志
  if (res.ok && !options.dryRun) {
    appendOperationLog({ method: 'POST', endpoint, body });
  }
  
  return handleResponse(res, 'POST');
}

/**
 * PUT 请求
 */
async function put(endpoint, body, query = {}, options = {}) {
  const res = await request('PUT', endpoint, body, query, options);
  
  // 记录操作日志
  if (res.ok && !options.dryRun) {
    appendOperationLog({ method: 'PUT', endpoint, body });
  }
  
  return handleResponse(res, 'PUT');
}

/**
 * DELETE 请求
 */
async function del(endpoint, query = {}, options = {}) {
  const res = await request('DELETE', endpoint, null, query, options);
  
  // 记录操作日志
  return handleResponse(res, 'DELETE');
}

// ========== 响应处理 ==========

/**
 * 统一响应处理
 * @param {object} res - HTTP 响应
 * @param {string} [method='GET'] - HTTP 方法，用于判断写操作空响应处理
 */
function handleResponse(res, method = 'GET') {
  const status = res.status;
  const data = res.data;

  if (status === 204) {
    return { ok: true, data: null, httpStatus: 204 };
  }

  if (status >= 500) {
    return { ok: false, error: `服务器错误 (HTTP ${status})`, httpStatus: status };
  }

  if (status === 404) {
    return { ok: false, error: '接口不存在 (404)', httpStatus: status };
  }

  if (status >= 400 && status < 500) {
    if (status === 401) {
      return { ok: false, error: '认证失败，Token 无效或过期 (401)', httpStatus: status };
    }
    if (status === 403) {
      return { ok: false, error: '权限不足，当前账号无此操作权限 (403)', httpStatus: status };
    }
    return { ok: false, error: `客户端错误 (HTTP ${status})`, httpStatus: status };
  }

  // 禅道业务级别错误
  if (data && data.status === 'fail') {
    return { ok: false, error: data.message || JSON.stringify(data), httpStatus: status, detail: data };
  }

  // 写操作 (POST/PUT/PATCH): 200 + 空 body 视为成功（禅道写操作惯例）
  const isWriteMethod = ['POST', 'PUT', 'PATCH'].includes(method);
  if (isWriteMethod && status === 200 && (data === null || data === undefined || data === '' ||
      (typeof data === 'object' && !Array.isArray(data) && Object.keys(data).length === 0))) {
    return { ok: true, data: null, httpStatus: status };
  }

  // 200 但空 body 或无数据（读操作：视为无数据）
  if (data === null || data === undefined || data === '' ||
      (typeof data === 'object' && !Array.isArray(data) && Object.keys(data).length === 0)) {
    return { ok: false, error: `空响应 (HTTP ${status})`, httpStatus: status };
  }

  // 成功
  return { ok: true, data: data, httpStatus: status };
}

// ========== CLI 入口 ==========

/**
 * 解析 CLI 参数
 */
function parseCliArgs(args) {
  const result = {
    method: 'GET',
    endpoint: null,
    body: null,
    query: { recPerPage: 20, pageID: 1 },
    dryRun: false,
    yes: false,  // 跳过二次确认
  };

  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    if (arg === 'get') {
      result.method = 'GET';
      result.endpoint = args[++i];
    } else if (arg === 'post') {
      result.method = 'POST';
      result.endpoint = args[++i];
      result.body = args[++i];
    } else if (arg === 'put') {
      result.method = 'PUT';
      result.endpoint = args[++i];
      result.body = args[++i];
    } else if (arg === 'delete') {
      result.method = 'DELETE';
      result.endpoint = args[++i];
    } else if (arg === '--dry-run') {
      result.dryRun = true;
    } else if (arg === '--yes') {
      result.yes = true;
    } else if (arg.startsWith('--')) {
      const [key, ...valueParts] = arg.slice(2).split('=');
      const value = valueParts.length ? valueParts.join('=') : true;
      if (key === 'limit' || key === 'recPerPage') {
        const n = parseInt(value, 10);
        if (isNaN(n) || n < 1 || n > 1000) {
          throw new Error(`[INVALID_PARAM] limit 范围必须为 1~1000，当前值: ${value}`);
        }
        result.query.recPerPage = n;
      } else if (key === 'page' || key === 'pageID') {
        const n = parseInt(value, 10);
        if (isNaN(n) || n < 1) {
          throw new Error(`[INVALID_PARAM] page 必须 ≥ 1，当前值: ${value}`);
        }
        result.query.pageID = n;
      } else {
        result.query[key] = value;
      }
    }
  }

  return result;
}

/**
 * CLI 主入口
 */
async function main() {
  const args = process.argv.slice(2);
  if (!args.length || !args[0]) {
    console.error('用法: node api.cjs <get|post|put|delete> <endpoint> [body] [--limit=N] [--page=N] [--dry-run] [--yes]');
    console.error('示例:');
    console.error('  node api.cjs get /users');
    console.error('  node api.cjs get /products --limit=50');
    console.error('  node api.cjs get /projects --page=2');
    console.error('  node api.cjs post /users \'{"account":"x"}\' --dry-run');
    console.error('  node api.cjs delete /users/1 --yes');
    process.exit(1);
  }

  try {
    const { method, endpoint, body, query, dryRun, yes } = parseCliArgs(args);

    if (!endpoint) {
      console.error('[ERROR] 缺少端点参数');
      process.exit(1);
    }

    // 二次确认（删除操作且未指定 --yes）
    if (method === 'DELETE' && !dryRun && !yes) {
      console.log(`⚠️  确认要执行 DELETE ${endpoint} 吗？`);
      console.log('   使用 --yes 跳过确认');
      process.exit(1);
    }

    let res;
    if (method === 'POST') {
      const parsedBody = body ? (body.startsWith('{') ? JSON.parse(body) : body) : null;
      res = await post(endpoint, parsedBody, query, { dryRun });
    } else if (method === 'PUT') {
      const parsedBody = body ? (body.startsWith('{') ? JSON.parse(body) : body) : null;
      res = await put(endpoint, parsedBody, query, { dryRun });
    } else if (method === 'DELETE') {
      res = await del(endpoint, query, { dryRun });
    } else {
      res = await get(endpoint, query);
    }

    // 脱敏输出
    if (!res.ok) {
      console.error(`[ERROR] ${res.error}`);
      if (res.detail) console.error(JSON.stringify(sanitize(res.detail), null, 2));
      process.exit(1);
    }

    console.log(JSON.stringify(sanitize(res.data), null, 2));
  } catch (err) {
    if (err.message.includes('CONFIG_MISSING')) {
      return;
    }
    console.error(`[ERROR] ${err.message}`);
    process.exit(1);
  }
}

// CLI 模式执行
if (require.main === module) {
  main();
}

// 模块导出
module.exports = { get, post, put, del, sanitize, handleResponse, request, dryRunResult, appendOperationLog };
