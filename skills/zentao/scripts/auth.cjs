#!/usr/bin/env node

/**
 * 禅道 Token 认证模块
 * 
 * 核心逻辑：
 *   - getToken() 优先读缓存，无缓存则 POST /api/v2/users/login
 *   - 内存缓存单会话复用，减少重复登录
 *   - 401 自动刷新（重新登录）
 * 
 * 登录接口：
 *   POST {CHANDAO_URL}/api/v2/users/login
 *   Body: { account, password }
 *   Header: token: xxx（非 Bearer 格式）
 */

const http = require('http');
const https = require('https');
const { loadRequired } = require('./env.cjs');

// 内存缓存
let cachedToken = null;
let isRefreshing = false;
let refreshQueue = [];

/**
 * 执行 HTTP 请求（底层）
 */
function httpRaw(urlString, options = {}) {
  return new Promise((resolve, reject) => {
    const url = new URL(urlString);
    const lib = url.protocol === 'https:' ? https : http;

    const reqOptions = {
      hostname: url.hostname,
      port: url.port,
      path: url.pathname + url.search,
      method: options.method || 'GET',
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
    };

    const req = lib.request(reqOptions, (res) => {
      let body = '';
      res.on('data', (chunk) => (body += chunk));
      res.on('end', () => {
        try {
          const parsed = JSON.parse(body);
          resolve({ status: res.statusCode, headers: res.headers, data: parsed });
        } catch {
          resolve({ status: res.statusCode, headers: res.headers, data: body });
        }
      });
    });

    req.on('error', reject);
    req.setTimeout(15000, () => {
      req.destroy(new Error('请求超时'));
    });

    if (options.body) {
      req.write(typeof options.body === 'string' ? options.body : JSON.stringify(options.body));
    }
    req.end();
  });
}

/**
 * 登录获取 Token
 */
async function doLogin() {
  const { baseUrl, account, password } = loadRequired();
  const loginUrl = `${baseUrl}/api/v2/users/login`;

  const res = await httpRaw(loginUrl, {
    method: 'POST',
    body: JSON.stringify({ account, password }),
  });

  if (res.status !== 200 && res.status !== 201) {
    throw new Error(`登录失败: HTTP ${res.status} — ${JSON.stringify(res.data)}`);
  }

  if (res.data && res.data.status === 'fail') {
    throw new Error(`登录失败: ${res.data.message || JSON.stringify(res.data)}`);
  }

  const token = res.data && res.data.token;
  if (!token) {
    throw new Error(`登录响应中缺少 token: ${JSON.stringify(res.data)}`);
  }

  return token;
}

/**
 * 获取 Token（带缓存 + 自动刷新）
 * @returns {Promise<string>}
 */
async function getToken() {
  // 有缓存直接返回
  if (cachedToken) return cachedToken;

  // 防止并发刷新
  if (isRefreshing) {
    return new Promise((resolve, reject) => {
      refreshQueue.push({ resolve, reject });
    });
  }

  isRefreshing = true;
  try {
    cachedToken = await doLogin();
    // 唤醒等待队列
    for (const { resolve } of refreshQueue) resolve(cachedToken);
    refreshQueue = [];
    return cachedToken;
  } catch (err) {
    for (const { reject } of refreshQueue) reject(err);
    refreshQueue = [];
    throw err;
  } finally {
    isRefreshing = false;
  }
}

/**
 * 刷新 Token（清除缓存后重新登录）
 */
async function refreshToken() {
  cachedToken = null;
  return getToken();
}

/**
 * 清除缓存（用于测试或手动登出）
 */
function clearCache() {
  cachedToken = null;
}

module.exports = { getToken, refreshToken, clearCache, doLogin, httpRaw };
