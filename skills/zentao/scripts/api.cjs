#!/usr/bin/env node

/**
 * 禅道 API 统一请求封装
 * 
 * 功能：
 *   - 自动注入 Token 到请求头（token: xxx 格式）
 *   - 统一 baseURL 拼接
 *   - 分页处理：pageID + recPerPage（默认 20）
 *   - 统一错误处理（401 自动刷新 Token）
 *   - CLI 入口：node api.cjs <action> [args...]
 * 
 * CLI 用法：
 *   node api.cjs get /users                    # 获取用户列表
 *   node api.cjs get /users/1                  # 获取用户详情
 *   node api.cjs get /products --limit=50      # 获取产品列表
 *   node api.cjs get /projects --page=2        # 翻页
 *   node api.cjs post /users '{"account":"x"}' # POST 请求
 */

const { loadRequired } = require('./env.cjs');
const { getToken, refreshToken, httpRaw } = require('./auth.cjs');
const { sanitize } = require('./sanitize.cjs');

/**
 * 带认证的请求（自动处理 401 刷新）
 */
async function request(method, endpoint, body, query) {
  const { baseUrl } = loadRequired();

  // 拼接路径：确保 endpoint 以 / 开头，baseUrl 已去尾斜杠
  const cleanEndpoint = endpoint.startsWith('/') ? endpoint : '/' + endpoint;
  const apiPath = `/api.php/v2${cleanEndpoint}`;

  // 构建查询参数
  const params = new URLSearchParams();
  if (query) {
    for (const [k, v] of Object.entries(query)) {
      if (v !== undefined && v !== null) params.append(k, String(v));
    }
  }
  const queryString = params.toString() ? `?${params.toString()}` : '';

  let url = `${baseUrl}${apiPath}${queryString}`;

  // 获取 Token 并发起请求
  const token = await getToken();
  let res = await httpRaw(url, {
    method,
    headers: { token },
    body: body ? JSON.stringify(body) : null,
  });

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
  const res = await request('GET', endpoint, null, query);
  return handleResponse(res);
}

/**
 * POST 请求
 */
async function post(endpoint, body, query = {}) {
  const res = await request('POST', endpoint, body, query);
  return handleResponse(res);
}

/**
 * PUT 请求
 */
async function put(endpoint, body, query = {}) {
  const res = await request('PUT', endpoint, body, query);
  return handleResponse(res);
}

/**
 * 统一响应处理
 */
function handleResponse(res) {
  const { status, data } = res;

  // HTTP 级别错误
  if (status >= 500) {
    return { ok: false, error: `服务器错误 (HTTP ${status})`, httpStatus: status };
  }

  if (status === 404) {
    return { ok: false, error: '接口不存在 (404)', httpStatus: status };
  }

  if (status >= 400 && status < 500) {
    return { ok: false, error: `客户端错误 (HTTP ${status})`, httpStatus: status };
  }

  // 禅道业务级别错误
  if (data && data.status === 'fail') {
    return { ok: false, error: data.message || JSON.stringify(data), httpStatus: status, detail: data };
  }

  // 200 但空 body 或无数据
  if (data === null || data === undefined || data === '' ||
      (typeof data === 'object' && !Array.isArray(data) && Object.keys(data).length === 0)) {
    return { ok: false, error: `空响应 (HTTP ${status})`, httpStatus: status };
  }

  // 成功
  return { ok: true, data: data, httpStatus: status };
}

/**
 * 解析 CLI 参数
 */
function parseCliArgs(args) {
  const result = {
    method: 'GET',
    endpoint: null,
    body: null,
    query: { recPerPage: 20, pageID: 1 },
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
    } else if (arg.startsWith('--')) {
      const [key, ...valueParts] = arg.slice(2).split('=');
      const value = valueParts.length ? valueParts.join('=') : true;
      if (key === 'limit' || key === 'recPerPage') {
        result.query.recPerPage = parseInt(value, 10);
      } else if (key === 'page' || key === 'pageID') {
        result.query.pageID = parseInt(value, 10);
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
    console.error('用法: node api.cjs <get|post|put> <endpoint> [body] [--limit=N] [--page=N]');
    console.error('示例:');
    console.error('  node api.cjs get /users');
    console.error('  node api.cjs get /products --limit=50');
    console.error('  node api.cjs get /projects --page=2');
    process.exit(1);
  }

  try {
    const { method, endpoint, body, query } = parseCliArgs(args);

    if (!endpoint) {
      console.error('[ERROR] 缺少端点参数');
      process.exit(1);
    }

    let res;
    if (method === 'POST') {
      const parsedBody = body ? (body.startsWith('{') ? JSON.parse(body) : body) : null;
      res = await post(endpoint, parsedBody, query);
    } else if (method === 'PUT') {
      const parsedBody = body ? (body.startsWith('{') ? JSON.parse(body) : body) : null;
      res = await put(endpoint, parsedBody, query);
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
      // env.cjs 已经处理了退出
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
module.exports = { get, post, put, sanitize, handleResponse, request };
