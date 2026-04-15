/**
 * 笔记关系操作: relations, relate, unrelate
 */

const { normalizeMemoId, stripMemoPrefix, parseFlags } = require("../utils.cjs");

// --- relations ---

async function actionRelations(callAPI, argList) {
  const { positional } = parseFlags(argList);
  const rawId = positional[0];

  if (!rawId) {
    console.error("用法: api.cjs relations <笔记ID>");
    process.exit(1);
  }

  const id = normalizeMemoId(rawId);

  try {
    const data = await callAPI("GET", `/api/v1/${id}/relations`);
    const relations = data.relations || [];

    if (relations.length === 0) {
      console.log(`🔗 ${id} 暂无关联笔记`);
      return;
    }

    console.log(`🔗 ${id} 的关联笔记（共 ${relations.length} 个）:\n`);
    console.log("━".repeat(50));

    for (const relation of relations) {
      const targetMemo = (relation.relatedMemo && relation.relatedMemo.name) || (relation.relatedMemoName) || relation.relatedMemo || "未知";
      const sourceMemo = (relation.memo && relation.memo.name) || (relation.memoName) || relation.memo || "未知";
      const type = relation.type || "未知";

      console.log(`\n📝 源笔记: ${sourceMemo}`);
      console.log(`   目标笔记: ${targetMemo}`);
      console.log(`   关系类型: ${type}`);
      console.log("─".repeat(50));
    }
  } catch (err) {
    console.error(`❌ 获取关联笔记失败: ${err.message || "API 调用错误"}`);
    process.exit(1);
  }
}

// --- relate ---

async function actionRelate(callAPI, argList) {
  const { positional, flags } = parseFlags(argList);
  const rawId = positional[0];
  const targetRawId = positional[1];
  const type = flags.type || "REFERENCE"; // 默认为引用关系

  if (!rawId || !targetRawId) {
    console.error("用法: api.cjs relate <笔记ID> <目标笔记ID> [--type=REFERENCE|COMMENT|PARENT]");
    process.exit(1);
  }

  const id = normalizeMemoId(rawId);
  const targetId = normalizeMemoId(targetRawId);

  try {
    // Prepare the relation data
    const relationData = {
      relations: [
        {
          memo: { name: id },
          relatedMemo: { name: targetId },
          type: type
        }
      ]
    };

    // Call the API to set the relation
    const result = await callAPI("PATCH", `/api/v1/${id}/relations`, JSON.stringify(relationData));
    
    console.log(`\n✅ 笔记关系已建立`);
    console.log(`   源笔记: ${id}`);
    console.log(`   目标笔记: ${targetId}`);
    console.log(`   关系类型: ${type}`);
  } catch (err) {
    console.error(`❌ 建立关系失败: ${err.message || "API 调用错误"}`);
    process.exit(1);
  }
}

// --- unrelate ---

async function actionUnrelate(callAPI, argList) {
  const { positional } = parseFlags(argList);
  const rawId = positional[0];
  const targetRawId = positional[1];

  if (!rawId || !targetRawId) {
    console.error("用法: api.cjs unrelate <笔记ID> <目标笔记ID>");
    process.exit(1);
  }

  const id = normalizeMemoId(rawId);
  const targetId = normalizeMemoId(targetRawId);

  try {
    // First, get all relations to find the specific one to remove
    const data = await callAPI("GET", `/api/v1/${id}/relations`);
    const relations = data.relations || [];
    
    // Find the relation to the target memo (new format: memo.name / relatedMemo.name)
    const relationToRemove = relations.find(rel => {
      const rn = (rel.relatedMemo && rel.relatedMemo.name) || rel.relatedMemo;
      const mn = (rel.memo && rel.memo.name) || rel.memo;
      return rn === targetId || mn === targetId;
    });
    
    if (!relationToRemove) {
      console.log(`\n⚠️  未找到与 ${targetId} 的关系`);
      console.log(`   笔记: ${id}`);
      console.log(`   目标: ${targetId}`);
      return;
    }

    // Filter out the specific relation and send remaining ones
    const filteredRelations = relations.filter(rel => {
      const rn = (rel.relatedMemo && rel.relatedMemo.name) || rel.relatedMemo;
      const mn = (rel.memo && rel.memo.name) || rel.memo;
      return rn !== targetId && mn !== targetId;
    });
    
    const relationData = {
      relations: filteredRelations.map(rel => ({
        memo: { name: (rel.memo && rel.memo.name) || rel.memo || rel.memoName },
        relatedMemo: { name: (rel.relatedMemo && rel.relatedMemo.name) || rel.relatedMemo || rel.relatedMemoName },
        type: rel.type
      }))
    };

    // Update the relations (removing the specific one)
    const result = await callAPI("PATCH", `/api/v1/${id}/relations`, JSON.stringify(relationData));
    
    console.log(`\n✅ 笔记关系已解除`);
    console.log(`   源笔记: ${id}`);
    console.log(`   目标笔记: ${targetId}`);
  } catch (err) {
    console.error(`❌ 解除关系失败: ${err.message || "API 调用错误"}`);
    process.exit(1);
  }
}

module.exports = { actionRelations, actionRelate, actionUnrelate };
