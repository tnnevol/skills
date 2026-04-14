/**
 * 标签操作: tags
 */

async function actionTags(callAPI) {
  const tagCounts = new Map();
  let nextPageToken = "";
  let totalPages = 0;

  while (true) {
    let url = `/api/v1/memos?pageSize=100`;
    if (nextPageToken) {
      url += `&pageToken=${encodeURIComponent(nextPageToken)}`;
    }

    const data = await callAPI("GET", url);
    const memos = data.memos || [];
    totalPages++;

    for (const memo of memos) {
      if (memo.tags && Array.isArray(memo.tags)) {
        for (const tag of memo.tags) {
          tagCounts.set(tag, (tagCounts.get(tag) || 0) + 1);
        }
      }
    }

    nextPageToken = data.nextPageToken || "";
    if (!nextPageToken) break;

    if (totalPages >= 50) {
      console.log("\n⚠️  分页已达上限（5000 条笔记），标签统计可能不完整");
      break;
    }
  }

  if (tagCounts.size === 0) {
    console.log("🏷️  暂无任何标签。");
    return;
  }

  const sorted = [...tagCounts.entries()].sort((a, b) => {
    if (b[1] !== a[1]) return b[1] - a[1];
    return a[0].localeCompare(b[0]);
  });

  console.log(`\n🏷️ 标签（共 ${sorted.length} 个）:\n`);
  console.log("━".repeat(30));

  for (const [tag, count] of sorted) {
    const bar = "█".repeat(Math.min(count, 20));
    console.log(`  #${tag.padEnd(12)} (${String(count).padStart(3)}) ${bar}`);
  }

  console.log("━".repeat(30));
  console.log("\n括号内为该标签下的笔记数量");
}

module.exports = { actionTags };
