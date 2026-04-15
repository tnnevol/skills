/**
 * 用户操作: whoami, user-stats
 */

const { formatTime } = require("../utils.cjs");

async function actionWhoami(callAPI) {
  const result = await callAPI("GET", "/api/v1/auth/me");
  const user = result.user || result;

  if (user.code !== undefined) {
    console.error(`❌ ${user.message || "用户未找到"}`);
    process.exit(1);
  }

  const userName = user.name || "";
  const userId = userName.startsWith("users/") ? userName.replace("users/", "") : userName;

  const email = user.email || "(未设置)";
  const maskedEmail = email.length > 6
    ? email[0] + "***" + email.slice(email.indexOf("@"))
    : "***";

  console.log("\n👤 当前用户");
  console.log("━".repeat(30));
  console.log(`用户名: ${user.username || "(未设置)"}`);
  console.log(`显示名: ${user.nickname || user.displayName || user.username || "(未设置)"}`);
  console.log(`角色: ${user.role || "用户"}`);
  console.log(`邮箱: ${maskedEmail}`);
  console.log(`状态: ${user.state || user.userState || "未知"}`);
  console.log(`创建时间: ${formatTime(user.createTime)}`);
  console.log(`更新时间: ${formatTime(user.updateTime)}`);
  console.log("━".repeat(30));
}

async function actionUserStats(callAPI) {
  // Step 1: Get current user via /auth/me
  const authResult = await callAPI("GET", "/api/v1/auth/me");
  const authUser = authResult.user || authResult;
  // :getStats expects the username (not the "users/xxx" name field)
  const userName = authUser.username || "";

  if (!userName) {
    console.error("❌ 无法获取当前用户信息");
    process.exit(1);
  }

  // Step 2: Get user stats via /users/{username}:getStats
  const stats = await callAPI("GET", `/api/v1/users/${userName}:getStats`);

  // Format tag stats
  const tagStats = stats.tagCount || {};
  const tagEntries = Object.entries(tagStats);
  const topTags = tagEntries
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([tag, count]) => `#${tag} (${count})`)
    .join(", ") || "(无标签)";

  // Format memo type stats
  const typeStats = stats.memoTypeStats || {};
  const typeBreakdown = Object.entries(typeStats)
    .map(([type, count]) => `  ${type}: ${count}`)
    .join("\n") || "  (无数据)";

  // Pinned memos count
  const pinnedMemos = stats.pinnedMemos || [];
  const pinnedCount = Array.isArray(pinnedMemos) ? pinnedMemos.length : 0;

  console.log("\n📊 用户统计");
  console.log("━".repeat(35));
  console.log(`用户名: ${authUser.username || authUser.name || "未知"}`);
  console.log(`总笔记数: ${stats.totalMemoCount || 0}`);
  console.log(`已置顶: ${pinnedCount}`);
  console.log(`笔记类型分布:`);
  console.log(typeBreakdown);
  console.log(`唯一标签数: ${tagEntries.length}`);
  console.log(`常用标签: ${topTags}`);
  console.log("━".repeat(35));
}

module.exports = { actionWhoami, actionUserStats };
