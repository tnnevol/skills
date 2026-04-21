/**
 * api.cjs — HTTP 请求统一封装
 * 
 * - 自动注入 token
 * - 统一 baseURL 拼接
 * - 分页处理：pageID + recPerPage（默认 20）
 * - 统一错误处理
 * - 401 自动重试登录
 */
const { loadEnv } = require("./env.cjs");
const { getToken } = require("./auth.cjs");
const { sanitize } = require("./sanitize.cjs");

// 禅道 v2 API 统一返回结构
function isSuccess(data) {
  return data && (data.status === "success" || data.status === 1);
}

async function callAPI(endpoint, options = {}) {
  const env = loadEnv();
  if (env.error) {
    console.error(env.message);
    process.exit(1);
  }

  const { retry = true } = options;
  let token = await getToken(env.CHANDAO_URL);

  const url = `${env.CHANDAO_URL}/api/v2${endpoint}`;
  let res = await fetch(url, {
    method: options.method || "GET",
    headers: {
      "Content-Type": "application/json",
      token: token,
      ...options.headers,
    },
    body: options.body ? JSON.stringify(options.body) : undefined,
  });

  // 401 自动重新登录重试
  if (res.status === 401 && retry) {
    token = await getToken(env.CHANDAO_URL);
    res = await fetch(url, {
      method: options.method || "GET",
      headers: {
        "Content-Type": "application/json",
        token: token,
        ...options.headers,
      },
      body: options.body ? JSON.stringify(options.body) : undefined,
    });
  }

  if (!res.ok) {
    throw new Error(`HTTP ${res.status}: ${res.statusText}`);
  }

  const data = await res.json();

  if (!isSuccess(data)) {
    throw new Error(`禅道 API 错误: ${data.message || JSON.stringify(data)}`);
  }

  return data;
}

// 列表查询封装（带分页）
async function queryList(endpoint, params = {}) {
  const page = params.page || 1;
  const limit = params.limit || 20;

  const queryParams = new URLSearchParams({
    recPerPage: String(limit),
    pageID: String(page),
  });

  if (params.browseType) queryParams.set("browseType", params.browseType);
  if (params.orderBy) queryParams.set("orderBy", params.orderBy);

  const data = await callAPI(`${endpoint}?${queryParams}`);
  return {
    data: data.result || data.data || data,
    page,
    limit,
    hasMore: Array.isArray(data.result || data.data || data) &&
             (data.result || data.data || data).length >= limit,
  };
}

// 详情查询封装
async function queryDetail(endpoint, id) {
  return callAPI(`${endpoint}/${id}`);
}

// CLI 入口
if (require.main === module) {
  const action = process.argv[2];
  const arg1 = process.argv[3];
  const arg2 = process.argv[4];

  async function run() {
    let result;
    switch (action) {
      case "list":
        result = await queryList(arg1, {
          page: parseInt(process.argv[5] || "1"),
          limit: parseInt(process.argv[6] || "20"),
        });
        console.log(JSON.stringify(result, null, 2));
        break;
      case "detail":
        result = await queryDetail(arg1, arg2);
        console.log(JSON.stringify(result, null, 2));
        break;
      default:
        console.log("用法: api.cjs <list|detail> <endpoint> [id] [page] [limit]");
    }
  }
  run().catch((e) => {
    console.error(`❌ ${e.message}`);
    process.exit(1);
  });
}

module.exports = { callAPI, queryList, queryDetail, sanitize };
