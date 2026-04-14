/**
 * 用户操作: whoami, user-stats
 */

const { formatTime } = require("../utils.cjs");

async function actionWhoami(callAPI) {
  const userId = await getCurrentUserId(callAPI);
  const user = await callAPI("GET", `/api/v1/users/${userId}`);

  if (user.code !== undefined) {
    console.error(`❌ ${user.message || "用户未找到"}`);
    process.exit(1);
  }

  const email = user.email || "(未设置)";
  const maskedEmail = email.length > 6
    ? email[0] + "***" + email.slice(email.indexOf("@"))
    : "***";

  console.log("\n👤 当前用户");
  console.log("━".repeat(30));
  console.log(`用户名: ${user.username || "(未设置)"}`);
  console.log(`显示名: ${user.displayName || user.username || "(未设置)"}`);
  console.log(`角色: ${user.role || "用户"}`);
  console.log(`邮箱: ${maskedEmail}`);
  console.log(`状态: ${user.state || "未知"}`);
  console.log(`创建时间: ${formatTime(user.createTime)}`);
  console.log(`更新时间: ${formatTime(user.updateTime)}`);
  console.log("━".repeat(30));
}

async function actionUserStats(callAPI) {
  const userId = await getCurrentUserId(callAPI);
  const user = await callAPI("GET", `/api/v1/users/${userId}`);

  if (user.code !== undefined) {
    console.error(`❌ ${user.message || "用户未找到"}`);
    process.exit(1);
  }

  const tagCounts = new Map();
  const visibilityCounts = { PRIVATE: 0, PROTECTED: 0, PUBLIC: 0 };
  let totalMemos = 0;
  let pinnedCount = 0;
  let nextPageToken = "";

  while (true) {
    let url = `/api/v1/memos?pageSize=100`;
    if (nextPageToken) {
      url += `&pageToken=${encodeURIComponent(nextPageToken)}`;
    }

    const data = await callAPI("GET", url);
    const memos = data.memos || [];

    for (const memo of memos) {
      totalMemos++;
      if (memo.pinned) pinnedCount++;
      const vis = memo.visibility || "PRIVATE";
      if (visibilityCounts[vis] !== undefined) visibilityCounts[vis]++;
      if (memo.tags && Array.isArray(memo.tags)) {
        for (const tag of memo.tags) {
          tagCounts.set(tag, (tagCounts.get(tag) || 0) + 1);
        }
      }
    }

    nextPageToken = data.nextPageToken || "";
    if (!nextPageToken) break;
  }

  const topTags = [...tagCounts.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([tag, count]) => `#${tag} (${count})`)
    .join(", ") || "(无标签)";

  console.log("\n📊 用户统计");
  console.log("━".repeat(35));
  console.log(`用户名: ${user.displayName || user.username || "未知"}`);
  console.log(`总笔记数: ${totalMemos}`);
  console.log(`已置顶: ${pinnedCount}`);
  console.log(`可见性分布:`);
  console.log(`  PRIVATE: ${visibilityCounts.PRIVATE}`);
  console.log(`  PROTECTED: ${visibilityCounts.PROTECTED}`);
  console.log(`  PUBLIC: ${visibilityCounts.PUBLIC}`);
  console.log(`唯一标签数: ${tagCounts.size}`);
  console.log(`常用标签: ${topTags}`);
  console.log("━".repeat(35));
}

async function getCurrentUserId(callAPI) {
  let userId = "1";
  try {
    const data = await callAPI("GET", "/api/v1/memos?pageSize=1");
    const creator = data.memos?.[0]?.creator;
    if (creator && creator.startsWith("users/")) {
      userId = creator.replace("users/", "");
    }
  } catch {
    // fallback
  }
  return userId;
}

module.exports = { actionWhoami, actionUserStats };
