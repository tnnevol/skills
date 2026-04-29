/**
 * 评论操作: comments
 *
 * Visibility 默认继承规则：
 * - 不传 --visibility 时，自动获取父笔记的 visibility 并继承
 * - 用户可显式指定 --visibility=PUBLIC|PRIVATE|PROTECTED 覆盖默认值
 */

const { normalizeMemoId, truncate, formatTime, parseFlags } = require("../utils.cjs");

async function actionComments(callAPI, argList) {
  const { positional, flags } = parseFlags(argList);
  const rawId = positional[0];
  const commentContent = positional.slice(1).join(" ");

  if (!rawId) {
    console.error("用法: api.cjs comments <笔记ID> [\"评论内容\"] [--visibility=PUBLIC|PRIVATE|PROTECTED] [--operation=create|view|update|delete] [--comment-id=评论ID]");
    process.exit(1);
  }

  const id = normalizeMemoId(rawId);
  const operation = flags.operation || (commentContent ? "create" : "view");
  const commentId = flags['comment-id'];

  switch(operation.toLowerCase()) {
    case 'view':
      // 查看评论
      await viewComments(callAPI, id);
      break;
      
    case 'create':
      // 添加评论
      await createComment(callAPI, id, commentContent, flags);
      break;
      
    case 'update':
      // 更新评论
      if (!commentId) {
        console.error("错误: 更新评论需要提供 --comment-id 参数");
        process.exit(1);
      }
      if (!commentContent) {
        console.error("错误: 更新评论需要提供新内容");
        process.exit(1);
      }
      await updateComment(callAPI, commentId, commentContent, flags);
      break;
      
    case 'delete':
      // 删除评论
      if (!commentId) {
        console.error("错误: 删除评论需要提供 --comment-id 参数");
        process.exit(1);
      }
      await deleteComment(callAPI, commentId);
      break;
      
    default:
      console.error(`错误: 不支持的操作类型 '${operation}'。支持的操作: view, create, update, delete`);
      process.exit(1);
  }
}

// 查看评论
async function viewComments(callAPI, id) {
  const data = await callAPI("GET", `/api/v1/${id}/comments`);
  const comments = data.memos || [];

  if (comments.length === 0) {
    console.log(`💬 ${id} 暂无评论`);
    return;
  }

  console.log(`💬 ${id} 的评论（共 ${comments.length} 条）:\n`);
  console.log("━".repeat(60));

  for (let i = 0; i < comments.length; i++) {
    const c = comments[i];
    console.log(`\n${i + 1}. ${truncate(c.content || "", 100).replace(/\n/g, " ")}`);
    console.log(`   ID: ${c.name || "未知"}`);
    console.log(`   创建者: ${c.creator || "未知"}`);
    console.log(`   可见性: ${c.visibility || "默认"}`);
    console.log(`   创建时间: ${formatTime(c.createTime)}`);
    console.log(`   更新时间: ${formatTime(c.updateTime)}`);
    console.log("─".repeat(60));
  }
}

// 添加评论
async function createComment(callAPI, id, commentContent, flags) {
  const body = { content: commentContent };

  // 处理 visibility：显式指定 > 自动继承父笔记
  if (flags.visibility) {
    body.visibility = flags.visibility.toUpperCase();
  } else {
    // 自动继承父笔记的 visibility
    try {
      const parentData = await callAPI("GET", `/api/v1/${id}`);
      if (parentData && parentData.visibility) {
        body.visibility = parentData.visibility;
      }
    } catch (e) {
      // 获取失败则不设置 visibility，使用 API 默认值
    }
  }

  const data = await callAPI("POST", `/api/v1/${id}/comments`, JSON.stringify(body));

  console.log("\n✅ 评论添加成功");
  console.log(`   ID: ${data.name || "未知"}`);
  console.log(`   内容: ${truncate(data.content || "", 80)}`);
  console.log(`   可见性: ${data.visibility || "默认"}`);
  console.log(`   创建时间: ${formatTime(data.createTime)}`);
  console.log(`   笔记链接: ${process.env.MEMOS_BASE_URL}/${id}`);
}

// 更新评论
async function updateComment(callAPI, commentId, newContent, flags) {
  const body = { content: newContent };

  // 处理 visibility
  if (flags.visibility) {
    body.visibility = flags.visibility.toUpperCase();
  }

  const data = await callAPI("PATCH", `/api/v1/memos/${commentId}`, JSON.stringify(body));

  console.log("\n✅ 评论更新成功");
  console.log(`   ID: ${data.name || "未知"}`);
  console.log(`   新内容: ${truncate(data.content || "", 80)}`);
  console.log(`   可见性: ${data.visibility || "默认"}`);
  console.log(`   更新时间: ${formatTime(data.updateTime)}`);
}

// 删除评论
async function deleteComment(callAPI, commentId) {
  const commentData = await callAPI("GET", `/api/v1/memos/${commentId}`);

  console.log("\n⚠️  确定要删除这条评论吗？");
  console.log(`   ID: ${commentData.name || commentId}`);
  console.log(`   内容: ${truncate(commentData.content || "", 100).replace(/\n/g, " ")}`);
  console.log(`   创建时间: ${formatTime(commentData.createTime)}`);

  await callAPI("DELETE", `/api/v1/memos/${commentId}`);

  console.log(`\n✅ 已删除评论: ${commentId}`);
}

module.exports = { actionComments };
