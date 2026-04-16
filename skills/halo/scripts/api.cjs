/**
 * Halo 通用 API 调用脚本 — 主入口
 * 用法: <runtime> api.cjs <操作> [参数...]
 *
 * 支持运行时: node (>=18), bun, deno
 * 零依赖 — 仅使用原生 fetch + JSON
 */

const { BASE_URL, PAT } = require("./env.cjs");
const { callAPI } = require("./utils.cjs");

// 绑定 callAPI
const api = (method, path, body) => callAPI(BASE_URL, PAT, method, path, body);
// 静默失败模式（用于可选端点，如 /content）
const apiSilent = (method, path, body) => callAPI(BASE_URL, PAT, method, path, body, true);

// 导入操作模块
const post = require("./actions/post.cjs");

// 参数解析
const args = process.argv.slice(2);
const action = args[0];

if (!action) {
  console.error("用法: api.cjs <操作> [参数...]");
  console.error("可用操作: list, get, create, update, delete, publish, unpublish");
  process.exit(1);
}

// 路由分发
const actionMap = {
  list: (a) => post.actionList(api, a),
  get: (a) => post.actionGet(api, apiSilent, BASE_URL, a),
  create: (a) => post.actionCreate(api, BASE_URL, a),
  update: (a) => post.actionUpdate(api, BASE_URL, a),
  delete: (a) => post.actionDelete(api, a),
  publish: (a) => post.actionPublish(api, BASE_URL, a, true),
  unpublish: (a) => post.actionPublish(api, BASE_URL, a, false),
};

const actionFn = actionMap[action];

if (!actionFn) {
  console.error(`未知操作: ${action}`);
  console.error("可用操作: list, get, create, update, delete, publish, unpublish");
  process.exit(1);
}

actionFn(args.slice(1)).catch((err) => {
  console.error(err.message || err);
  process.exit(1);
});
