/**
 * 评论操作: comments
 */

const { normalizeMemoId, truncate, formatTime, parseFlags } = require("../utils.cjs");

async function actionComments(callAPI, argList) {
  const { positional } = parseFlags(argList);
  const rawId = positional[0];
  const commentContent = positional.slice(1).join(" ");

  if (!rawId) {
    console.error("用法: api.cjs comments <笔记ID> [\"评论内容\"]");
    process.exit(1);
  }

  const id = normalizeMemoId(rawId);

  if (commentContent) {
    // 添加评论
    const data = await callAPI("POST", `/api/v1/${id}/comments`, JSON.stringify({ content: commentContent }));

    console.log("\n✅ 评论添加成功");
    console.log(`   ID: ${data.name || "未知"}`);
    console.log(`   内容: ${truncate(data.content || "", 80)}`);
    console.log(`   创建时间: ${formatTime(data.createTime)}`);
    console.log(`   笔记链接: ${process.env.MEMOS_BASE_URL}/${id}`);
  } else {
    // 查看评论
    const data = await callAPI("GET", `/api/v1/${id}/comments`);
    const comments = data.memos || [];

    if (comments.length === 0) {
      console.log(`💬 ${id} 暂无评论`);
      return;
    }

    console.log(`💬 ${id} 的评论（共 ${comments.length} 条）:\n`);
    console.log("━".repeat(40));

    for (let i = 0; i < comments.length; i++) {
      const c = comments[i];
      console.log(`\n${i + 1}. ${truncate(c.content || "", 100).replace(/\n/g, " ")}`);
      console.log(`   创建者: ${c.creator || "未知"}`);
      console.log(`   创建时间: ${formatTime(c.createTime)}`);
      console.log("─".repeat(40));
    }
  }
}

module.exports = { actionComments };
