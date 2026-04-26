/**
 * Memos 通用 API 调用脚本 — 主入口
 * 用法: <runtime> api.cjs <操作> [参数...]
 *
 * 支持运行时: node (>=18), bun, deno
 * 零依赖 — 仅使用原生 fetch + JSON
 *
 * 操作:
 *   list [--limit=N] [--tag=xxx]     - 列出笔记
 *   create "内容" [--visibility=X]   - 创建笔记
 *   get <笔记ID>                     - 获取单条笔记
 *   update <笔记ID> "内容"           - 更新笔记
 *   delete <笔记ID>                  - 删除笔记
 *   pin <笔记ID>                     - 切换置顶
 *   tags                             - 列出所有标签
 *   comments <笔记ID> ["内容"]       - 查看/添加评论
 *   whoami                           - 显示当前用户
 *   user-stats                       - 显示用户统计
 *   share <笔记ID> [--list] [--revoke=ID] - 分享管理
 *   attachments <笔记ID>             - 列出附件
 *   upload-attachment <文件路径>     - 上传附件 [--memo=ID] [--filename=xxx]
 *   delete-attachment <附件ID>       - 删除附件
 *   batch-delete-attachment <ID...>  - 批量删除附件
 */

const { BASE_URL, ACCESS_TOKEN } = require("./env.cjs");
const { callAPI } = require("./utils.cjs");

// 绑定 callAPI
const api = (method, path, body) => callAPI(BASE_URL, ACCESS_TOKEN, method, path, body);

// 导入操作模块
const memo = require("./actions/memo.cjs");
const tag = require("./actions/tag.cjs");
const comment = require("./actions/comment.cjs");
const user = require("./actions/user.cjs");
const share = require("./actions/share.cjs");
const attachment = require("./actions/attachment.cjs");
const reaction = require("./actions/reaction.cjs");
const relation = require("./actions/relation.cjs");

// 参数解析
const args = process.argv.slice(2);
const action = args[0];

if (!action) {
  console.error("用法: api.cjs <操作> [参数...]");
  console.error("可用操作: list, create, get, update, delete, pin, tags, comments, whoami, user-stats, share, attachments, upload-attachment, delete-attachment, batch-delete-attachment, reactions, react, unreact, relations, relate, unrelate");
  process.exit(1);
}

// 路由分发
const actionMap = {
  list: (a) => memo.actionList(api, a),
  create: (a) => memo.actionCreate(api, a),
  get: (a) => memo.actionGet(api, a),
  update: (a) => memo.actionUpdate(api, a),
  delete: (a) => memo.actionDelete(api, a),
  pin: (a) => memo.actionPin(api, a),
  tags: () => tag.actionTags(api),
  comments: (a) => comment.actionComments(api, a),
  whoami: () => user.actionWhoami(api),
  "user-stats": () => user.actionUserStats(api),
  share: (a) => share.actionShare(api, BASE_URL, ACCESS_TOKEN, a),
  attachments: (a) => attachment.actionAttachments(api, BASE_URL, a),
  "upload-attachment": (a) => attachment.actionAttachmentUpload(api, a),
  "delete-attachment": (a) => attachment.actionAttachmentDelete(api, a),
  "batch-delete-attachment": (a) => attachment.actionAttachmentBatchDelete(api, a),
  reactions: (a) => reaction.actionReactions(api, a),
  react: (a) => reaction.actionReact(api, a),
  unreact: (a) => reaction.actionUnreact(api, a),
  relations: (a) => relation.actionRelations(api, a),
  relate: (a) => relation.actionRelate(api, a),
  unrelate: (a) => relation.actionUnrelate(api, a),
};

const actionFn = actionMap[action];

if (!actionFn) {
  console.error(`未知操作: ${action}`);
  console.error("可用操作: list, create, get, update, delete, pin, tags, comments, whoami, user-stats, share, attachments, upload-attachment, delete-attachment, batch-delete-attachment, reactions, react, unreact, relations, relate, unrelate");
  process.exit(1);
}

actionFn(args.slice(1)).catch((err) => {
  console.error(err.message || err);
  process.exit(1);
});
