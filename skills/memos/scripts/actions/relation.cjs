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
    // 首先获取现有的所有关系
    let existingData;
    try {
      existingData = await callAPI("GET", `/api/v1/${id}/relations`);
    } catch (err) {
      // 如果获取现有关系失败，我们仍可以继续添加新关系
      existingData = { relations: [] };
    }
    
    const existingRelations = existingData.relations || [];
    
    // 检查是否已存在相同的关系
    const relationExists = existingRelations.some(rel => {
      const rn = (rel.relatedMemo && rel.relatedMemo.name) || rel.relatedMemo;
      const mn = (rel.memo && rel.memo.name) || rel.memo;
      return (rn === targetId && mn === id && rel.type === type) || (rn === id && mn === targetId && rel.type === type);
    });
    
    if (relationExists) {
      console.log(`\n⚠️  关系已存在`);
      console.log(`   源笔记: ${id}`);
      console.log(`   目标笔记: ${targetId}`);
      return;
    }

    // 添加新关系到现有关系列表中
    const newRelation = {
      memo: { name: id },
      relatedMemo: { name: targetId },
      type: type
    };
    
    const allRelations = [...existingRelations, newRelation];

    // 准备完整的更新数据，确保正确处理所有字段
    const relationData = {
      relations: allRelations.map(rel => {
        // 确保每个关系对象包含所有必需的字段
        return {
          memo: { name: rel.memo?.name || rel.memo || rel.memoName },
          relatedMemo: { name: rel.relatedMemo?.name || rel.relatedMemo || rel.relatedMemoName },
          type: rel.type || 'REFERENCE'
        };
      })
    };

    // 调用API更新关系（包含所有现有关系和新关系）
    const result = await callAPI("PATCH", `/api/v1/${id}/relations`, JSON.stringify(relationData));
    
    console.log(`\n✅ 笔记关系已建立`);
    console.log(`   源笔记: ${id}`);
    console.log(`   目标笔记: ${targetId}`);
    console.log(`   关系类型: ${type}`);
    console.log(`   源笔记链接: ${process.env.MEMOS_BASE_URL}/${id}`);
    console.log(`   目标笔记链接: ${process.env.MEMOS_BASE_URL}/${targetId}`);
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
    console.log(`   源笔记链接: ${process.env.MEMOS_BASE_URL}/${id}`);
    console.log(`   目标笔记链接: ${process.env.MEMOS_BASE_URL}/${targetId}`);
  } catch (err) {
    console.error(`❌ 解除关系失败: ${err.message || "API 调用错误"}`);
    process.exit(1);
  }
}

module.exports = { actionRelations, actionRelate, actionUnrelate };
