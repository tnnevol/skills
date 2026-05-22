/**
 * 表情回应操作: reactions, react, unreact
 */

const { normalizeMemoId, stripMemoPrefix, parseFlags } = require("../utils.cjs");

// --- reactions ---

async function actionReactions(callAPI, argList) {
  const { positional } = parseFlags(argList);
  const rawId = positional[0];

  if (!rawId) {
    console.error("用法: api.cjs reactions <笔记ID>");
    process.exit(1);
  }

  const id = normalizeMemoId(rawId);

  try {
    const data = await callAPI("GET", `/api/v1/${id}/reactions`);
    const reactions = data.reactions || [];

    if (reactions.length === 0) {
      console.log(`🎭 ${id} 暂无表情回应`);
      return;
    }

    console.log(`🎭 ${id} 的表情回应（共 ${reactions.length} 个）:\n`);
    console.log("━".repeat(50));

    // Group reactions by type
    const grouped = {};
    for (const reaction of reactions) {
      const type = reaction.reactionType || "unknown";
      if (!grouped[type]) {
        grouped[type] = [];
      }
      grouped[type].push(reaction);
    }

    for (const [type, items] of Object.entries(grouped)) {
      const creators = items.map(r => r.creator).filter(Boolean).join(", ");
      const count = items.length;
      console.log(`\n${type} x${count} — ${creators}`);
      console.log("─".repeat(50));
    }
  } catch (err) {
    console.error(`❌ 获取表情回应失败: ${err.message || "API 调用错误"}`);
    process.exit(1);
  }
}

// --- react ---

async function actionReact(callAPI, argList) {
  const { positional } = parseFlags(argList);
  const rawId = positional[0];
  const emoji = positional[1];

  if (!rawId || !emoji) {
    console.error("用法: api.cjs react <笔记ID> <表情>");
    process.exit(1);
  }

  const id = normalizeMemoId(rawId);

  try {
    // First, check if user already has this reaction
    const reactionsData = await callAPI("GET", `/api/v1/${id}/reactions`);
    const reactions = reactionsData.reactions || [];
    
    // Find existing reaction by this user with this emoji
    const existingReaction = reactions.find(r => 
      r.reactionType === emoji && r.creator.includes('users/') // Assuming user format
    );

    if (existingReaction) {
      // User already has this reaction, so remove it (toggle effect)
      await callAPI("DELETE", `/api/v1/${existingReaction.name}`);
      console.log(`\n✅ 表情 ${emoji} 已取消`);
      console.log(`   笔记: ${id}`);
      console.log(`   表情: ${emoji}`);
      console.log(`   笔记链接: ${process.env.MEMOS_BASE_URL}/${id}`);
    } else {
      // Add new reaction
      // UpsertMemoReactionRequest: body = { reaction: { reactionType, contentId } }
      const body = {
        reaction: {
          reactionType: emoji,
          contentId: id
        }
      };
      
      await callAPI("POST", `/api/v1/${id}/reactions`, JSON.stringify(body));
      console.log(`\n✅ 表情 ${emoji} 已添加`);
      console.log(`   笔记: ${id}`);
      console.log(`   表情: ${emoji}`);
      console.log(`   笔记链接: ${process.env.MEMOS_BASE_URL}/${id}`);
    }
  } catch (err) {
    console.error(`❌ 表情操作失败: ${err.message || "API 调用错误"}`);
    process.exit(1);
  }
}

// --- unreact ---

async function actionUnreact(callAPI, argList) {
  const { positional } = parseFlags(argList);
  const rawId = positional[0];
  const emoji = positional[1];

  if (!rawId || !emoji) {
    console.error("用法: api.cjs unreact <笔记ID> <表情>");
    process.exit(1);
  }

  const id = normalizeMemoId(rawId);

  try {
    // Get all reactions to find the specific one to delete
    const reactionsData = await callAPI("GET", `/api/v1/${id}/reactions`);
    const reactions = reactionsData.reactions || [];
    
    // Find reaction by this user with this emoji
    const reactionToDelete = reactions.find(r => 
      r.reactionType === emoji && r.creator.includes('users/')
    );

    if (!reactionToDelete) {
      console.log(`\n⚠️  未找到 ${emoji} 表情回应`);
      console.log(`   笔记: ${id}`);
      console.log(`   表情: ${emoji}`);
      return;
    }

    // Delete the specific reaction
    await callAPI("DELETE", `/api/v1/${reactionToDelete.name}`);
    console.log(`\n✅ 表情 ${emoji} 已取消`);
    console.log(`   笔记: ${id}`);
    console.log(`   表情: ${emoji}`);
    console.log(`   笔记链接: ${process.env.MEMOS_BASE_URL}/${id}`);
  } catch (err) {
    console.error(`❌ 取消表情失败: ${err.message || "API 调用错误"}`);
    process.exit(1);
  }
}

module.exports = { actionReactions, actionReact, actionUnreact };
